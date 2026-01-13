"use strict";

/* =====================
   CONFIG
===================== */

const STORAGE_KEY = "faststile_data";
let transacoes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let grafico = null;
let tipoAtual = "renda";

/* =====================
   TEMA
===================== */

function toggleTema() {
  const html = document.documentElement;
  const atual = html.getAttribute("data-theme");
  const novo = atual === "dark" ? "light" : "dark";
  html.setAttribute("data-theme", novo);
  localStorage.setItem("faststile_tema", novo);
}

(function () {
  const tema = localStorage.getItem("faststile_tema");
  if (tema) document.documentElement.setAttribute("data-theme", tema);
})();

/* =====================
   LICENÇA
===================== */

function validarLicenca(chave) {
  return /^FS-2026-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(chave);
}

function ativarLicenca() {
  const chave = document.getElementById("chaveLicenca").value.trim();
  if (!validarLicenca(chave)) {
    toast("Chave inválida");
    return;
  }
  localStorage.setItem("faststile_licenciado", "true");
  localStorage.setItem("faststile_chave", chave);
  toast("Licença ativada com sucesso!");
  fecharLicenca();
}

function isLicenciado() {
  return localStorage.getItem("faststile_licenciado") === "true";
}

function bloquearPremium() {
  if (!isLicenciado()) {
    abrirLicenca();
    return true;
  }
  return false;
}

function abrirLicenca() {
  document.getElementById("modalLicenca").style.display = "flex";
}

function fecharLicenca() {
  document.getElementById("modalLicenca").style.display = "none";
}

/* =====================
   DICAS
===================== */

const dicas = [
  "Pequenas economias criam grandes resultados.",
  "Organização financeira gera liberdade.",
  "Controle hoje, tranquilidade amanhã.",
  "Seus dados ficam só no seu dispositivo."
];

function iniciarMensagem() {
  document.getElementById("dicaFinanceira").textContent =
    dicas[Math.floor(Math.random() * dicas.length)];
}

/* =====================
   FINANÇAS
===================== */

function setTipo(tipo) {
  tipoAtual = tipo;
}

function salvar() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transacoes));
}

function adicionar() {
  const desc = descricao.value.trim();
  const valor = Number(valorInput.value);

  if (!desc || !valor) {
    toast("Preencha todos os campos");
    return;
  }

  transacoes.push({ desc, valor, tipo: tipoAtual });
  salvar();
  descricao.value = "";
  valorInput.value = "";
  render();
}

function render() {
  lista.innerHTML = "";
  let renda = 0, despesa = 0;

  transacoes.forEach(t => {
    t.tipo === "renda" ? renda += t.valor : despesa += t.valor;

    const li = document.createElement("li");
    li.textContent = `${t.desc} — R$ ${t.valor.toFixed(2)}`;
    lista.appendChild(li);
  });

  totalRenda.textContent = renda.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
  totalDespesa.textContent = despesa.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
  saldoTotal.textContent = (renda-despesa).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

  atualizarGrafico(renda, despesa);
}

function atualizarGrafico(renda, despesa) {
  if (grafico) grafico.destroy();
  grafico = new Chart(graficoCanvas, {
    type: "doughnut",
    data: {
      labels: ["Rendas", "Despesas"],
      datasets: [{ data: [renda, despesa] }]
    }
  });
}

/* =====================
   PREMIUM
===================== */

function exportarPDF() {
  if (bloquearPremium()) return;

  html2pdf().set({
    filename: "FastStile_Premium.pdf",
    html2canvas: { scale: 2 },
    jsPDF: { format: "a4" }
  }).from(document.body).save();
}

function exportarBackup() {
  if (bloquearPremium()) return;
  const blob = new Blob([JSON.stringify(transacoes)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "faststile-backup.json";
  a.click();
}

function importarBackup() {
  if (bloquearPremium()) return;
  alert("Importação premium (upload pode ser adicionado)");
}

function resetar() {
  if (bloquearPremium()) return;
  localStorage.clear();
  location.reload();
}

/* =====================
   TOAST
===================== */

function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"),3000);
}

/* =====================
   INIT
===================== */

document.addEventListener("DOMContentLoaded", () => {
  iniciarMensagem();
  render();
});