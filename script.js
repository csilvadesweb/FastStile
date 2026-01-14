"use strict";

const DB_KEY = "FastStile_Pro_v2_Data";
const PREMIUM_KEY = "FastStile_Premium_Status";
let transacoes = JSON.parse(localStorage.getItem(DB_KEY)) || [];
let tipoSelecionado = null;
let meuGrafico = null;

document.addEventListener("DOMContentLoaded", () => {
    aplicarTema();
    validarPremiumUI();
    fetchCambio();
    render();
});

function aplicarTema() { document.body.className = localStorage.getItem("theme") || "light-theme"; }

function toggleTheme() {
    const novoTema = document.body.classList.contains("dark-theme") ? "light-theme" : "dark-theme";
    document.body.className = novoTema;
    localStorage.setItem("theme", novoTema);
    render();
}

function setTipo(t) {
    tipoSelecionado = t;
    document.getElementById('btnReceita').className = 'btn-tipo' + (t === 'receita' ? ' active-receita' : '');
    document.getElementById('btnDespesa').className = 'btn-tipo' + (t === 'despesa' ? ' active-despesa' : '');
}

function salvarTransacao() {
    const desc = document.getElementById("descricao").value.trim();
    const valor = parseFloat(document.getElementById("valor").value);
    if (!desc || isNaN(valor) || !tipoSelecionado) { toast("Dados incompletos"); return; }
    transacoes.unshift({ id: Date.now(), desc, valor, tipo: tipoSelecionado, data: new Date().toLocaleDateString('pt-BR') });
    localStorage.setItem(DB_KEY, JSON.stringify(transacoes));
    document.getElementById("descricao").value = "";
    document.getElementById("valor").value = "";
    setTipo(null);
    render();
    toast("Salvo!");
}

function render() {
    const lista = document.getElementById("listaTransacoes");
    lista.innerHTML = "";
    let r = 0, d = 0;
    transacoes.forEach(t => {
        if (t.tipo === 'receita') r += t.valor; else d += t.valor;
        const li = document.createElement("li");
        li.style = "list-style:none; display:flex; justify-content:space-between; padding:15px 0; border-bottom:1px solid var(--border);";
        li.innerHTML = `<div><div style="font-weight:700;">${t.desc}</div><div style="font-size:11px; color:var(--text-sub)">${t.data}</div></div>
            <div style="display:flex; align-items:center; gap:10px">
                <span style="font-weight:800; color:${t.tipo==='receita'?'var(--accent)':'var(--danger)'}">
                    ${t.tipo==='receita'?'+':'-'} R$ ${t.valor.toLocaleString('pt-BR')}
                </span>
                <button onclick="removerItem(${t.id})" style="background:none; border:none; color:var(--text-sub); cursor:pointer;">✕</button>
            </div>`;
        lista.appendChild(li);
    });
    document.getElementById("totalRendas").innerText = "R$ " + r.toLocaleString('pt-BR');
    document.getElementById("totalDespesas").innerText = "R$ " + d.toLocaleString('pt-BR');
    document.getElementById("saldoTotal").innerText = "R$ " + (r-d).toLocaleString('pt-BR');
    document.getElementById("saldoPercent").innerText = (r+d) > 0 ? Math.round((r/(r+d))*100) + "%" : "0%";
    atualizarGrafico(r, d);
}

function gerarPDF() {
    if (localStorage.getItem(PREMIUM_KEY) !== "true") { abrirLicenca(); return; }
    const area = document.getElementById("pdf-render-area");
    area.style.display = "block";
    let r = 0, d = 0;
    transacoes.forEach(t => t.tipo === 'receita' ? r += t.valor : d += t.valor);

    area.innerHTML = `
        <div style="padding:50px; font-family:sans-serif; background:white;">
            <div style="background:#0f172a; color:white; padding:30px; border-radius:10px;">
                <h1>FastStile Pro - Relatório</h1>
                <p>Data: ${new Date().toLocaleString('pt-BR')}</p>
            </div>
            <div style="margin:30px 0; display:flex; justify-content:space-between;">
                <p><b>Receitas:</b> R$ ${r.toLocaleString('pt-BR')}</p>
                <p><b>Despesas:</b> R$ ${d.toLocaleString('pt-BR')}</p>
                <p><b>Saldo:</b> R$ ${(r-d).toLocaleString('pt-BR')}</p>
            </div>
            <table style="width:100%; border-collapse:collapse;">
                <tr style="background:#f1f5f9; text-align:left;"><th style="padding:10px;">Data</th><th style="padding:10px;">Descrição</th><th style="padding:10px;text-align:right;">Valor</th></tr>
                ${transacoes.map(t => `<tr style="border-bottom:1px solid #eee;"><td style="padding:10px;">${t.data}</td><td style="padding:10px;">${t.desc}</td><td style="padding:10px;text-align:right;color:${t.tipo==='receita'?'#10b981':'#f43f5e'}">R$ ${t.valor.toLocaleString('pt-BR')}</td></tr>`).join('')}
            </table>
        </div>`;

    html2pdf().set({ margin: 0, filename: 'Relatorio.pdf', html2canvas: { scale: 2 } }).from(area).save().then(() => area.style.display = "none");
}

function exportarBackup() {
    if (localStorage.getItem(PREMIUM_KEY) !== "true") { abrirLicenca(); return; }
    const blob = new Blob([JSON.stringify(transacoes)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "backup_faststile.json"; a.click();
}

function importarBackup(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            if (Array.isArray(data)) { transacoes = data; localStorage.setItem(DB_KEY, JSON.stringify(transacoes)); render(); toast("Restaurado!"); }
        } catch { toast("Erro no arquivo"); }
    };
    reader.readAsText(file);
}

function atualizarGrafico(r, d) {
    const ctx = document.getElementById('graficoFinanceiro').getContext('2d');
    if (meuGrafico) meuGrafico.destroy();
    meuGrafico = new Chart(ctx, {
        type: 'doughnut',
        data: { datasets: [{ data: (r+d)>0?[r,d]:[1,0], backgroundColor: (r+d)>0?['#10b981','#f43f5e']:['#e2e8f0','#e2e8f0'], borderWidth: 0, cutout:'80%' }] },
        options: { plugins: { legend: { display: false } } }
    });
}

async function fetchCambio() {
    try {
        const res = await fetch("https://economia.awesomeapi.com.br/last/USD-BRL");
        const data = await res.json();
        document.getElementById("miniConverter").innerHTML = `💵 USD <strong>R$ ${parseFloat(data.USDBRL.bid).toFixed(2)}</strong>`;
    } catch { document.getElementById("miniConverter").innerText = "Câmbio Offline"; }
}

function ativarLicenca() {
    const chave = document.getElementById("chaveLicenca").value.toUpperCase().trim();
    if (/^FS-2026-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(chave)) {
        localStorage.setItem(PREMIUM_KEY, "true");
        toast("Premium Ativado!"); setTimeout(() => location.reload(), 1000);
    } else { toast("Chave Inválida"); }
}

function removerItem(id) { transacoes = transacoes.filter(t => t.id !== id); localStorage.setItem(DB_KEY, JSON.stringify(transacoes)); render(); }
function abrirLicenca() { document.getElementById("modalLicenca").style.display = "flex"; }
function fecharLicenca() { document.getElementById("modalLicenca").style.display = "none"; }
function fecharConfirmacao() { document.getElementById("modalConfirmacao").style.display = "none"; }
function abrirConfirmacao(tipo) {
    document.getElementById("modalConfirmacao").style.display = "flex";
    document.getElementById("btnConfirmarAcao").onclick = () => { if(tipo==='limpar') { transacoes=[]; localStorage.setItem(DB_KEY,"[]"); render(); } fecharConfirmacao(); };
}
function toast(m) { const t = document.getElementById("toast"); t.innerText = m; t.style.display = "block"; setTimeout(()=>t.style.display="none", 3000); }
function validarPremiumUI() { if(localStorage.getItem(PREMIUM_KEY) === "true") { const b = document.getElementById("btnPremiumStatus"); b.innerText = "💎 Plano PRO"; b.style.background = "#1e293b"; b.style.color="#fff"; } }
