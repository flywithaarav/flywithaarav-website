(() => {
 const URL="https://upvkjgwnavtkcsyzwjjn.supabase.co";
 const KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwdmtqZ3duYXZ0a2NzeXp3ampuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5ODkyMzcsImV4cCI6MjEwNzU2NTIzN30.sw-dBRwmWgUyattdFK7zAp1YA5BuFYDTmiLNmgdbYpM";
 if(!window.supabase)return;
 const db=window.supabase.createClient(URL,KEY);
 const text=(sel,v)=>{const el=document.querySelector(sel);if(el&&v!==undefined)el.textContent=v;};
 const safeUrl=v=>typeof v==="string"&&v.startsWith("https://")?v:"";
 db.from("site_homepage_content").select("content").eq("id",1).maybeSingle().then(({data})=>{
  const c=data?.content;if(!c)return;
  text(".hero-content .eyebrow",c.hero_eyebrow);
  const h=document.querySelector(".hero-content h1");if(h){h.replaceChildren();const first=document.createElement("span");first.textContent=c.hero_title||"";const br=document.createElement("br");const em=document.createElement("em");em.textContent=c.hero_emphasis||"";h.append(first,br,em);}
  text(".hero-content .lede",c.hero_description);
  text("#flights .heading h2",c.flight_heading);text("#flights .intro",c.flight_intro);
  document.querySelectorAll("#flights .card").forEach((card,i)=>{if(i>2)return;const val=(k)=>Array.isArray(c[k])?c[k][i]:undefined;const img=card.querySelector("img");if(img&&safeUrl(val("flight_images"))){img.src=safeUrl(val("flight_images"));img.alt=val("flight_titles")||"Flight image";}text.call(null,"",undefined);const label=card.querySelector("label");if(label&&val("flight_labels"))label.textContent=val("flight_labels");const title=card.querySelector("h3");if(title&&val("flight_titles"))title.textContent=val("flight_titles");const p=card.querySelector("p");if(p&&val("flight_descriptions"))p.textContent=val("flight_descriptions");const a=card.querySelector("a.link");if(a&&safeUrl(val("flight_links")))a.href=safeUrl(val("flight_links"));});
  document.querySelectorAll("#fleet .fleet article").forEach((card,i)=>{if(i>2)return;const name=Array.isArray(c.fleet_names)?c.fleet_names[i]:null;const desc=Array.isArray(c.fleet_descriptions)?c.fleet_descriptions[i]:null;if(name)text("#fleet .fleet article:nth-child("+(i+1)+") h3",name);if(desc)card.querySelectorAll("p")[1].textContent=desc;});
  document.querySelectorAll("#gallery .gallery button").forEach((card,i)=>{const im=Array.isArray(c.gallery_images)?c.gallery_images[i]:null;const cap=Array.isArray(c.gallery_captions)?c.gallery_captions[i]:null;const img=card.querySelector("img");if(img&&safeUrl(im))img.src=safeUrl(im);const span=card.querySelector("span");if(span&&cap)span.textContent=String(i+1).padStart(2,"0")+" / "+cap+" ↗";});
  text("#about h2",c.about_heading);text("#about div p:not(.eyebrow)",c.about_description);
  if(safeUrl(c.youtube_url)){document.querySelectorAll('a[href*="youtube.com/@flywithaarav"]').forEach(a=>a.href=safeUrl(c.youtube_url));}
 }).catch(()=>{});
})();