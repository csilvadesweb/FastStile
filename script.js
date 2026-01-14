/**
 * @license FASTSTILE PRO - COPYRIGHT 2026 C. SILVA
 * PROTEÇÃO JURÍDICA LEI 9.609/98
 */
"use strict";

const DB_KEY = "FS_PRO_DATA_SECURE";
const PREMIUM_KEY = "FS_PRO_LIC_STATUS";
const AUTH_SIG = "FS_ORIGINAL_CORE";

let transacoes = JSON.parse(localStorage.getItem(DB_KEY)) || [];
let tipoSelecionado = null;
let meuGrafico = null;

// Bloqueio de Inspeção
document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && (e.shiftKey && (e.key === "I" || e.key === "J") || e.key === "U") || e.key === "F12") {
        e.preventDefault(); toast("🛡️ Código Protegido");
    }
});

document.addEventListener("DOMContentLoaded", () => {
    aplicarTema();
    validarPremiumUI();
    fetchCambio();
    render();
    
    // Liga o botão de apagar
    const btnDel = document.getElementById("btnConfirmarAcao");
    if(btnDel) btnDel.onclick = () => {
        transacoes = [];
        localStorage.setItem(DB_KEY, JSON.stringify(transacoes));
        render(); fecharConfirmacao(); toast("🗑️ Dados removidos.");
    };
});

function aplicarTema() { document.body.className = localStorage.getItem("theme") || "light-theme"; }
function toggleTheme() {
    const n = document.body.classList.contains("dark-theme") ? "light-theme" : "dark-theme";
    document.body.className = n; localStorage.setItem("theme", n); render();
}

function setTipo(t) {
    tipoSelecionado = t;
    document.getElementById('btnReceita').className = 'btn-tipo' + (t==='receita'?' active-receita':'');
    document.getElementById('btnDespesa').className = 'btn-tipo' + (t==='despesa'?' active-despesa':'');
}

function salvarTransacao() {
    const d = document.getElementById("descricao").value.trim();
    const v = parseFloat(document.getElementById("valor").value);
    if (!d || isNaN(v) || !tipoSelecionado) { toast("⚠️ Preencha todos os campos"); return; }

    transacoes.unshift({
        id: Date.now(), desc: d.toUpperCase(), valor: v, tipo: tipoSelecionado,
        data: new Date().toLocaleDateString('pt-BR'), _sig: AUTH_SIG
    });
    localStorage.setItem(DB_KEY, JSON.stringify(transacoes));
    document.getElementById("descricao").value = "";
    document.getElementById("valor").value = "";
    setTipo(null); render(); toast("✅ Registrado!");
}

function removerItem(id) {
    transacoes = transacoes.filter(t => t.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(transacoes));
    render();
}

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
            <div><b>${t.desc}</b><br><small style="color:var(--text-sub)">${t.data}</small></div>
            <div style="display:flex; align-items:center; gap:10px">
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

function isPremium() { return localStorage.getItem(PREMIUM_KEY) === "ACTIVE"; }

function gerarPDF() {
    if(!isPremium()){ abrirLicenca(); return; }
    toast("⏳ Gerando...");
    const target = document.getElementById("pdf-template");
    target.innerHTML = `<div style="padding:40px; font-family:sans-serif;"><h1>FastStile Extrato</h1><hr>${transacoes.map(t=>`<p>${t.data} - ${t.desc}: R$ ${t.valor.toFixed(2)}</p>`).join('')}</div>`;
    html2pdf().from(target).save('Extrato_FastStile.pdf').then(()=>toast("✅ Concluído"));
}

function exportarBackup() {
    if(!isPremium()){ abrirLicenca(); return; }
    const blob = new Blob([btoa(JSON.stringify(transacoes))], {type:"text/plain"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = `backup_fs.faststile`; a.click();
}

function tentarImportar() { if(!isPremium()){ abrirLicenca(); return; } document.getElementById('inputImport').click(); }

function importarBackup(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            transacoes = JSON.parse(atob(event.target.result));
            localStorage.setItem(DB_KEY, JSON.stringify(transacoes));
            render(); toast("✅ Backup Restaurado!");
        } catch { toast("❌ Arquivo inválido"); }
    };
    reader.readAsText(file);
}

function ativarLicenca() {
    const c = document.getElementById("chaveLicenca").value.toUpperCase();
    if (/^FS-2026-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(c)) {
        localStorage.setItem(PREMIUM_KEY, "ACTIVE");
        toast("💎 Premium Ativado!"); setTimeout(()=>location.reload(), 1000);
    } else { toast("❌ Chave Inválida"); }
}

async function fetchCambio() {
    try {
        const res = await fetch("https://economia.awesomeapi.com.br/last/USD-BRL");
        const data = await res.json();
        document.getElementById("miniConverter").innerHTML = `USD: <b>R$ ${parseFloat(data.USDBRL.bid).toFixed(2)}</b>`;
    } catch { document.getElementById("miniConverter").innerText = "Offline"; }
}

function abrirLicenca() { document.getElementById("modalLicenca").style.display = "flex"; }
function fecharLicenca() { document.getElementById("modalLicenca").style.display = "none"; }
function abrirConfirmacao() { document.getElementById("modalConfirmacao").style.display = "flex"; }
function fecharConfirmacao() { document.getElementById("modalConfirmacao").style.display = "none"; }
function toast(m) { const t = document.getElementById("toast"); t.innerText = m; t.style.display = "block"; setTimeout(()=>t.style.display="none", 3000); }
function validarPremiumUI() { if(isPremium()){ const b = document.getElementById("btnPremiumStatus"); if(b){ b.innerText="💎 PRO"; b.onclick=null; b.style.background="var(--primary)"; } } }
