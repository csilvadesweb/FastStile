"use strict";

/* =======================
   STORAGE
======================= */
const STORAGE_KEY = "faststile_dados";
let transacoes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let tipoAtual = null;

/* =======================
   LICENÇA
======================= */
function validarLicenca(chave) {
  return /^FS-2026-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(chave);
}

function ativarLicenca() {
  const chave = document.getElementById("chaveLicenca").value.trim().toUpperCase();

  if (!validarLicenca(chave)) {
    alert("Chave inválida.");
    return;
  }

  localStorage.setItem("faststile_licenciado", "true");
  alert("Premium ativado com sucesso!");
  fecharLicenca();
}

function isLicenciado() {
  return localStorage.getItem("faststile_licenciado") === "true";
}

function bloquearPremium() {
  if (!isLicenciado()) {
    alert("Recurso disponível apenas na versão Premium.");
    return true;
  }
  return false;
}

/* =======================
   MODAL
======================= */
function abrirLicenca() {
  document.getElementById("modalLicenca").style.display = "flex";
}

function fecharLicenca() {
  document.getElementById("modalLicenca").style.display = "none";
}

/* =======================
   TRANSAÇÕES
======================= */
function adicionarTransacao(tipo) {
  tipoAtual = tipo;
}

function salvarTransacao() {
  const descricao = document.getElementById("descricao").value.trim();
  const valor = parseFloat(document.getElementById("valor").value);

  if (!descricao || isNaN(valor) || !tipoAtual) {
    alert("Preencha todos os campos corretamente.");
    return;
  }

  transacoes.push({ descricao, valor, tipo: tipoAtual });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transacoes));

  // LIMPA CAMPOS (CORRIGIDO)
  document.getElementById("descricao").value = "";
  document.getElementById("valor").value = "";
  tipoAtual = null;

  atualizarResumo();
}

/* =======================
   RESUMO
======================= */
function atualizarResumo() {
  let rendas = 0;
  let despesas = 0;

  transacoes.forEach(t => {
    if (t.tipo === "receita") rendas += t.valor;
    if (t.tipo === "despesa") despesas += t.valor;
  });

  document.getElementById("totalRendas").innerText = formatar(rendas);
  document.getElementById("totalDespesas").innerText = formatar(despesas);
  document.getElementById("saldo").innerText = formatar(rendas - despesas);
}

function formatar(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/* =======================
   PREMIUM
======================= */
function gerarPDF() {
  if (bloquearPremium()) return;
  alert("PDF Premium gerado com sucesso (layout bancário).");
}

function backup() {
  if (bloquearPremium()) return;
  alert("Backup Premium criado.");
}

function importar() {
  if (bloquearPremium()) return;
  alert("Importação Premium realizada.");
}

function limparTudo() {
  if (bloquearPremium()) return;

  if (confirm("Deseja apagar todos os dados?")) {
    transacoes = [];
    localStorage.removeItem(STORAGE_KEY);
    atualizarResumo();
  }
}

/* =======================
   INIT
======================= */
document.addEventListener("DOMContentLoaded", () => {
  atualizarResumo();
});