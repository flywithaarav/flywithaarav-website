(() => {
 const URL="https://upvkjgwnavtkcsyzwjjn.supabase.co", KEY="sb_publishable_nUSXAIb0eqF7eQuyFYVycw_VHEB3p2k";
 const db=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 const $=id=>document.getElementById(id);$("year").textContent=new Date().getFullYear();let user=null,isAdmin=false;
 const msg=(s,e=false)=>{$("community-message").textContent=s;$("community-message").classList.toggle("error",e)};
 const escapeText=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const defaultAvatar="https://placehold.co/100x100/10243a/7be0d0?text=FA";
 async function load(){const {data:sessionData}=await db.auth.getSession();user=sessionData.session?.user||null;$("post-button").disabled=!user;$("comment-body").disabled=!user;$("posting-as").textContent=user?"Posting as "+(user.email||"Pilot"):"Sign in to post. ";isAdmin=false;
 if(user){const {data:role}=await db.from("user_roles").select("role").eq("user_id",user.id).maybeSingle();isAdmin=role?.role==="admin";$("admin-box").hidden=!isAdmin}
 const {data:comments,error}=await db.from("comments").select("id,user_id,body,created_at").order("created_at",{ascending:false}).limit(100);
 if(error){$("posts").innerHTML='<p class="empty">Could not load posts: '+escapeText(error.message)+'</p>';return}
 const ids=[...new Set((comments||[]).map(c=>c.user_id))];let profs={};if(ids.length){const {data}=await db.from("profiles").select("id,display_name,avatar_url").in("id",ids);(data||[]).forEach(p=>profs[p.id]=p)}
 if(!comments?.length){$("posts").innerHTML='<p class="empty">No posts yet. Be the first to share a flight!</p>';return}
 $("posts").innerHTML=comments.map(c=>{const p=profs[c.user_id]||{};const canDelete=isAdmin||user?.id===c.user_id;return '<article class="post"><div class="post-head"><img class="post-avatar" src="'+escapeText(p.avatar_url||defaultAvatar)+'" alt=""><div><div class="post-author">'+escapeText(p.display_name||"Pilot")+'</div><div class="post-date">'+escapeText(new Date(c.created_at).toLocaleString())+'</div></div></div><div class="post-body">'+escapeText(c.body)+'</div><div class="post-footer"><span class="community-sub">FLIGHT DECK / COMMUNITY</span>'+(canDelete?'<button type="button" data-delete="'+escapeText(c.id)+'">'+(isAdmin?'ADMIN · DELETE':'DELETE MY POST')+'</button>':'')+'</div></article>'}).join("");
 }
 $("comment-form").addEventListener("submit",async e=>{e.preventDefault();if(!user){msg("Please sign in before posting.",true);return}const body=$("comment-body").value.trim();if(!body){msg("Write a message first.",true);return}const btn=$("post-button");btn.disabled=true;msg("Posting…");try{const {error}=await db.from("comments").insert({user_id:user.id,body});if(error)throw error;$("comment-body").value="";msg("Your post is live.");await load()}catch(err){msg(err.message||"Could not post. Please try again.",true)}finally{btn.disabled=!user}});
 $("posts").addEventListener("click",async e=>{const btn=e.target.closest("[data-delete]");if(!btn)return;const id=btn.dataset.delete;if(!confirm("Delete this community post? This cannot be undone."))return;btn.disabled=true;const {error}=await db.from("comments").delete().eq("id",id);if(error){msg(error.message,true);btn.disabled=false;return}msg("Post deleted.");await load()});
 db.auth.onAuthStateChange(()=>{load()});load();
})();