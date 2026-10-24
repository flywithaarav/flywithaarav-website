(() => {
 const URL="https://upvkjgwnavtkcsyzwjjn.supabase.co",KEY="sb_publishable_nUSXAIb0eqF7eQuyFYVycw_VHEB3p2k";
 const db=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 const $=id=>document.getElementById(id);$("year").textContent=new Date().getFullYear();
 let user=null,tier="free",profile={};
 const say=(s,bad=false)=>{$("member-message").textContent=s;$("member-message").style.color=bad?"#ffb6a9":"#7be0d0"};
 const rank={free:0,silver:1,gold:2,platinum:3};
 function gate(min){return (rank[tier]||0)>=(rank[min]||0)}
 function lock(id,min){const el=$(id);if(!gate(min)){el.disabled=true;el.title=min.toUpperCase()+" membership required";el.style.opacity=".55"}}
 async function init(){
  const {data,error}=await db.auth.getUser();if(error||!data.user){$("member-status").textContent="Please sign in to use member features.";say("Sign in, then return here to unlock your benefits.",true);return}
  user=data.user;
  const {data:m}=await db.from("memberships").select("tier,status,current_period_end").eq("user_id",user.id).maybeSingle();
  const {data:roles}=await db.from("user_roles").select("role").eq("user_id",user.id);
  const admin=Array.isArray(roles)&&roles.some(x=>x.role==="admin");
  if(admin){tier="platinum"}else if(m&&m.status==="active"&&rank[m.tier]>=1){tier=m.tier}
  $("member-status").textContent=admin?"✦ ADMIN ACCESS · all member features unlocked":tier==="free"?"FREE PILOT · Choose a membership to unlock member features.":("✦ "+tier.toUpperCase()+" MEMBERSHIP · "+(m.current_period_end?"renews/ends "+new Date(m.current_period_end).toLocaleDateString("en-GB"):"active"));
  const {data:p,error:pe}=await db.from("profiles").select("display_name,avatar_url,profile_background_url,display_name_color,premium_frame_enabled").eq("id",user.id).maybeSingle();
  if(pe){say("Could not load profile settings: "+pe.message,true);return}profile=p||{};
  $("background-url").value=profile.profile_background_url||"";$("name-colour").value=profile.display_name_color||"#f4f7fb";$("name-preview").style.color=$("name-colour").value;$("name-preview").innerHTML="✈ <strong>"+(profile.display_name||user.email.split("@")[0])+"</strong>";
  $("premium-frame").checked=!!profile.premium_frame_enabled;$("frame-preview").style.borderColor=profile.premium_frame_enabled?"#b7f5ff":"#7be0d0";if(profile.profile_background_url)$("background-preview").style.background="linear-gradient(#07111f55,#07111f55),url('"+profile.profile_background_url.replace(/'/g,"%27")+"') center/cover";
  lock("background-url","silver");lock("save-background","silver");lock("name-colour","gold");lock("save-colour","gold");lock("premium-frame","platinum");lock("save-frame","platinum");lock("download-wallpaper","gold");
  if(tier==="free")say("Your account is signed in, but these benefits need an active membership. You can still view your profile and plans.");
 }
 async function save(fields){if(!user){say("Please sign in first.",true);return}const {error}=await db.from("profiles").upsert({id:user.id,...fields,updated_at:new Date().toISOString()});if(error){say("Could not save: "+error.message,true);return}say("Saved successfully.");}
 $("name-colour").addEventListener("input",()=>{$("name-preview").style.color=$("name-colour").value});
 $("save-background").addEventListener("click",()=>{if(!gate("silver"))return say("Silver membership or higher is required.",true);const v=$("background-url").value.trim();if(v&&!/^https:\/\//i.test(v))return say("Please use a secure https:// image URL.",true);save({profile_background_url:v||null});if(v)$("background-preview").style.background="linear-gradient(#07111f55,#07111f55),url('"+v.replace(/'/g,"%27")+"') center/cover";else $("background-preview").style.background="radial-gradient(circle at 50% 45%,#164a6b,#07111f 65%)"});
 $("save-colour").addEventListener("click",()=>{if(!gate("gold"))return say("Gold membership or higher is required.",true);save({display_name_color:$("name-colour").value})});
 $("save-frame").addEventListener("click",()=>{if(!gate("platinum"))return say("Platinum membership is required.",true);save({premium_frame_enabled:$("premium-frame").checked});$("frame-preview").style.borderColor=$("premium-frame").checked?"#b7f5ff":"#7be0d0";$("frame-preview").style.boxShadow=$("premium-frame").checked?"0 0 18px #55dfff66":"none"});
 $("download-wallpaper").addEventListener("click",()=>{if(!gate("gold"))return say("Gold membership or higher is required.",true);const svg='<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="2560" viewBox="0 0 1440 2560"><defs><linearGradient id="g" x2="0" y2="1"><stop stop-color="#16364b"/><stop offset=".55" stop-color="#07111f"/><stop offset="1" stop-color="#020711"/></linearGradient><radialGradient id="r"><stop stop-color="#1c6884" stop-opacity=".8"/><stop offset="1" stop-color="#07111f" stop-opacity="0"/></radialGradient></defs><rect width="1440" height="2560" fill="url(#g)"/><circle cx="720" cy="950" r="650" fill="url(#r)"/><g fill="none" stroke="#7be0d0" stroke-opacity=".5"><circle cx="720" cy="930" r="340" stroke-width="3"/><circle cx="720" cy="930" r="390" stroke-width="1"/></g><path d="M720 570 L765 895 L1040 1050 L1030 1090 L760 1015 L750 1240 L835 1310 L825 1345 L720 1310 L615 1345 L605 1310 L690 1240 L680 1015 L410 1090 L400 1050 L675 895 Z" fill="#e9fbff"/><text x="720" y="1580" text-anchor="middle" font-family="Arial,sans-serif" font-size="72" font-weight="bold" letter-spacing="14" fill="#f4f7fb">FLYWITHAARAV</text><text x="720" y="1660" text-anchor="middle" font-family="Arial,sans-serif" font-size="32" letter-spacing="9" fill="#7be0d0">VIRTUAL AVIATION</text></svg>';const a=document.createElement("a");a.href=globalThis.URL.createObjectURL(new Blob([svg],{type:"image/svg+xml"}));a.download="FlyWithAarav-member-wallpaper.svg";a.click();globalThis.URL.revokeObjectURL(a.href);say("Your original wallpaper was created and downloaded.")});
 init();
})();