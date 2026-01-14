"use strict";

// CONFIGURAÇÃO DE DADOS
const DB_KEY = "FastStile_Pro_v3_Data";
const PREMIUM_KEY = "FS_PRO_SYSTEM_ACTIVE";
let transacoes = JSON.parse(localStorage.getItem(DB_KEY)) || [];
let tipoSelecionado = null;
let meuGrafico = null;

// INICIALIZAÇÃO
document.addEventListener("DOMContentLoaded", () => {
    aplicarTema();
    validarPremiumUI();
    fetchCambio();
    render();
    
    // Configura o botão de confirmação do modal de limpeza uma única vez
    const btnConfirmar = document.getElementById("btnConfirmarAcao");
    if(btnConfirmar) {
        btnConfirmar.onclick = () => {
            transacoes = [];
            localStorage.setItem(DB_KEY, JSON.stringify(transacoes));
            render();
            fecharConfirmacao();
            toast("🗑️ Todos os dados foram apagados.");
        };
    }
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
    const descInput = document.getElementById("descricao");
    const valorInput = document.getElementById("valor");
    const desc = descInput.value.trim();
    const valor = parseFloat(valorInput.value);
    
    if (!desc || isNaN(valor) || !tipoSelecionado) {
        toast("⚠️ Preencha descrição, valor e selecione o tipo.");
        return;
    }

    const nova = {
        id: Date.now(),
        desc: desc.toUpperCase(),
        valor,
        tipo: tipoSelecionado,
        data: new Date().toLocaleDateString('pt-BR')
    };

    transacoes.unshift(nova);
    localStorage.setItem(DB_KEY, JSON.stringify(transacoes));
    
    // Limpa campos
    descInput.value = "";
    valorInput.value = "";
    setTipo(null);
    render();
    toast("✅ Salvo com sucesso!");
}

function removerItem(id) {
    transacoes = transacoes.filter(t => t.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(transacoes));
    render();
}

function isPremium() {
    return localStorage.getItem(PREMIUM_KEY) === "FS_ACT_2026";
}

// --- FERRAMENTAS ---
function exportarBackup() {
    if (!isPremium()) { abrirLicenca(); return; }
    const payload = btoa(JSON.stringify({ app: "FS-PRO", data: transacoes }));
    const blob = new Blob([payload], {type: "text/plain"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `BACKUP_FS_${Date.now()}.faststile`;
    a.click();
    toast("📦 Backup exportado!");
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
            const backup = JSON.parse(atob(e.target.result));
            if (backup.data) {
                transacoes = backup.data;
                localStorage.setItem(DB_KEY, JSON.stringify(transacoes));
                render();
                toast("✅ Dados restaurados!");
            }
        } catch { toast("❌ Erro ao ler backup"); }
    };
    reader.readAsText(file);
}

// --- PDF ENGINE (FIX BRANCO) ---
function gerarPDF() {
    if (!isPremium()) { abrirLicenca(); return; }
    toast("⏳ Gerando PDF...");
    
    const target = document.getElementById("pdf-template");
    let r = 0, d = 0;
    transacoes.forEach(t => t.tipo === 'receita' ? r += t.valor : d += t.valor);

    target.innerHTML = `
        <div style="padding:40px; background:#fff; width:210mm; font-family:sans-serif;">
            <div style="border-bottom:4px solid #0f172a; padding-bottom:10px; margin-bottom:20px;">
                <h1 style="margin:0;">FASTSTILE PRO</h1>
                <p>Relatório Gerado em: ${new Date().toLocaleDateString('pt-BR')}</p>
            </div>
            <div style="display:flex; gap:20px; margin-bottom:30px;">
                <div style="flex:1; padding:15px; background:#f8fafc; border:1px solid #ddd;">RECEITAS: <b>R$ ${r.toFixed(2)}</b></div>
                <div style="flex:1; padding:15px; background:#f8fafc; border:1px solid #ddd;">DESPESAS: <b>R$ ${d.toFixed(2)}</b></div>
                <div style="flex:1; padding:15px; background:#0f172a; color:#fff;">SALDO: <b>R$ ${(r-d).toFixed(2)}</b></div>
            </div>
            <table style="width:100%; border-collapse:collapse;">
                <tr style="background:#f1f5f9;">
                    <th style="padding:10px; text-align:left;">Data</th>
                    <th style="padding:10px; text-align:left;">Descrição</th>
                    <th style="padding:10px; text-align:right;">Valor</th>
                </tr>
                ${transacoes.map(t => `
                    <tr style="border-bottom:1px solid #eee;">
                        <td style="padding:10px;">${t.data}</td>
                        <td style="padding:10px;">${t.desc}</td>
                        <td style="padding:10px; text-align:right; color:${t.tipo==='receita'?'#10b981':'#f43f5e'}">
                            ${t.tipo==='receita'?'':'-'} R$ ${t.valor.toFixed(2)}
                        </td>
                    </tr>
                `).join('')}
            </table>
        </div>`;

    const opt = { 
        margin: 0, filename: 'Extrato.pdf',
        html2canvas: { scale: 2, windowWidth: 800 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    setTimeout(() => {
        html2pdf().set(opt).from(target).save().then(() => {
            target.innerHTML = "";
            toast("✅ PDF Concluído!");
        });
    }, 600);
}

// --- UI RENDER ---
function render() {
    const lista = document.getElementById("listaTransacoes");
    if (!lista) return;
    lista.innerHTML = "";
    let r = 0, d = 0;

    transacoes.forEach(t => {
        if (t.tipo === 'receita') r += t.valor; else d += t.valor;
        const li = document.createElement("li");
        li.className = "item-transacao";
        li.innerHTML = `
            <div>
                <div style="font-weight:700;">${t.desc}</div>
                <div style="font-size:0.75rem; color:var(--text-sub)">${t.data}</div>
            </div>
            <div style="display:flex; gap:12px; align-items:center;">
                <span style="font-weight:800; color:${t.tipo==='receita'?'var(--accent)':'var(--danger)'}">
                ${t.tipo==='receita'?'+':'-'} R$ ${t.valor.toFixed(2)}</span>
                <button onclick="removerItem(${t.id})" style="border:none; background:none; color:#ccc; cursor:pointer;">✕</button>
            </div>`;
        lista.appendChild(li);
    });

    document.getElementById("totalRendas").innerText = "R$ " + r.toFixed(2);
    document.getElementById("totalDespesas").innerText = "R$ " + d.toFixed(2);
    document.getElementById("saldoTotal").innerText = "R$ " + (r-d).toFixed(2);
    document.getElementById("saldoPercent").innerText = (r+d) > 0 ? Math.round((r/(r+d))*100) + "%" : "0%";
    
    atualizarGrafico(r, d);
}

function atualizarGrafico(r, d) {
    const ctx = document.getElementById('graficoFinanceiro').getContext('2d');
    if (meuGrafico) meuGrafico.destroy();
    meuGrafico = new Chart(ctx, {
        type: 'doughnut',
        data: { datasets: [{ data: (r+d)>0?[r,d]:[1,0], backgroundColor: (r+d)>0?['#10b981','#f43f5e']:['#e2e8f0','#e2e8f0'], borderWidth: 0, cutout:'85%', borderRadius: 10 }] },
        options: { plugins: { legend: { display: false } } }
    });
}

// --- SISTEMA ---
function ativarLicenca() {
    const chave = document.getElementById("chaveLicenca").value.toUpperCase().trim();
    if (/^FS-2026-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(chave)) {
        localStorage.setItem(PREMIUM_KEY, "FS_ACT_2026");
        toast("💎 Versão PRO Ativada!");
        setTimeout(() => location.reload(), 1000);
    } else { toast("❌ Chave Inválida"); }
}

async function fetchCambio() {
    try {
        const res = await fetch("https://economia.awesomeapi.com.br/last/USD-BRL");
        const data = await res.json();
        document.getElementById("miniConverter").innerHTML = `💵 USD <b>R$ ${parseFloat(data.USDBRL.bid).toFixed(2)}</b>`;
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
        if(btn) { 
            btn.innerText = "💎 Plano PRO"; 
            btn.style.background = "var(--primary)"; btn.style.color = "#fff"; 
            btn.onclick = null;
        }
    } 
}
