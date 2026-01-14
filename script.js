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
    toast("Salvo com sucesso!");
}

function removerItem(id) {
    transacoes = transacoes.filter(t => t.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(transacoes));
    render();
}

// --- FUNÇÕES COM TRAVA PREMIUM ---

function exportarBackup() {
    if (localStorage.getItem(PREMIUM_KEY) !== "true") { abrirLicenca(); return; }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(transacoes));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `backup_faststile_${Date.now()}.json`);
    dlAnchor.click();
    toast("Backup Exportado!");
}

function tentarImportar() {
    if (localStorage.getItem(PREMIUM_KEY) !== "true") { 
        abrirLicenca(); 
    } else {
        document.getElementById('inputImport').click();
    }
}

function importarBackup(event) {
    if (localStorage.getItem(PREMIUM_KEY) !== "true") { 
        event.target.value = ""; 
        return; 
    }
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
                toast("Dados Restaurados!");
            }
        } catch (err) { toast("Arquivo Inválido"); }
    };
    reader.readAsText(file);
}

function gerarPDF() {
    if (localStorage.getItem(PREMIUM_KEY) !== "true") { abrirLicenca(); return; }
    toast("Gerando PDF Bancário...");
    const tempCont = document.getElementById("pdf-template");
    tempCont.style.display = "block";
    
    let r = 0, d = 0;
    transacoes.forEach(t => t.tipo === 'receita' ? r += t.valor : d += t.valor);

    tempCont.innerHTML = `
        <div style="padding:40px; font-family: sans-serif; color:#1e293b; background: white;">
            <div style="border-bottom:3px solid #0f172a; padding-bottom:20px; margin-bottom:30px; display:flex; justify-content:space-between;">
                <div><h1 style="margin:0; font-size: 24px;">FASTSTILE PRO</h1><p>EXTRATO BANCÁRIO DE CONTROLE</p></div>
                <div style="text-align:right;"><p><b>DATA:</b> ${new Date().toLocaleDateString('pt-BR')}</p></div>
            </div>
            <div style="display:flex; gap:10px; margin-bottom:30px;">
                <div style="flex:1; background:#f1f5f9; padding:15px; border-radius:8px;">Rendas: <br><b style="color:#10b981;">R$ ${r.toLocaleString('pt-BR')}</b></div>
                <div style="flex:1; background:#f1f5f9; padding:15px; border-radius:8px;">Gastos: <br><b style="color:#f43f5e;">R$ ${d.toLocaleString('pt-BR')}</b></div>
                <div style="flex:1; background:#0f172a; padding:15px; border-radius:8px; color:white;">Saldo: <br><b>R$ ${(r-d).toLocaleString('pt-BR')}</b></div>
            </div>
            <table style="width:100%; border-collapse:collapse;">
                <tr style="background:#f8fafc; border-bottom: 2px solid #e2e8f0;">
                    <th style="padding:12px; text-align:left;">DATA</th><th style="padding:12px; text-align:left;">DESCRIÇÃO</th><th style="padding:12px; text-align:right;">VALOR</th>
                </tr>
                ${transacoes.map(t => `
                    <tr style="border-bottom:1px solid #f1f5f9;">
                        <td style="padding:12px; font-size:12px;">${t.data}</td>
                        <td style="padding:12px;">${t.desc}</td>
                        <td style="padding:12px; text-align:right; font-weight:bold; color:${t.tipo==='receita'?'#10b981':'#f43f5e'}">
                            ${t.tipo==='receita'?'+':'-'} R$ ${t.valor.toLocaleString('pt-BR')}
                        </td>
                    </tr>
                `).join('')}
            </table>
        </div>`;

    const opt = { margin: 0, filename: 'extrato-faststile.pdf', html2canvas: { scale: 3 }, jsPDF: { unit: 'mm', format: 'a4' } };
    html2pdf().set(opt).from(tempCont).save().then(() => { tempCont.style.display = "none"; });
}

function abrirConfirmacao(tipo) {
    if (localStorage.getItem(PREMIUM_KEY) !== "true") { abrirLicenca(); return; }
    document.getElementById("modalConfirmacao").style.display = "flex";
    document.getElementById("btnConfirmarAcao").onclick = () => { 
        if(tipo==='limpar') { transacoes=[]; localStorage.setItem(DB_KEY,"[]"); render(); }
        fecharConfirmacao(); 
    };
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
                <div><div style="font-weight:700;">${t.desc}</div><div style="font-size:11px; color:var(--text-sub)">${t.data}</div></div>
                <div style="display:flex; gap:10px; align-items:center;">
                    <span style="font-weight:800; color:${t.tipo==='receita'?'var(--accent)':'var(--danger)'}">
                    ${t.tipo==='receita'?'+':'-'} ${t.valor.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</span>
                    <button onclick="removerItem(${t.id})" style="border:none; background:none; color:var(--text-sub); cursor:pointer;">✕</button>
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
    const canvas = document.getElementById('graficoFinanceiro');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (meuGrafico) meuGrafico.destroy();
    meuGrafico = new Chart(ctx, {
        type: 'doughnut',
        data: { datasets: [{ data: (r+d)>0?[r,d]:[1,0], backgroundColor: (r+d)>0?['#10b981','#f43f5e']:['#e2e8f0','#e2e8f0'], borderWidth: 0, cutout:'82%', borderRadius: 10 }] },
        options: { plugins: { legend: { display: false } }, animation: {duration: 500} }
    });
}

function ativarLicenca() {
    const chave = document.getElementById("chaveLicenca").value.toUpperCase().trim();
    if (/^FS-2026-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(chave)) {
        localStorage.setItem(PREMIUM_KEY, "true");
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
function fecharConfirmacao() { document.getElementById("modalConfirmacao").style.display = "none"; }
function toast(m) { const t = document.getElementById("toast"); t.innerText = m; t.style.display = "block"; setTimeout(()=>t.style.display="none", 3000); }

function validarPremiumUI() { 
    if(localStorage.getItem(PREMIUM_KEY) === "true") { 
        const btn = document.getElementById("btnPremiumStatus");
        if(btn) {
            btn.innerText = "💎 Plano PRO";
            btn.style.background = "#1e293b";
        }
    } 
}
