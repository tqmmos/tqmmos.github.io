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

function getVIPDaysLeft(){

  const expire = Number(
  localStorage.getItem("vipExpire")
);

  if(!expire) return 0;

  return Math.max(
    0,
    Math.ceil(
      (expire - Date.now()) /
      (1000 * 60 * 60 * 24)
    )
  );

}

function updateVIPInfo(){

  const el =
    document.getElementById("vipInfo");

  if(!el) return;

  if(isVIP()){

    const expire =
      Number(localStorage.getItem("vipExpire"));

    el.innerHTML =
      "👑 VIP còn " +
      getVIPDaysLeft() +
      " ngày<br>📅 Hết hạn: " +
      new Date(expire)
        .toLocaleDateString("vi-VN");

  }else{

    el.innerHTML =
      "🔒 Chưa kích hoạt VIP";

  }

}

function isVIP(){

  const vip =
    localStorage.getItem("vip") === "true";

  const expire =
    Number(localStorage.getItem("vipExpire"));

  if(!vip) return false;

  if(!expire) return false;

  if(Date.now() > expire){

    localStorage.removeItem("vip");
    localStorage.removeItem("vipExpire");

    return false;

  }

  return true;

}

function escapeHtml(text){

  if(text == null) return "";

  return String(text)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");

}

function isIPadDevice(){
  return (/iPad/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1));
}

function applyVipMode(){

    if(isVIP()){

        document.body.classList.add(
            "vip-user"
        );

    }

}

function openVIP(){

    document.getElementById("appModal").style.visibility = "hidden";

    const vip = document.getElementById("vipModal");
    vip.style.display = "flex";

setTimeout(()=>{
    vip.classList.add("show");
},16);
}
function closeVIP(){

    const vip = document.getElementById("vipModal");
    const app = document.getElementById("appModal");

    vip.classList.remove("show");

    setTimeout(()=>{

        vip.style.display = "none";

        app.style.visibility = "visible";

        const content =
          app.querySelector(".modal-content");

        content.classList.remove("animate-popup");

        void content.offsetWidth;

        content.classList.add("animate-popup");

    },300);

}

async function activeVIP(){

  let c = document.getElementById("vipCode").value.trim();

  const hashed = await sha256(c);

  if(!VIP_HASHES.includes(hashed)){
    return alert("Vui lòng mua VIP 👑");
  }

  if(localStorage.getItem("used_"+hashed)){
    return alert("Mã đã dùng");
  }

  const ONE_YEAR = 365 * 24 * 60 * 60 * 1000;

const expireDate =
  Date.now() + ONE_YEAR;

localStorage.setItem("vip","true");
localStorage.setItem("vipExpire", expireDate);
localStorage.setItem("used_"+hashed,"true");

updateVIPInfo();

document.body.classList.add(
    "vip-user"
);

alert(
  "Kích hoạt thành công 🎉\n" +
  "VIP còn " +
  getVIPDaysLeft() +
  " ngày"
);

setTimeout(()=>{
   location.reload();
},500);
}

Promise.all([
  fetch("apps.json",{
    cache:"no-store"
}).then(r => r.json()),
fetch("games.json",{
    cache:"no-store"
}).then(r => r.json())
]).then(async ([appsData, gamesData]) => {

function render(list,id){
let el=document.getElementById(id);
el.innerHTML=list.map(a=>`
<div class="card">
<img loading="lazy" src="${escapeHtml(a.icon)}">
<b>${escapeHtml(a.name)}</b>
<p>✅ ${a.dec || (id === "games" ? "Hacks" : "Premium")}</p>
<p>📦 ${a.version || "N/A"}</p>
${a.vip?'<div class="vip">VIP</div>':''}
<button class="btn" onclick="downloadById(${a._id})">Xem</button>
</div>`).join("");
}

window.allGames = (gamesData || []).sort((a, b) => {

  try{
    return a.name.localeCompare(
      b.name,
      "vi",
      { sensitivity: "base" }
    );
  }catch(e){
    return a.name.localeCompare(b.name);
  }

});

window.allApps = (appsData || []).sort((a, b) => {

  try{
    return a.name.localeCompare(
      b.name,
      "vi",
      { sensitivity: "base" }
    );
  }catch(e){
    return a.name.localeCompare(b.name);
  }

});

const allApps = [
  ...window.allGames,
  ...window.allApps
];

const allItems = allApps;

allItems.forEach(app => {

    if (
        !app.version &&
        Array.isArray(app.versions) &&
        app.versions.length > 0 &&
        app.versions[0].version
    ) {
        app.version = app.versions[0].version;
    }

});

window.allItems = allItems;

allItems.forEach((app, index) => {
    app._id = index;
});

const shuffledApps = [...allApps];

for(let i = shuffledApps.length - 1; i > 0; i--){

  const j = Math.floor(
    Math.random() * (i + 1)
  );

  [shuffledApps[i], shuffledApps[j]] =
  [shuffledApps[j], shuffledApps[i]];

}

window.featuredRandom =
  shuffledApps.slice(
    0,
    isIPadDevice() ? 5 : 4
  );

render(window.featuredRandom,"featured");

async function runQueue(items, worker, limit = 5){

    let index = 0;

    async function next(){

        while(index < items.length){

            const current = items[index++];

            try{
                await worker(current);
            }catch(e){}

        }

    }

    await Promise.all(
        Array.from(
            {length: Math.min(limit, items.length)},
            next
        )
    );

}

(async()=>{

    await runQueue(

        allItems,

        async(app)=>{

            if(!app.bundle) return;

            app.version = await getLatestVersion(
    app.bundle,
    app.version
);

        },

        5

    );

    render(window.featuredRandom,"featured");

    updateHomeApps();

})();

function updateHomeApps(){

  let showCount;

  if (isIPadDevice()) {
    showCount = 10;
  } else if (
    window.innerWidth >= 768 ||
    (
      window.innerWidth < 768 &&
      window.innerWidth > window.innerHeight
    )
  ) {
    showCount = 8;
  } else {
    showCount = 6;
  }

  render(window.allGames.slice(0, showCount), "games");
  render(window.allApps.slice(0, showCount), "apps");

}

updateHomeApps();

let resizeTimer;

function handleResize(){

  clearTimeout(resizeTimer);

  resizeTimer = setTimeout(()=>{
    updateHomeApps();
  },200);

}

window.addEventListener("resize", handleResize, {
  passive:true
});

window.addEventListener(
  "orientationchange",
  handleResize,
  { passive:true }
);

}).catch(err => {

  console.error("Lỗi tải dữ liệu:", err);

  const featured =
    document.getElementById("featured");

  if(featured){
    featured.innerHTML =
      '<p style="padding:20px;text-align:center">❌ Không tải được dữ liệu</p>';
  }

});


let lastAppHtml = "";
let selectedApp = null;


async function getLatestVersion(bundleId, fallbackVersion = "N/A"){

    if(!bundleId) return fallbackVersion;

    const cacheKey = "ver_" + bundleId;

    // Cache 24 giờ
    try{

        const cache = JSON.parse(
            localStorage.getItem(cacheKey) || "null"
        );

        if (
    cache &&
    cache.version &&
    cache.version !== "N/A" &&
    Date.now() - cache.time < 86400000
) {
    return cache.version;
}

    }catch(e){}

    // Thứ tự quốc gia ưu tiên
    const countries = [
        "vn",
        "us",
        "ua",
        "gb",
        "ca",
        "au",
        "jp",
        "kr",
        "sg",
        "hk",
        "tw",
        "fr",
        "de",
        "it",
        "es",
        "th",
        "my",
        "ph",
        "id"
    ];

    let version = fallbackVersion || "N/A";
let foundFromApple = false;

    for(const country of countries){

        const controller = new AbortController();

        const timeout = setTimeout(()=>{
            controller.abort();
        },3000);

        try{

            const res = await fetch(
                `https://itunes.apple.com/lookup?bundleId=${encodeURIComponent(bundleId)}&country=${country}`,
                {
                    signal: controller.signal,
                    cache: "no-store"
                }
            );

            clearTimeout(timeout);

            if(!res.ok) continue;

            const json = await res.json();

            if(
                json &&
                json.resultCount > 0 &&
                json.results &&
                json.results[0] &&
                json.results[0].version
            ){

                version = json.results[0].version;
foundFromApple = true;
break;

            }

        }catch(e){

            clearTimeout(timeout);

        }

    }

    // Chỉ cache khi thực sự lấy được version từ Apple
if (
    foundFromApple &&
    version &&
    version !== "N/A" &&
    version !== fallbackVersion
) {

    try {

        localStorage.setItem(
            cacheKey,
            JSON.stringify({
                version,
                time: Date.now()
            })
        );

    } catch (e) {}

}

return version || fallbackVersion;

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

 if(
   selectedApp.versions &&
   selectedApp.versions.length
 ){

   let html = `
     <h2 style="margin-bottom:15px">
       Chọn phiên bản
     </h2>
   `;

   selectedApp.versions.forEach(v=>{

 html += `
<div class="version-card">

  <span>

    📦 ${v.version}

    ${
      v.vip
      ? ' 👑'
      : ' 🆓'
    }

  </span>

  <button
    onclick="
      if(${v.vip} && !isVIP()){
        openVIP();
      }else{
        const a=document.createElement('a');

a.href='${v.link}';

a.target='_blank';

a.rel='noopener';

a.click();
      }
    "
  >
    TẢI
  </button>

</div>
`;

});

   html += `
<button
  class="btn-close"
  style="margin-top:12px;width:100%"
  onclick="goBackVersion()"
>
  Quay lại
</button>
`;

const box = document.getElementById("appInfo");

box.innerHTML = html;

const actions = document.querySelector(".action-buttons");
if(actions){
    actions.style.display = "none";
}

const downloadBtn = document.querySelector(".download-btn");
if(downloadBtn){
  downloadBtn.style.display = "none";
}

const modal = document.getElementById("appModal");
const content = modal.querySelector(".modal-content");

content.classList.remove("animate-popup");

void content.offsetWidth;

content.classList.add("animate-popup");

   return;
 }

 const a=document.createElement("a");

a.href=selectedApp.link;

a.target="_blank";

a.rel="noopener";

a.click();
}

async function downloadById(id){

    const app = window.allItems.find(x => x._id === id);

    if(!app) return;

    await download(app);

}

async function download(a) {

  selectedApp = a;

const actions = document.querySelector(".action-buttons");
if(actions){
    actions.style.display = "flex";
}

const downloadBtn = document.querySelector(".download-btn");
if(downloadBtn){
  downloadBtn.style.display = "block";
}

  let latestVersion =
    a.version ||
    a.versions?.[0]?.version ||
    "N/A";

if(a.bundle){

    latestVersion = await getLatestVersion(
        a.bundle,
        latestVersion
    );

    a.version = latestVersion;

}

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

  const more = document.getElementById("moreModal");

  more.classList.remove("show");

  setTimeout(()=>{
    more.style.display = "none";
  },300);

}
  document.getElementById("appInfo").innerHTML = `
<img loading="lazy"
     class="app-banner"
     src="${escapeHtml(a.banner || a.icon)}"><div class="app-icon-wrap"><img loading="lazy" class="app-icon" src="${escapeHtml(a.icon)}"></div>
<div style="margin-top:10px">
<h2>${escapeHtml(a.name)}</h2>
</div>
<div class="app-stats">
<span>⭐ ${fakeStar}</span>
<span>⬇️ ${fakeDownloads}</span>
<span>💾 ${fakeSize}</span>
</div>
${a.vip ? '<div style="margin:12px 0;padding:10px;background:#fff3cd;color:#b26a00;border-radius:12px;font-weight:700">👑 YÊU CẦU VIP</div>' : ''}
<p>
📦 Phiên bản:
${
  a.versions
    ? a.versions.length + " phiên bản khả dụng"
    : latestVersion
}
</p>
${
a.versions
? `<p style="color:#007AFF;font-weight:700">
👇 Nhấn TẢI để chọn phiên bản
</p>`
: ""
}
`;

lastAppHtml =
document.getElementById("appInfo").innerHTML;

const modal = document.getElementById("appModal");

modal.classList.remove("show");

modal.style.display = "flex";

setTimeout(()=>{
  modal.classList.add("show");
},20);

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
   <img loading="lazy" src="${escapeHtml(a.icon)}">
<b>${escapeHtml(a.name)}</b>
   <p>✅ ${a.dec || (type === "games" ? "Hacks" : "Premium")}</p>
   <p>📦 ${a.version || "N/A"}</p>
   ${a.vip ? '<div class="vip">VIP</div>' : ''}
   <button class="btn" onclick="downloadById(${a._id})">
      Xem
   </button>
 </div>
 `).join("");

 const more = document.getElementById("moreModal");

more.style.display='flex';

setTimeout(()=>{
    more.classList.add("show");
},16);
}

function goBackVersion(){

  const actions = document.querySelector('.action-buttons');
  if(actions) actions.style.display = 'flex';

  document.getElementById('appInfo').innerHTML = lastAppHtml;

  const downloadBtn = document.querySelector('.download-btn');
  if(downloadBtn){
    downloadBtn.style.display = 'block';
  }

  const content = document.querySelector('#appModal .modal-content');

  if(content){
    content.classList.remove('animate-popup');
    void content.offsetWidth;
    content.classList.add('animate-popup');
  }

}

document.addEventListener('DOMContentLoaded',()=>{

  updateVIPInfo();

  const app=document.getElementById('appModal');
  const more=document.getElementById('moreModal');

  window.closeAppInfo=function(){

  if(app){

    app.classList.remove('show');

    setTimeout(()=>{

      app.style.display='none';

      if(window.fromMoreModal && more){

  more.style.display='flex';

  setTimeout(()=>{
    more.classList.add('show');
  },20);

  window.fromMoreModal = false;
}

    },300);

  }

}

  const oldShowMore=window.showMore;
  window.showMore=function(type){
    oldShowMore(type);
    setTimeout(()=>{
    more && more.classList.add("show");
},16);
  }

  window.closeMore=function(){
    if(more){
      more.classList.remove('show');
      setTimeout(()=>{more.style.display='none';},300);
    }
  }
});

function showFeature(){

  if(!selectedApp) return;

  let html = `
    <h2 style="margin-bottom:15px">
      ✨ Tính năng
    </h2>
  `;

  if(
    selectedApp.features &&
    selectedApp.features.length
  ){

    selectedApp.features.forEach(item=>{

      html += `
      <div class="feature-card">
        ✅ ${item}
      </div>
      `;

    });

  }else{

    html += `
      <div class="feature-card">
        Chưa có thông tin tính năng
      </div>
    `;

  }

  html += `
    <button
      class="btn-close"
      style="margin-top:12px;width:100%"
      onclick="goBackFeature()"
    >
      Quay lại
    </button>
  `;

  const box =
    document.getElementById("appInfo");

  box.innerHTML = html;

  const actions =
    document.querySelector(".action-buttons");

  if(actions){
    actions.style.display = "none";
  }

  const content =
    document.querySelector(
      "#appModal .modal-content"
    );

  content.classList.remove(
    "animate-popup"
  );

  void content.offsetWidth;

  content.classList.add(
    "animate-popup"
  );
}

function goBackFeature(){

  const actions =
    document.querySelector(
      ".action-buttons"
    );

  if(actions){
    actions.style.display = "flex";
  }

  document.getElementById(
    "appInfo"
  ).innerHTML = lastAppHtml;

  const content =
    document.querySelector(
      "#appModal .modal-content"
    );

  content.classList.remove(
    "animate-popup"
  );

  void content.offsetWidth;

  content.classList.add(
    "animate-popup"
  );
}

window.addEventListener("error",e=>{

    console.error(e.error);

});

window.addEventListener(

"unhandledrejection",

e=>{

    console.error(e.reason);

});