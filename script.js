"use strict";

const STORAGE_KEY = "faststile_pro_v3_core";
let transacoes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let tipoSelecionado = null;
let meuGrafico = null;

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    render();
    verificarStatusPremium();
});

// --- SISTEMA DE TEMAS ---
function initTheme() {
    const savedTheme = localStorage.getItem("theme") || "light-theme";
    document.body.className = savedTheme;
}

function toggleTheme() {
    const isDark = document.body.classList.contains("dark-theme");
    const newTheme = isDark ? "light-theme" : "dark-theme";
    document.body.className = newTheme;
    localStorage.setItem("theme", newTheme);
    render(); // Re-renderiza para atualizar cores do gráfico se necessário
}

// --- CORE TRANSAÇÕES ---
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

    transacoes.unshift({
        id: Date.now(),
        desc,
        valor,
        tipo: tipoSelecionado,
        data: new Date().toLocaleDateString('pt-BR')
    });

    salvarEAtualizar();
    limparCampos();
    mostrarToast("Confirmado!");
}

function deletarTransacao(id) {
    if(confirm("Excluir item?")) {
        transacoes = transacoes.filter(t => t.id !== id);
        salvarEAtualizar();
    }
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
                <span class="${t.tipo === 'receita' ? 'texto-receita' : 'texto-despesa'}">
                    ${formatarMoeda(t.valor)}
                </span>
                <button class="btn-del" onclick="deletarTransacao(${t.id})">✕</button>
            </div>
        `;
        lista.appendChild(li);
    });

    document.getElementById("totalRendas").innerText = formatarMoeda(r);
    document.getElementById("totalDespesas").innerText = formatarMoeda(d);
    document.getElementById("saldoTotal").innerText = formatarMoeda(r - d);
    atualizarGrafico(r, d);
}

function formatarMoeda(v) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// --- GRÁFICO ---
function atualizarGrafico(r, d) {
    const ctx = document.getElementById('graficoFinanceiro');
    if (meuGrafico) meuGrafico.destroy();
    
    const isDark = document.body.classList.contains("dark-theme");
    const emptyColor = isDark ? '#334155' : '#e5e7eb';
    
    const temDados = r > 0 || d > 0;
    const dataGrafico = temDados ? [r, d] : [1, 0];
    const cores = temDados ? ['#10b981', '#ef4444'] : [emptyColor, emptyColor];

    meuGrafico = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: dataGrafico,
                backgroundColor: cores,
                borderWidth: 0,
                cutout: '80%',
                borderRadius: temDados ? 6 : 0
            }]
        },
        options: { 
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { enabled: temDados } }
        }
    });
}

// --- UTILITÁRIOS PREMIUM ---
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

function isPremium() { return localStorage.getItem("faststile_premium") === "true"; }

function verificarStatusPremium() {
    if(isPremium()) {
        const btn = document.getElementById("btnPremiumStatus");
        btn.innerHTML = "💎 PRO";
        btn.style.background = "#10b981";
        btn.onclick = null;
    }
}

function abrirLicenca() { document.getElementById("modalLicenca").style.display = "flex"; }
function fecharLicenca() { document.getElementById("modalLicenca").style.display = "none"; }

function ativarLicenca() {
    const chave = document.getElementById("chaveLicenca").value.trim();
    if (/^FS-2026-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(chave)) {
        localStorage.setItem("faststile_premium", "true");
        location.reload();
    } else { alert("Chave inválida!"); }
}

function gerarPDF() {
    if (!isPremium()) return abrirLicenca();
    window.print();
}

function exportarBackup() {
    if (!isPremium()) return abrirLicenca();
    const data = JSON.stringify(transacoes);
    const blob = new Blob([data], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'backup.json'; a.click();
}

function limparTudo() {
    if (confirm("Apagar tudo?")) {
        transacoes = [];
        salvarEAtualizar();
    }
}
