const VIP_HASHES=[
"640632983ba14acf7da857b23edd34465f075ac7d1529cadf6fbdfd099892b53",
"2c5d75e771e3723fc786edf4add82e36269d9005babc5d658722b1c7c02e7800",
"eb3e49a32d54aab63a7df7bad1139c5bc162879137ff820c028f0692ea45cfa7"
];

async function sha256(text){

  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text)
  );

  return [...new Uint8Array(buf)]
    .map(b=>b.toString(16).padStart(2,"0"))
    .join("");

}

function isVIP(){return localStorage.getItem("vip")==="true";}

function openVIP(){

    document.getElementById("appModal").style.visibility = "hidden";

    const vip = document.getElementById("vipModal");
    vip.style.display = "flex";
    vip.classList.add("show");
}
function closeVIP(){

    const vip = document.getElementById("vipModal");
    vip.classList.remove("show");

    setTimeout(()=>{
        vip.style.display = "none";

        document.getElementById("appModal").style.visibility = "visible";

    },200);
}

async function activeVIP(){

  let c = document.getElementById("vipCode").value.trim();

  const hashed = await sha256(c);

  if(!VIP_HASHES.includes(hashed)){
    return alert("Hãy mua VIP");
  }

  if(localStorage.getItem("used_"+hashed)){
    return alert("Mã đã dùng");
  }

  localStorage.setItem("vip","true");
  localStorage.setItem("used_"+hashed,"true");

  alert("Kích hoạt thành công 🎉");

  closeVIP();
}

fetch("apps.json").then(r=>r.json()).then(d=>{
function render(list,id){
let el=document.getElementById(id);
el.innerHTML=list.map(a=>`
<div class="card">
<img src="${a.icon}">
<b>${a.name}</b>
<p>${a.version}</p>
${a.vip?'<div class="vip">VIP</div>':''}
<button class="btn" onclick='download(${JSON.stringify(a)})'>Xem</button>
</div>`).join("");
}

window.allGames = d.games || [];
window.allApps = d.apps || [];

const allApps = [
  ...window.allGames,
  ...window.allApps
];

const featuredRandom = [...allApps]
  .sort(() => Math.random() - 0.5)
  .slice(0, 4);

render(featuredRandom, "featured");

render(window.allGames.slice(0, 6), "games");
render(window.allApps.slice(0, 6), "apps");
});


let selectedApp=null;

async function getLatestVersion(bundleId){

  try{
    const r = await fetch(
      `https://itunes.apple.com/lookup?bundleId=${bundleId}`
    );

    const d = await r.json();

    return d.results?.[0]?.version || "N/A";

  }catch(e){
    return "N/A";
  }

}

function closeAppInfo(){

  document.getElementById("appModal").style.display = "none";

  if(window.fromMoreModal){
    document.getElementById("moreModal").style.display = "flex";
    window.fromMoreModal = false;
  }

}

function startDownload(){
 if(!selectedApp) return;

 if(selectedApp.vip && !isVIP()){
   openVIP();
   return;
 }

 window.location.href=selectedApp.link;
}

async function download(a) {

  selectedApp = a;

  const latestVersion =
  a.bundle
    ? await getLatestVersion(a.bundle)
    : (a.version || "N/A");

  const fakeDownloads =
    (Math.floor(Math.random() * 900) + 100) + "K+";

  const fakeStar =
    (4.5 + Math.random() * 0.5).toFixed(1);

  const fakeSize = a.size || (
  a.name.toLowerCase().includes("game")
    ? (Math.floor(Math.random() * 2000) + 500) + " MB"
    : (Math.floor(Math.random() * 500) + 50) + " MB"
);

if (
  document.getElementById("moreModal") &&
  document.getElementById("moreModal").style.display === "flex"
) {
  window.fromMoreModal = true;
  document.getElementById("moreModal").style.visibility = "hidden";
}
  document.getElementById("appInfo").innerHTML = `
<img class="app-banner" src="${a.banner || a.icon}"><div class="app-icon-wrap"><img class="app-icon" src="${a.icon}"></div>
<div style="margin-top:10px">
<h2>${a.name}</h2>
</div>
<div class="app-stats">
<span>⭐ ${fakeStar}</span>
<span>⬇️ ${fakeDownloads}</span>
<span>💾 ${fakeSize}</span>
</div>
${a.vip ? '<div style="margin:12px 0;padding:10px;background:#fff3cd;color:#b26a00;border-radius:12px;font-weight:700">👑 YÊU CẦU VIP</div>' : ''}
<p>📦 Phiên bản: ${latestVersion}</p>
<p>✅ : ${a.dec || "N/A"}</p>
`;document.getElementById("appModal").style.display="flex";
}
function closeMore(){
 document.getElementById("moreModal").style.display="none";
}


function showMore(type){

 const data = type === "games"
   ? window.allGames
   : window.allApps;

 document.getElementById("moreTitle").innerText =
   type === "games"
   ? "🎮 Tất cả trò chơi"
   : "📱 Tất cả ứng dụng";

 document.getElementById("moreList").innerHTML =
 data.map(a=>`
 <div class="card">
   <img src="${a.icon}">
   <b>${a.name}</b>
   <p>${a.version}</p>
   ${a.vip ? '<div class="vip">VIP</div>' : ''}
   <button class="btn" onclick='download(${JSON.stringify(a)})'>
      Xem
   </button>
 </div>
 `).join("");

 document.getElementById("moreModal").style.display="flex";
}

document.addEventListener('DOMContentLoaded',()=>{
  const app=document.getElementById('appModal');
  const more=document.getElementById('moreModal');

  const oldDownload=window.download;
  window.download=function(a){
    oldDownload(a);
    requestAnimationFrame(()=>app && app.classList.add('show'));
  }

  const oldCloseApp=window.closeAppInfo;
  window.closeAppInfo=function(){
    if(app){
      app.classList.remove('show');
      setTimeout(()=>{app.style.display='none'; if(window.fromMoreModal && more){
    more.style.visibility = 'visible';
    window.fromMoreModal = false;
}},200);
    }
  }

  const oldShowMore=window.showMore;
  window.showMore=function(type){
    oldShowMore(type);
    requestAnimationFrame(()=>more && more.classList.add('show'));
  }

  window.closeMore=function(){
    if(more){
      more.classList.remove('show');
      setTimeout(()=>{more.style.display='none';},200);
    }
  }
});
