/******************************
 CONFIG
******************************/
const ADMIN_USER = "admin";
const ADMIN_PASS = "1234";

const DRIVE_API = "https://script.google.com/macros/s/AKfycbw-y6LG5ZeYywOKLaU7BJWvLdgGHJfCyUszzla6jr9Ts3_IXIfpiieyAaVKNHeezcXjhQ/exec";

/******************************
 ELEMENTS
******************************/
const loginBox = document.getElementById("loginBox");
const app = document.getElementById("app");
const username = document.getElementById("username");
const password = document.getElementById("password");
const loginStatus = document.getElementById("loginStatus");

const galeriEkstra = document.getElementById("galeriEkstra");
const galeriKegiatan = document.getElementById("galeriKegiatan");
const listPTK = document.getElementById("listPTK");

const totalFoto = document.getElementById("totalFoto");
const totalFile = document.getElementById("totalFile");

/******************************
 FOLDER MAP
******************************/
const folderMap = {
  Tari: "136X1CcQMwN8LKh_C6AaQXjTSd8_6FU7N",
  Pramuka: "1dVPrGsL2DKmdK5ZzdV5AQe89UVN8CH7T",
  Hadroh: "10wtuKAx-IuuzY25FS-zvq3MAq7R7zd_E",
  Kegiatan: "11xLRGB1OIw80chaUJHn_NUNgbMnxYiP9",
  PTK: "1HIzKu4XssoLgdCXQrBJiv_GYgpe6uJwj"
};

/******************************
 LOGIN SYSTEM
******************************/
function login() {
  const u = username.value.trim();
  const p = password.value.trim();

  if (u === ADMIN_USER && p === ADMIN_PASS) {
    localStorage.setItem("isLoggedIn", "true");
    showApp();
    loadData();
  } else {
    loginStatus.innerText = "❌ Username atau Password salah!";
  }
}

function logout() {
  localStorage.removeItem("isLoggedIn");
  location.reload();
}

function showApp() {
  loginBox.classList.add("hidden");
  app.classList.remove("hidden");
}

function showLogin() {
  loginBox.classList.remove("hidden");
  app.classList.add("hidden");
}

/******************************
 AUTO LOGIN
******************************/
document.addEventListener("DOMContentLoaded", () => {
  localStorage.getItem("isLoggedIn") === "true" ? showApp() : showLogin();
  loadData();
});

/******************************
 PAGE SWITCH
******************************/
function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

/******************************
 PREVIEW FOTO
******************************/
function previewFoto(event, previewId) {
  const file = event.target.files[0];
  if (!file) return;

  const preview = document.getElementById(previewId);
  const reader = new FileReader();

  reader.onload = () => {
    preview.src = reader.result;
    preview.style.display = "block";
  };

  reader.readAsDataURL(file);
}

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

/******************************
 UPLOAD GOOGLE DRIVE
******************************/
function uploadDrive(menu, inputId, previewId, statusId, nameInputId = null) {
  const status = document.getElementById(statusId);
  const input = document.getElementById(inputId);
  const file = input?.files[0];
  const previewSrc = previewId ? document.getElementById(previewId)?.src : null;

  if (!file && !previewSrc) {
    status.innerText = "❌ Pilih file atau ambil foto dulu!";
    return;
  }

  const targetFolder = getTargetFolder(menu);
  const finalName = generateFileName(file, nameInputId);

  status.innerText = "⏳ Upload ke Google Drive...";

  const sendBase64 = base64 => {
    fetch(DRIVE_API, {
      method: "POST",
      body: new URLSearchParams({
        folder: targetFolder,
        filename: finalName,
        mime: file ? file.type : "image/png",
        file: base64
      })
    })
      .then(res => res.json())
      .then(data => handleUploadResponse(data))
      .catch(err => status.innerText = "❌ Upload gagal: " + err);
  };

  if (file) {
    const reader = new FileReader();
    reader.onload = () => sendBase64(reader.result.split(",")[1]);
    reader.readAsDataURL(file);
  } else {
    sendBase64(previewSrc.split(",")[1]);
  }

  function handleUploadResponse(data) {
    if (data.status !== "success") {
      status.innerText = "❌ Error server: " + data.message;
      return;
    }

    status.innerHTML = `✅ Upload berhasil<br><a href="${data.fileUrl}" target="_blank">Buka File</a>`;

    const waktu = new Date().toLocaleString("id-ID");
    saveRiwayat(menu, finalName, waktu, data.fileUrl);

    updateCount();
    saveData();
  }
}

/******************************
 HELPERS
******************************/
function getTargetFolder(menu) {
  if (menu === "Ekstra") return folderMap[kategoriEkstra.value];
  if (menu === "Kegiatan") return folderMap.Kegiatan;
  if (menu === "PTK") return folderMap.PTK;
  return "";
}

function generateFileName(file, nameInputId) {
  if (!file) return "camera_" + Date.now() + ".png";

  let name = file.name;

  if (nameInputId) {
    const input = document.getElementById(nameInputId)?.value.trim();
    if (input) {
      const ext = file.name.split(".").pop();
      name = input.replace(/[^a-z0-9]/gi, "_") + "." + ext;
    }
  }

  return name;
}

/******************************
 SIMPAN RIWAYAT (HALAMAN 2 SAJA)
******************************/
function saveRiwayat(menu, fileName, waktu, url) {
  const log = `
    <li>
      📌 <b>${menu}</b><br>
      🕒 ${waktu}<br>
      📄 ${fileName}<br>
      🔗 <a href="${url}" target="_blank">Buka File</a>
    </li>
  `;

  const old = localStorage.getItem("listUpload") || "";
  localStorage.setItem("listUpload", log + old);
}

/******************************
 COUNTER
******************************/
function updateCount() {
  totalFoto.innerText =
    document.querySelectorAll("#galeriEkstra li, #galeriKegiatan li").length || 0;

  totalFile.innerText =
    document.querySelectorAll("#listPTK li").length || 0;
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw,js");
}

window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});


/******************************
 LOCAL STORAGE DASHBOARD
******************************/
function saveData() {
  localStorage.setItem("galeriEkstra", galeriEkstra?.innerHTML || "");
  localStorage.setItem("galeriKegiatan", galeriKegiatan?.innerHTML || "");
  localStorage.setItem("listPTK", listPTK?.innerHTML || "");
  localStorage.setItem("totalFoto", totalFoto?.innerText || 0);
  localStorage.setItem("totalFile", totalFile?.innerText || 0);
}

function loadData() {
  if (galeriEkstra) galeriEkstra.innerHTML = localStorage.getItem("galeriEkstra") || "";
  if (galeriKegiatan) galeriKegiatan.innerHTML = localStorage.getItem("galeriKegiatan") || "";
  if (listPTK) listPTK.innerHTML = localStorage.getItem("listPTK") || "";

  if (totalFoto) totalFoto.innerText = localStorage.getItem("totalFoto") || 0;
  if (totalFile) totalFile.innerText = localStorage.getItem("totalFile") || 0;
}
