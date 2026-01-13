"use strict";

const STORAGE_KEY = "faststile_data";
let transacoes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let grafico;

/* ELEMENTOS */
const descricaoInput = document.getElementById("descricao");
const valorInput = document.getElementById("valor");
const tipoSelect = document.getElementById("tipo");
const lista = document.getElementById("lista");

/* =========================
   STORAGE
========================= */

function salvar() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transacoes));
}

/* =========================
   ADICIONAR TRANSAÇÃO
========================= */

function adicionar() {
  const desc = descricaoInput.value.trim();
  const valor = Number(valorInput.value);
  const tipo = tipoSelect.value;

  if (!desc || !valor) {
    mostrarToast("Preencha todos os campos.");
    return;
  }

  transacoes.push({ desc, valor, tipo });
  salvar();
  render();

  /* LIMPA OS CAMPOS (corrigido) */
  descricaoInput.value = "";
  valorInput.value = "";
  tipoSelect.value = "renda";
  descricaoInput.focus();
}

/* =========================
   RENDER
========================= */

function render() {
  lista.innerHTML = "";

  let renda = 0;
  let despesa = 0;

  transacoes.forEach(t => {
    if (t.tipo === "renda") renda += t.valor;
    else despesa += t.valor;

    const li = document.createElement("li");
    li.innerHTML = `
      <span>${t.desc}</span>
      <strong>${t.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>
    `;
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

/* =========================
   GRÁFICO
========================= */

function atualizarGrafico(renda, despesa) {
  if (grafico) grafico.destroy();

  grafico = new Chart(document.getElementById("grafico"), {
    type: "doughnut",
    data: {
      labels: ["Rendas", "Despesas"],
      datasets: [{
        data: [renda, despesa],
        backgroundColor: ["#10b981", "#ef4444"]
      }]
    },
    options: {
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });
}

/* =========================
   BACKUP PREMIUM
========================= */

function exportarBackup() {
  if (bloquearPremium()) return;

  const blob = new Blob([JSON.stringify(transacoes, null, 2)], {
    type: "application/json"
  });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "faststile-backup.json";
  a.click();
}

function importarBackup() {
  if (bloquearPremium()) return;
  mostrarToast("Importação em desenvolvimento.");
}

/* =========================
   RESET SEGURO
========================= */

function resetar() {
  if (bloquearPremium()) return;

  const licenca = localStorage.getItem("faststile_licenciado");
  const chave = localStorage.getItem("faststile_chave");

  localStorage.clear();

  if (licenca) localStorage.setItem("faststile_licenciado", licenca);
  if (chave) localStorage.setItem("faststile_chave", chave);

  location.reload();
}

/* =========================
   INICIALIZAÇÃO
========================= */

document.addEventListener("DOMContentLoaded", () => {
  render();
});