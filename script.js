/******************************
 ANDROID PRO SCHOOL APP
 SINGLE CLEAN VERSION
******************************/

/* ================= CONFIG ================= */
const ADMIN_USER="admin";
const ADMIN_PASS="1234";
const DRIVE_API="https://script.google.com/macros/s/AKfycbyPhY3MWu3PnoxhO7rNrmwqBST7OxlwhFzhtSmQwgKGZ2pTS8X7HP2xOMycLkP2i85nbQ/exec";

/* ================= ELEMENT ================= */
const $=id=>document.getElementById(id);

const loginBox=$("loginBox");
const app=$("app");
const username=$("username");
const password=$("password");
const loginStatus=$("loginStatus");

const galeriEkstra=$("galeriEkstra");
const galeriKegiatan=$("galeriKegiatan");
const listPTK=$("listPTK");

const totalFoto=$("totalFoto");
const totalFile=$("totalFile");

/******************************
 FOLDER MAP
******************************/
const folderMap = {
  Tari: "1WBoVqfxcJBkPMVi9STBdgiy1gsKh6WoF",
  Pramuka: "1y4dlkElZoIWFe937qVR9nVHe3SG5g6ki",
  Hadroh: "1nMxjcWKhF_k9lt1M5Ra2DoSDA-442MbV",
  Kegiatan: "19YpKhcaRVvaUgWolHNzsd-xIPORZ6CfE",
  PTK: "1NJ5b1-Q-uc2iy2ExG4rxY-FRA3fe7I65",
  Ekstra: "1-IpJoPcbZKUEVAwkQbsA88Ygu0Cco1Zr"
};

/* ================= LOGIN ================= */
function login(){
if(username.value.trim()===ADMIN_USER &&
password.value.trim()===ADMIN_PASS){
localStorage.setItem("isLoggedIn","true");
showApp();
}else{
loginStatus.innerText="❌ Login gagal";
}
}

function logout(){
localStorage.removeItem("isLoggedIn");
location.reload();
}

function showApp(){
loginBox.classList.add("hidden");
app.classList.remove("hidden");
loadData();
}

function showLogin(){
loginBox.classList.remove("hidden");
app.classList.add("hidden");
}

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded",()=>{
localStorage.getItem("isLoggedIn")==="true"?showApp():showLogin();
});

/* ================= PAGE ================= */
function showPage(id){
document.querySelectorAll(".page").forEach(p=>p.classList.add("hidden"));
$(id).classList.remove("hidden");
updateCount();
renderRiwayat();
}

/* ================= LOADING ================= */
function showLoading(){ $("loadingUpload")?.classList.remove("hidden"); }
function hideLoading(){ $("loadingUpload")?.classList.add("hidden"); }

/* ================= TOAST ================= */
function toast(){
const t=$("toastSuccess");
if(!t) return;
t.classList.add("show");
setTimeout(()=>t.classList.remove("show"),2000);
}

/* ================= FILE NAME ================= */
function fileName(file,input){
if(!file) return "camera_"+Date.now()+".png";
let name=file.name;
if(input){
const val=$(input)?.value.trim();
if(val){
const ext=file.name.split(".").pop();
name=val.replace(/[^a-z0-9]/gi,"_")+"."+ext;
}}
return name;
}

/* ================= UPLOAD ================= */
function uploadDrive(menu,inputId,previewId,statusId,nameInputId=null){

const status=$(statusId);
const input=$(inputId);
const file=input?.files[0];
const preview=previewId?$(previewId)?.src:null;

if(!file && !preview){
status.innerText="❌ Pilih file dulu";
return;
}
const targetFolder = folderMap[menu];

if(!targetFolder){
alert("Folder tidak ditemukan untuk menu: " + menu);
return;
}

console.log("Upload ke folder:", targetFolder);
 
status.innerText="";
showLoading();

const finalName=fileName(file,nameInputId);

const send=b64=>{
fetch(DRIVE_API,{
method:"POST",
body:new URLSearchParams({
folder: folderMap[menu],
filename:finalName,
mime:file?file.type:"image/png",
file:b64
})
})
.then(r=>r.json())
.then(data=>{
hideLoading();

if(data.status!=="success"){
status.innerText="❌ Upload gagal";
return;
}

status.innerText="✅ Upload berhasil";
toast();

/* SIMPAN KE RIWAYAT */
saveRiwayat(menu,finalName);

/* UPDATE DASHBOARD */
updateCount();
renderRiwayat();

})
.catch(()=>{
hideLoading();
status.innerText="❌ Error jaringan";
});
};

if(file){
const reader=new FileReader();
reader.onload=()=>send(reader.result.split(",")[1]);
reader.readAsDataURL(file);
}else{
send(preview.split(",")[1]);
}
}

/* ================= RIWAYAT DATA ================= */
function saveRiwayat(menu,name){

let data=JSON.parse(localStorage.getItem("riwayatData"))||[];

data.unshift({
menu:menu,
nama:name,
waktu:new Date().toLocaleString("id-ID")
});

localStorage.setItem("riwayatData",JSON.stringify(data));
}

/* ================= RENDER RIWAYAT ================= */
function renderRiwayat(){

let data=JSON.parse(localStorage.getItem("riwayatData"))||[];

const list=$("listRiwayat");
if(!list) return;

list.innerHTML="";

data.forEach(item=>{
list.innerHTML+=`
<li>
📌 ${item.menu}<br>
🕒 ${item.waktu}<br>
📄 ${item.nama}
</li>`;
});
}

/* ================= DASHBOARD COUNTER ================= */
function updateCount(){

let data=JSON.parse(localStorage.getItem("riwayatData"))||[];

let foto=data.filter(d=>
d.menu==="Ekstra"||d.menu==="Kegiatan"
).length;

let file=data.filter(d=>
d.menu==="PTK"
).length;

if(totalFoto) totalFoto.innerText=foto;
if(totalFile) totalFile.innerText=file;
}

/* ================= LOAD ================= */
function loadData(){
updateCount();
renderRiwayat();
}

/* ================= AUTO SYNC ================= */
document.addEventListener("visibilitychange",()=>{
if(!document.hidden){
updateCount();
renderRiwayat();
}
});

/* ================= SPLASH ================= */
window.addEventListener("load",()=>{
document.body.classList.add("loaded");
});

/* ================= SERVICE WORKER ================= */
if("serviceWorker" in navigator){
navigator.serviceWorker.register("sw.js");
}


document.querySelectorAll(".menu button").forEach(btn=>{
btn.addEventListener("click",function(){
document.querySelectorAll(".menu button")
.forEach(b=>b.classList.remove("active"));
this.classList.add("active");
});
});

/******************************
 CAMERA
******************************/
async function openCamera(videoId) {
  const video = document.getElementById(videoId);

  if (!navigator.mediaDevices?.getUserMedia) {
    alert("❌ Browser tidak mendukung kamera");
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false
    });

    video.srcObject = stream;
    video.playsInline = true;
    await video.play();

  } catch {
    alert("❌ Kamera gagal dibuka. Izinkan kamera di browser.");
  }
}

/******************************
 TAKE PHOTO
******************************/
function takePhoto(videoId, previewId) {
  const video = document.getElementById(videoId);
  const preview = document.getElementById(previewId);

  if (!video.srcObject) {
    alert("❌ Kamera belum aktif");
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  preview.src = canvas.toDataURL("image/png");
  preview.style.display = "block";
}










