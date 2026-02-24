/******************************
 RIWAYAT PAGE - CLEAN VERSION
******************************/

const $ = id => document.getElementById(id);

/* ================= LOAD RIWAYAT ================= */
function renderRiwayat(){

let data = JSON.parse(localStorage.getItem("riwayatData")) || [];

const list = $("listRiwayat");
if(!list) return;

list.innerHTML = "";

if(data.length === 0){
list.innerHTML = "<li style='text-align:center'>Belum ada riwayat upload</li>";
return;
}

data.forEach(item=>{
list.innerHTML += `
<li>
📌 ${item.menu}<br>
🕒 ${item.waktu}<br>
📄 ${item.nama}
</li>`;
});

}

/* ================= HAPUS ================= */
function hapusRiwayat(){

if(confirm("Yakin hapus semua riwayat?")){

localStorage.removeItem("riwayatData");

renderRiwayat();

alert("Riwayat berhasil dihapus");
}
}

/* ================= AUTO LOAD ================= */
document.addEventListener("DOMContentLoaded",()=>{
renderRiwayat();
});
