(() => {
  const URL = "https://upvkjgwnavtkcsyzwjjn.supabase.co";
  const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwdmtqZ3duYXZ0a2NzeXp3ampuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5ODkyMzcsImV4cCI6MjEwNzU2NTIzN30.sw-dBRwmWgUyattdFK7zAp1YA5BuFYDTmiLNmgdbYpM";
  if (!window.supabase) return;
  const db = window.supabase.createClient(URL, KEY);
  const style = document.createElement("style");
  style.textContent = `
    #faa-egg-trigger{position:fixed;top:12px;left:12px;z-index:80;width:36px;height:36px;border:1px solid #7be0d077;border-radius:50%;background:#0d1b2c;color:#7be0d0;font-size:18px;cursor:pointer;box-shadow:0 4px 18px #0006;opacity:.82;transition:transform .2s,opacity .2s}
    #faa-egg-trigger:hover{opacity:1;transform:rotate(20deg) scale(1.08)}
    #faa-egg-overlay{position:fixed;inset:0;z-index:100;background:#020812d9;display:grid;place-items:center;padding:20px}
    #faa-egg-overlay[hidden]{display:none}
    #faa-egg-card{position:relative;width:min(520px,100%);max-height:85vh;overflow:auto;background:#0d1b2c;color:#f4f7fb;border:1px solid #7be0d066;border-radius:16px;padding:28px;box-shadow:0 20px 80px #0009}
    #faa-egg-card h2{margin:0 35px 12px 0;color:#7be0d0;font-size:25px}
    #faa-egg-card p{white-space:pre-wrap;line-height:1.65;color:#d5deea}
    #faa-egg-card img{display:block;max-width:100%;max-height:300px;object-fit:contain;border-radius:10px;margin:14px auto}
    #faa-egg-close{position:absolute;top:10px;right:12px;border:0;background:transparent;color:#fff;font-size:28px;cursor:pointer}
    #faa-egg-link{display:inline-block;margin-top:8px;padding:10px 14px;background:#7be0d0;color:#07111f;border-radius:7px;font-weight:700;text-decoration:none}
    @media(max-width:620px){#faa-egg-trigger{top:8px;left:8px;width:32px;height:32px}}
  `;
  document.head.appendChild(style);
  const trigger = document.createElement("button");
  trigger.id = "faa-egg-trigger"; trigger.type = "button"; trigger.title = "A little secret"; trigger.setAttribute("aria-label","Open the FlyWithAarav Easter egg"); trigger.textContent = "✦";
  const overlay = document.createElement("div"); overlay.id = "faa-egg-overlay"; overlay.hidden = true;
  overlay.innerHTML = '<section id="faa-egg-card" role="dialog" aria-modal="true" aria-labelledby="faa-egg-title"><button id="faa-egg-close" aria-label="Close">×</button><h2 id="faa-egg-title">You found the secret!</h2><img id="faa-egg-image" alt="" hidden><p id="faa-egg-body">Welcome to the hidden corner of FlyWithAarav.</p><a id="faa-egg-link" hidden target="_blank" rel="noopener noreferrer"></a></section>';
  document.body.append(trigger, overlay);
  const close = () => { overlay.hidden = true; };
  trigger.addEventListener("click", () => { overlay.hidden = false; document.getElementById("faa-egg-close").focus(); });
  document.getElementById("faa-egg-close").addEventListener("click", close);
  overlay.addEventListener("click", e => { if (e.target === overlay) close(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
  db.from("site_easter_egg").select("enabled,title,body,image_url,link_url,link_label").eq("id",1).maybeSingle().then(({data}) => {
    if (!data) return;
    trigger.hidden = !data.enabled;
    if (data.title) document.getElementById("faa-egg-title").textContent = data.title;
    document.getElementById("faa-egg-body").textContent = data.body || "";
    const img = document.getElementById("faa-egg-image");
    if (data.image_url && /^https:\/\//i.test(data.image_url)) { img.src = data.image_url; img.hidden = false; }
    const link = document.getElementById("faa-egg-link");
    if (data.link_url && /^https:\/\//i.test(data.link_url)) { link.href = data.link_url; link.textContent = data.link_label || "Explore more"; link.hidden = false; }
  });
})();