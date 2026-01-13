"use strict";

/* =========================
   LICENÇA
========================= */

function validarLicenca(chave) {
  return /^FS-2026-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(chave);
}

function ativarLicenca() {
  const input = document.getElementById("chaveLicenca");
  const chave = input.value.trim();

  if (!validarLicenca(chave)) {
    mostrarToast("Chave inválida.");
    return;
  }

  localStorage.setItem("faststile_licenciado", "true");
  localStorage.setItem("faststile_chave", chave);

  mostrarToast("Licença ativada com sucesso!");
  fecharLicenca();
}

function isLicenciado() {
  return localStorage.getItem("faststile_licenciado") === "true";
}

/* NÃO interrompe mais o fluxo */
function bloquearPremium() {
  if (!isLicenciado()) {
    abrirLicenca();
    return true;
  }
  return false;
}

/* =========================
   MODAL LICENÇA
========================= */

function abrirLicenca() {
  const modal = document.getElementById("modalLicenca");
  if (modal) modal.style.display = "flex";
}

function fecharLicenca() {
  const modal = document.getElementById("modalLicenca");
  if (modal) modal.style.display = "none";
}

/* =========================
   MENSAGEM INICIAL
========================= */

const dicas = [
  "Controle financeiro inteligente começa com pequenos hábitos.",
  "Seus dados ficam apenas no seu dispositivo.",
  "Organização financeira gera liberdade.",
  "Evite gastos impulsivos. Planeje.",
  "Economizar é tão importante quanto ganhar."
];

function iniciarMensagem() {
  const el = document.getElementById("dicaFinanceira");
  if (!el) return;

  const index = Math.floor(Math.random() * dicas.length);
  el.textContent = dicas[index];
}

/* =========================
   TOAST
========================= */

function mostrarToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = msg;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

/* =========================
   PDF PREMIUM
========================= */

function exportarPDF() {
  if (bloquearPremium()) return;

  const element = document.body;

  const opt = {
    margin: 10,
    filename: "FastStile_Financeiro.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
  };

  html2pdf().set(opt).from(element).save();
}

/* =========================
   INICIALIZAÇÃO GLOBAL
========================= */

document.addEventListener("DOMContentLoaded", () => {
  iniciarMensagem();

  if (!isLicenciado()) {
    setTimeout(() => abrirLicenca(), 600);
  }
});