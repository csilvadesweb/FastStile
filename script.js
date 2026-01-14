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

// --- SISTEMA CORE ---
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
    if (!desc || isNaN(valor) || !tipoSelecionado) { toast("Preencha todos os campos."); return; }

    transacoes.unshift({
        id: Date.now(),
        desc, valor, tipo: tipoSelecionado,
        data: new Date().toLocaleDateString('pt-BR')
    });

    localStorage.setItem(DB_KEY, JSON.stringify(transacoes));
    document.getElementById("descricao").value = "";
    document.getElementById("valor").value = "";
    setTipo(null);
    render();
    toast("Lançamento salvo!");
}

function removerItem(id) {
    transacoes = transacoes.filter(t => t.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(transacoes));
    render();
}

// --- BACKUP & RESTORE (PREMIUM ONLY) ---
function exportarBackup() {
    if (localStorage.getItem(PREMIUM_KEY) !== "true") { abrirLicenca(); return; }
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(transacoes));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "backup_financeiro_" + Date.now() + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast("Backup exportado com sucesso!");
}

function importarBackup(event) {
    if (localStorage.getItem(PREMIUM_KEY) !== "true") { abrirLicenca(); return; }
    
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const dadosImportados = JSON.parse(e.target.result);
            if (Array.isArray(dadosImportados)) {
                transacoes = dadosImportados;
                localStorage.setItem(DB_KEY, JSON.stringify(transacoes));
                render();
                toast("Dados restaurados!");
            }
        } catch (err) { toast("Erro ao ler arquivo."); }
    };
    reader.readAsText(file);
}

// --- GERADOR DE PDF PROFISSIONAL ---
function gerarPDF() {
    if (localStorage.getItem(PREMIUM_KEY) !== "true") { abrirLicenca(); return; }
    
    toast("Preparando Extrato Bancário...");
    const tempCont = document.getElementById("pdf-template");
    tempCont.style.display = "block";
    
    let totalR = 0, totalD = 0;
    transacoes.forEach(t => t.tipo === 'receita' ? totalR += t.valor : totalD += t.valor);

    let html = `
        <div style="padding: 40px; font-family: sans-serif; color: #1e293b;">
            <div style="display:flex; justify-content:space-between; border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 30px;">
                <div>
                    <h1 style="margin:0; color:#0f172a;">FastStile PRO</h1>
                    <p style="margin:5px 0; color:#64748b;">Relatório Consolidado de Finanças</p>
                </div>
                <div style="text-align:right;">
                    <p style="margin:0; font-weight:bold;">Data: ${new Date().toLocaleDateString('pt-BR')}</p>
                    <p style="margin:5px 0; color:#64748b;">ID: #FS-${Date.now().toString().slice(-6)}</p>
                </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:20px; margin-bottom:40px;">
                <div style="background:#f1f5f9; padding:20px; border-radius:10px;">
                    <small>Renda Total</small><br><b style="color:#10b981; font-size:18px;">R$ ${totalR.toLocaleString('pt-BR')}</b>
                </div>
                <div style="background:#f1f5f9; padding:20px; border-radius:10px;">
                    <small>Despesa Total</small><br><b style="color:#f43f5e; font-size:18px;">R$ ${totalD.toLocaleString('pt-BR')}</b>
                </div>
                <div style="background:#0f172a; padding:20px; border-radius:10px; color:white;">
                    <small>Saldo Líquido</small><br><b style="font-size:18px;">R$ ${(totalR-totalD).toLocaleString('pt-BR')}</b>
                </div>
            </div>

            <table style="width:100%; border-collapse:collapse;">
                <thead>
                    <tr style="background:#f8fafc; text-align:left;">
                        <th style="padding:12px; border-bottom:1px solid #e2e8f0;">Data</th>
                        <th style="padding:12px; border-bottom:1px solid #e2e8f0;">Descrição</th>
                        <th style="padding:12px; border-bottom:1px solid #e2e8f0; text-align:right;">Valor</th>
                    </tr>
                </thead>
                <tbody>
                    ${transacoes.map(t => `
                        <tr>
                            <td style="padding:12px; border-bottom:1px solid #f1f5f9; font-size:13px;">${t.data}</td>
                            <td style="padding:12px; border-bottom:1px solid #f1f5f9;">${t.desc}</td>
                            <td style="padding:12px; border-bottom:1px solid #f1f5f9; text-align:right; font-weight:bold; color:${t.tipo==='receita'?'#10b981':'#f43f5e'}">
                                ${t.tipo==='receita' ? '+' : '-'} R$ ${t.valor.toLocaleString('pt-BR')}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div style="margin-top:50px; text-align:center; color:#94a3b8; font-size:10px; border-top:1px solid #e2e8f0; padding-top:20px;">
                Documento gerado eletronicamente via FastStile Pro - Criptografia Local Ativa.
            </div>
        </div>
    `;

    tempCont.innerHTML = html;
    const opt = { 
        margin: 0, 
        filename: `extrato_${Date.now()}.pdf`, 
        html2canvas: { scale: 3, useCORS: true }, 
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } 
    };

    html2pdf().set(opt).from(tempCont).save().then(() => {
        tempCont.style.display = "none";
        toast("Download concluído!");
    });
}

// --- RENDERIZAÇÃO E UI ---
function render() {
    const lista = document.getElementById("listaTransacoes");
    lista.innerHTML = "";
    let r = 0, d = 0;

    transacoes.forEach(t => {
        if (t.tipo === 'receita') r += t.valor; else d += t.valor;
        const li = document.createElement("li");
        li.style = "list-style:none; display:flex; justify-content:space-between; padding:16px 0; border-bottom:1px solid var(--border);";
        li.innerHTML = `
            <div>
                <div style="font-weight:700; color:var(--text)">${t.desc}</div>
                <div style="font-size:11px; color:var(--text-sub)">${t.data}</div>
            </div>
            <div style="display:flex; align-items:center; gap:12px">
                <span style="font-weight:800; color:${t.tipo==='receita'?'var(--accent)':'var(--danger)'}">
                    ${t.tipo==='receita' ? '+' : '-'} ${t.valor.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}
                </span>
                <button onclick="removerItem(${t.id})" style="background:none; border:none; color:var(--text-sub); cursor:pointer; font-size:16px">✕</button>
            </div>`;
        lista.appendChild(li);
    });

    document.getElementById("totalRendas").innerText = r.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
    document.getElementById("totalDespesas").innerText = d.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
    document.getElementById("saldoTotal").innerText = (r-d).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
    document.getElementById("saldoPercent").innerText = (r+d) > 0 ? Math.round((r/(r+d))*100) + "%" : "0%";
    atualizarGrafico(r, d);
}

function atualizarGrafico(r, d) {
    const ctx = document.getElementById('graficoFinanceiro').getContext('2d');
    if (meuGrafico) meuGrafico.destroy();
    const isDark = document.body.classList.contains("dark-theme");
    meuGrafico = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: (r+d) > 0 ? [r, d] : [1, 0],
                backgroundColor: (r+d) > 0 ? ['#10b981', '#f43f5e'] : [isDark ? '#1e293b' : '#e2e8f0', '#e2e8f0'],
                borderWidth: 0, cutout: '82%', borderRadius: 10
            }]
        },
        options: { plugins: { legend: { display: false } }, animation: { duration: 600 } }
    });
}

function ativarLicenca() {
    const chave = document.getElementById("chaveLicenca").value.toUpperCase().trim();
    if (/^FS-2026-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(chave)) {
        localStorage.setItem(PREMIUM_KEY, "true");
        toast("💎 Versão Premium Ativada!");
        setTimeout(() => location.reload(), 1200);
    } else { toast("Chave inválida!"); }
}

async function fetchCambio() {
    try {
        const res = await fetch("https://economia.awesomeapi.com.br/last/USD-BRL");
        const data = await res.json();
        document.getElementById("miniConverter").innerHTML = `💵 USD <strong>R$ ${parseFloat(data.USDBRL.bid).toFixed(2)}</strong>`;
    } catch { document.getElementById("miniConverter").innerText = "Câmbio Offline"; }
}

function abrirLicenca() { document.getElementById("modalLicenca").style.display = "flex"; }
function fecharLicenca() { document.getElementById("modalLicenca").style.display = "none"; }
function abrirConfirmacao(tipo) {
    document.getElementById("modalConfirmacao").style.display = "flex";
    document.getElementById("btnConfirmarAcao").onclick = () => {
        if(tipo==='limpar') { transacoes = []; localStorage.setItem(DB_KEY, "[]"); render(); }
        fecharConfirmacao();
    };
}
function fecharConfirmacao() { document.getElementById("modalConfirmacao").style.display = "none"; }
function toast(m) {
    const t = document.getElementById("toast");
    t.innerText = m; t.style.display = "block";
    setTimeout(() => t.style.display = "none", 3000);
}
function validarPremiumUI() {
    if(localStorage.getItem(PREMIUM_KEY) === "true") {
        const b = document.getElementById("btnPremiumStatus");
        b.innerText = "💎 Plano PRO"; b.style.background = "#1e293b"; b.style.color = "#fff";
    }
}
