"use strict";

/* =========================
   CONFIGURAÇÕES
========================= */

const STORAGE_KEY = "faststile_data";
const THEME_KEY = "faststile_theme";

let transacoes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let grafico = null;

/* =========================
   LICENÇA
========================= */

function validarLicenca(chave) {
  return /^FS-2026-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(chave);
}

function ativarLicenca() {
  const input = document.getElementById("chaveLicenca");
  if (!input) return;

  const chave = input.value.trim();

  if (!validarLicenca(chave)) {
    mostrarToast("❌ Chave inválida");
    return;
  }

  localStorage.setItem("faststile_licenciado", "true");
  localStorage.setItem("faststile_chave", chave);

  mostrarToast("✅ Licença ativada com sucesso!");
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
   TEMA CLARO / ESCURO
========================= */

function aplicarTema(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
}

function toggleTheme() {
  const atual = document.documentElement.getAttribute("data-theme") || "light";
  aplicarTema(atual === "dark" ? "light" : "dark");
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

  setTimeout(() => toast.classList.remove("show"), 3000);
}

/* =========================
   FINANÇAS
========================= */

function salvar() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transacoes));
}

function adicionar() {
  const descricao = document.getElementById("descricao");
  const valor = document.getElementById("valor");
  const tipo = document.getElementById("tipo");

  if (!descricao || !valor || !tipo) return;

  const desc = descricao.value.trim();
  const val = Number(valor.value);

  if (!desc || !val) {
    mostrarToast("⚠️ Preencha todos os campos");
    return;
  }

  transacoes.push({ desc, valor: val, tipo: tipo.value });
  salvar();
  render();

  /* LIMPA CAMPOS (isso tinha sumido) */
  descricao.value = "";
  valor.value = "";
  descricao.focus();
}

function render() {
  const lista = document.getElementById("lista");
  if (!lista) return;

  lista.innerHTML = "";

  let renda = 0;
  let despesa = 0;

  transacoes.forEach(t => {
    if (t.tipo === "renda") renda += t.valor;
    else despesa += t.valor;

    const li = document.createElement("li");
    li.innerHTML = `<span>${t.desc}</span><strong>R$ ${t.valor.toFixed(2)}</strong>`;
    lista.appendChild(li);
  });

  document.getElementById("totalRenda").textContent =
    renda.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  document.getElementById("totalDespesa").textContent =
    despesa.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  document.getElementById("saldoTotal").textContent =
    (renda - despesa).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  atualizarGrafico(renda, despesa);
}

function atualizarGrafico(renda, despesa) {
  const canvas = document.getElementById("grafico");
  if (!canvas) return;

  if (grafico) grafico.destroy();

  grafico = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: ["Rendas", "Despesas"],
      datasets: [{
        data: [renda, despesa],
        backgroundColor: ["#10b981", "#ef4444"]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });
}

/* =========================
   PDF PREMIUM (VISUAL BANCO)
========================= */

function exportarPDF() {
  if (bloquearPremium()) return;

  const area = document.querySelector("main");

  const opt = {
    margin: 8,
    filename: "FastStile_Relatorio_Premium.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, backgroundColor: "#ffffff" },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
  };

  html2pdf().set(opt).from(area).save();
}

/* =========================
   BACKUP
========================= */

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

  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";

  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        transacoes = JSON.parse(reader.result);
        salvar();
        render();
        mostrarToast("✅ Backup importado com sucesso");
      } catch {
        mostrarToast("❌ Arquivo inválido");
      }
    };
    reader.readAsText(file);
  };

  input.click();
}

function resetar() {
  if (bloquearPremium()) return;

  if (confirm("Deseja apagar todos os dados?")) {
    localStorage.removeItem(STORAGE_KEY);
    transacoes = [];
    render();
  }
}

/* =========================
   INICIALIZAÇÃO
========================= */

document.addEventListener("DOMContentLoaded", () => {
  aplicarTema(localStorage.getItem(THEME_KEY) || "light");
  iniciarMensagem();
  render();

  if (!isLicenciado()) {
    setTimeout(abrirLicenca, 800);
  }
});