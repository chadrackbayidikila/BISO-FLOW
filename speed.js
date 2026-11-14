(function(){
let failed=false;
/* 1. Chaque requête s'arrête après 20 s */
run=async function(p){
 let t;const to=new Promise(r=>{t=setTimeout(()=>r({data:null,error:{message:'Connexion trop lente. Réessayez dans un instant.'}}),20000)});
 let res;
 try{res=await Promise.race([Promise.resolve(p),to])}catch(e){res={data:null,error:{message:'Réseau indisponible'}}}
 clearTimeout(t);
 if(res.error){failed=true;toast(res.error.message);return null}
 return res.data===null?true:res.data};
/* 2. Plus d'écran vide infini */
const _boot=boot;
boot=async function(){
 await _boot();
 const r=document.getElementById('root');
 if(r&&r.children.length===1&&/Chargement/.test(r.textContent)){
  r.innerHTML='<div class="auth"><h1>Connexion lente</h1><p class="mu">Le serveur met du temps à répondre.</p><button class="btn" onclick="boot()">Réessayer</button></div>'}};
/* 3. Visiteur sans session : page de connexion */
SB.auth.getSession().then(r=>{if(!r.data.session&&!U)boot()}).catch(()=>{});
/* 4. Affichage immédiat des écrans déjà visités */
const _go=go;
const ck=t=>'bf-c-'+(C?C.id:'')+'-'+t+'-'+sub;
go=async function(t){
 const m=document.getElementById('main');
 const show=C&&m&&!fs&&!q&&((t!==tab)||!m.textContent.trim());
 const c=show?lsGet(ck(t)):null;
 failed=false;
 const p=_go(t);
 const mm=document.getElementById('main');
 if(c&&mm){mm.innerHTML=c;mm.style.opacity='.6';mm.style.pointerEvents='none'}
 try{await p}finally{
  const m2=document.getElementById('main');
  if(m2){m2.style.opacity='';m2.style.pointerEvents='';
   if(C&&tab===t&&!fs&&!failed&&m2.textContent.trim()&&!/Chargement/.test(m2.textContent))lsSet(ck(t),m2.innerHTML)}}};
/* 5. Effacer les copies à la déconnexion */
SB.auth.onAuthStateChange(e=>{if(e==='SIGNED_OUT'){try{Object.keys(localStorage).filter(k=>k.indexOf('bf-c-')===0).forEach(k=>localStorage.removeItem(k))}catch(x){}}});
})();
