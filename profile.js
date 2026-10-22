(() => {
 const URL="https://upvkjgwnavtkcsyzwjjn.supabase.co", KEY="sb_publishable_nUSXAIb0eqF7eQuyFYVycw_VHEB3p2k";
 const db=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 const $=id=>document.getElementById(id); $("year").textContent=new Date().getFullYear();
 let user=null, avatarUrl=null, removeAvatar=false, selectedFile=null;
 const msg=(s,e=false)=>{$("profile-message").textContent=s;$("profile-message").classList.toggle("error",e)};
 async function init(){const {data,error}=await db.auth.getUser(); if(error||!data.user){msg("Please sign in first to view and edit your profile.",true);$("profile-form").hidden=true;return}
 user=data.user;$("profile-email").value=user.email||"";
 const badge=$("profile-membership-badge");
 try{
  const {data:roles}=await db.from("user_roles").select("role").eq("user_id",user.id);
  if(Array.isArray(roles)&&roles.some(r=>r.role==="admin")){badge.textContent="✦ ADMIN · FREE ACCESS";badge.hidden=false;badge.style.borderColor="#e7bd68";badge.style.color="#e7bd68";}
  else{
   const {data:membership}=await db.from("memberships").select("tier,status").eq("user_id",user.id).maybeSingle();
   if(membership&&membership.status==="active"&&["silver","gold","platinum"].includes(membership.tier)){
    badge.textContent="✦ "+membership.tier.toUpperCase()+" MEMBER";badge.hidden=false;
    const colors={silver:"#cbd5e1",gold:"#e7bd68",platinum:"#d8e3f2"};badge.style.borderColor=colors[membership.tier];badge.style.color=colors[membership.tier];
   }else{badge.textContent="✦ FREE PILOT";badge.hidden=false;}
  }
 }catch(_){badge.textContent="✦ PILOT MEMBERSHIP";badge.hidden=false;}

 const {data:p,error:pe}=await db.from("profiles").select("display_name,avatar_url").eq("id",user.id).maybeSingle();
 if(pe){msg(pe.message,true);return}
 if(p){$("display-name").value=p.display_name||"";avatarUrl=p.avatar_url;$("avatar-preview").src=avatarUrl||"https://placehold.co/260x260/10243a/7be0d0?text=FA"}
 else $("display-name").value=(user.email||"Pilot").split("@")[0];
 }
 $("avatar-file").addEventListener("change",()=>{selectedFile=$("avatar-file").files[0]||null;if(!selectedFile)return;if(selectedFile.size>3*1024*1024){selectedFile=null;$("avatar-file").value="";msg("Choose an image smaller than 3 MB.",true);return}const reader=new FileReader();reader.onload=()=>{$("avatar-preview").src=reader.result};reader.readAsDataURL(selectedFile);removeAvatar=false});
 $("remove-photo").addEventListener("click",()=>{selectedFile=null;removeAvatar=true;$("avatar-file").value="";$("avatar-preview").src="https://placehold.co/260x260/10243a/7be0d0?text=FA"});
 $("profile-form").addEventListener("submit",async e=>{e.preventDefault();if(!user){msg("Sign in first.",true);return}const btn=$("save-profile");btn.disabled=true;msg("Saving profile…");
 try{if(selectedFile){const ext=selectedFile.type==="image/png"?"png":selectedFile.type==="image/webp"?"webp":"jpg";const path=user.id+"/avatar."+ext;const {error:upErr}=await db.storage.from("profile-photos").upload(path,selectedFile,{upsert:true,contentType:selectedFile.type,cacheControl:"3600"});if(upErr)throw upErr;const {data}=db.storage.from("profile-photos").getPublicUrl(path);avatarUrl=data.publicUrl;removeAvatar=false}
 if(removeAvatar)avatarUrl=null;
 const {error}=await db.from("profiles").upsert({id:user.id,display_name:$("display-name").value.trim(),avatar_url:avatarUrl,updated_at:new Date().toISOString()});if(error)throw error;
 msg("Profile saved successfully.");$("avatar-preview").src=avatarUrl||"https://placehold.co/260x260/10243a/7be0d0?text=FA";selectedFile=null;
 }catch(err){msg(err.message||"Could not save your profile.",true)}finally{btn.disabled=false}});
 db.auth.onAuthStateChange((_e,s)=>{if(!s)window.location.href="auth.html?mode=signin"});init();
})();