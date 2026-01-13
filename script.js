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
        mostrarToast("Preencha todos os campos.");
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
    mostrarToast("Lançamento confirmado!");
}

function deletarTransacao(id) {
    if(confirm("Deseja excluir este item?")) {
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
                <span class="${t.tipo === 'receita' ? 'texto-receita' : 'texto-despesa'}" style="font-weight:700">
                    ${formatarMoeda(t.valor)}
                </span>
                <button class="btn-del" onclick="deletarTransacao(${t.id})" style="background:none; border:none; color:var(--text-sub); margin-left:10px; cursor:pointer">✕</button>
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

function atualizarGrafico(r, d) {
    const ctx = document.getElementById('graficoFinanceiro');
    if (meuGrafico) meuGrafico.destroy();
    
    const isDark = document.body.classList.contains("dark-theme");
    const emptyColor = isDark ? '#334155' : '#e5e7eb';
    const temDados = r > 0 || d > 0;

    meuGrafico = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: temDados ? [r, d] : [1, 0],
                backgroundColor: temDados ? ['#10b981', '#ef4444'] : [emptyColor, emptyColor],
                borderWidth: 0, cutout: '82%', borderRadius: temDados ? 8 : 0
            }]
        },
        options: { 
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { enabled: temDados } }
        }
    });
}

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

// --- LOGICA PREMIUM ---
function isPremium() { return localStorage.getItem("faststile_premium") === "true"; }

function verificarStatusPremium() {
    if(isPremium()) {
        const btn = document.getElementById("btnPremiumStatus");
        btn.innerHTML = "💎 PRO Ativo";
        btn.style.background = "#10b981";
        btn.onclick = null;
    }
}

function abrirLicenca() { document.getElementById("modalLicenca").style.display = "flex"; }
function fecharLicenca() { document.getElementById("modalLicenca").style.display = "none"; }

function ativarLicenca() {
    const chave = document.getElementById("chaveLicenca").value.trim().toUpperCase();
    if (/^FS-2026-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(chave)) {
        localStorage.setItem("faststile_premium", "true");
        mostrarToast("💎 Premium Ativado com Sucesso!");
        setTimeout(() => location.reload(), 1500);
    } else {
        alert("Chave inválida! Verifique o código.");
    }
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
    a.href = url; a.download = 'faststile_backup.json'; a.click();
}

function limparTudo() {
    if (confirm("Apagar todos os dados permanentemente?")) {
        transacoes = [];
        salvarEAtualizar();
        mostrarToast("Dados removidos.");
    }
}
