"use strict";

const STORAGE_KEY = "faststile_data";
let transacoes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let meuGrafico = null;

const categoriaCores = {
    moradia: "#6366f1", transporte: "#3b82f6", saude: "#f43f5e", educacao: "#a855f7",
    compras: "#ec4899", assinaturas: "#06b6d4", investimentos: "#10b981", impostos: "#1e293b", outros: "#94a3b8"
};

// Funções Globais expostas ao objeto Window
window.toggleTheme = function() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    atualizarInterface();
};

window.adicionar = function(tipo) {
    const d = document.getElementById('nomeDesc'), v = document.getElementById('valorMontante'), c = document.getElementById('categoriaSelect');
    const nome = d.value.trim(), valor = parseFloat(v.value);
    
    if (!nome || isNaN(valor) || valor <= 0) return alert("Por favor, insira valores válidos.");

    transacoes.push({
        id: Date.now(),
        nome,
        valor,
        tipo,
        categoria: c.value,
        data: new Date().toLocaleDateString('pt-BR')
    });

    d.value = ""; v.value = "";
    salvarEAtualizar();
};

window.exportarPDF = function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    [span_3](start_span)// Dados para o cabeçalho[span_3](end_span)
    const rT = transacoes.filter(t => t.tipo === 'renda').reduce((acc, t) => acc + t.valor, 0);
    const dT = transacoes.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + t.valor, 0);

    [span_4](start_span)// Design do Cabeçalho[span_4](end_span)
    doc.setFillColor(15, 23, 42); doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255); doc.setFontSize(22); doc.text("FastStilecs PRO", 15, 20);
    doc.setFontSize(12); doc.text("RELATÓRIO FINANCEIRO PREMIUM", 15, 30);
    doc.setFontSize(10); doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 15, 38);

    [span_5](start_span)// Blocos de Resumo[span_5](end_span)
    doc.setTextColor(40); doc.setFontSize(12);
    doc.text(`Receitas: R$ ${rT.toFixed(2)}`, 15, 55);
    doc.text(`Despesas: R$ ${dT.toFixed(2)}`, 15, 62);
    doc.setFont("helvetica", "bold");
    doc.text(`Saldo Final: R$ ${(rT - dT).toFixed(2)}`, 15, 72);

    [span_6](start_span)// Tabela de Transações[span_6](end_span)
    const colunas = ["DATA", "DESCRIÇÃO", "CATEGORIA", "TIPO", "VALOR"];
    const linhas = transacoes.slice().reverse().map(t => [
        t.data, t.nome.toUpperCase(), t.categoria, t.tipo === 'renda' ? 'ENTRADA' : 'SAÍDA', 
        `${t.tipo === 'renda' ? '+' : '-'} ${t.valor.toFixed(2)}`
    ]);

    doc.autoTable({
        head: [colunas], body: linhas, startY: 80, theme: 'striped',
        headStyles: { fillColor: [15, 23, 42] },
        styles: { fontSize: 9 }
    });

    doc.setFontSize(8); doc.setTextColor(150);
    [span_7](start_span)doc.text("2026 FastStilecs - Propriedade de C. Silva", 105, 290, { align: "center" });[span_7](end_span)
    
    doc.save("FastStilecs_Relatorio.pdf");
};

window.exportarBackup = () => {
    const b = new Blob([JSON.stringify({ app: "FastStile", dados: transacoes })], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(b);
    a.download = "FastStile_Backup.json"; a.click();
};

window.importarBackup = () => {
    const i = document.createElement("input"); i.type = "file";
    i.onchange = e => {
        const r = new FileReader();
        r.onload = ev => {
            const res = JSON.parse(ev.target.result);
            if (res.app === "FastStile") { transacoes = res.dados; salvarEAtualizar(); }
        };
        r.readAsText(e.target.files[0]);
    };
    i.click();
};

window.zerarDados = function() {
    if (confirm("Resetar todos os dados?")) { transacoes = []; salvarEAtualizar(); }
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
        html += `<div class="hist-item"><span><b>${t.nome}</b><br><small>${t.data} | ${t.categoria.toUpperCase()}</small></span><span style="color:${t.tipo === 'renda' ? '#10b981' : '#ef4444'}; font-weight:bold;">${t.tipo === 'renda' ? '+' : '-'} R$ ${t.valor.toFixed(2)}</span></div>`;
    });

    document.getElementById('resumoRenda').innerText = `R$ ${rT.toFixed(2)}`;
    document.getElementById('resumoDespesa').innerText = `R$ ${dT.toFixed(2)}`;
    document.getElementById('resumoSaldo').innerText = `R$ ${(rT - dT).toFixed(2)}`;
    if (lista) lista.innerHTML = html || "<p style='text-align:center; opacity:0.5; padding:20px;'>Sem registros.</p>";
    renderGrafico();
}

function renderGrafico() {
    const canvas = document.getElementById('graficoFinanceiro');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (meuGrafico) meuGrafico.destroy();
    const cats = {}; transacoes.forEach(t => { cats[t.categoria] = (cats[t.categoria] || 0) + t.valor; });
    meuGrafico = new Chart(ctx, {
        type: 'bar',
        data: { labels: Object.keys(cats).map(c => c.toUpperCase()), datasets: [{ data: Object.values(cats), backgroundColor: Object.keys(cats).map(c => categoriaCores[c] || '#94a3b8'), borderRadius: 5 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

// Inicialização segura
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode');
    atualizarInterface();
});
