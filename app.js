(function(){
var FILTERS=[["all","All"],["travel","Travel/Exchange"],["tech","Tech/Coding/STEM"],["free","Free/Funded"],["soon","Deadline Soon"]];
var state={f:"all",q:"",sort:"deadline",data:[]};
var $=function(id){return document.getElementById(id)};
var UNC="Unconfirmed / Verify on Official Page";
function daysLeft(o){
  if(!o.deadlineConfirmed||!o.deadlineSort)return null;
  var d=new Date(o.deadlineSort+"T23:59:59");
  return Math.ceil((d-new Date())/86400000);
}
function isSoon(o){var d=daysLeft(o);return d!==null&&d>=0&&d<=45}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function flagged(s){return esc(s).split(esc(UNC)).join('<span class="flag">'+UNC+'</span>')}
function match(o){
  if(state.f==="travel"&&!o.hasTravel)return false;
  if(state.f==="tech"&&o.tags.indexOf("tech")<0)return false;
  if(state.f==="free"&&!o.isFree)return false;
  if(state.f==="soon"&&!isSoon(o))return false;
  if(state.q){
    var h=(o.name+" "+o.type+" "+o.eligibility+" "+o.fit+" "+o.travelDuration).toLowerCase();
    return state.q.toLowerCase().split(/\s+/).every(function(w){return h.indexOf(w)>=0});
  }
  return true;
}
function sorted(a){
  var r=a.slice();
  if(state.sort==="name")r.sort(function(x,y){return x.name.localeCompare(y.name)});
  else if(state.sort==="travel")r.sort(function(x,y){return (y.hasTravel-x.hasTravel)||(x.id-y.id)});
  else if(state.sort==="free")r.sort(function(x,y){return (y.isFree-x.isFree)||(x.id-y.id)});
  else r.sort(function(x,y){return x.id-y.id});
  return r;
}
function render(){
  var rows=sorted(state.data.filter(match));
  $("count").textContent=rows.length+" of "+state.data.length+" opportunities";
  if(!rows.length){$("list").innerHTML='<p class="empty">No matches. Try another filter.</p>';return}
  $("list").innerHTML=rows.map(function(o){
    var tg='';
    if(isSoon(o))tg+='<span class="tag soon">Deadline soon</span>';
    if(o.isFree)tg+='<span class="tag free">Free/Funded</span>';
    if(o.hasTravel)tg+='<span class="tag travel">Travel</span>';
    if(o.tags.indexOf("tech")>=0)tg+='<span class="tag">Tech</span>';
    return '<button class="card" data-id="'+o.id+'"><h2><span class="num">'+o.id+'.</span>'+esc(o.name)+'</h2>'+
      '<p class="meta">'+esc(o.type)+'</p><p class="meta dl">Deadline: '+flagged(o.deadline)+'</p><div class="tags">'+tg+'</div></button>';
  }).join("");
}
function sec(t,v){return '<h3>'+t+'</h3><p>'+flagged(v)+'</p>'}
function open(id){
  var o=state.data.filter(function(x){return x.id===id})[0];if(!o)return;
  $("mbody").innerHTML='<h2>'+o.id+'. '+esc(o.name)+'</h2><p class="meta">'+esc(o.type)+'</p>'+
    sec("Deadline and cycle",o.deadline)+sec("Eligibility",o.eligibility)+sec("Travel and duration",o.travelDuration)+
    sec("Funding and fees",o.funding)+sec("Fit and critical reality check",o.fit)+
    '<a class="btn" href="'+esc(o.url)+'" target="_blank" rel="noopener noreferrer">Open official page</a><p class="url">'+esc(o.url)+'</p>';
  $("modal").hidden=false;document.body.style.overflow="hidden";$("close").focus();
}
function closeM(){$("modal").hidden=true;document.body.style.overflow=""}
function init(){
  $("chips").innerHTML=FILTERS.map(function(f){return '<button class="chip" data-f="'+f[0]+'" aria-pressed="'+(f[0]==="all")+'">'+f[1]+'</button>'}).join("");
  $("chips").addEventListener("click",function(e){var b=e.target.closest(".chip");if(!b)return;state.f=b.dataset.f;
    [].forEach.call(document.querySelectorAll(".chip"),function(c){c.setAttribute("aria-pressed",c===b)});render()});
  $("q").addEventListener("input",function(e){state.q=e.target.value.trim();render()});
  $("sort").addEventListener("change",function(e){state.sort=e.target.value;render()});
  $("list").addEventListener("click",function(e){var c=e.target.closest(".card");if(c)open(+c.dataset.id)});
  $("close").addEventListener("click",closeM);
  $("modal").addEventListener("click",function(e){if(e.target===$("modal"))closeM()});
  document.addEventListener("keydown",function(e){if(e.key==="Escape")closeM()});
  fetch("data.json").then(function(r){return r.json()}).then(function(d){state.data=d;render()}).catch(function(){$("list").innerHTML='<p class="empty">Could not load data.json</p>'});
}
init();
})();
