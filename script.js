"use strict";

(function () {
    const STORAGE_KEY = "faststile_data";
    let transacoes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    let meuGrafico = null;

    const categoriaCores = { moradia: "#6366f1", transporte: "#3b82f6", saude: "#f43f5e", educacao: "#a855f7", compras: "#ec4899", assinaturas: "#06b6d4", investimentos: "#10b981", dividas: "#f59e0b", outros: "#94a3b8" };

    window.onload = () => {
        if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode');
        atualizarInterface();
    };

    function notify(msg, tipo = 'sucesso') {
        const t = document.createElement('div');
        t.style = `position:fixed; bottom:20px; right:20px; padding:15px 25px; border-radius:12px; background:${tipo==='erro'?'#ef4444':'#0f172a'}; color:white; font-weight:bold; z-index:10000; box-shadow:0 10px 20px rgba(0,0,0,0.2); transition:0.3s;`;
        t.innerText = msg; document.body.appendChild(t);
        setTimeout(() => t.remove(), 3000);
    }

    window.toggleTheme = () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
        renderGrafico();
    };

    window.adicionar = (tipo) => {
        const d = document.getElementById('nomeDesc'), v = document.getElementById('valorMontante'), c = document.getElementById('categoriaSelect');
        const nome = d.value.trim(), valor = parseFloat(v.value);
        if (!nome || isNaN(valor) || valor <= 0) return notify("Dados inválidos", "erro");
        transacoes.push({ id: Date.now(), nome, valor, tipo, categoria: c.value, data: new Date().toLocaleDateString('pt-BR') });
        d.value = ""; v.value = ""; salvarEAtualizar();
    };

    function salvarEAtualizar() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(transacoes));
        atualizarInterface();
    }

    function atualizarInterface() {
        const lista = document.getElementById('listaHistorico');
        let rT = 0, dT = 0, html = "";
        [...transacoes].reverse().forEach(t => {
            if(t.tipo === 'renda') rT += t.valor; else dT += t.valor;
            html += `<div class="hist-item"><span><b>${t.nome}</b><br><small>${t.data} | ${t.categoria.toUpperCase()}</small></span><span style="color:${t.tipo==='renda'?'#10b981':'#ef4444'};font-weight:800">${t.tipo==='renda'?'+':'-'} R$ ${t.valor.toFixed(2)}</span></div>`;
        });
        document.getElementById('resumoRenda').innerText = `R$ ${rT.toFixed(2)}`;
        document.getElementById('resumoDespesa').innerText = `R$ ${dT.toFixed(2)}`;
        document.getElementById('resumoSaldo').innerText = `R$ ${(rT-dT).toFixed(2)}`;
        if(lista) lista.innerHTML = html || "<p style='text-align:center; opacity:0.5'>Sem dados.</p>";
        renderGrafico();
    }

    function renderGrafico() {
        const ctx = document.getElementById('graficoFinanceiro').getContext('2d');
        if(meuGrafico) meuGrafico.destroy();
        const cats = {}; transacoes.forEach(t => { cats[t.categoria] = (cats[t.categoria] || 0) + t.valor; });
        meuGrafico = new Chart(ctx, {
            type: 'bar',
            data: { labels: Object.keys(cats).map(c=>c.toUpperCase()), datasets: [{ data: Object.values(cats), backgroundColor: Object.keys(cats).map(c=>categoriaCores[c] || '#94a3b8'), borderRadius: 8 }] },
            options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}} }
        });
    }

    window.exportarPDF = function() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const rT = transacoes.filter(t=>t.tipo==='renda').reduce((acc,t)=>acc+t.valor,0);
        const dT = transacoes.filter(t=>t.tipo==='despesa').reduce((acc,t)=>acc+t.valor,0);

        // Design Premium
        doc.setFillColor(15, 23, 42); doc.rect(0, 0, 210, 45, 'F');
        doc.setTextColor(255); doc.setFontSize(24); doc.text("FastStile PRO", 15, 25);
        doc.setFontSize(10); doc.text("RELATÓRIO FINANCEIRO EXECUTIVO", 15, 35);
        
        doc.setTextColor(40); doc.setFontSize(12);
        doc.text(`Receitas: R$ ${rT.toFixed(2)}`, 15, 55);
        doc.text(`Despesas: R$ ${dT.toFixed(2)}`, 15, 62);
        doc.setFont("helvetica","bold");
        [span_2](start_span)doc.text(`Saldo Final: R$ ${(rT-dT).toFixed(2)}`, 15, 72);[span_2](end_span)

        [span_3](start_span)const colunas = ["DATA", "DESCRIÇÃO", "CATEGORIA", "TIPO", "VALOR"];[span_3](end_span)
        const linhas = transacoes.slice().reverse().map(t=>[
            t.data, t.nome.toUpperCase(), t.categoria, t.tipo==='renda'?'ENTRADA':'SAÍDA', `R$ ${t.valor.toFixed(2)}`
        [span_4](start_span)]);[span_4](end_span)

        doc.autoTable({ head:[colunas], body:linhas, startY:80, theme:'striped', headStyles:{fillColor:[15, 23, 42]} });
        doc.save("Relatorio_FastStile.pdf");
        notify("PDF gerado!");
    };

    window.exportarBackup = () => { /* lógica backup */ };
    window.importarBackup = () => { /* lógica import */ };
    window.zerarDados = () => { if(confirm("Zerar?")) { transacoes=[]; salvarEAtualizar(); } };

    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/FastStile/sw.js');
})();
