"use strict";

const DB_KEY = "FastStile_Pro_v2_Data";
const PREMIUM_KEY = "FS_PRO_ACTIVE_STATUS";
let transacoes = JSON.parse(localStorage.getItem(DB_KEY)) || [];
let tipoSelecionado = null;
let meuGrafico = null;

document.addEventListener("DOMContentLoaded", () => {
    aplicarTema();
    validarPremiumUI();
    fetchCambio();
    render();
});

function aplicarTema() { 
    document.body.className = localStorage.getItem("theme") || "light-theme"; 
}

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
    toast("Salvo!");
}

function removerItem(id) {
    transacoes = transacoes.filter(t => t.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(transacoes));
    render();
}

// --- GATE DE ATIVAÇÃO ---
function isPremium() {
    return localStorage.getItem(PREMIUM_KEY) === "PRO_LEVEL_ACCESS";
}

// --- BACKUP & RESTORE ---
function exportarBackup() {
    if (!isPremium()) { abrirLicenca(); return; }
    const payload = { app: "FastStile Pro", data: transacoes, date: new Date().toISOString() };
    const blob = new Blob([btoa(JSON.stringify(payload))], {type: "text/plain"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BACKUP_FS_${Date.now()}.faststile`;
    a.click();
    toast("📦 Backup Gerado!");
}

function tentarImportar() {
    if (!isPremium()) { abrirLicenca(); return; }
    document.getElementById('inputImport').click();
}

function importarBackup(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const dec = atob(e.target.result);
            const backup = JSON.parse(dec);
            if (backup.data) {
                transacoes = backup.data;
                localStorage.setItem(DB_KEY, JSON.stringify(transacoes));
                render();
                toast("✅ Restaurado!");
            }
        } catch (err) { toast("❌ Arquivo Inválido"); }
    };
    reader.readAsText(file);
}

// --- PDF HIGH PERFORMANCE (FIX BRANCO) ---
function gerarPDF() {
    if (!isPremium()) { abrirLicenca(); return; }
    toast("Gerando Extrato...");
    
    const target = document.getElementById("pdf-template");
    let r = 0, d = 0;
    transacoes.forEach(t => t.tipo === 'receita' ? r += t.valor : d += t.valor);

    // Injeção de Template com Largura Fixa para o motor de captura
    target.innerHTML = `
        <div style="padding: 40px; font-family: sans-serif; color: #1e293b; background: #fff; width: 210mm;">
            <div style="display:flex; justify-content:space-between; border-bottom: 3px solid #0f172a; padding-bottom:15px; margin-bottom:30px;">
                <div><h1 style="margin:0;">FASTSTILE PRO</h1><small>EXTRATO BANCÁRIO ELETRÔNICO</small></div>
                <div style="text-align:right"><p>Emissão: ${new Date().toLocaleDateString('pt-BR')}</p></div>
            </div>
            <div style="display:flex; gap:10px; margin-bottom:30px;">
                <div style="flex:1; background:#f8fafc; padding:15px; border-radius:10px;">RECEITAS<br><strong>R$ ${r.toFixed(2)}</strong></div>
                <div style="flex:1; background:#f8fafc; padding:15px; border-radius:10px;">DESPESAS<br><strong>R$ ${d.toFixed(2)}</strong></div>
                <div style="flex:1; background:#0f172a; color:#fff; padding:15px; border-radius:10px;">SALDO LÍQUIDO<br><strong>R$ ${(r-d).toFixed(2)}</strong></div>
            </div>
            <table style="width:100%; border-collapse:collapse;">
                <tr style="background:#f1f5f9; text-align:left;">
                    <th style="padding:10px;">Data</th><th style="padding:10px;">Descrição</th><th style="padding:10px; text-align:right;">Valor</th>
                </tr>
                ${transacoes.map(t => `
                    <tr style="border-bottom:1px solid #f1f5f9;">
                        <td style="padding:10px; font-size:12px;">${t.data}</td>
                        <td style="padding:10px; font-size:12px;">${t.desc.toUpperCase()}</td>
                        <td style="padding:10px; text-align:right; font-weight:bold; color:${t.tipo==='receita'?'#10b981':'#f43f5e'}">
                            ${t.tipo==='receita'?'':'-'} R$ ${t.valor.toFixed(2)}
                        </td>
                    </tr>
                `).join('')}
            </table>
        </div>`;

    const opt = { 
        margin: 0, filename: `Extrato_FS_${Date.now()}.pdf`,
        html2canvas: { scale: 2, useCORS: true, windowWidth: 800 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Delay de 500ms para garantir que o HTML foi renderizado no buffer
    setTimeout(() => {
        html2pdf().set(opt).from(target).save().then(() => {
            target.innerHTML = ""; 
            toast("✅ PDF Concluído!");
        });
    }, 500);
}

// --- CORE ---
function render() {
    const lista = document.getElementById("listaTransacoes");
    if (!lista) return;
    lista.innerHTML = "";
    let r = 0, d = 0;
    transacoes.forEach(t => {
        if (t.tipo === 'receita') r += t.valor; else d += t.valor;
        const li = document.createElement("li");
        li.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:15px 0; border-bottom:1px solid var(--border);">
                <div><strong>${t.desc}</strong><br><small style="color:var(--text-sub)">${t.data}</small></div>
                <div style="display:flex; gap:10px; align-items:center;">
                    <span style="font-weight:800; color:${t.tipo==='receita'?'var(--accent)':'var(--danger)'}">
                    ${t.tipo==='receita'?'+':'-'} ${t.valor.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</span>
                    <button onclick="removerItem(${t.id})" style="border:none; background:none; color:#ccc; cursor:pointer;">✕</button>
                </div>
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
    meuGrafico = new Chart(ctx, {
        type: 'doughnut',
        data: { datasets: [{ data: (r+d)>0?[r,d]:[1,0], backgroundColor: (r+d)>0?['#10b981','#f43f5e']:['#e2e8f0','#e2e8f0'], borderWidth: 0, cutout:'85%' }] },
        options: { plugins: { legend: { display: false } } }
    });
}

function ativarLicenca() {
    const chave = document.getElementById("chaveLicenca").value.toUpperCase().trim();
    if (/^FS-2026-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(chave)) {
        localStorage.setItem(PREMIUM_KEY, "PRO_LEVEL_ACCESS");
        toast("💎 Premium Ativado!");
        setTimeout(() => location.reload(), 1000);
    } else { toast("Chave Inválida"); }
}

async function fetchCambio() {
    try {
        const res = await fetch("https://economia.awesomeapi.com.br/last/USD-BRL");
        const data = await res.json();
        document.getElementById("miniConverter").innerHTML = `💵 USD <strong>R$ ${parseFloat(data.USDBRL.bid).toFixed(2)}</strong>`;
    } catch { document.getElementById("miniConverter").innerText = "Offline"; }
}

function abrirLicenca() { document.getElementById("modalLicenca").style.display = "flex"; }
function fecharLicenca() { document.getElementById("modalLicenca").style.display = "none"; }
function abrirConfirmacao() { document.getElementById("modalConfirmacao").style.display = "flex"; }
function fecharConfirmacao() { document.getElementById("modalConfirmacao").style.display = "none"; }
function toast(m) { const t = document.getElementById("toast"); t.innerText = m; t.style.display = "block"; setTimeout(()=>t.style.display="none", 3000); }

function validarPremiumUI() { 
    if(isPremium()) { 
        const btn = document.getElementById("btnPremiumStatus");
        if(btn) { btn.innerText = "💎 Plano PRO"; btn.style.background = "#1e293b"; btn.style.color = "#fff"; }
    } 
}
