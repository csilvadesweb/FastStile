"use strict";

const STORAGE_KEY = "faststile_pro_v3_core";
let transacoes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let tipoSelecionado = null;
let meuGrafico = null;
let acaoPendente = null; // Armazena qual ação será confirmada

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    render();
    verificarStatusPremium();
});

// --- SISTEMA DE MODAIS CUSTOMIZADOS ---
function abrirConfirmacao(tipo, id = null) {
    const modal = document.getElementById("modalConfirmacao");
    const msg = document.getElementById("confirmMessage");
    const btn = document.getElementById("btnConfirmarAcao");

    if (tipo === 'limpar') {
        msg.innerText = "Apagar todos os dados permanentemente?";
        btn.onclick = () => { limparTudo(); fecharConfirmacao(); };
    } else if (tipo === 'deletar') {
        msg.innerText = "Deseja excluir esta transação?";
        btn.onclick = () => { realizarDelecao(id); fecharConfirmacao(); };
    } else if (tipo === 'importar') {
        msg.innerText = "Deseja substituir seus dados atuais pelos dados do backup?";
        btn.onclick = () => { confirmarImportacao(id); fecharConfirmacao(); };
    }

    modal.style.display = "flex";
}

function fecharConfirmacao() {
    document.getElementById("modalConfirmacao").style.display = "none";
}

// --- CORE DO APP ---
function initTheme() {
    const savedTheme = localStorage.getItem("theme") || "light-theme";
    document.body.className = savedTheme;
}

function toggleTheme() {
    const isDark = document.body.classList.contains("dark-theme");
    const newTheme = isDark ? "light-theme" : "dark-theme";
    document.body.className = newTheme;
    localStorage.setItem("theme", newTheme);
    render();
}

function setTipo(tipo) {
    tipoSelecionado = tipo;
    document.getElementById('btnReceita').className = 'btn-tipo' + (tipo === 'receita' ? ' active-receita' : '');
    document.getElementById('btnDespesa').className = 'btn-tipo' + (tipo === 'despesa' ? ' active-despesa' : '');
}

function salvarTransacao() {
    const desc = document.getElementById("descricao").value.trim();
    const valor = parseFloat(document.getElementById("valor").value);
    if (!desc || isNaN(valor) || !tipoSelecionado) {
        mostrarToast("Preencha os campos corretamente.");
        return;
    }
    transacoes.unshift({ id: Date.now(), desc, valor, tipo: tipoSelecionado, data: new Date().toLocaleDateString('pt-BR') });
    salvarEAtualizar();
    limparCampos();
    mostrarToast("Lançamento confirmado!");
}

function deletarTransacao(id) {
    abrirConfirmacao('deletar', id);
}

function realizarDelecao(id) {
    transacoes = transacoes.filter(t => t.id !== id);
    salvarEAtualizar();
}

function salvarEAtualizar() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transacoes));
    render();
}

function render() {
    const lista = document.getElementById("listaTransacoes");
    lista.innerHTML = "";
    let r = 0, d = 0;

    transacoes.forEach(t => {
        if (t.tipo === "receita") r += t.valor;
        else d += t.valor;

        const li = document.createElement("li");
        li.innerHTML = `
            <div>
                <strong>${t.desc}</strong>
                <small style="display:block; color:var(--text-sub); font-size:10px">${t.data}</small>
            </div>
            <div style="display:flex; align-items:center">
                <span style="font-weight:700; color:${t.tipo==='receita'?'#10b981':'#ef4444'}">${formatarMoeda(t.valor)}</span>
                <button onclick="deletarTransacao(${t.id})" style="background:none; border:none; color:#cbd5e1; margin-left:12px; cursor:pointer">✕</button>
            </div>`;
        lista.appendChild(li);
    });

    const saldo = r - d;
    document.getElementById("totalRendas").innerText = formatarMoeda(r);
    document.getElementById("totalDespesas").innerText = formatarMoeda(d);
    document.getElementById("saldoTotal").innerText = formatarMoeda(saldo);
    const total = r + d;
    document.getElementById("saldoPercent").innerText = (total > 0 ? Math.round((r / total) * 100) : 0) + "%";
    atualizarGrafico(r, d);
}

function formatarMoeda(v) { return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }

function atualizarGrafico(r, d) {
    const ctx = document.getElementById('graficoFinanceiro');
    if (meuGrafico) meuGrafico.destroy();
    const isDark = document.body.classList.contains("dark-theme");
    const emptyColor = isDark ? '#334155' : '#e2e8f0';
    meuGrafico = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: (r > 0 || d > 0) ? [r, d] : [1, 0],
                backgroundColor: (r > 0 || d > 0) ? ['#10b981', '#ef4444'] : [emptyColor, emptyColor],
                borderWidth: 0, cutout: '85%', borderRadius: 20
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } } }
    });
}

// --- FERRAMENTAS ---
function exportarBackup() {
    if (localStorage.getItem("faststile_premium") !== "true") return abrirLicenca();
    const dataStr = JSON.stringify(transacoes, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', 'backup_faststile.json');
    link.click();
}

let tempImportData = null;
function processarImportacao(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        tempImportData = JSON.parse(e.target.result);
        abrirConfirmacao('importar');
    };
    reader.readAsText(file);
    event.target.value = '';
}

function confirmarImportacao() {
    if (tempImportData) { transacoes = tempImportData; salvarEAtualizar(); mostrarToast("Backup importado!"); }
}

function limparTudo() { transacoes = []; salvarEAtualizar(); mostrarToast("Dados limpos."); }

function mostrarToast(m) {
    const t = document.getElementById("toast");
    t.innerText = m; t.style.display = "block";
    setTimeout(() => t.style.display = "none", 2500);
}

function limparCampos() {
    document.getElementById("descricao").value = "";
    document.getElementById("valor").value = "";
    tipoSelecionado = null;
    document.getElementById('btnReceita').className = 'btn-tipo';
    document.getElementById('btnDespesa').className = 'btn-tipo';
}

// --- PREMIUM ---
function verificarStatusPremium() {
    if(localStorage.getItem("faststile_premium") === "true") {
        const btn = document.getElementById("btnPremiumStatus");
        btn.innerHTML = "💎 PRO"; btn.style.background = "#10b981"; btn.onclick = null;
    }
}
function abrirLicenca() { document.getElementById("modalLicenca").style.display = "flex"; }
function fecharLicenca() { document.getElementById("modalLicenca").style.display = "none"; }
function ativarLicenca() {
    const chave = document.getElementById("chaveLicenca").value.trim().toUpperCase();
    if (/^FS-2026-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(chave)) { localStorage.setItem("faststile_premium", "true"); location.reload(); }
    else { alert("Chave inválida!"); }
}
function gerarPDF() { if (localStorage.getItem("faststile_premium") !== "true") return abrirLicenca(); window.print(); }
