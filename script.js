"use strict";

const DB_KEY = "FastStile_Pro_v2_Data";
const PREMIUM_KEY = "FastStile_Premium_Status";
const BACKUP_VERSION = "1.0";
const CRYPTO_SALT = "FastStile::SecureBackup";

let transacoes = JSON.parse(localStorage.getItem(DB_KEY)) || [];
let tipoSelecionado = null;
let meuGrafico = null;

document.addEventListener("DOMContentLoaded", () => {
  aplicarTema();
  validarPremiumUI();
  fetchCambio();
  render();
});

/* ================= PREMIUM ================= */
function isPremium() {
  return localStorage.getItem(PREMIUM_KEY) === "true";
}
function premiumGuard(cb) {
  if (!isPremium()) { abrirLicenca(); return; }
  cb();
}

/* ================= PDF BANCÁRIO ================= */
function gerarPDF() {
  premiumGuard(() => {

    const hoje = new Date().toLocaleDateString("pt-BR");
    let totalR = 0, totalD = 0;

    const linhas = transacoes.map(t => {
      t.tipo === "receita" ? totalR += t.valor : totalD += t.valor;
      return `
        <tr>
          <td>${t.data}</td>
          <td>${t.desc}</td>
          <td class="${t.tipo}">
            ${t.tipo === "receita" ? "+" : "-"}
            ${t.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </td>
        </tr>`;
    }).join("");

    const html = `
    <div style="font-family: Arial, sans-serif; color:#0f172a; padding:30px;">
      <h2 style="margin:0;">FastStile Finance Pro</h2>
      <p style="margin:2px 0 20px;font-size:12px;">
        Extrato Financeiro • Emitido em ${hoje}
      </p>

      <table style="width:100%; border-collapse:collapse; font-size:12px;">
        <thead>
          <tr style="background:#f1f5f9;">
            <th style="padding:8px;border:1px solid #e2e8f0;">Data</th>
            <th style="padding:8px;border:1px solid #e2e8f0;">Descrição</th>
            <th style="padding:8px;border:1px solid #e2e8f0;">Valor</th>
          </tr>
        </thead>
        <tbody>
          ${linhas || `
          <tr>
            <td colspan="3" style="padding:20px;text-align:center;">
              Nenhuma movimentação registrada
            </td>
          </tr>`}
        </tbody>
      </table>

      <div style="margin-top:20px; font-size:13px;">
        <p><strong>Total de Entradas:</strong> ${totalR.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</p>
        <p><strong>Total de Saídas:</strong> ${totalD.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</p>
        <p><strong>Saldo Final:</strong> ${(totalR-totalD).toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</p>
      </div>

      <p style="margin-top:30px;font-size:10px;color:#64748b;">
        Documento gerado automaticamente • FastStile Finance Pro
      </p>
    </div>`;

    const container = document.createElement("div");
    container.innerHTML = html;

    html2pdf().set({
      margin: 10,
      filename: "extrato-faststile.pdf",
      html2canvas: { scale: 3, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    }).from(container).save();

    toast("Extrato bancário gerado");
  });
}

/* ================= RESTANTE DO APP ================= */
/* Tema, render, gráfico, backup, restore, licença, toast */
/* — permanecem exatamente iguais para regressão zero */

/* (Demais funções já existentes continuam aqui sem alterações) */