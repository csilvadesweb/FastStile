"use strict";

// Variáveis Globais
const STORAGE_KEY = "faststile_data";
let transacoes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let meuGrafico = null;

const categoriaCores = {
    moradia: "#6366f1", transporte: "#3b82f6", saude: "#f43f5e", educacao: "#a855f7",
    compras: "#ec4899", assinaturas: "#06b6d4", investimentos: "#10b981", impostos: "#1e293b", outros: "#94a3b8"
};

// Funções de Interface
window.toggleTheme = function() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    if(meuGrafico) renderGrafico();
};

window.adicionar = function(tipo) {
    const d = document.getElementById('nomeDesc'), v = document.getElementById('valorMontante'), c = document.getElementById('categoriaSelect');
    if (!d.value || !v.value || v.value <= 0) return alert("Preencha os campos corretamente.");

    transacoes.push({
        id: Date.now(),
        nome: d.value.toUpperCase(),
        valor: parseFloat(v.value),
        tipo: tipo,
        categoria: c.value,
        data: new Date().toLocaleDateString('pt-BR')
    });

    d.value = ""; v.value = "";
    salvarEAtualizar();
};

window.exportarPDF = function() {
    if (transacoes.length === 0) return alert("Sem dados para exportar.");
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const rT = transacoes.filter(t => t.tipo === 'renda').reduce((acc, t) => acc + t.valor, 0);
    const dT = transacoes.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + t.valor, 0);

    // Design Elite (conforme o PDF solicitado)
    doc.setFillColor(15, 23, 42); doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255); doc.setFontSize(22); doc.text("FastStilecs PRO", 15, 20);
    doc.setFontSize(10); doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 15, 35);

    doc.setTextColor(40); doc.setFontSize(12);
    doc.text(`Receitas: R$ ${rT.toFixed(2)}`, 15, 55);
    doc.text(`Despesas: R$ ${dT.toFixed(2)}`, 15, 62);
    doc.setFont("helvetica", "bold");
    doc.text(`Saldo Final: R$ ${(rT - dT).toFixed(2)}`, 15, 72);

    const linhas = transacoes.slice().reverse().map(t => [
        t.data, t.nome, t.categoria, t.tipo === 'renda' ? 'ENTRADA' : 'SAÍDA', `R$ ${t.valor.toFixed(2)}`
    ]);

    doc.autoTable({
        head: [['DATA', 'DESCRIÇÃO', 'CATEGORIA', 'TIPO', 'VALOR']],
        body: linhas, startY: 80, theme: 'striped', headStyles: { fillColor: [15, 23, 42] }
    });

    doc.save("Relatorio_FastStile.pdf");
};

window.zerarDados = function() {
    if (confirm("Apagar todos os registos permanentemente?")) {
        transacoes = [];
        salvarEAtualizar();
    }
};

function salvarEAtualizar() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transacoes));
    atualizarInterface();
}

function atualizarInterface() {
    const lista = document.getElementById('listaHistorico');
    let rT = 0, dT = 0, html = "";

    [...transacoes].reverse().forEach(t => {
        if (t.tipo === 'renda') rT += t.valor; else dT += t.valor;
        html += `<div class="hist-item">
            <span><b>${t.nome}</b><br><small>${t.data} | ${t.categoria.toUpperCase()}</small></span>
            <span style="color:${t.tipo === 'renda' ? '#10b981' : '#ef4444'}; font-weight:bold;">
                ${t.tipo === 'renda' ? '+' : '-'} R$ ${t.valor.toFixed(2)}
            </span>
        </div>`;
    });

    document.getElementById('resumoRenda').innerText = `R$ ${rT.toFixed(2)}`;
    document.getElementById('resumoDespesa').innerText = `R$ ${dT.toFixed(2)}`;
    document.getElementById('resumoSaldo').innerText = `R$ ${(rT - dT).toFixed(2)}`;
    if (lista) lista.innerHTML = html || "<p style='text-align:center; opacity:0.5; padding:20px;'>Sem dados.</p>";
    renderGrafico();
}

function renderGrafico() {
    const canvas = document.getElementById('graficoFinanceiro');
    if (!canvas) return;
    if (meuGrafico) meuGrafico.destroy();
    const cats = {}; 
    transacoes.forEach(t => { cats[t.categoria] = (cats[t.categoria] || 0) + t.valor; });

    meuGrafico = new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: Object.keys(cats).map(c => c.toUpperCase()),
            datasets: [{ data: Object.values(cats), backgroundColor: '#3b82f6', borderRadius: 5 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode');
    atualizarInterface();
});

// PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(err => console.log("SW Erro:", err));
}
