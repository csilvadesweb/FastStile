"use strict";

/* =========================
   CONFIGURAÇÃO GERAL
========================= */

const STORAGE_KEY = "faststile_dados";
const LIC_KEY = "faststile_licenciado";

/* =========================
   LICENÇA
========================= */

function validarLicenca(chave) {
  return /^FS-2026-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(chave);
}

function ativarLicenca() {
  const input = document.getElementById("chaveLicenca");
  const chave = input.value.trim().toUpperCase();

  if (!validarLicenca(chave)) {
    mostrarToast("❌ Chave inválida");
    return;
  }

  localStorage.setItem(LIC_KEY, "true");
  localStorage.setItem("faststile_chave", chave);

  mostrarToast("✅ Licença Premium ativada");
  fecharLicenca();
}

function isLicenciado() {
  return localStorage.getItem(LIC_KEY) === "true";
}

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
  "Organização financeira gera liberdade.",
  "Controle seus gastos e domine seu futuro.",
  "Pequenas economias criam grandes resultados.",
  "Seu dinheiro deve trabalhar por você.",
  "Planejar hoje evita dívidas amanhã."
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
   DADOS FINANCEIROS
========================= */

function obterDados() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function salvarDados(dados) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
}

function adicionarRegistro(tipo) {
  const descricao = document.getElementById("descricao").value.trim();
  const valor = parseFloat(document.getElementById("valor").value);

  if (!descricao || isNaN(valor) || valor <= 0) {
    mostrarToast("⚠️ Preencha corretamente");
    return;
  }

  const dados = obterDados();
  dados.push({
    tipo,
    descricao,
    valor,
    data: new Date().toLocaleDateString("pt-BR")
  });

  salvarDados(dados);
  atualizarResumo();
  limparFormulario();

  mostrarToast("✔ Registro salvo");
}

function limparFormulario() {
  document.getElementById("descricao").value = "";
  document.getElementById("valor").value = "";
}

function atualizarResumo() {
  const dados = obterDados();

  let rendas = 0;
  let despesas = 0;

  dados.forEach(item => {
    if (item.tipo === "entrada") rendas += item.valor;
    else despesas += item.valor;
  });

  document.getElementById("totalRendas").textContent = rendas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  document.getElementById("totalDespesas").textContent = despesas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  document.getElementById("saldo").textContent = (rendas - despesas).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/* =========================
   PDF PREMIUM (BANCÁRIO)
========================= */

function exportarPDF() {
  if (bloquearPremium()) return;

  const area = document.getElementById("relatorioPDF");
  if (!area) {
    mostrarToast("Erro ao gerar PDF");
    return;
  }

  const opt = {
    margin: [15, 15, 15, 15],
    filename: "FastStile_Financeiro_Premium.pdf",
    image: { type: "jpeg", quality: 1 },
    html2canvas: {
      scale: 3,
      backgroundColor: "#ffffff",
      useCORS: true
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait"
    }
  };

  html2pdf().set(opt).from(area).save();
}

/* =========================
   INICIALIZAÇÃO
========================= */

document.addEventListener("DOMContentLoaded", () => {
  iniciarMensagem();
  atualizarResumo();

  if (!isLicenciado()) {
    setTimeout(abrirLicenca, 700);
  }
});