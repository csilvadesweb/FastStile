"use strict";

/* ===== LICENÇA ===== */

function validarLicenca(chave) {
  return /^FS-2026-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(chave);
}

function ativarLicenca() {
  const chave = document.getElementById("chaveLicenca").value.trim();

  if (!validarLicenca(chave)) {
    alert("Chave inválida");
    return;
  }

  localStorage.setItem("faststile_licenciado", "true");
  alert("Licença ativada com sucesso!");
  fecharLicenca();
}

function isLicenciado() {
  return localStorage.getItem("faststile_licenciado") === "true";
}

function bloquearPremium() {
  if (!isLicenciado()) {
    alert("Recurso disponível apenas na versão licenciada.");
    return true;
  }
  return false;
}

/* ===== MODAL ===== */

function abrirLicenca() {
  document.getElementById("modalLicenca").style.display = "flex";
}

function fecharLicenca() {
  document.getElementById("modalLicenca").style.display = "none";
}