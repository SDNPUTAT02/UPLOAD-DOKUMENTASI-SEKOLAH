document.addEventListener("DOMContentLoaded", () => {
  const listUpload = document.getElementById("listUpload");
  if (!listUpload) return;

  const saved = localStorage.getItem("listUpload");

  listUpload.innerHTML = saved && saved.trim() !== ""
    ? saved
    : "<li>📭 Belum ada riwayat upload</li>";
});

function hapusRiwayat() {
  if (confirm("Hapus semua riwayat upload?")) {
    localStorage.removeItem("listUpload");
    document.getElementById("listUpload").innerHTML =
      "<li>📭 Riwayat dikosongkan</li>";
  }
}
