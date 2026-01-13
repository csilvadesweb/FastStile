"use strict";

const STORAGE_KEY = "faststile_pro_v3_core";
let transacoes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let tipoSelecionado = null;
let meuGrafico = null;

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    render();
    verificarStatusPremium();
    buscarCambio(); // Mini conversor USD
});

// --- TEMA ---
function initTheme() {
    const saved = localStorage.getItem("theme") || "light-theme";
    document.body.className = saved;
}

function toggleTheme() {
    const novo = document.body.classList.contains("dark-theme") ? "light-theme" : "dark-theme";
    document.body.className = novo;
    localStorage.setItem("theme", novo);
    render(); // Redesenha gráfico
}

// --- TRANSAÇÕES ---
function setTipo(tipo) {
    tipoSelecionado = tipo;
    document.getElementById('btnReceita').className = 'btn-tipo' + (tipo === 'receita' ? ' active-receita' : '');
    document.getElementById('btnDespesa').className = 'btn-tipo' + (tipo === 'despesa' ? ' active-despesa' : '');
}

function salvarTransacao() {
    const desc = document.getElementById("descricao").value.trim();
    const valor = parseFloat(document.getElementById("valor").value);

    if (!desc || isNaN(valor) || !tipoSelecionado) {
        mostrarToast("⚠️ Preencha todos os campos.");
        return;
    }

    const novaTransacao = {
        id: Date.now(),
        desc,
        valor,
        tipo: tipoSelecionado,
        data: new Date().toLocaleDateString('pt-BR')
    };

    transacoes.unshift(novaTransacao);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transacoes));

    document.getElementById("descricao").value = "";
    document.getElementById("valor").value = "";
    setTipo(null);
    render();
}

function render() {
    const lista = document.getElementById("listaTransacoes");
    if(!lista) return;

    lista.innerHTML = "";
    let r = 0, d = 0;

    transacoes.forEach(t => {
        if (t.tipo === "receita") r += t.valor; else d += t.valor;

        const li = document.createElement("li");
        li.innerHTML = `
            <div>
                <strong>${t.desc}</strong>
                <small style="display:block; color:var(--text-sub); font-size:11px">${t.data}</small>
            </div>
            <div style="display:flex; align-items:center; gap:12px">
                <span style="font-weight:700; color:${t.tipo==='receita'?'var(--accent)':'var(--danger)'}">
                    ${t.valor.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}
                </span>
                <button onclick="abrirConfirmacao('deletar', ${t.id})" style="background:none; border:none; cursor:pointer; font-size:16px; color:#cbd5e1">✕</button>
            </div>
        `;
        lista.appendChild(li);
    });

    document.getElementById("totalRendas").innerText = r.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
    document.getElementById("totalDespesas").innerText = d.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
    document.getElementById("saldoTotal").innerText = (r-d).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});

    const perc = (r+d) > 0 ? Math.round((r/(r+d))*100) : 0;
    document.getElementById("saldoPercent").innerText = perc + "%";

    atualizarGrafico(r, d);
}

// --- GRÁFICO ---
function atualizarGrafico(r, d) {
    const ctx = document.getElementById('graficoFinanceiro');
    if (!ctx) return;

    if (meuGrafico) meuGrafico.destroy();

    const isDark = document.body.classList.contains("dark-theme");
    const corVazio = isDark ? '#334155' : '#e2e8f0';

    meuGrafico = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: (r+d) > 0 ? [r, d] : [1, 0],
                backgroundColor: (r+d) > 0 ? ['#10b981', '#ef4444'] : [corVazio, corVazio],
                borderWidth: 0,
                cutout: '80%',
                borderRadius: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { enabled: (r+d)>0 } }
        }
    });
}

// --- PREMIUM ---
function abrirLicenca() { document.getElementById("modalLicenca").style.display = "flex"; }
function fecharLicenca() { document.getElementById("modalLicenca").style.display = "none"; }

function ativarLicenca() {
    const campo = document.getElementById("chaveLicenca");
    const chave = campo.value.trim().toUpperCase();
    if (/^FS-2026-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(chave)) {
        localStorage.setItem("faststile_premium", "true");
        mostrarToast("💎 Premium Ativado com Sucesso!");
        setTimeout(() => location.reload(), 1200);
    } else {
        mostrarToast("❌ Chave Inválida!");
    }
}

function bloquearPremium() {
    if (localStorage.getItem("faststile_premium") !== "true") {
        abrirLicenca();
        return true;
    }
    return false;
}

function verificarStatusPremium() {
    if(localStorage.getItem("faststile_premium") === "true") {
        const btn = document.getElementById("btnPremiumStatus");
        btn.innerHTML = "💎 PRO";
        btn.style.background = "var(--accent)";
        btn.onclick = null;
    }
}

// --- CONFIRMAÇÃO ---
function abrirConfirmacao(tipo, id = null) {
    const modal = document.getElementById("modalConfirmacao");
    const msg = document.getElementById("confirmMessage");
    const btn = document.getElementById("btnConfirmarAcao");

    modal.style.display = "flex";

    if (tipo === 'limpar') {
        msg.innerText = "Deseja apagar todos os dados permanentemente?";
        btn.onclick = () => { transacoes = []; localStorage.setItem(STORAGE_KEY, "[]"); render(); fecharConfirmacao(); };
    } else if (tipo === 'deletar') {
        msg.innerText = "Excluir esta transação?";
        btn.onclick = () => { transacoes = transacoes.filter(t => t.id !== id); localStorage.setItem(STORAGE_KEY, JSON.stringify(transacoes)); render(); fecharConfirmacao(); };
    }
}

function fecharConfirmacao() { document.getElementById("modalConfirmacao").style.display = "none"; }

// --- TOAST ---
function mostrarToast(m) {
    const t = document.getElementById("toast");
    t.innerText = m;
    t.style.display = "block";
    setTimeout(() => t.style.display = "none", 2500);
}

// --- MINICONVERSOR ---
async function buscarCambio() {
    try {
        const res = await fetch("https://economia.awesomeapi.com.br/last/USD-BRL");
        const data = await res.json();
        document.getElementById("miniConverter").innerText = `USD: R$ ${parseFloat(data.USDBRL.bid).toFixed(2)}`;
    } catch {
        document.getElementById("miniConverter").innerText = "USD: R$ 5,20";
    }
}

// --- BACKUP ---
function exportarBackup() {
    if (bloquearPremium()) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(transacoes));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "faststile_backup.json");
    dlAnchorElem.click();
}

function processarImportacao(event) {
    if (bloquearPremium()) return;
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            transacoes = data;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(transacoes));
            render();
            mostrarToast("✅ Backup Restaurado!");
        } catch { mostrarToast("❌ Arquivo inválido"); }
    };
    reader.readAsText(file);
}

// --- PDF ---
function gerarPDF() {
    if (bloquearPremium()) return;
    window.print();
}

// --- POLÍTICA DE PRIVACIDADE ---
function abrirPrivacidade() {
    document.getElementById("modalPrivacidade").style.display = "flex";
}
function fecharPrivacidade() {
    document.getElementById("modalPrivacidade").style.display = "none";
}