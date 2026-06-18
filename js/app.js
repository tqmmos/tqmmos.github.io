const VIP_CODES=["VIP123","VIP456"];

function isVIP(){return localStorage.getItem("vip")==="true";}

function openVIP(){document.getElementById("vipModal").style.display="flex";}
function closeVIP(){document.getElementById("vipModal").style.display="none";}

function activeVIP(){
let c=document.getElementById("vipCode").value;
if(!VIP_CODES.includes(c)) return alert("Sai code");
if(localStorage.getItem("used_"+c)) return alert("Đã dùng");
localStorage.setItem("vip","true");
localStorage.setItem("used_"+c,"true");
alert("OK VIP");
closeVIP();
}

function download(a){
if(a.vip&&!isVIP()){openVIP();return;}
window.location.href=a.link;
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

// Lưu dữ liệu toàn bộ
window.allGames = d.games || [];
window.allApps = d.apps || [];

// Nổi bật ngẫu nhiên
const allApps = [
  ...window.allGames,
  ...window.allApps
];

const featuredRandom = [...allApps]
  .sort(() => Math.random() - 0.5)
  .slice(0, 4);

// Hiển thị
render(featuredRandom, "featured");

// Chỉ hiện 6 app
render(window.allGames.slice(0, 6), "games");
render(window.allApps.slice(0, 6), "apps");
});


let selectedApp=null;

function closeAppInfo(){

  document.getElementById("appModal").style.display = "none";

  if(window.fromMoreModal){
    document.getElementById("moreModal").style.visibility = "visible";
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

function download(a) {

  selectedApp = a;

// Nếu mở từ popup Xem thêm thì chỉ ẩn tạm
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
<span>⭐ ${a.star || "N/A"}</span>
<span>⬇️ ${a.downloads || "N/A"}</span>
<span>💾 ${a.size || "N/A"}</span>
</div>
${a.vip ? '<div style="margin:12px 0;padding:10px;background:#fff3cd;color:#b26a00;border-radius:12px;font-weight:700">👑 YÊU CẦU VIP</div>' : ''}
<p>📦 Phiên bản: ${a.version}</p>
<p>📝 Có cải thiện hiệu năng và sửa lỗi.</p>
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
      setTimeout(()=>{app.style.display='none'; if(window.fromMoreModal&&more){more.style.visibility='visible';more.classList.add('show');window.fromMoreModal=false;}},200);
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
