"use strict";

(function () {
    const STORAGE_KEY = "faststile_data";
    let transacoes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    let meuGrafico = null;

    // Paleta de Cores FinTech Premium
    const categoriaCores = {
        moradia: "#6366f1", transporte: "#3b82f6", saude: "#f43f5e",
        educacao: "#a855f7", compras: "#ec4899", assinaturas: "#06b6d4",
        investimentos: "#10b981", dividas: "#f59e0b", outros: "#94a3b8",
        imprevistos: "#ef4444", impostos: "#1e293b"
    };

    window.onload = () => {
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-mode');
        }
        atualizarInterface();
    };

    // Notificações Premium
    function notify(msg, tipo = 'sucesso') {
        const toast = document.createElement('div');
        toast.style = `
            position: fixed; bottom: 30px; right: 30px; 
            padding: 14px 24px; border-radius: 16px; 
            background: ${tipo === 'erro' ? '#ef4444' : '#0f172a'}; 
            color: white; font-weight: 700; z-index: 9999;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            transform: translateY(150px); transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1);
        `;
        toast.innerText = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.style.transform = 'translateY(0)', 100);
        setTimeout(() => {
            toast.style.transform = 'translateY(150px)';
            setTimeout(() => toast.remove(), 400);
        }, 3500);
    }

    window.toggleTheme = function() {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
        atualizarInterface();
    };

    window.adicionar = function(tipo) {
        const d = document.getElementById('nomeDesc'), v = document.getElementById('valorMontante'), c = document.getElementById('categoriaSelect');
        const nome = d.value.trim(), valor = parseFloat(v.value);

        if (!nome || isNaN(valor) || valor <= 0) { 
            notify("Preencha os dados corretamente", "erro"); 
            return; 
        }

        transacoes.push({
            id: Date.now(),
            nome, valor, tipo, categoria: c.value,
            data: new Date().toLocaleDateString('pt-BR')
        });

        d.value = ""; v.value = "";
        notify(`${tipo === 'renda' ? 'Entrada' : 'Saída'} registrada!`);
        salvarEAtualizar();
    };

    function salvarEAtualizar() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(transacoes));
        atualizarInterface();
    }

    function atualizarInterface() {
        const lista = document.getElementById('listaHistorico');
        const isDark = document.body.classList.contains('dark-mode');
        let rT = 0, dT = 0, html = "";

        [...transacoes].reverse().forEach(t => {
            if(t.tipo === 'renda') rT += t.valor; else dT += t.valor;
            html += `
            <div class="hist-item">
                <span style="display:flex; flex-direction:column">
                    <b style="font-size: 0.95rem">${t.nome}</b>
                    <small style="color: var(--text-muted); font-size: 0.75rem">${t.data} • ${t.categoria.toUpperCase()}</small>
                </span>
                <span style="color: ${t.tipo === 'renda' ? 'var(--income)' : 'var(--expense)'}; font-weight: 800">
                    ${t.tipo === 'renda' ? '+' : '-'} R$ ${t.valor.toFixed(2)}
                </span>
            </div>`;
        });

        if(lista) lista.innerHTML = html || "<p style='text-align:center; padding:30px; opacity:0.5'>Sem dados.</p>";
        document.getElementById('resumoRenda').innerText = `R$ ${rT.toFixed(2)}`;
        document.getElementById('resumoDespesa').innerText = `R$ ${dT.toFixed(2)}`;
        document.getElementById('resumoSaldo').innerText = `R$ ${(rT-dT).toFixed(2)}`;
        renderGrafico();
    }

    function renderGrafico() {
        const ctx = document.getElementById('graficoFinanceiro').getContext('2d');
        const isDark = document.body.classList.contains('dark-mode');
        if(meuGrafico) meuGrafico.destroy();

        const cats = {};
        transacoes.forEach(t => { cats[t.categoria] = (cats[t.categoria] || 0) + t.valor; });

        meuGrafico = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(cats).map(c => c.toUpperCase()),
                datasets: [{
                    data: Object.values(cats),
                    backgroundColor: Object.keys(cats).map(c => categoriaCores[c] || '#94a3b8'),
                    borderRadius: 10
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { ticks: { color: isDark ? '#94a3b8' : '#64748b' }, grid: { color: 'rgba(0,0,0,0.05)' } },
                    x: { ticks: { color: isDark ? '#94a3b8' : '#64748b' }, grid: { display: false } }
                }
            }
        });
    }

    // PDF DE ALTÍSSIMO NÍVEL
    window.exportarPDF = function() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const primary = [15, 23, 42], success = [16, 185, 129], danger = [239, 68, 68];

        [span_2](start_span)// Cabeçalho Elite[span_2](end_span)
        doc.setFillColor(...primary);
        doc.rect(0, 0, 210, 50, 'F');
        doc.setTextColor(255);
        doc.setFontSize(26);
        doc.text("FastStile", 15, 25);
        doc.setFontSize(9);
        doc.setTextColor(200);
        doc.text("RELATÓRIO DE PERFORMANCE FINANCEIRA", 15, 33);
        doc.text(`DATA: ${new Date().toLocaleString('pt-BR')}`, 195, 38, {align: 'right'});

        [span_3](start_span)// Sumário Executivo[span_3](end_span)
        let rT = 0, dT = 0;
        transacoes.forEach(t => { if(t.tipo === 'renda') rT += t.valor; else dT += t.valor; });
        const saldo = rT - dT;

        doc.setFillColor(248, 250, 252);
        doc.roundedRect(15, 55, 180, 35, 3, 3, 'F');
        doc.setTextColor(100);
        doc.setFontSize(10);
        doc.text("PATRIMÔNIO LÍQUIDO", 25, 65);
        doc.setTextColor(saldo >= 0 ? success[0] : danger[0], saldo >= 0 ? success[1] : danger[1], saldo >= 0 ? success[2] : danger[2]);
        doc.setFontSize(22);
        doc.text(`R$ ${saldo.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, 25, 78);

        [span_4](start_span)// Tabela de Dados[span_4](end_span)
        const colunas = ["DATA", "DESCRIÇÃO", "CATEGORIA", "STATUS", "VALOR"];
        const linhas = transacoes.slice().reverse().map(t => [
            t.data, t.nome.toUpperCase(), t.categoria.toUpperCase(),
            t.tipo === 'renda' ? 'CREDITADO' : 'DEBITADO',
            { content: `${t.tipo === 'renda' ? '+' : '-'} R$ ${t.valor.toFixed(2)}`, 
              styles: { textColor: t.tipo === 'renda' ? success : danger, fontStyle: 'bold', halign: 'right' } }
        ]);

        doc.autoTable({
            head: [colunas], body: linhas, startY: 100, theme: 'grid',
            headStyles: { fillColor: primary, fontSize: 10 },
            styles: { fontSize: 8 },
            alternateRowStyles: { fillColor: [250, 251, 253] }
        });

        [span_5](start_span)// Rodapé de Propriedade[span_5](end_span)
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("2026 FastStilecs - Propriedade de C. Silva", 105, 288, {align:"center"});
        
        notify("Relatório Executivo gerado!");
        doc.save(`FastStile_EliteReport.pdf`);
    };

    window.exportarBackup = () => {
        const b = new Blob([JSON.stringify({app:"FastStile", dados:transacoes})], {type:"application/json"});
        const a = document.createElement("a"); a.href = URL.createObjectURL(b);
        a.download = `FastStile_Backup.json`; a.click();
        notify("Backup concluído!");
    };

    window.importarBackup = () => {
        const i = document.createElement("input"); i.type = "file"; i.accept = ".json";
        i.onchange = e => {
            const r = new FileReader();
            r.onload = ev => {
                const res = JSON.parse(ev.target.result);
                if(res.app === "FastStile"){ transacoes = res.dados; salvarEAtualizar(); notify("Dados restaurados!"); }
            };
            r.readAsText(e.target.files[0]);
        };
        i.click();
    };

    window.zerarDados = () => { 
        if(confirm("Deseja apagar todos os dados?")) { transacoes = []; salvarEAtualizar(); notify("Dados limpos", "erro"); } 
    };

    window.converterMoeda = function(tipo){
        const v = parseFloat(document.getElementById('valorConvert').value);
        if(isNaN(v)) return;
        const c = { USD: 5.15, EUR: 5.55 };
        document.getElementById('resultadoConversao').innerHTML = `${tipo}: <b>${(v/c[tipo]).toFixed(2)}</b>`;
    };

    // PWA Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/FastStile/sw.js')
                .then(reg => console.log('SW Ativo'))
                .catch(err => console.log('Erro SW', err));
        });
    }

})();
