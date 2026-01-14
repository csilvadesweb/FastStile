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

// --- NOVO: BACKUP & RESTORE COM TRAVA PREMIUM ---
function exportarBackup() {
    if (localStorage.getItem(PREMIUM_KEY) !== "true") { abrirLicenca(); return; }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(transacoes));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `backup_faststile_${Date.now()}.json`);
    dlAnchor.click();
    toast("Backup exportado!");
}

function importarBackup(event) {
    if (localStorage.getItem(PREMIUM_KEY) !== "true") { abrirLicenca(); return; }
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const dados = JSON.parse(e.target.result);
            if (Array.isArray(dados)) {
                transacoes = dados;
                localStorage.setItem(DB_KEY, JSON.stringify(transacoes));
                render();
                toast("Dados restaurados com sucesso!");
            }
        } catch (err) { toast("Arquivo de backup inválido."); }
    };
    reader.readAsText(file);
}

// --- NOVO: PDF PROFISSIONAL ESTILO BANCO ---
function gerarPDF() {
    if (localStorage.getItem(PREMIUM_KEY) !== "true") { abrirLicenca(); return; }
    toast("Gerando Extrato Profissional...");
    const tempCont = document.getElementById("pdf-template");
    tempCont.style.display = "block";
    
    let r = 0, d = 0;
    transacoes.forEach(t => t.tipo === 'receita' ? r += t.valor : d += t.valor);

    tempCont.innerHTML = `
        <div style="padding:40px; font-family:Arial, sans-serif; color:#1e293b;">
            <div style="border-bottom:3px solid #0f172a; padding-bottom:20px; margin-bottom:30px; display:flex; justify-content:space-between; align-items:center;">
                <div><h1 style="margin:0;">FastStile PRO</h1><p style="color:#64748b;">Extrato Detalhado de Conta</p></div>
                <div style="text-align:right;"><p><b>Emissão:</b> ${new Date().toLocaleDateString('pt-BR')}</p></div>
            </div>
            <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:15px; margin-bottom:30px;">
                <div style="background:#f8fafc; padding:15px; border-radius:10px; border:1px solid #e2e8f0;">Rendas: <b style="color:#10b981;">R$ ${r.toLocaleString('pt-BR')}</b></div>
                <div style="background:#f8fafc; padding:15px; border-radius:10px; border:1px solid #e2e8f0;">Gastos: <b style="color:#f43f5e;">R$ ${d.toLocaleString('pt-BR')}</b></div>
                <div style="background:#0f172a; padding:15px; border-radius:10px; color:white;">Saldo: <b>R$ ${(r-d).toLocaleString('pt-BR')}</b></div>
            </div>
            <table style="width:100%; border-collapse:collapse;">
                <tr style="background:#f1f5f9; text-align:left;">
                    <th style="padding:12px;">Data</th><th style="padding:12px;">Descrição</th><th style="padding:12px; text-align:right;">Valor</th>
                </tr>
                ${transacoes.map(t => `
                    <tr style="border-bottom:1px solid #e2e8f0;">
                        <td style="padding:10px; font-size:12px;">${t.data}</td>
                        <td style="padding:10px;">${t.desc}</td>
                        <td style="padding:10px; text-align:right; font-weight:bold; color:${t.tipo==='receita'?'#10b981':'#f43f5e'}">
                            ${t.tipo==='receita'?'+':'-'} R$ ${t.valor.toLocaleString('pt-BR')}
                        </td>
                    </tr>
                `).join('')}
            </table>
        </div>`;

    html2pdf().set({ margin: 0, filename: 'extrato.pdf', html2canvas: { scale: 3 }, jsPDF: { unit: 'mm', format: 'a4' } })
    .from(tempCont).save().then(() => { tempCont.style.display = "none"; });
}

// --- UTILITÁRIOS ---
function render() {
    const lista = document.getElementById("listaTransacoes");
    lista.innerHTML = "";
    let r = 0, d = 0;
    transacoes.forEach(t => {
        if (t.tipo === 'receita') r += t.valor; else d += t.valor;
        const li = document.createElement("li");
        li.style = "list-style:none; display:flex; justify-content:space-between; padding:16px 0; border-bottom:1px solid var(--border);";
        li.innerHTML = `<div><div style="font-weight:700;">${t.desc}</div><div style="font-size:11px; color:var(--text-sub)">${t.data}</div></div>
            <div style="display:flex; align-items:center; gap:12px"><span style="font-weight:800; color:${t.tipo==='receita'?'var(--accent)':'var(--danger)'}">
            ${t.tipo==='receita'?'+':'-'} ${t.valor.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</span>
            <button onclick="removerItem(${t.id})" style="background:none; border:none; color:var(--text-sub); cursor:pointer;">✕</button></div>`;
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
    meuGrafico = new Chart(ctx, {
        type: 'doughnut',
        data: { datasets: [{ data: (r+d)>0?[r,d]:[1,0], backgroundColor: (r+d)>0?['#10b981','#f43f5e']:['#e2e8f0','#e2e8f0'], borderWidth: 0, cutout:'82%', borderRadius: 10 }] },
        options: { plugins: { legend: { display: false } } }
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
    document.getElementById("btnConfirmarAcao").onclick = () => { if(tipo==='limpar') { transacoes=[]; localStorage.setItem(DB_KEY,"[]"); render(); } fecharConfirmacao(); };
}
function fecharConfirmacao() { document.getElementById("modalConfirmacao").style.display = "none"; }
function toast(m) { const t = document.getElementById("toast"); t.innerText = m; t.style.display = "block"; setTimeout(()=>t.style.display="none", 3000); }
function validarPremiumUI() { if(localStorage.getItem(PREMIUM_KEY) === "true") { const b = document.getElementById("btnPremiumStatus"); b.innerText = "💎 Plano PRO"; b.style.background = "#1e293b"; b.style.color = "#fff"; } }
