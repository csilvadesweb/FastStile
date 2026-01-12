"use strict";

const STORAGE_KEY = "faststile_data";
let transacoes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let grafico;

const descricaoInput = document.getElementById("descricao");
const valorInput = document.getElementById("valor");
const tipoSelect = document.getElementById("tipo");
const lista = document.getElementById("lista");

function salvar() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transacoes));
}

function adicionar() {
  const desc = descricaoInput.value.trim();
  const valor = Number(valorInput.value);
  const tipo = tipoSelect.value;

  if (!desc || !valor) {
    alert("Preencha todos os campos");
    return;
  }

  transacoes.push({ desc, valor, tipo });
  salvar();
  render();
}

function render() {
  lista.innerHTML = "";

  let renda = 0;
  let despesa = 0;

  transacoes.forEach(t => {
    if (t.tipo === "renda") renda += t.valor;
    else despesa += t.valor;

    const li = document.createElement("li");
    li.textContent = `${t.desc} - R$ ${t.valor.toFixed(2)}`;
    lista.appendChild(li);
  });

  document.getElementById("totalRenda").textContent = renda.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  document.getElementById("totalDespesa").textContent = despesa.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  document.getElementById("saldoTotal").textContent = (renda - despesa).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  atualizarGrafico(renda, despesa);
}

function atualizarGrafico(renda, despesa) {
  if (grafico) grafico.destroy();

  grafico = new Chart(document.getElementById("grafico"), {
    type: "doughnut",
    data: {
      labels: ["Rendas", "Despesas"],
      datasets: [{
        data: [renda, despesa]
      }]
    }
  });
}

/* ===== PREMIUM ===== */

function exportarPDF() {
  if (bloquearPremium()) return;
  html2pdf().from(document.body).save("FastStile.pdf");
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
  alert("Importação liberada (implementar upload se desejar)");
}

function resetar() {
  if (bloquearPremium()) return;
  localStorage.clear();
  location.reload();
}

render();