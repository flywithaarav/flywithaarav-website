import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@17.7.0";
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async(req)=>{
 if(req.method!=="POST")return new Response("Method not allowed",{status:405});
 const secret=Deno.env.get("STRIPE_SECRET_KEY"),signingSecret=Deno.env.get("STRIPE_WEBHOOK_SECRET");
 if(!secret||!signingSecret)return new Response("Stripe webhook is not configured",{status:503});
 const signature=req.headers.get("stripe-signature");if(!signature)return new Response("Missing signature",{status:400});
 const stripe=new Stripe(secret,{apiVersion:"2024-12-18.acacia"});
 let event:Stripe.Event;
 try{event=await stripe.webhooks.constructEventAsync(await req.text(),signature,signingSecret,undefined,Stripe.createSubtleCryptoProvider())}
 catch(_){return new Response("Invalid Stripe signature",{status:400})}
 const url=Deno.env.get("SUPABASE_URL")!,service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
 const db=createClient(url,service);
 try{
  if(event.type==="checkout.session.completed"){
   const s=event.data.object as Stripe.Checkout.Session;const userId=s.metadata?.user_id||s.client_reference_id;const tier=s.metadata?.tier;
   if(userId&&["silver","gold","platinum"].includes(tier||"")){
    const subId=typeof s.subscription==="string"?s.subscription:null;const customerId=typeof s.customer==="string"?s.customer:null;
    let periodEnd:string|null=null;let status="active";
    if(subId){const sub=await stripe.subscriptions.retrieve(subId);status=sub.status==="active"||sub.status==="trialing"?sub.status:"inactive";periodEnd=new Date(sub.current_period_end*1000).toISOString()}
    const {error}=await db.from("memberships").upsert({user_id:userId,tier,status,stripe_customer_id:customerId,stripe_subscription_id:subId,current_period_end:periodEnd,updated_at:new Date().toISOString()},{onConflict:"user_id"});if(error)throw error;
   }
  }else if(event.type==="customer.subscription.updated"||event.type==="customer.subscription.deleted"){
   const sub=event.data.object as Stripe.Subscription;const userId=sub.metadata?.user_id;const tier=sub.metadata?.tier;
   if(userId){
    const status=event.type==="customer.subscription.deleted"?"canceled":sub.status;
    const update:Record<string,unknown>={status,current_period_end:new Date(sub.current_period_end*1000).toISOString(),updated_at:new Date().toISOString()};
    if(["silver","gold","platinum"].includes(tier||""))update.tier=tier;
    const {error}=await db.from("memberships").update(update).eq("user_id",userId).eq("stripe_subscription_id",sub.id);if(error)throw error;
   }
  }else if(event.type==="invoice.payment_failed"){
   const invoice=event.data.object as Stripe.Invoice;const subId=typeof invoice.subscription==="string"?invoice.subscription:null;
   if(subId){const {error}=await db.from("memberships").update({status:"past_due",updated_at:new Date().toISOString()}).eq("stripe_subscription_id",subId);if(error)throw error}
  }
  return new Response(JSON.stringify({received:true}),{headers:{"Content-Type":"application/json"}});
 }catch(e){return new Response(e instanceof Error?e.message:"Webhook processing failed",{status:500})}
});