const menu=document.getElementById('menu');
const nav=document.getElementById('nav');
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'×':'☰'});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.textContent='☰'}));
document.getElementById('year').textContent=new Date().getFullYear();

const box=document.getElementById('lightbox'),large=document.getElementById('large'),close=document.getElementById('close');
function hide(){box.hidden=true;large.src='';document.body.style.overflow=''}
close.addEventListener('click',hide);
box.addEventListener('click',e=>{if(e.target===box)hide()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!box.hidden)hide()});
document.querySelector('.gallery').addEventListener('click',e=>{
  const button=e.target.closest('button');
  if(!button)return;
  const img=button.querySelector('img');
  if(!img)return;
  large.src=img.src;large.alt=img.alt;box.hidden=false;document.body.style.overflow='hidden';close.focus();
});

const make=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node};
const setText=(selector,value)=>{const node=document.querySelector(selector);if(node&&value!==undefined)node.textContent=value};
const setLink=(node,url,label)=>{if(!node)return;if(url)node.href=url;if(label)node.textContent=label;node.target='_blank';node.rel='noopener'};
const setHeading=(node,first,second)=>{if(!node)return;node.replaceChildren(document.createTextNode(first||''),document.createElement('br'));const em=make('em','',second||'');node.appendChild(em)};
const setImage=(img,url,alt)=>{if(url)img.src=url;if(alt!==undefined)img.alt=alt};

async function loadEditableContent(){
  try{
    const response=await fetch('content/site.json',{cache:'no-store'});
    if(!response.ok)throw new Error('Could not load content/site.json');
    const data=await response.json();
    const yt=data.youtube_url||'https://www.youtube.com/@flywithaarav';
    const hero=data.hero||{};
    setText('.hero-content .eyebrow',hero.eyebrow);
    setHeading(document.querySelector('.hero h1'),hero.headline_first,hero.headline_second);
    setText('.hero-content .lede',hero.description);
    setText('.flightnote h3',hero.note_heading);
    setText('.flightnote small',hero.note_subtitle);
    if(hero.image)document.querySelector('.hero').style.backgroundImage='url('+JSON.stringify(hero.image)+')';
    document.querySelectorAll('a[href="https://www.youtube.com/@flywithaarav"]').forEach(a=>{a.href=yt});
    document.querySelectorAll('.actions a')[1]?.setAttribute('href',yt);
    setText('.ticker',data.ticker);
    setText('#flights .intro',data.flights_intro);
    setText('#fleet .intro',data.fleet_intro);
    setText('#gallery .intro',data.gallery_intro);

    if(Array.isArray(data.flights)){
      const cards=document.querySelector('.cards');cards.replaceChildren();
      data.flights.forEach(item=>{
        const article=make('article','card'),img=make('img');setImage(img,item.image,item.title||'Flight image');
        const body=make('div','cardbody');body.append(make('label','',item.label||''),make('h3','',item.title||''),make('p','',item.description||''));
        const link=make('a','link',item.link_label||'Watch flight ↗');setLink(link,item.link_url||yt);body.append(link);article.append(img,body);cards.append(article);
      });
    }
    if(Array.isArray(data.fleet)){
      const fleet=document.querySelector('.fleet');fleet.replaceChildren();
      data.fleet.forEach((item,index)=>{
        const article=make('article'),number=make('span','',String(index+1).padStart(2,'0'));
        article.append(number,make('p','eyebrow',item.category||''),make('h3','',item.title||''),make('p','',item.description||''),make('small','',item.tag||''));fleet.append(article);
      });
    }
    if(Array.isArray(data.gallery)){
      const gallery=document.querySelector('.gallery');gallery.replaceChildren();
      data.gallery.forEach(item=>{
        const button=make('button'),img=make('img');setImage(img,item.image,item.alt||item.label||'Gallery image');button.append(img,make('span','',item.label||''));gallery.append(button);
      });
    }
    const about=data.about||{};
    setText('.about .eyebrow',about.eyebrow);
    setHeading(document.querySelector('.about h2'),about.headline_first,about.headline_second);
    setText('.about>div:nth-child(2)>p:not(.eyebrow)',about.description);
    const sub=data.subscribe||{};
    setText('.subscribe .eyebrow',sub.eyebrow);
    setHeading(document.querySelector('.subscribe h2'),sub.headline_first,sub.headline_second);
    setText('.subscribe p:not(.eyebrow)',sub.description);
    setLink(document.querySelector('.subscribe .button'),yt);
    setLink(document.querySelector('.about .button'),yt);
    setLink(document.querySelector('footer .brand'), '#home');
    const navButton=document.querySelector('nav a.navbutton');
    setLink(navButton,yt,'YouTube ↗');
  }catch(error){console.warn('FlyWithAarav content file could not be loaded; showing built-in page content.',error)}
}
loadEditableContent();
