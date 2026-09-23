// Pisos Murcia — app con sincronización en tiempo real (Firebase)
import { firebaseConfig } from './config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, sendPasswordResetEmail, signOut, connectAuthEmulator } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, getDoc, connectFirestoreEmulator } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';

const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const P={home:'<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
map:'<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/>',
plus:'<path d="M5 12h14"/><path d="M12 5v14"/>',minus:'<path d="M5 12h14"/>',
sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
moon:'<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
heart:'<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',back:'<path d="m15 18-6-6 6-6"/>',chev:'<path d="m9 18 6-6-6-6"/>',
sliders:'<line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/>',
trash:'<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
pencil:'<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>',
image:'<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
clip:'<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',
phone:'<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
camera:'<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
ext:'<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
pin:'<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
tag:'<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.420 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
check:'<path d="M20 6 9 17l-5-5"/>',search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
link:'<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
cal:'<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
sort:'<path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/>',
star:'<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.010a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
maxi:'<path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/>',
user:'<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>'};
const I=(n,c='')=>`<svg class="i ${c}" viewBox="0 0 24 24">${P[n]}</svg>`;
const COLORS={red:['#353a22','#fff'],deep:['#7d8a4e','#fff'],salmon:['#e7dcc4','#4a3f22'],ink:['#1f1f1a','#fff'],grey:['#b9b5ab','#1f1f1a'],pale:['#e6e3dd','#55534c']};
const TOWNS={'Murcia':[37.9834,-1.1299],'Cartagena':[37.6057,-0.9863],'Lorca':[37.6771,-1.7003],'Molina de Segura':[38.0547,-1.2076],'Alcantarilla':[37.969,-1.217],'San Javier':[37.8063,-0.8375],'San Pedro del Pinatar':[37.835,-0.791],'Los Alcázares':[37.744,-0.851],'Torre-Pacheco':[37.743,-0.953],'Águilas':[37.4063,-1.5829],'Mazarrón':[37.599,-1.315],'Totana':[37.769,-1.501],'Cieza':[38.239,-1.419],'Caravaca de la Cruz':[38.106,-1.861],'Jumilla':[38.475,-1.325],'Yecla':[38.614,-1.115]};
const BOUNDS=[[37.36,-2.36],[38.77,-0.62]];
const DEFAULT_STATUSES=[{id:'s1',name:'Nuevo',color:'red'},{id:'s2',name:'Contactado',color:'salmon'},{id:'s3',name:'En curso',color:'ink'},{id:'s4',name:'Visitado',color:'deep'},{id:'s5',name:'Descartado',color:'pale'}];

/* ============ FIREBASE ============ */
const gate=$('#gate');
const configured=firebaseConfig&&firebaseConfig.apiKey&&!/PEGA_AQUI/.test(firebaseConfig.apiKey+firebaseConfig.projectId);
const useEmu=/^(localhost|127\.0\.0\.1)$/.test(location.hostname)&&new URLSearchParams(location.search).has('emu');
let app,auth,db;
if(configured||useEmu){
 app=initializeApp(configured?firebaseConfig:{apiKey:'demo-key',authDomain:'demo-pisos.firebaseapp.com',projectId:'demo-pisos',appId:'demo'});
 auth=getAuth(app);
 db=initializeFirestore(app,{localCache:persistentLocalCache({tabManager:persistentMultipleTabManager()})});
 if(useEmu){connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true});connectFirestoreEmulator(db,'127.0.0.1',8080)}
}
const pRef=id=>doc(db,'pisos',id);
const fRef=id=>doc(db,'fotos',id);
const stRef=()=>doc(db,'ajustes','estados');
const errW=e=>{console.error(e);toast(e?.code==='permission-denied'?'Sin permiso para guardar':'No se pudo guardar: '+(e?.message||e))};
const clean=p=>{const o={...p};delete o.id;return o};
function upd(id,fields){const p=pisoOf(id);fields={...fields,updated:Date.now()};if(p)Object.assign(p,fields);updateDoc(pRef(id),fields).catch(errW)}
function putPiso(p){setDoc(pRef(p.id),clean({...p,updated:Date.now()})).catch(errW)}
function saveStatuses(){setDoc(stRef(),{list:S.statuses}).catch(errW)}

/* ============ ESTADO ============ */
const S={pisos:[],statuses:DEFAULT_STATUSES.map(s=>({...s}))};
let loaded={pisos:false,st:false},ready=false,unsub=[],syncState='ok';
const ui={tab:'home',filter:'all',q:'',sort:0,detail:null,gi:0,mort:{down:20,years:30,rate:2.9},mf:{st:[],max:400000,rooms:0,fav:false},zone:null,sel:null};
try{const m=JSON.parse(localStorage.getItem('pisos-mort'));if(m)Object.assign(ui.mort,m)}catch(e){}
const SORTS=[['Recientes',(a,b)=>b.created-a.created],['Precio ↑',(a,b)=>a.price-b.price],['Precio ↓',(a,b)=>b.price-a.price],['€/m² ↑',(a,b)=>(a.price/(a.m2||1))-(b.price/(b.m2||1))]];
const eur=n=>n==null||isNaN(n)||!isFinite(n)?'—':Math.round(n).toLocaleString('es-ES',{useGrouping:true})+' €';
const kfmt=n=>n>=1e6?(n/1e6).toFixed(2).replace('.',',')+'M':Math.round(n/1000)+'k';
const stOf=id=>S.statuses.find(s=>s.id===id)||S.statuses[0];
const pisoOf=id=>S.pisos.find(p=>p.id===id);
const col=s=>COLORS[s?.color]||COLORS.ink;
const norm=d=>{const p={id:d.id,...d.data()};p.links=p.links||[];p.photos=p.photos||[];p.notes=p.notes||'';p.visit=p.visit||'';p.cover=p.cover||'';return p};
function portalOf(u){try{const h=new URL(u).hostname.replace('www.','');
 if(/idealista/.test(h))return{name:'Idealista',ab:'id',ad:1};if(/fotocasa/.test(h))return{name:'Fotocasa',ab:'fc',ad:1};if(/habitaclia/.test(h))return{name:'Habitaclia',ab:'hb',ad:1};if(/pisos\.com/.test(h))return{name:'Pisos.com',ab:'pc',ad:1};
 if(/google\.[a-z.]+$/.test(h)&&/maps/.test(u)||/goo\.gl|maps\.app/.test(h))return{name:'Google Maps',ab:'gm',maps:1};return{name:h,ab:h.slice(0,2)}}catch(e){return null}}
function coordsFrom(u){let m=u.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)||u.match(/[?&](?:q|ll|query)=(-?\d+\.\d+),\s*(-?\d+\.\d+)/)||u.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);return m?[+m[1],+m[2]]:null}
function coverHTML(p){return p.cover?`<img src="${p.cover}" alt="">`:`<div class="ph">${p.photos.length?'Cargando foto…':'Sin fotos'}</div>`}
function fmtVisit(v){const d=new Date(v);return d.toLocaleDateString('es-ES',{weekday:'short',day:'numeric',month:'short'})+', '+d.toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'})}

/* ============ FOTOS ============ */
const photoCache=new Map();
function getPhoto(id){if(!photoCache.has(id)){const pr=getDoc(fRef(id)).then(s=>s.exists()?s.data().src:null).catch(()=>null);photoCache.set(id,pr);pr.then(v=>{if(!v)photoCache.delete(id)})}return Promise.resolve(photoCache.get(id))}
const cachedSrc=id=>{const v=photoCache.get(id);return typeof v==='string'?v:''};
function imgHTML(id){const s=cachedSrc(id);return `<img data-ph="${esc(id)}" ${s?`src="${s}"`:''} alt="">`}
function hydrate(root){$$('img[data-ph]:not([src])',root).forEach(async img=>{const id=img.dataset.ph;const src=await getPhoto(id);if(src){photoCache.set(id,src);img.src=src}else{img.replaceWith(Object.assign(document.createElement('div'),{className:'ph',textContent:'Foto no disponible'}))}})}
function loadImg(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src})}
function toJpeg(img,max,q){const k=Math.min(1,max/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);c.getContext('2d').drawImage(img,0,0,c.width,c.height);return c.toDataURL('image/jpeg',q)}
async function fileToData(file){const url=URL.createObjectURL(file);try{const img=await loadImg(url);let q=.78,max=1400,out=toJpeg(img,max,q);while(out.length>900000&&q>.35){q-=.1;if(q<.5)max=1100;out=toJpeg(img,max,q)}return out}catch(e){return null}finally{URL.revokeObjectURL(url)}}
async function makeThumb(src){if(!src)return '';try{return toJpeg(await loadImg(src),560,.62)}catch(e){return ''}}
function storePhoto(pisoId,src){const id=uid();photoCache.set(id,src);setDoc(fRef(id),{src,piso:pisoId,created:Date.now()}).catch(errW);return id}
async function coverFor(ids){return ids.length?makeThumb(await getPhoto(ids[0])):''}

/* ============ INICIO ============ */
function renderHome(anim=true){
 const t=document.documentElement.dataset.theme;
 const counts={};S.pisos.forEach(p=>counts[p.status]=(counts[p.status]||0)+1);
 const q=ui.q.trim().toLowerCase();
 let list=S.pisos.filter(p=>(ui.filter==='all'||(ui.filter==='fav'?p.fav:p.status===ui.filter))&&(!q||(p.title+' '+p.town).toLowerCase().includes(q))).sort(SORTS[ui.sort][1]);
 const now=Date.now();const nv=S.pisos.filter(p=>p.visit&&new Date(p.visit)>now).sort((a,b)=>new Date(a.visit)-new Date(b.visit))[0];
 const favN=S.pisos.filter(p=>p.fav).length;
 const sync=syncState==='off'?'<span class="sync off"><i></i>Sin conexión</span>':syncState==='pend'?'<span class="sync pend"><i></i>Guardando…</span>':'<span class="sync"><i></i>Sincronizado</span>';
 $('#home').innerHTML=`
 <header class="hd"><div><div class="kick">${S.pisos.length} guardados · <span id="syncl">${sync}</span></div><h1>Mis pisos</h1></div><div class="sp"></div>
 <div class="acts"><button class="ibtn" data-a="theme" aria-label="Cambiar tema">${I(t==='dark'?'sun':'moon')}</button><button class="ibtn" data-a="statuses" aria-label="Gestionar estados">${I('tag')}</button><button class="ibtn" data-a="account" aria-label="Cuenta">${I('user')}</button></div></header>
 <div class="srch"><label>${I('search','s')}<input id="q" placeholder="Buscar por título o municipio" value="${esc(ui.q)}"></label><button class="sortb" data-a="sort">${I('sort','s')}${SORTS[ui.sort][0]}</button></div>
 <div class="chips" id="stchips">
  <button class="chip ${ui.filter==='all'?'on':''}" data-a="filter" data-f="all">Todos <span class="n">${S.pisos.length}</span></button>
  ${favN?`<button class="chip ${ui.filter==='fav'?'on':''}" data-a="filter" data-f="fav">${I('heart','s')}<span class="n">${favN}</span></button>`:''}
  ${S.statuses.map(s=>`<button class="chip ${ui.filter===s.id?'on':''}" data-a="filter" data-f="${s.id}"><i class="dot" style="background:${col(s)[0]}"></i>${esc(s.name)} <span class="n">${counts[s.id]||0}</span></button>`).join('')}
  <button class="chip add" data-a="statuses">${I('plus','s')}Estado</button>
 </div>
 ${nv&&ui.filter==='all'&&!q?`<button class="visit" data-a="open" data-id="${nv.id}">${I('cal')}<div><b>Próxima visita · ${fmtVisit(nv.visit)}</b><span>${esc(nv.title)}</span></div>${I('chev')}</button>`:''}
 <div class="list">${list.length?list.map((p,i)=>cardHTML(p,anim?i:-40)).join(''):`<div class="empty"><h4>Nada por aquí</h4><p>${S.pisos.length?'No hay pisos con este filtro.':'Pega un enlace de Idealista, Fotocasa o Google Maps para guardar tu primer piso.'}</p><button class="btn btn-primary" data-a="add">${I('plus','s')}Añadir piso</button></div>`}</div>`;
}
function renderHomeKeep(){const a=document.activeElement,had=a&&a.id==='q',pos=had?a.selectionStart:0,h=$('#home'),sc=h.scrollTop;renderHome(false);h.scrollTop=sc;if(had){const n=$('#q');n.focus();try{n.setSelectionRange(pos,pos)}catch(e){}}}
function cardHTML(p,i){const s=stOf(p.status),c=col(s);
 return `<article class="pcard" data-a="open" data-id="${p.id}" style="--i:${i}">
 <div class="pc-img">${coverHTML(p)}<button class="st" data-a="quick" data-id="${p.id}" style="background:${c[0]};color:${c[1]}">${esc(s.name)}</button>
 <button class="ibtn glass fav ${p.fav?'on':''}" data-a="fav" data-id="${p.id}" aria-label="Favorito">${I('heart')}</button>
 ${p.photos.length>1?`<span class="pcnt">${I('image','s')}${p.photos.length}</span>`:''}</div>
 <div class="pc-body"><div class="prow"><div class="price">${p.price?eur(p.price):'—'}</div><div class="ppm">${p.m2&&p.price?eur(p.price/p.m2)+'/m²':''}</div></div>
 <div class="ptitle">${esc(p.title)}</div>
 <div class="meta"><div><b>${p.m2||'—'}</b> m²</div><div><b>${p.rooms||'—'}</b> hab.</div><div><b>${p.baths||'—'}</b> baños</div><div>${esc(p.town)}</div></div>
 ${p.links.length?`<div class="links">${p.links.map(l=>`<a class="lnk" href="${esc(l)}" target="_blank" rel="noopener" data-stop>${esc(portalOf(l)?.name||'Enlace')}${I('ext','s')}</a>`).join('')}</div>`:''}
 </div></article>`}

/* ============ FICHA ============ */
let pendingDetail=false;
function openDetail(id){ui.detail=id;ui.gi=0;renderDetail();requestAnimationFrame(()=>$('#detail').classList.add('open'));photoTarget=srcs=>addPhotosTo(ui.detail,srcs)}
function closeDetail(){$('#detail').classList.remove('open');ui.detail=null;photoTarget=null}
function renderDetail(keep){const p=pisoOf(ui.detail);if(!p)return;pendingDetail=false;const sc=$('#detail .d-scroll')?.scrollTop||0;
 if(ui.gi>=p.photos.length)ui.gi=Math.max(0,p.photos.length-1);
 const m=ui.mort,loan=p.price*(1-m.down/100),r=m.rate/100/12,n=m.years*12,q=r?loan*r/(1-Math.pow(1+r,-n)):loan/n,up=p.price*m.down/100+p.price*.1;
 $('#detail').innerHTML=`<div class="d-top"><button class="ibtn glass" data-a="close" aria-label="Volver">${I('back')}</button><div class="sp"></div>
 <button class="ibtn glass fav ${p.fav?'on':''}" data-a="fav" data-id="${p.id}" aria-label="Favorito">${I('heart')}</button><div class="sp"></div><button class="ibtn glass" data-a="edit" data-id="${p.id}" aria-label="Editar">${I('pencil')}</button></div>
 <div class="d-scroll"><div class="gal">
  <div class="gal-track" id="gtrack">${p.photos.length?p.photos.map(id=>`<div class="slide">${imgHTML(id)}</div>`).join(''):`<div class="slide"><div class="ph">Sin fotos — añade algunas</div></div>`}</div>
  ${p.photos.length>1?`<div class="gal-dots">${p.photos.map((_,i)=>`<i class="${i===ui.gi?'on':''}"></i>`).join('')}</div>`:''}
  <div class="gal-bar"><button class="add" data-a="addPhotos">${I('plus','s')}Foto</button><span class="sp"></span>
  ${p.photos.length?`${ui.gi>0?`<button data-a="cover">${I('star','s')}Portada</button>`:''}<button data-a="delPhoto" aria-label="Borrar foto">${I('trash','s')}</button><span id="gcount">${ui.gi+1} / ${p.photos.length}</span>`:''}</div>
 </div>
 <div class="d-body">
  <div class="chips">${S.statuses.map(x=>`<button class="chip ${x.id===p.status?'on':''}" data-a="setStatus" data-s="${x.id}" ${x.id===p.status?`style="background:${col(x)[0]};color:${col(x)[1]};border-color:transparent"`:''}><i class="dot" style="background:${col(x)[0]}"></i>${esc(x.name)}</button>`).join('')}</div>
  <div class="d-head"><div class="prow"><div class="price">${p.price?eur(p.price):'Sin precio'}</div></div><h3>${esc(p.title)}</h3>
  <div class="d-town">${I('pin','s')}${esc(p.town)}<button class="btn btn-ghost" data-a="onMap">Ver en mapa ${I('chev','s')}</button></div></div>
  <div class="stats"><div><b>${p.m2||'—'}</b><span>m²</span></div><div><b>${p.rooms||'—'}</b><span>Hab.</span></div><div><b>${p.baths||'—'}</b><span>Baños</span></div><div><b>${p.m2&&p.price?Math.round(p.price/p.m2).toLocaleString('es-ES'):'—'}</b><span>€/m²</span></div></div>
  <section class="sec"><h6>Enlaces <span class="text-muted" style="font-size:11px">${p.links.length}</span></h6>
   ${p.links.map((l,i)=>{const pt=portalOf(l)||{name:'Enlace',ab:'↗'};return `<a class="lrow" href="${esc(l)}" target="_blank" rel="noopener"><span class="lic">${esc(pt.ab.toUpperCase())}</span><span><b>${esc(pt.name)}</b><small>${esc(l.replace(/^https?:\/\/(www\.)?/,''))}</small></span><span style="display:flex;align-items:center">${I('ext','s')}<button class="x" data-a="delLink" data-i="${i}" aria-label="Quitar">${I('x','s')}</button></span></a>`}).join('')}
   <div class="addl"><input class="input" id="newLink" placeholder="Pega otro enlace (anuncio, Maps…)"><button class="btn" data-a="addLink" aria-label="Añadir enlace">${I('plus','s')}</button></div></section>
  <section class="sec"><h6>Visita</h6><input class="input" type="datetime-local" data-d="visit" value="${esc(p.visit)}"></section>
  <section class="sec"><h6>Notas</h6><textarea class="input" data-d="notes" placeholder="Comunidad, orientación, reformas, contacto de la agencia…">${esc(p.notes)}</textarea></section>
  ${p.price?`<section class="sec"><h6>Hipoteca estimada</h6><div class="mort">
   <div class="row"><span>Entrada</span><div class="seg" style="width:180px">${[10,20,30].map(v=>`<button class="seg-opt ${m.down===v?'on':''}" data-a="mort" data-k="down" data-v="${v}">${v}%</button>`).join('')}</div></div>
   <div class="row"><span>Plazo</span><div class="seg" style="width:180px">${[20,25,30].map(v=>`<button class="seg-opt ${m.years===v?'on':''}" data-a="mort" data-k="years" data-v="${v}">${v} años</button>`).join('')}</div></div>
   <div class="row"><span>Interés fijo (TIN %)</span><input class="input" type="number" step="0.1" min="0" id="rate" value="${m.rate}"></div>
   <div class="res"><div><b>${eur(q)}</b><span>cuota al mes</span></div><div><b>${eur(up)}</b><span>ahorro necesario (entrada + ~10% gastos e impuestos)</span></div></div>
  </div></section>`:''}
  <button class="btn btn-secondary btn-block danger" data-a="delPiso">${I('trash','s')}Eliminar piso</button>
 </div></div>`;
 hydrate($('#detail'));
 const tr=$('#gtrack');if(tr){tr.scrollLeft=ui.gi*tr.clientWidth;tr.onscroll=()=>{const i=Math.round(tr.scrollLeft/tr.clientWidth);if(i!==ui.gi){ui.gi=i;const c=$('#gcount');if(c)c.textContent=`${i+1} / ${p.photos.length}`;$$('.gal-dots i').forEach((d,j)=>d.classList.toggle('on',j===i));const bar=$('.gal-bar');const cv=bar.querySelector('[data-a=cover]');if(i>0&&!cv){bar.querySelector('[data-a=delPhoto]').insertAdjacentHTML('beforebegin',`<button data-a="cover">${I('star','s')}Portada</button>`)}else if(i===0&&cv)cv.remove()}}}
 if(keep)$('#detail .d-scroll').scrollTop=sc;
}
const editingInDetail=()=>{const a=document.activeElement;return a&&$('#detail').contains(a)&&a.matches('input,textarea,select')};
$('#detail').addEventListener('focusout',()=>setTimeout(()=>{if(pendingDetail&&ui.detail&&!editingInDetail())renderDetail(true)},50));

async function addPhotosTo(pid,srcs){const p=pisoOf(pid);if(!p)return;const ids=srcs.map(s=>storePhoto(pid,s));const photos=[...p.photos,...ids];const f={photos};if(!p.cover)f.cover=await makeThumb(srcs[0]);upd(pid,f);if(ui.detail===pid)renderDetail(true);refresh(false)}

/* ============ HOJAS ============ */
function openSheet(html,cls=''){const w=document.createElement('div');w.className='sheet-wrap';w.innerHTML=`<div class="sheet-bd" data-a="closeSheet"></div><div class="sheet ${cls}"><div class="grab"></div>${html}</div>`;$('#sheets').appendChild(w);requestAnimationFrame(()=>requestAnimationFrame(()=>w.classList.add('in')));return w}
function closeSheet(w){w=w||$$('.sheet-wrap').pop();if(!w)return;w.classList.remove('in');if(w._onClose)w._onClose();setTimeout(()=>w.remove(),380)}
const shHd=t=>`<div class="sh-hd"><h3>${t}</h3><button class="ibtn" data-a="closeSheet" aria-label="Cerrar">${I('x')}</button></div>`;

/* CUENTA */
function accountSheet(){const u=auth.currentUser;const e=u?.email||'';
 openSheet(shHd('Cuenta')+`<div class="sh-body"><div class="acc"><span class="av">${esc((e[0]||'?').toUpperCase())}</span><span><b>${esc(e)}</b><small id="accsync">${syncState==='off'?'Sin conexión: los cambios se guardan en este dispositivo y se enviarán al volver la conexión.':syncState==='pend'?'Enviando cambios…':'Todo sincronizado. Los cambios aparecen al instante en los demás dispositivos.'}</small></span></div>
 <p class="hint">Para tenerla como app en el móvil: en Android (Chrome) menú ⋮ → «Añadir a pantalla de inicio»; en iPhone (Safari) botón Compartir → «Añadir a pantalla de inicio».</p>
 <button class="btn btn-secondary btn-block danger" data-a="logout">${I('logout','s')}Cerrar sesión</button></div>`)}

/* ESTADOS */
let stEdit=null,stDel=null;
function statusSheet(){const w=openSheet(shHd('Estados')+`<div class="sh-body" id="stbody"></div>`);renderStatusBody();w._onClose=()=>{stEdit=null;stDel=null}}
function renderStatusBody(){const b=$('#stbody');if(!b)return;const counts={};S.pisos.forEach(p=>counts[p.status]=(counts[p.status]||0)+1);
 const editor=(s)=>`<div class="edit-box"><label class="lbl">Nombre</label><input class="input" id="stName" value="${esc(s.name)}" placeholder="p. ej. Oferta enviada"><div class="swatches">${Object.keys(COLORS).map(k=>`<button class="swatch ${s.color===k?'on':''}" data-a="stColor" data-c="${k}" style="background:${COLORS[k][0]};color:${COLORS[k][1]}">${s.color===k?I('check','s'):''}</button>`).join('')}</div><div class="acts"><button class="btn btn-secondary" data-a="stCancel">Cancelar</button><button class="btn btn-primary" data-a="stSave">${I('check','s')}Guardar</button></div></div>`;
 b.innerHTML=`<p class="text-muted" style="font-size:13px">Organiza tus pisos por fases. Los cambios se aplican a todos los pisos con ese estado.</p>
 ${S.statuses.map(s=>stEdit&&stEdit.id===s.id?editor(stEdit):stDel===s.id?`<div class="edit-box"><b>¿Eliminar «${esc(s.name)}»?</b><p style="font-size:13px;margin:6px 0 8px">${counts[s.id]?`${counts[s.id]} ${counts[s.id]>1?'pisos tienen':'piso tiene'} este estado. Muévelos a:`:'Ningún piso usa este estado.'}</p>${counts[s.id]?`<div class="lchips" style="margin-bottom:10px">${S.statuses.filter(x=>x.id!==s.id).map((x,i)=>`<button class="chip ${i===0?'on':''}" data-a="stMoveTo" data-s="${x.id}"><i class="dot" style="background:${col(x)[0]}"></i>${esc(x.name)}</button>`).join('')}</div>`:''}<div class="acts"><button class="btn btn-secondary" data-a="stCancel">Cancelar</button><button class="btn btn-primary" data-a="stDelOk" data-id="${s.id}">${I('trash','s')}Eliminar</button></div></div>`:
 `<div class="strow"><i class="sw" style="background:${col(s)[0]}"></i><b>${esc(s.name)}</b><span class="c">${counts[s.id]||0}</span><button class="ibtn" data-a="stEdit" data-id="${s.id}" aria-label="Editar">${I('pencil','s')}</button><button class="ibtn" data-a="stDel" data-id="${s.id}" aria-label="Eliminar" ${S.statuses.length<2?'disabled':''}>${I('trash','s')}</button></div>`).join('')}
 ${stEdit&&stEdit.isNew?editor(stEdit):`<button class="btn btn-secondary btn-block" style="margin-top:14px" data-a="stNew">${I('plus','s')}Nuevo estado</button>`}`;
 const ni=$('#stName');if(ni){ni.focus();ni.oninput=()=>stEdit.name=ni.value;ni.onkeydown=e=>{if(e.key==='Enter')act('stSave',ni)}}
}
function quickStatus(id){const p=pisoOf(id);openSheet(shHd('Cambiar estado')+`<div class="sh-body">${S.statuses.map(s=>`<button class="opt" data-a="quickSet" data-id="${id}" data-s="${s.id}"><span class="oic" style="background:${col(s)[0]};color:${col(s)[1]}">${s.id===p.status?I('check'):''}</span><span><b>${esc(s.name)}</b></span>${I('chev','s')}</button>`).join('')}</div>`)}

/* AÑADIR FOTOS */
let photoTarget=null,photoCb=null;
function photoSheet(cb){photoCb=cb;const w=openSheet(shHd('Añadir fotos')+`<div class="sh-body">
 <button class="opt" data-a="phClip"><span class="oic">${I('clip')}</span><span><b>Pegar del portapapeles</b><small>Imágenes copiadas del anuncio o de otra app</small></span>${I('chev','s')}</button>
 <button class="opt" data-a="phFile"><span class="oic">${I('image')}</span><span><b>Galería del dispositivo</b><small>Selecciona una o varias fotos</small></span>${I('chev','s')}</button>
 <button class="opt" data-a="phShot"><span class="oic">${I('phone')}</span><span><b>Captura de pantalla</b><small>Elige capturas del anuncio desde tu carrete</small></span>${I('chev','s')}</button>
 <button class="opt" data-a="phCam"><span class="oic">${I('camera')}</span><span><b>Hacer foto</b><small>Útil durante la visita</small></span>${I('chev','s')}</button>
 <p class="hint" style="margin-top:14px">En el ordenador también puedes pegar una imagen copiada con Ctrl+V (o ⌘V).</p></div>`);w._onClose=()=>{photoCb=null}}
async function gotPhotos(list){list=list.filter(Boolean);if(!list.length){toast('No se pudo leer la imagen');return}const cb=photoCb||photoTarget;if(photoCb){closeSheet();photoCb=null}cb&&cb(list);toast(`${list.length} ${list.length>1?'fotos añadidas':'foto añadida'}`)}
async function pasteClipboard(){try{const items=await navigator.clipboard.read();const out=[];for(const it of items){const t=it.types.find(t=>t.startsWith('image/'));if(t)out.push(await fileToData(await it.getType(t)))}if(out.length)gotPhotos(out);else toast('No hay ninguna imagen en el portapapeles')}catch(e){toast('Pulsa ⌘V o Ctrl+V para pegar la imagen')}}
['fileIn','camIn'].forEach(id=>$('#'+id).onchange=async e=>{const fs=[...e.target.files];e.target.value='';if(!fs.length)return;toast('Preparando fotos…');gotPhotos(await Promise.all(fs.map(fileToData)))});
document.addEventListener('paste',async e=>{if(e.target.matches&&e.target.matches('input,textarea'))return;const fs=[...(e.clipboardData?.files||[])].filter(f=>f.type.startsWith('image/'));if(fs.length&&(photoCb||photoTarget)){e.preventDefault();gotPhotos(await Promise.all(fs.map(fileToData)))}});

/* FORMULARIO NUEVO / EDITAR */
let form=null;
function formSheet(id){const p=id&&pisoOf(id);
 form=p?{...JSON.parse(JSON.stringify(p)),editing:true,origPhotos:[...p.photos],photos:p.photos.map(id=>({id}))}:{id:uid(),title:'',price:'',m2:'',rooms:'',baths:'',town:'Murcia',lat:null,lng:null,status:S.statuses[0].id,fav:false,links:[],photos:[],notes:'',visit:'',created:Date.now()};
 if(p&&p.lat!=null)form.locSrc=form.locSrc||'Ubicación guardada';
 const w=openSheet(shHd(p?'Editar piso':'Nuevo piso')+`<div class="sh-body">
 <div class="field"><label class="lbl">Enlace del anuncio o de Google Maps</label><div class="linkbox"><input class="input" id="fLink" placeholder="https://www.idealista.com/inmueble/…"><button class="btn" data-a="pasteLink">${I('clip','s')}Pegar</button></div><div id="fImp"></div><div class="lchips" id="fLinks"></div></div>
 <div class="field"><label class="lbl">Título</label><input class="input" data-f="title" value="${esc(form.title)}" placeholder="Piso con terraza en…"></div>
 <div class="grid2"><div class="field"><label class="lbl">Precio (€)</label><input class="input" type="number" inputmode="numeric" data-f="price" value="${form.price||''}" placeholder="180000"></div><div class="field"><label class="lbl">Superficie (m²)</label><input class="input" type="number" inputmode="numeric" data-f="m2" value="${form.m2||''}" placeholder="90"></div></div>
 <div class="grid3"><div class="field"><label class="lbl">Habitaciones</label><input class="input" type="number" inputmode="numeric" data-f="rooms" value="${form.rooms||''}" placeholder="3"></div><div class="field"><label class="lbl">Baños</label><input class="input" type="number" inputmode="numeric" data-f="baths" value="${form.baths||''}" placeholder="2"></div><div class="field"><label class="lbl">Municipio</label><select class="input" data-f="town">${[...new Set([...Object.keys(TOWNS),form.town])].map(t=>`<option ${t===form.town?'selected':''}>${esc(t)}</option>`).join('')}</select></div></div>
 <div class="field"><label class="lbl">Ubicación</label><div id="fLoc"></div></div>
 <div class="field"><label class="lbl">Estado</label><div class="lchips" id="fSt"></div></div>
 <div class="field"><label class="lbl">Fotos</label><div class="thumbs" id="fPh"></div><p class="hint">Los portales no dejan copiar sus fotos automáticamente: pégalas desde el portapapeles, elígelas de la galería o usa capturas de pantalla del anuncio.</p></div>
 </div><div class="sh-foot"><button class="btn btn-primary" data-a="saveForm">${I('check','s')}${p?'Guardar cambios':'Guardar piso'}</button></div>`,'tall');
 w._onClose=()=>{form=null};
 const li=$('#fLink');li.addEventListener('keydown',e=>{if(e.key==='Enter'){addFormLink(li.value);li.value=''}});li.addEventListener('paste',()=>setTimeout(()=>{addFormLink(li.value);li.value=''},0));li.addEventListener('change',()=>{if(li.value){addFormLink(li.value);li.value=''}});
 $$('[data-f]',w).forEach(el=>el.addEventListener('input',()=>{form[el.dataset.f]=el.value;if(el.dataset.f==='town'&&form.locSrc!=='Desde Google Maps'&&form.locSrc!=='Marcada en el mapa'){form.lat=null;form.locSrc=null;renderFormParts()}}));
 renderFormParts();
 return w;
}
function renderFormParts(){if(!form)return;
 $('#fLinks').innerHTML=form.links.map((l,i)=>`<span>${I('link','s')}${esc(portalOf(l)?.name)}<button data-a="fDelLink" data-i="${i}">${I('x','s')}</button></span>`).join('');
 $('#fImp').innerHTML=form.imported?`<div class="imp ok">${I('check','s')}Enlace de ${esc(form.imported)} guardado${form.importTown?' · municipio: '+esc(form.importTown):''}. Completa precio y datos a mano.</div>`:'';
 const hasLoc=form.lat!=null;
 $('#fLoc').innerHTML=`<div class="imp" style="margin:0">${I('pin','s')}<span style="flex:1">${hasLoc?(form.locSrc||'Ubicación marcada')+` · ${(+form.lat).toFixed(4)}, ${(+form.lng).toFixed(4)}`:`Centro de ${esc(form.town)} (aprox.)`}</span><button class="btn btn-ghost" data-a="pickLoc" style="padding:2px 4px">Marcar en mapa</button></div>`;
 $('#fSt').innerHTML=S.statuses.map(s=>`<button class="chip ${form.status===s.id?'on':''}" data-a="fStatus" data-s="${s.id}"><i class="dot" style="background:${col(s)[0]}"></i>${esc(s.name)}</button>`).join('');
 $('#fPh').innerHTML=`<button class="thumb addt" data-a="fAddPh" aria-label="Añadir fotos">${I('plus')}</button>`+form.photos.map((f,i)=>`<div class="thumb">${f.src?`<img src="${f.src}" alt="">`:imgHTML(f.id)}<button data-a="fDelPh" data-i="${i}" aria-label="Quitar foto">${I('x','s')}</button></div>`).join('');
 hydrate($('#fPh'));
}
function townFromUrl(u){const s=decodeURIComponent(u).toLowerCase().replace(/[_+]/g,'-').normalize('NFD').replace(/[̀-ͯ]/g,'');return Object.keys(TOWNS).sort((a,b)=>b.length-a.length).find(t=>s.includes(t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/ /g,'-')))}
function addFormLink(u){u=(u||'').trim();const m=u.match(/https?:\/\/\S+/);if(!m){if(u)toast('Eso no parece un enlace');return}u=m[0];const p=portalOf(u);if(!p||form.links.includes(u))return;form.links.push(u);
 if(p.maps){const c=coordsFrom(u);if(c){form.lat=c[0];form.lng=c[1];form.locSrc='Desde Google Maps'}else toast('Enlace de Maps guardado; marca la ubicación en el mapa')}
 else if(p.ad){const town=townFromUrl(u);form.imported=p.name;form.importTown=town||'';if(town&&form.locSrc!=='Desde Google Maps'&&form.locSrc!=='Marcada en el mapa'){form.town=town;const sel=$('[data-f=town]');if(sel)sel.value=town;form.lat=null}
  if(!form.title){form.title=`Piso en ${form.town}`;const ti=$('[data-f=title]');if(ti)ti.value=form.title}}
 renderFormParts()}
async function saveForm(){const f=form;if(!f.title.trim()){toast('Añade un título');$('[data-f=title]').focus();return}
 const t=TOWNS[f.town]||TOWNS.Murcia;if(f.lat==null){f.lat=t[0]+(Math.random()-.5)*.012;f.lng=t[1]+(Math.random()-.5)*.012}
 const btn=$('[data-a=saveForm]');if(btn)btn.disabled=true;
 const ids=f.photos.map(x=>x.id||storePhoto(f.id,x.src));
 const removed=(f.origPhotos||[]).filter(id=>!ids.includes(id));
 const firstChanged=(f.origPhotos||[])[0]!==ids[0];
 const data={title:f.title.trim(),price:+f.price||0,m2:+f.m2||0,rooms:+f.rooms||0,baths:+f.baths||0,town:f.town,lat:+f.lat,lng:+f.lng,status:f.status,links:f.links,photos:ids};
 const old=f.editing&&pisoOf(f.id);
 if(firstChanged||!old||!old.cover){const first=f.photos[0];data.cover=first?await makeThumb(first.src||await getPhoto(first.id)):''}
 if(f.editing){if(old)upd(f.id,data);else putPiso({...data,id:f.id,fav:f.fav,notes:f.notes,visit:f.visit,created:f.created})}
 else{const p={id:f.id,...data,fav:false,notes:'',visit:'',created:f.created};S.pisos.push(p);putPiso(p)}
 removed.forEach(id=>{photoCache.delete(id);deleteDoc(fRef(id)).catch(()=>{})});
 const ed=f.editing;closeSheet();refresh();if(ed&&ui.detail)renderDetail(true);toast(ed?'Cambios guardados':'Piso guardado')}

/* ============ MAPA ============ */
let map,layer,pickMode=false,pickMarker=null;
function mapVisible(){return S.pisos.filter(p=>{const f=ui.mf;return p.lat!=null&&(!f.st.length||f.st.includes(p.status))&&(!p.price||p.price<=f.max||f.max>=400000)&&(!f.rooms||p.rooms>=f.rooms)&&(!f.fav||p.fav)})}
function initMap(){if(map)return;const b=L.latLngBounds(BOUNDS);
 map=L.map('map',{zoomControl:false,maxBounds:b.pad(.08),maxBoundsViscosity:1,minZoom:8,maxZoom:18,attributionControl:true});
 L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors',bounds:b.pad(.15)}).addTo(map);
 map.fitBounds(b,{paddingTopLeft:[0,110]});layer=L.layerGroup().addTo(map);
 map.on('click',e=>{if(pickMode){setPick(e.latlng);return}ui.sel=null;renderMapFoot();updateMarkers()});
 $('#zoomc').children[0].innerHTML=I('plus');$('#zoomc').children[1].innerHTML=I('minus');$('#zoomc').children[2].innerHTML=I('maxi');
 updateMarkers();}
function updateMarkers(){if(!map)return;layer.clearLayers();const vis=mapVisible();
 vis.forEach((p,i)=>{const s=stOf(p.status),c=col(s);const icon=L.divIcon({className:'pm',iconSize:[0,0],html:`<div class="pin ${ui.sel===p.id?'sel':''}" style="background:${c[0]};color:${c[1]};border-color:${c[0]};animation-delay:${i*30}ms">${p.fav?'♥ ':''}${p.price?kfmt(p.price):'?'}</div>`});
  L.marker([p.lat,p.lng],{icon,zIndexOffset:ui.sel===p.id?1000:0}).on('click',e=>{L.DomEvent.stopPropagation(e);if(pickMode)return;ui.sel=p.id;renderMapFoot();updateMarkers();map.panTo([p.lat,p.lng],{animate:true})}).addTo(layer)});
 $('#mcount').textContent=`${vis.length} de ${S.pisos.length} pisos`;$('#mcount').style.display=ui.sel||pickMode?'none':'';
 const n=(ui.mf.st.length?1:0)+(ui.mf.max<400000?1:0)+(ui.mf.rooms?1:0)+(ui.mf.fav?1:0);$('#fbtn').innerHTML=`${I('sliders','s')}Filtros${n?`<span class="badge">${n}</span>`:''}`;
 const z={};vis.forEach(p=>z[p.town]=(z[p.town]||0)+1);
 $('#zones').innerHTML=`<button class="chip ${!ui.zone?'on':''}" data-a="zone" data-z="">Toda la región</button>`+Object.entries(z).sort((a,b)=>b[1]-a[1]).map(([t,n])=>`<button class="chip ${ui.zone===t?'on':''}" data-a="zone" data-z="${esc(t)}">${esc(t)} <span class="n">${n}</span></button>`).join('');
}
function renderMapFoot(){const f=$('#mfoot'),p=ui.sel&&pisoOf(ui.sel);$('#zoomc').style.display=p?'none':'';$('#mcount').style.display=p?'none':'';if(!p){f.classList.add('hide');return}const s=stOf(p.status),c=col(s);
 f.innerHTML=`<div class="mprev" data-a="open" data-id="${p.id}"><div class="pc-img">${coverHTML(p)}</div><div class="pc-body"><span class="tag" style="background:${c[0]};color:${c[1]};padding:2px 7px;font-weight:600">${esc(s.name)}</span><div class="price" style="margin-top:6px">${p.price?eur(p.price):'—'}</div><div class="ptitle" style="margin:2px 0 4px">${esc(p.title)}</div><div class="ppm">${p.m2||'—'} m² · ${p.rooms||'—'} hab. · ${esc(p.town)}</div></div></div>`;f.classList.remove('hide')}
function flyZone(t){ui.zone=t||null;const pts=mapVisible().filter(p=>!t||p.town===t);if(!t||!pts.length)map.flyToBounds(BOUNDS,{paddingTopLeft:[0,110],duration:.8});else if(pts.length===1)map.flyTo([pts[0].lat,pts[0].lng],14,{duration:.8});else map.flyToBounds(pts.map(p=>[p.lat,p.lng]),{paddingTopLeft:[40,150],paddingBottomRight:[40,60],maxZoom:14,duration:.8});updateMarkers()}
function mapFilterSheet(){const f={...ui.mf,st:[...ui.mf.st]};const w=openSheet(shHd('Filtros del mapa')+`<div class="sh-body" id="mfb"></div><div class="sh-foot"><button class="btn btn-secondary" data-a="mfClear">Limpiar</button><button class="btn btn-primary" data-a="mfApply" id="mfOk"></button></div>`);w._f=f;renderMF(w)}
function renderMF(w){const f=w._f;const n=S.pisos.filter(p=>(!f.st.length||f.st.includes(p.status))&&(f.max>=400000||p.price<=f.max)&&(!f.rooms||p.rooms>=f.rooms)&&(!f.fav||p.fav)).length;
 $('#mfb',w).innerHTML=`<div class="field"><label class="lbl">Estados</label><div class="lchips">${S.statuses.map(s=>`<button class="chip ${f.st.includes(s.id)?'on':''}" data-a="mfSt" data-s="${s.id}"><i class="dot" style="background:${col(s)[0]}"></i>${esc(s.name)}</button>`).join('')}</div></div>
 <div class="field"><div class="rlab"><span>Precio máximo</span><b>${f.max>=400000?'Sin límite':eur(f.max)}</b></div><input type="range" class="range" min="60000" max="400000" step="10000" value="${f.max}" id="mfMax"></div>
 <div class="field"><label class="lbl">Habitaciones</label><div class="seg">${[0,1,2,3,4].map(v=>`<button class="seg-opt ${f.rooms===v?'on':''}" data-a="mfRooms" data-v="${v}">${v?v+'+':'Todas'}</button>`).join('')}</div></div>
 <div class="toggle ${f.fav?'on':''}" data-a="mfFav"><span>Solo favoritos</span><i class="sw-t"></i></div>`;
 $('#mfOk',w).innerHTML=`${I('check','s')}Ver ${n} ${n===1?'piso':'pisos'}`;
 $('#mfMax',w).oninput=e=>{f.max=+e.target.value;$('.rlab b',w).textContent=f.max>=400000?'Sin límite':eur(f.max)};$('#mfMax',w).onchange=()=>renderMF(w)}
function setPick(ll){form.lat=ll.lat;form.lng=ll.lng;form.locSrc='Marcada en el mapa';if(pickMarker)pickMarker.setLatLng(ll);else pickMarker=L.marker(ll,{icon:L.divIcon({className:'pm',iconSize:[0,0],html:`<div class="pin" style="background:var(--color-accent);color:#fff;border-color:var(--color-accent)">Aquí</div>`})}).addTo(map)}
function startPick(){const sh=$$('.sheet-wrap').pop();sh.style.display='none';pickMode=true;startPick.prevTab=ui.tab;switchTab('map',true);$('#mapv').insertAdjacentHTML('beforeend',`<div class="pick-banner" id="pickb">${I('pin','s')}Toca el mapa para marcar el piso<button data-a="pickDone">Listo</button></div>`);ui.sel=null;renderMapFoot();
 if(form.lat!=null)setTimeout(()=>{setPick({lat:+form.lat,lng:+form.lng});map.setView([form.lat,form.lng],15)},350);else setTimeout(()=>map.setView(TOWNS[form.town]||TOWNS.Murcia,13),350);
 startPick.sheet=sh}
function endPick(){pickMode=false;$('#pickb')?.remove();if(pickMarker){map.removeLayer(pickMarker);pickMarker=null}const sh=startPick.sheet;if(sh)sh.style.display='';renderFormParts();updateMarkers()}

/* ============ GENERAL ============ */
function switchTab(t){ui.tab=t;$('#home').classList.toggle('off',t!=='home');$('#mapv').classList.toggle('off',t!=='map');$('#t-home').classList.toggle('on',t==='home');$('#t-map').classList.toggle('on',t==='map');
 if(t==='map'){initMap();setTimeout(()=>map.invalidateSize(),60)}}
$('#t-home').innerHTML=I('home')+'Pisos';$('#t-map').innerHTML=I('map')+'Mapa';$('.fab').innerHTML=I('plus');
function refresh(anim=true){if(anim)renderHome(true);else renderHomeKeep();updateMarkers();if(ui.sel)renderMapFoot()}
let tT;function toast(msg,label,fn){const t=$('#toast');t.querySelector('span').textContent=msg;const b=t.querySelector('button');b.textContent=label||'';b.style.display=label?'':'none';b.onclick=()=>{fn&&fn();t.classList.remove('show')};t.classList.add('show');clearTimeout(tT);tT=setTimeout(()=>t.classList.remove('show'),label?6000:2600)}

function act(a,el,e){const id=el.dataset.id;const p=id&&pisoOf(id);
 switch(a){
 case 'tab':if(pickMode)return;switchTab(el.dataset.t);break;
 case 'add':if(pickMode)return;formSheet();break;
 case 'theme':{const cur=document.documentElement.dataset.theme;const nt=cur==='dark'?'light':'dark';try{localStorage.setItem('pisos-theme',nt)}catch(e){}document.documentElement.dataset.theme=nt;renderHomeKeep();break}
 case 'account':accountSheet();break;
 case 'logout':closeSheet();signOut(auth);break;
 case 'statuses':stEdit=null;stDel=null;statusSheet();break;
 case 'filter':ui.filter=el.dataset.f;renderHome();break;
 case 'sort':ui.sort=(ui.sort+1)%SORTS.length;renderHome();break;
 case 'open':openDetail(id);break;
 case 'close':closeDetail();break;
 case 'fav':{if(!p)return;const v=!p.fav;upd(id,{fav:v});$$(`.fav[data-id="${id}"]`).forEach(b=>{b.classList.toggle('on',v);b.classList.add('pop');setTimeout(()=>b.classList.remove('pop'),300)});setTimeout(()=>{renderHomeKeep();updateMarkers()},320);break}
 case 'quick':quickStatus(id);break;
 case 'quickSet':upd(id,{status:el.dataset.s});closeSheet();refresh(false);if(ui.detail===id)renderDetail(true);toast(`Estado: ${stOf(el.dataset.s).name}`);break;
 case 'edit':formSheet(id);break;
 case 'setStatus':upd(ui.detail,{status:el.dataset.s});renderDetail(true);refresh(false);break;
 case 'addPhotos':photoSheet(photoTarget);break;
 case 'cover':(async()=>{const q=pisoOf(ui.detail);const ph=[...q.photos];const [f]=ph.splice(ui.gi,1);ph.unshift(f);ui.gi=0;upd(q.id,{photos:ph,cover:await coverFor(ph)});renderDetail(true);refresh(false);toast('Nueva portada')})();break;
 case 'delPhoto':(async()=>{const q=pisoOf(ui.detail);const gi=ui.gi;const ph=[...q.photos];const [fid]=ph.splice(gi,1);const src=await getPhoto(fid);const oldCover=q.cover;
  upd(q.id,{photos:ph,...(gi===0?{cover:await coverFor(ph)}:{})});deleteDoc(fRef(fid)).catch(()=>{});renderDetail(true);refresh(false);
  toast('Foto eliminada','Deshacer',()=>{const r=pisoOf(q.id);if(!r)return;if(src){photoCache.set(fid,src);setDoc(fRef(fid),{src,piso:q.id,created:Date.now()}).catch(errW)}const a=[...r.photos];a.splice(gi,0,fid);upd(q.id,{photos:a,...(gi===0?{cover:oldCover}:{})});if(ui.detail===q.id)renderDetail(true);refresh(false)})})();break;
 case 'addLink':{const v=$('#newLink').value.trim();if(!/^https?:\/\//.test(v)){toast('Pega un enlace válido');return}const q=pisoOf(ui.detail);const f={links:[...q.links,v]};const c=portalOf(v)?.maps&&coordsFrom(v);if(c){f.lat=c[0];f.lng=c[1];toast('Ubicación actualizada desde Maps')}upd(q.id,f);renderDetail(true);refresh(false);break}
 case 'delLink':{e.preventDefault();e.stopPropagation();const q=pisoOf(ui.detail);const l=[...q.links];l.splice(+el.dataset.i,1);upd(q.id,{links:l});renderDetail(true);refresh(false);break}
 case 'mort':ui.mort[el.dataset.k]=+el.dataset.v;try{localStorage.setItem('pisos-mort',JSON.stringify(ui.mort))}catch(e){}renderDetail(true);break;
 case 'onMap':{const q=pisoOf(ui.detail);closeDetail();switchTab('map');ui.sel=q.id;setTimeout(()=>{if(!mapVisible().includes(q)){ui.mf={st:[],max:400000,rooms:0,fav:false}}updateMarkers();renderMapFoot();map.flyTo([q.lat,q.lng],15,{duration:.9})},120);break}
 case 'delPiso':(async()=>{const q=pisoOf(ui.detail);if(!q)return;const srcs=await Promise.all(q.photos.map(getPhoto));const i=S.pisos.indexOf(q);
  S.pisos.splice(i,1);deleteDoc(pRef(q.id)).catch(errW);q.photos.forEach(fid=>deleteDoc(fRef(fid)).catch(()=>{}));closeDetail();if(ui.sel===q.id)ui.sel=null;refresh(false);renderMapFoot();
  toast('Piso eliminado','Deshacer',()=>{q.photos.forEach((fid,j)=>{if(srcs[j]){photoCache.set(fid,srcs[j]);setDoc(fRef(fid),{src:srcs[j],piso:q.id,created:Date.now()}).catch(errW)}});q.photos=q.photos.filter((_,j)=>srcs[j]);S.pisos.push(q);putPiso(q);refresh(false)})})();break;
 case 'closeSheet':if(pickMode)return;closeSheet(el.closest('.sheet-wrap'));break;
 case 'stNew':stEdit={isNew:true,id:uid(),name:'',color:'grey'};stDel=null;renderStatusBody();break;
 case 'stEdit':stEdit={...S.statuses.find(s=>s.id===id)};stDel=null;renderStatusBody();break;
 case 'stColor':stEdit.color=el.dataset.c;renderStatusBody();break;
 case 'stCancel':stEdit=null;stDel=null;renderStatusBody();break;
 case 'stSave':{const n=(stEdit.name||'').trim();if(!n){toast('Ponle un nombre');return}if(S.statuses.some(s=>s.id!==stEdit.id&&s.name.toLowerCase()===n.toLowerCase())){toast('Ya existe un estado con ese nombre');return}
  if(stEdit.isNew)S.statuses.push({id:stEdit.id,name:n,color:stEdit.color});else Object.assign(S.statuses.find(s=>s.id===stEdit.id),{name:n,color:stEdit.color});stEdit=null;saveStatuses();renderStatusBody();refresh(false);if(ui.detail)renderDetail(true);if(form)renderFormParts();break}
 case 'stDel':stDel=id;stEdit=null;renderStatusBody();break;
 case 'stMoveTo':$$('[data-a=stMoveTo]').forEach(b=>b.classList.toggle('on',b===el));break;
 case 'stDelOk':{const to=$('[data-a=stMoveTo].on')?.dataset.s||S.statuses.find(s=>s.id!==id).id;let n=0;S.pisos.forEach(q=>{if(q.status===id){upd(q.id,{status:to});n++}});const nm=stOf(id).name;S.statuses=S.statuses.filter(s=>s.id!==id);if(ui.filter===id)ui.filter='all';ui.mf.st=ui.mf.st.filter(s=>s!==id);stDel=null;saveStatuses();renderStatusBody();refresh(false);if(ui.detail)renderDetail(true);toast(n?`«${nm}» eliminado · ${n} movidos a ${stOf(to).name}`:`«${nm}» eliminado`);break}
 case 'phClip':pasteClipboard();break;
 case 'phFile':case 'phShot':$('#fileIn').click();break;
 case 'phCam':$('#camIn').click();break;
 case 'pasteLink':if(navigator.clipboard?.readText)navigator.clipboard.readText().then(t=>addFormLink(t)).catch(()=>{$('#fLink').focus();toast('Pega el enlace en el campo (mantén pulsado → Pegar)')});else $('#fLink').focus();break;
 case 'fDelLink':{const l=form.links.splice(+el.dataset.i,1)[0];if(portalOf(l)?.maps&&form.locSrc==='Desde Google Maps'){form.lat=null;form.locSrc=null}if(!form.links.some(x=>portalOf(x)?.ad))form.imported=null;renderFormParts();break}
 case 'fStatus':form.status=el.dataset.s;renderFormParts();break;
 case 'fAddPh':photoSheet(srcs=>{if(!form)return;form.photos.push(...srcs.map(src=>({src})));renderFormParts()});break;
 case 'fDelPh':form.photos.splice(+el.dataset.i,1);renderFormParts();break;
 case 'pickLoc':startPick();break;
 case 'pickDone':{const back=startPick.prevTab||'home';endPick();switchTab(back);break}
 case 'saveForm':saveForm();break;
 case 'mapFilters':if(!pickMode)mapFilterSheet();break;
 case 'mfSt':{const w=el.closest('.sheet-wrap'),f=w._f,s=el.dataset.s;f.st=f.st.includes(s)?f.st.filter(x=>x!==s):[...f.st,s];renderMF(w);break}
 case 'mfRooms':{const w=el.closest('.sheet-wrap');w._f.rooms=+el.dataset.v;renderMF(w);break}
 case 'mfFav':{const w=el.closest('.sheet-wrap');w._f.fav=!w._f.fav;renderMF(w);break}
 case 'mfClear':{const w=el.closest('.sheet-wrap');w._f={st:[],max:400000,rooms:0,fav:false};renderMF(w);break}
 case 'mfApply':{const w=el.closest('.sheet-wrap');ui.mf=w._f;if(ui.sel&&!mapVisible().some(p=>p.id===ui.sel)){ui.sel=null;renderMapFoot()}updateMarkers();closeSheet(w);break}
 case 'zone':flyZone(el.dataset.z);break;
 case 'zin':map.zoomIn();break;case 'zout':map.zoomOut();break;case 'zreg':flyZone('');break;
 }}
$('#app').addEventListener('click',e=>{if(e.target.closest('[data-stop]')){e.stopPropagation();return}const el=e.target.closest('[data-a]');if(!el||el.disabled)return;if(el.tagName==='A')return;act(el.dataset.a,el,e)});
$('#app').addEventListener('input',e=>{const t=e.target;
 if(t.id==='q'){ui.q=t.value;renderHomeKeep()}
 if(t.dataset.d&&ui.detail){const p=pisoOf(ui.detail),k=t.dataset.d,v=t.value,id=p.id;p[k]=v;clearTimeout(t._w);t._w=setTimeout(()=>upd(id,{[k]:v}),600);if(k==='visit')renderHomeKeep()}
 if(t.id==='rate'){ui.mort.rate=parseFloat(t.value)||0;try{localStorage.setItem('pisos-mort',JSON.stringify(ui.mort))}catch(e){}clearTimeout(t._t);t._t=setTimeout(()=>{renderDetail(true);const r=$('#rate');r&&r.focus()},700)}});
$('#app').addEventListener('change',e=>{const t=e.target;if(t.dataset.d&&ui.detail){clearTimeout(t._w);upd(ui.detail,{[t.dataset.d]:t.value})}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if($$('.sheet-wrap').length&&!pickMode)closeSheet();else if(ui.detail)closeDetail()}});

/* ============ DATOS EN TIEMPO REAL ============ */
function setSync(meta){const s=!navigator.onLine?'off':meta.hasPendingWrites?'pend':meta.fromCache?'off':'ok';if(s===syncState)return;syncState=s;const l=$('#syncl');if(l)l.innerHTML=s==='off'?'<span class="sync off"><i></i>Sin conexión</span>':s==='pend'?'<span class="sync pend"><i></i>Guardando…</span>':'<span class="sync"><i></i>Sincronizado</span>'}
addEventListener('online',()=>setSync({}));addEventListener('offline',()=>setSync({}));
function onData(){
 if(!ready){if(!(loaded.pisos&&loaded.st))return;ready=true;gate.hidden=true;renderHome(true);handleShare();return}
 renderHomeKeep();updateMarkers();if(ui.sel){if(pisoOf(ui.sel))renderMapFoot();else{ui.sel=null;renderMapFoot()}}
 if(ui.detail){if(!pisoOf(ui.detail)){closeDetail();toast('Este piso se ha eliminado')}else if(editingInDetail())pendingDetail=true;else renderDetail(true)}
 if($('#stbody')&&!stEdit&&!stDel)renderStatusBody();
 if(form&&!form.editing)renderFormParts();
}
function listen(){
 unsub.push(onSnapshot(collection(db,'pisos'),{includeMetadataChanges:true},snap=>{
  setSync(snap.metadata);
  if(snap.docChanges().length||!loaded.pisos){S.pisos=snap.docs.map(norm);loaded.pisos=true;onData()}
 },dataError));
 unsub.push(onSnapshot(stRef(),snap=>{
  if(snap.exists()&&Array.isArray(snap.data().list)&&snap.data().list.length){S.statuses=snap.data().list}
  else if(!snap.metadata.fromCache){setDoc(stRef(),{list:DEFAULT_STATUSES}).catch(()=>{})}
  loaded.st=true;onData();
 },dataError));
}
function dataError(e){console.error(e);if(e.code==='permission-denied')showGate('denied');else toast('Error de conexión: '+e.message)}
function stopListening(){unsub.forEach(f=>f());unsub=[];loaded={pisos:false,st:false};ready=false;S.pisos=[];closeDetail();$$('.sheet-wrap').forEach(w=>w.remove())}
function handleShare(){const q=new URLSearchParams(location.search);const txt=[q.get('url'),q.get('text'),q.get('title')].filter(Boolean).join(' ');const m=txt.match(/https?:\/\/\S+/);if(!m)return;history.replaceState(null,'',location.pathname);formSheet();addFormLink(m[0])}

/* ============ PANTALLAS DE ACCESO ============ */
const logo=`<div class="gate-logo">${I('home')}</div>`;
function showGate(kind,msg=''){gate.hidden=false;const c=gate.firstElementChild;
 if(kind==='loading')c.innerHTML='<i class="spin"></i>';
 else if(kind==='setup')c.innerHTML=`${logo}<h1>Falta un paso</h1><p>La app todavía no está conectada a la base de datos. Abre el archivo <code>js/config.js</code> y pega ahí la configuración de tu proyecto de Firebase (lo explica el archivo <code>LEEME.md</code>).</p>`;
 else if(kind==='denied')c.innerHTML=`${logo}<h1>Sin acceso</h1><p>La cuenta <b>${esc(auth.currentUser?.email||'')}</b> no tiene permiso para ver estos pisos. Pide que la añadan a la lista de correos permitidos (reglas de Firestore).</p><button class="btn btn-primary" id="gOut">Salir</button>`;
 else c.innerHTML=`${logo}<h1>Mis pisos</h1><p>Entra con tu correo y contraseña. Los datos se comparten y se actualizan al momento en todos tus dispositivos.</p>
  ${msg?`<div class="err">${esc(msg)}</div>`:''}
  <form id="gForm"><div class="field"><input class="input" type="email" id="gEmail" placeholder="Correo" autocomplete="username" required></div>
  <div class="field"><input class="input" type="password" id="gPass" placeholder="Contraseña" autocomplete="current-password" required></div>
  <button class="btn btn-primary" type="submit" id="gBtn">Entrar</button></form>
  <button class="link" id="gReset">He olvidado la contraseña</button>`;
 $('#gOut')?.addEventListener('click',()=>signOut(auth));
 const f=$('#gForm');if(f){try{$('#gEmail').value=localStorage.getItem('pisos-email')||''}catch(e){}
  f.onsubmit=async ev=>{ev.preventDefault();const em=$('#gEmail').value.trim(),pw=$('#gPass').value;$('#gBtn').disabled=true;$('#gBtn').textContent='Entrando…';
   try{try{localStorage.setItem('pisos-email',em)}catch(e){}await signInWithEmailAndPassword(auth,em,pw)}catch(e){showGate('login',authMsg(e))}};
  $('#gReset').onclick=async()=>{const em=$('#gEmail').value.trim();if(!em){showGate('login','Escribe primero tu correo arriba.');return}
   try{await sendPasswordResetEmail(auth,em);showGate('login','Te hemos enviado un correo para crear una contraseña nueva (mira también en spam).')}catch(e){showGate('login',authMsg(e))}}}
}
function authMsg(e){const c=e?.code||'';if(/invalid-credential|wrong-password|user-not-found|invalid-email/.test(c))return 'Correo o contraseña incorrectos.';if(/too-many-requests/.test(c))return 'Demasiados intentos. Espera unos minutos.';if(/network/.test(c))return 'Sin conexión a internet.';return 'No se pudo entrar ('+c+').'}

if(!auth){showGate('setup')}
else onAuthStateChanged(auth,u=>{stopListening();if(u){showGate('loading');listen()}else showGate('login')});
