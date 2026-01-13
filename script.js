"use strict";

const STORAGE_KEY = "faststile_pro_v3_core";
let transacoes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let tipoSelecionado = null;
let meuGrafico = null;

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    render();
    verificarStatusPremium();
    buscarCambio();
});

function initTheme() {
    document.body.className = localStorage.getItem("theme") || "light-theme";
}

function toggleTheme() {
    const n = document.body.classList.contains("dark-theme") ? "light-theme" : "dark-theme";
    document.body.className = n;
    localStorage.setItem("theme", n);
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

    localStorage.setItem(STORAGE_KEY, JSON.stringify(transacoes));
    document.getElementById("descricao").value = "";
    document.getElementById("valor").value = "";
    setTipo(null);
    render();
}

function render() {
    const lista = document.getElementById("listaTransacoes");
    lista.innerHTML = "";
    let r = 0, d = 0;

    transacoes.forEach(t => {
        if (t.tipo === "receita") r += t.valor; else d += t.valor;
        const li = document.createElement("li");
        li.innerHTML = `
            <div><strong>${t.desc}</strong><small style="display:block;color:var(--text-sub);font-size:10px">${t.data}</small></div>
            <div style="display:flex;align-items:center">
                <span style="font-weight:700;color:${t.tipo==='receita'?'var(--accent)':'var(--danger)'}">
                    ${t.valor.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}
                </span>
                <button onclick="abrirConfirmacao('deletar', ${t.id})" style="background:none;border:none;color:#cbd5e1;margin-left:12px;cursor:pointer">✕</button>
            </div>`;
        lista.appendChild(li);
    });

    document.getElementById("totalRendas").innerText = r.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
    document.getElementById("totalDespesas").innerText = d.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
    document.getElementById("saldoTotal").innerText = (r-d).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});

    const perc = (r+d) > 0 ? Math.round((r/(r+d))*100) : 0;
    document.getElementById("saldoPercent").innerText = perc + "%";
    atualizarGrafico(r, d);
}

function atualizarGrafico(r, d) {
    const ctx = document.getElementById('graficoFinanceiro');
    if (meuGrafico) meuGrafico.destroy();
    meuGrafico = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: (r+d)>0 ? [r, d] : [1, 0],
                backgroundColor: (r+d)>0 ? ['#10b981', '#ef4444'] : ['#e2e8f0', '#e2e8f0'],
                borderWidth: 0, cutout: '80%', borderRadius: 10
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

function abrirLicenca() { document.getElementById("modalLicenca").style.display = "flex"; }
function fecharLicenca() { document.getElementById("modalLicenca").style.display = "none"; }

function ativarLicenca() {
    const chave = document.getElementById("chaveLicenca").value.trim().toUpperCase();
    if (/^FS-2026-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(chave)) {
        localStorage.setItem("faststile_premium", "true");
        location.reload();
    } else { mostrarToast("Chave Inválida!"); }
}

function mostrarToast(m) {
    const t = document.getElementById("toast");
    t.innerText = m;
    t.style.display = "block";
    setTimeout(() => t.style.display = "none", 2000);
}

async function buscarCambio() {
    try {
        const res = await fetch("https://economia.awesomeapi.com.br/last/USD-BRL");
        const data = await res.json();
        document.getElementById("miniConverter").innerText = `USD: R$ ${parseFloat(data.USDBRL.bid).toFixed(2)}`;
    } catch { document.getElementById("miniConverter").innerText = "USD: R$ 5,20"; }
}

function gerarPDF() {
    if (localStorage.getItem("faststile_premium") !== "true") {
        abrirLicenca();
        return;
    }
    window.print();
}

function exportarBackup() {
    if (localStorage.getItem("faststile_premium") !== "true") { abrirLicenca(); return; }
    const blob = new Blob([JSON.stringify(transacoes)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'backup_faststile.json'; a.click();
}

function processarImportacao(event) {
    const reader = new FileReader();
    reader.onload = (e) => {
        transacoes = JSON.parse(e.target.result);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(transacoes));
        render();
        mostrarToast("Backup restaurado!");
    };
    reader.readAsText(event.target.files[0]);
}

function abrirConfirmacao(tipo, id = null) {
    const modal = document.getElementById("modalConfirmacao");
    modal.style.display = "flex";
    document.getElementById("btnConfirmarAcao").onclick = () => {
        if (tipo === 'limpar') transacoes = [];
        else transacoes = transacoes.filter(t => t.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(transacoes));
        render();
        fecharConfirmacao();
    };
}

function fecharConfirmacao() { document.getElementById("modalConfirmacao").style.display = "none"; }

function verificarStatusPremium() {
    if(localStorage.getItem("faststile_premium") === "true") {
        document.getElementById("btnPremiumStatus").innerText = "💎 PRO";
    }
}
