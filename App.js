function aceitarPrivacidade() {
  localStorage.setItem("p_acc", "1");
  document.getElementById("modalPrivacidade").style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  if (!localStorage.getItem("p_acc")) {
    document.getElementById("modalPrivacidade").style.display = "flex";
  }
});