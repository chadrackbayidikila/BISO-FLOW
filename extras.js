(function(){
let N=[],last=0,cur='';
const _go=go,_me=meBar,_oo=openOrder;
const unread=()=>N.filter(n=>!n.read_at).length;
const label=()=>'Alertes'+(unread()?' ('+unread()+')':'');
meBar=function(){const h=_me();return staff()?h.replace('<button class="btn g s" onclick="SB.auth.signOut()">','<button class="btn g s" id="bfBell" onclick="bfOpen()">'+label()+'</button> <button class="btn g s" onclick="SB.auth.signOut()">'):h};
async function load(check){
 if(!C||!staff()||document.hidden)return;
 if(check&&Date.now()-last>30000){last=Date.now();await SB.rpc('check_delays',{p_company:C.id})}
 const{data}=await SB.from('notifications').select('id,kind,message,order_id,created_at,read_at').eq('company_id',C.id).order('created_at',{ascending:false}).limit(40);
 N=data||[];const b=document.getElementById('bfBell');if(b)b.textContent=label()}
go=async function(t){const r=await _go(t);load(true);return r};
window.bfOpen=async function(){
 await load(true);
 modal('<div class="top"><h1>Alertes</h1><button class="btn g s" onclick="closeM()">Fermer</button></div>'+(N.length?N.map(n=>'<div class="card row" '+(n.order_id?'onclick="openOrder(\''+n.order_id+'\')"':'')+'><span>'+(n.read_at?'':'<span class="tag w">Nouveau</span> ')+esc(n.message)+'<br><small>'+fd(n.created_at)+'</small></span>'+(n.kind==='late'?'<span class="tag x">Retard</span>':'')+'</div>').join(''):'<div class="empty">Aucune alerte.</div>'));
 if(N.some(n=>!n.read_at)){await SB.rpc('mark_notifications_read',{p_company:C.id});N=N.map(n=>({...n,read_at:n.read_at||new Date().toISOString()}));const b=document.getElementById('bfBell');if(b)b.textContent=label()}};
openOrder=async function(id){
 cur=id;await _oo(id);
 if(!staff()||cur!==id)return;
 const[{data:ms},{data:o}]=await Promise.all([SB.from('missions').select('id').eq('order_id',id).in('status',['assigned','in_progress']),SB.from('orders').select('status').eq('id',id).single()]);
 if(cur!==id||(ms&&ms.length)||!o||['completed','cancelled'].includes(o.status))return;
 const md=document.getElementById('md'),acts=md.querySelector('.acts');if(!acts)return;
 const box=document.createElement('div');box.className='card';
 box.innerHTML='<b>Affectation automatique</b><p class="mu">Choisit un livreur disponible dont la zone correspond à l’adresse, sinon le moins chargé.</p><label>Rémunération (FCFA)</label><input id="af" type="number" min="0" value="0"><button class="btn s" style="margin-top:8px" onclick="bfAuto(\''+id+'\')">Affecter automatiquement</button>';
 md.insertBefore(box,acts)};
window.bfAuto=async function(id){
 const r=await run(SB.rpc('auto_assign_mission',{p_order:id,p_fee:+document.getElementById('af').value||0}));
 if(r){toast('Mission affectée à '+r.courier+(r.zone_match?' (zone correspondante)':' (aucune zone correspondante : livreur le moins chargé)'));openOrder(id)}};
setInterval(()=>load(true),60000);
if(typeof C!=='undefined'&&C&&document.getElementById('main'))go(tab);
})();
