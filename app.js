{
const ST=[["essayer","À essayer"],["commander","À commander"],["teste","Testé"]];
const KEY="dm-marques-v1";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const MOIS=["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."];
const state={items:[],filter:"tous",q:"",open:null,loaded:false,offline:false};
const $=id=>document.getElementById(id);
const pd=d=>{const [y,m,j]=String(d).split("-").map(Number);return new Date(y,(m||1)-1,j||1)};
$("today").textContent=new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});

let marks={};
try{marks=JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch(e){marks={}}
const saveMarks=()=>{try{localStorage.setItem(KEY,JSON.stringify(marks))}catch(e){}};
const mk=id=>marks[id]||{statut:"",fav:false};

function sections(it){
  const s=[["Pourquoi c'est malin",it.pourquoi],["Idée pour tes projets",it.idee],["En pratique",it.pratique]];
  let h=s.filter(x=>x[1]).map(([t,v])=>`<div class="sec"><h3>${esc(t)}</h3><p>${esc(v)}</p></div>`).join("");
  const L=(Array.isArray(it.liens)?it.liens:[]).filter(l=>l&&/^https:\/\//.test(l.u||""));
  if(L.length)h+=`<div class="sec"><h3>Pour creuser</h3><div class="links">${L.map(l=>`<a href="${esc(l.u)}" target="_blank" rel="noopener">${esc(l.t||"Lien")} ↗</a>`).join("")}</div></div>`;
  return h;
}
function acts(it){
  const m=mk(it.id);
  return `<div class="acts">${ST.map(([k,l])=>`<button class="st" data-id="${esc(it.id)}" data-st="${k}" aria-pressed="${m.statut===k}">${l}</button>`).join("")}<button class="st fav" data-id="${esc(it.id)}" data-fav="1" aria-pressed="${!!m.fav}">★ Favori</button></div>`;
}
function renderHero(){
  const it=state.items[0];
  if(!it){$("heroCat").textContent="";$("heroBody").innerHTML=`<p class="lead">${state.loaded?"Impossible de charger les fiches. Reconnecte-toi au réseau puis rouvre l'appli.":"Chargement des tiroirs…"}</p>`;return}
  const d=pd(it.date);
  $("heroCat").textContent=it.categorie||"";
  $("heroBody").innerHTML=`<p class="c">${esc(d.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"}))}${state.offline?" · hors ligne":""}</p><h1>${esc(it.titre)}</h1><p class="lead">${esc(it.quoi)}</p>${sections(it)}${acts(it)}`;
}
function cats(){const m={};state.items.forEach(i=>{if(i.categorie)m[i.categorie]=1});return Object.keys(m).sort((a,b)=>a.localeCompare(b,"fr"))}
function renderChips(){
  const all=[["tous","Tout"],["fav","★ Favoris"],...ST,...cats().map(c=>["c:"+c,c])];
  $("chips").innerHTML=all.map(([k,l])=>`<button data-f="${esc(k)}" aria-pressed="${state.filter===k}">${esc(l)}</button>`).join("");
}
function match(it){
  const f=state.filter,m=mk(it.id);
  if(f==="fav"&&!m.fav)return false;
  if(ST.some(s=>s[0]===f)&&m.statut!==f)return false;
  if(f.startsWith("c:")&&it.categorie!==f.slice(2))return false;
  const q=state.q.trim().toLowerCase();
  if(q){const hay=[it.titre,it.categorie,it.quoi,it.pourquoi,it.idee,it.pratique].join(" ").toLowerCase();if(!q.split(/\s+/).every(w=>hay.includes(w)))return false}
  return true;
}
function renderList(){
  const rows=state.items.filter(match);
  const n=state.items.length,t=state.items.filter(i=>mk(i.id).statut==="teste").length;
  $("count").textContent=n?`${rows.length} fiche${rows.length>1?"s":""} affichée${rows.length>1?"s":""} · ${n} au total · ${t} testée${t>1?"s":""}`:"";
  if(!rows.length){$("list").innerHTML=`<li class="empty">${n?"Rien dans ce tiroir. Essaie un autre filtre.":""}</li>`;return}
  $("list").innerHTML=rows.map(it=>{
    const d=pd(it.date),o=state.open===it.id,m=mk(it.id);
    const s=ST.find(x=>x[0]===m.statut);
    const mark=[m.fav?'<span class="s">★</span>':"",s?esc(s[1]):""].filter(Boolean).join(" ");
    return `<li class="row"><button data-open="${esc(it.id)}" aria-expanded="${o}"><span class="day"><b>${d.getDate()}</b><small>${MOIS[d.getMonth()]}</small></span><span><span class="t">${esc(it.titre)}</span><br><span class="c">${esc(it.categorie)}</span></span><span class="mark">${mark}</span></button>${o?`<div class="det"><p class="lead">${esc(it.quoi)}</p>${sections(it)}${acts(it)}</div>`:""}</li>`;
  }).join("");
}
function render(){renderHero();renderChips();renderList()}

document.addEventListener("click",e=>{
  const b=e.target.closest("button");if(!b)return;
  if(b.dataset.f){state.filter=b.dataset.f;render();return}
  if(b.dataset.open){state.open=state.open===b.dataset.open?null:b.dataset.open;renderList();return}
  const id=b.dataset.id;if(!id)return;
  const m={...mk(id)};
  if(b.dataset.fav)m.fav=!m.fav;
  else if(b.dataset.st)m.statut=m.statut===b.dataset.st?"":b.dataset.st;
  marks[id]=m;saveMarks();render();
});
$("q").addEventListener("input",e=>{state.q=e.target.value;renderList()});

async function load(){
  try{
    const r=await fetch("decouvertes.json",{cache:"no-cache"});
    if(!r.ok)throw new Error(r.status);
    const data=await r.json();
    state.offline=r.headers.get("x-dm-offline")==="1";
    state.items=(Array.isArray(data)?data:[]).filter(x=>x&&x.date&&x.titre).map(x=>({...x,id:String(x.date)})).sort((a,b)=>b.date.localeCompare(a.date));
  }catch(e){}
  state.loaded=true;render();
}
render();load();
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")load()});
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
}
