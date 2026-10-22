import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@17.7.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const cors={"Access-Control-Allow-Origin":"https://flywithaarav.great-site.net","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,"Content-Type":"application/json"}});
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 if(req.method!=="POST")return reply({error:"Method not allowed"},405);
 try{
  const url=Deno.env.get("SUPABASE_URL")!, anon=Deno.env.get("SUPABASE_ANON_KEY")!, service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const auth=req.headers.get("Authorization");if(!auth)return reply({error:"Sign in required"},401);
  const userClient=createClient(url,anon,{global:{headers:{Authorization:auth}}});
  const {data:{user},error:ue}=await userClient.auth.getUser();if(ue||!user)return reply({error:"Sign in required"},401);
  const adminClient=createClient(url,service);
  const {data:roles}=await adminClient.from("user_roles").select("role").eq("user_id",user.id);
  if(roles?.some((r)=>r.role==="admin"))return reply({admin:true,message:"Admins have free access."});
  const body=await req.json().catch(()=>({}));const tier=String(body.tier||"").toLowerCase();
  const envName=({silver:"STRIPE_PRICE_SILVER",gold:"STRIPE_PRICE_GOLD",platinum:"STRIPE_PRICE_PLATINUM"} as Record<string,string>)[tier];
  if(!envName)return reply({error:"Choose a valid membership tier."},400);
  const price=Deno.env.get(envName),secret=Deno.env.get("STRIPE_SECRET_KEY");
  if(!price||!secret)return reply({error:"Stripe is not configured yet."},503);
  const stripe=new Stripe(secret,{apiVersion:"2024-12-18.acacia"});
  const {data:membership}=await adminClient.from("memberships").select("stripe_customer_id").eq("user_id",user.id).maybeSingle();
  const session=await stripe.checkout.sessions.create({mode:"subscription",line_items:[{price,quantity:1}],success_url:"https://flywithaarav.great-site.net/membership.html?checkout=success",cancel_url:"https://flywithaarav.great-site.net/membership.html?checkout=cancelled",client_reference_id:user.id,customer:membership?.stripe_customer_id||undefined,customer_email:membership?.stripe_customer_id?undefined:user.email||undefined,metadata:{user_id:user.id,tier},subscription_data:{metadata:{user_id:user.id,tier}}});
  return reply({url:session.url});
 }catch(e){return reply({error:e instanceof Error?e.message:"Checkout could not be started."},500)}
});