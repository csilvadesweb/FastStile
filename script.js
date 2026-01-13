"use strict";

const DB_KEY = "FastStile_Pro_v2_Data";
const PREMIUM_KEY = "FastStile_Premium_Status";
let transacoes = JSON.parse(localStorage.getItem(DB_KEY)) || [];
let tipoSelecionado = null;
let meuGrafico = null;

document.addEventListener("DOMContentLoaded", () => {
    document.body.className = localStorage.getItem("theme") || "light-theme";
    if(localStorage.getItem(PREMIUM_KEY) === "true") validarPremiumUI();
    fetchCambio();
    render();
});

function toggleTheme() {
    const t = document.body.classList.contains("dark-theme") ? "light-theme" : "dark-theme";
    document.body.className = t;
    localStorage.setItem("theme", t);
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
    if (!desc || isNaN(valor) || !tipoSelecionado) { toast("Preencha tudo."); return; }

    transacoes.unshift({ id: Date.now(), desc, valor, tipo: tipoSelecionado, data: new Date().toLocaleDateString('pt-BR') });
    localStorage.setItem(DB_KEY, JSON.stringify(transacoes));
    document.getElementById("descricao").value = "";
    document.getElementById("valor").value = "";
    setTipo(null);
    render();
    toast("Lançamento salvo!");
}

function render() {
    const lista = document.getElementById("listaTransacoes");
    lista.innerHTML = "";
    let r = 0, d = 0;

    transacoes.forEach(t => {
        if (t.tipo === 'receita') r += t.valor; else d += t.valor;
        const li = document.createElement("li");
        li.style = "list-style:none; display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid var(--border);";
        li.innerHTML = `<div><strong>${t.desc}</strong><br><small>${t.data}</small></div>
            <div style="display:flex; align-items:center; gap:10px">
            <span style="font-weight:800; color:${t.tipo==='receita'?'var(--accent)':'var(--danger)'}">
            ${t.tipo==='receita'?'+':'-'} ${t.valor.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</span>
            <button class="no-print" onclick="removerItem(${t.id})" style="border:none; background:none; cursor:pointer;">✕</button></div>`;
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
        data: { datasets: [{ data: (r+d)>0?[r, d]:[1,0], backgroundColor: ['#10b981', '#f43f5e'], borderWidth: 0, cutout: '80%' }] },
        options: { plugins: { legend: { display: false } } }
    });
}

// BACKUP E IMPORTAÇÃO
function exportarBackup() {
    if (localStorage.getItem(PREMIUM_KEY) !== "true") { abrirLicenca(); return; }
    const blob = new Blob([JSON.stringify(transacoes)], {type: 'application/json'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'backup_faststile.json'; a.click();
}

function processarImportacao(event) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            transacoes = JSON.parse(e.target.result);
            localStorage.setItem(DB_KEY, JSON.stringify(transacoes));
            render(); toast("Backup restaurado!");
        } catch { toast("Arquivo inválido!"); }
    };
    reader.readAsText(event.target.files[0]);
}

function gerarPDF() {
    if (localStorage.getItem(PREMIUM_KEY) !== "true") { abrirLicenca(); return; }
    const element = document.getElementById("area-extrato-banco");
    const opt = { margin: 10, filename: 'extrato.pdf', html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } };
    toast("Gerando PDF...");
    html2pdf().set(opt).from(element).save();
}

function ativarLicenca() {
    const chave = document.getElementById("chaveLicenca").value.toUpperCase().trim();
    if (/^FS-2026-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(chave)) {
        localStorage.setItem(PREMIUM_KEY, "true");
        toast("Premium Ativado!"); setTimeout(() => location.reload(), 1000);
    } else { toast("Chave Inválida!"); }
}

function removerItem(id) { transacoes = transacoes.filter(t => t.id !== id); localStorage.setItem(DB_KEY, JSON.stringify(transacoes)); render(); }
function abrirLicenca() { document.getElementById("modalLicenca").style.display = "flex"; }
function fecharLicenca() { document.getElementById("modalLicenca").style.display = "none"; }
function toast(m) { const t = document.getElementById("toast"); t.innerText = m; t.style.display = "block"; setTimeout(()=>t.style.display="none",3000); }
function abrirConfirmacao() { document.getElementById("modalConfirmacao").style.display = "flex"; document.getElementById("btnConfirmarAcao").onclick = () => { transacoes = []; localStorage.setItem(DB_KEY, "[]"); render(); fecharConfirmacao(); }; }
function fecharConfirmacao() { document.getElementById("modalConfirmacao").style.display = "none"; }
async function fetchCambio() { try { const res = await fetch("https://economia.awesomeapi.com.br/last/USD-BRL"); const data = await res.json(); document.getElementById("miniConverter").innerHTML = `💵 USD <strong>R$ ${parseFloat(data.USDBRL.bid).toFixed(2)}</strong>`; } catch { } }
function validarPremiumUI() { const b = document.getElementById("btnPremiumStatus"); b.innerText = "💎 Plano PRO"; b.style.background = "#1e293b"; b.style.color = "#fff"; }
