(() => {
 const URL="https://upvkjgwnavtkcsyzwjjn.supabase.co", KEY="sb_publishable_nUSXAIb0eqF7eQuyFYVycw_VHEB3p2k";
 const db=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 const status=document.getElementById("membership-status");
 const membershipMain=document.querySelector("main.membership-wrap");
 async function checkMembershipVisibility(){
   const {data,error}=await db.from("site_feature_settings").select("membership_visible").eq("id",1).maybeSingle();
   if(!error && data && data.membership_visible===false){
     if(membershipMain) membershipMain.innerHTML='<div class="membership-inner" style="padding:70px 0"><p class="eyebrow">FLYWITHAARAV / MEMBERSHIPS</p><h1 style="font-size:clamp(36px,6vw,60px)">Memberships are <em>currently hidden.</em></h1><p class="membership-intro">This feature is not available right now. Please check back in the future.</p><div class="membership-links"><a href="index.html">Back to FlyWithAarav →</a></div></div>';
     return false;
   }
   return true;
 }
 document.getElementById("year").textContent=new Date().getFullYear();
 let signedInUser=null, isAdmin=false;
 const tierName=t=>({free:"Free",silver:"Silver",gold:"Gold",platinum:"Platinum"}[t]||"Free");
 async function init(){
   try{
     if(!(await checkMembershipVisibility()))return;
     const {data:{user},error}=await db.auth.getUser();
     if(error)throw error;
     signedInUser=user;
     if(!user){status.textContent="You are browsing as a guest. Sign in first to view membership status or choose a tier.";setButtons("Sign in to choose",true);return}
     const {data:roleRows}=await db.from("user_roles").select("role").eq("user_id",user.id);
     isAdmin=Array.isArray(roleRows)&&roleRows.some(r=>r.role==="admin");
     if(isAdmin){status.textContent="Admin access is free. Your account is exempt from all membership charges.";setButtons("Admin access — free",true);return}
     const {data:m,error:me}=await db.from("memberships").select("tier,status,current_period_end").eq("user_id",user.id).maybeSingle();
     if(me) throw me;
     if(m&&m.status==="active"){
       status.textContent="Your current membership: "+tierName(m.tier)+" (active)"+(m.current_period_end?" · renews/ends "+new Date(m.current_period_end).toLocaleDateString():"")+".";
       const current=m.tier;document.querySelectorAll("[data-tier]").forEach(b=>{b.textContent=b.dataset.tier===current?"Your current plan":"Change to "+tierName(b.dataset.tier)+" ↗"});
     }else status.textContent="Signed in as "+(user.email||"a FlyWithAarav pilot")+". No active paid membership was found.";
   }catch(e){status.textContent="Could not load membership status. You can still view the plans; checkout is unavailable until the secure payment setup is complete."}
 }
 function setButtons(text,disabled){document.querySelectorAll("[data-tier]").forEach(b=>{b.textContent=text;b.disabled=disabled})}
 document.querySelectorAll("[data-tier]").forEach(button=>button.addEventListener("click",async()=>{
   if(!signedInUser){location.href="auth.html?mode=signin";return}
   if(isAdmin){status.textContent="Admin access is free — no purchase is needed.";return}
   button.disabled=true;const old=button.textContent;button.textContent="Connecting securely…";
   try{
     const {data,error}=await db.functions.invoke("paypal-membership-checkout",{body:{tier:button.dataset.tier}});
     if(error)throw error;
     if(data?.admin){status.textContent="Admin access is free — no purchase is needed.";return}
     if(data?.url){location.assign(data.url);return}
     throw new Error(data?.error||"Secure checkout is not configured yet.");
   }catch(e){
     let detail=(e&&e.message)?e.message:"Unknown checkout error";
     try{if(e&&e.context&&typeof e.context.json==="function"){const payload=await e.context.json();detail=payload.details||payload.error||payload.message||detail}}catch(_){}
     status.textContent="PayPal Sandbox checkout failed. No real payment has been taken. Details: "+String(detail).slice(0,240);
     button.textContent=old;button.disabled=false
   }
 }));
 db.auth.onAuthStateChange(()=>{init()});
 init();
})();