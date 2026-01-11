"use strict";

(function () {
    const STORAGE_KEY = "faststilecs_data";
    let transacoes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    let meuGrafico = null;

    window.onload = () => {
        if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode');
        atualizarInterface();
    };

    window.toggleTheme = function() {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
        atualizarInterface();
    };

    window.adicionar = function(tipo) {
        const descInput = document.getElementById('nomeDesc');
        const valorInput = document.getElementById('valorMontante');
        const nome = descInput.value.trim();
        const valor = parseFloat(valorInput.value);

        if (!nome || isNaN(valor) || valor <= 0) {
            alert("Preencha os campos corretamente.");
            return;
        }

        transacoes.push({
            id: Date.now(),
            nome: nome,
            valor: valor,
            tipo: tipo,
            data: new Date().toLocaleDateString('pt-BR')
        });

        descInput.value = "";
        valorInput.value = "";
        salvarEAtualizar();
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
            html += `
            <div class="hist-item">
                <span><b>${t.nome}</b><br><small>${t.data}</small></span>
                <span style="color: ${t.tipo === 'renda' ? '#00b894' : '#ff7675'}; font-weight: 800">
                    ${t.tipo === 'renda' ? '+' : '-'} R$ ${t.valor.toFixed(2)}
                </span>
            </div>`;
        });

        if(lista) lista.innerHTML = html || "<p style='text-align:center; opacity:0.5'>Sem dados.</p>";
        document.getElementById('resumoRenda').innerText = `R$ ${rT.toFixed(2)}`;
        document.getElementById('resumoDespesa').innerText = `R$ ${dT.toFixed(2)}`;
        document.getElementById('resumoSaldo').innerText = `R$ ${(rT - dT).toFixed(2)}`;
        renderGrafico(rT, dT);
    }

    function renderGrafico(r, d) {
        const canvas = document.getElementById('graficoFinanceiro');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (meuGrafico) meuGrafico.destroy();
        if (r === 0 && d === 0) return;

        meuGrafico = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Renda', 'Despesa'],
                datasets: [{ data: [r, d], backgroundColor: ['#00b894', '#ff7675'], borderWidth: 0 }]
            },
            options: { responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { position: 'bottom' } } }
        });
    }

    window.exportarPDF = function() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const azulElite = [11, 44, 61];
        const verde = [0, 184, 148];
        const vermelho = [255, 118, 117];

        // Cabeçalho Premium
        doc.setFillColor(...azulElite);
        doc.rect(0, 0, 210, 50, 'F');
        doc.setTextColor(255);
        doc.setFontSize(28);
        doc.text("FastStilecs Elite", 15, 25);
        doc.setFontSize(10);
        doc.text("RELATÓRIO FINANCEIRO EXECUTIVO", 15, 33);
        doc.text("ID: FASTSTILECS-2026-PRO-SECURITY-BY-CSILVA", 15, 38);
        doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 15, 43);

        // Sumário
        let rT = 0, dT = 0;
        transacoes.forEach(t => { if (t.tipo === 'renda') rT += t.valor; else dT += t.valor; });

        doc.setTextColor(40);
        doc.setFontSize(12);
        doc.text(`Receitas: R$ ${rT.toFixed(2)}`, 15, 65);
        doc.text(`Despesas: R$ ${dT.toFixed(2)}`, 15, 72);
        doc.setFont("helvetica", "bold");
        doc.text(`Saldo Final: R$ ${(rT - dT).toFixed(2)}`, 15, 82);

        // Tabela Dinâmica Premium
        const colunas = ["DATA", "DESCRIÇÃO", "TIPO", "VALOR (R$)"];
        const linhas = transacoes.slice().reverse().map(t => [
            t.data,
            t.nome.toUpperCase(),
            t.tipo === 'renda' ? 'ENTRADA' : 'SAÍDA',
            { content: `${t.tipo === 'renda' ? '+' : '-'} ${t.valor.toFixed(2)}`, styles: { textColor: t.tipo === 'renda' ? verde : vermelho, fontStyle: 'bold' } }
        ]);

        doc.autoTable({
            head: [colunas],
            body: linhas,
            startY: 95,
            theme: 'striped',
            headStyles: { fillColor: azulElite },
            styles: { fontSize: 9 }
        });

        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("2026 FastStilecs - Propriedade Intelectual Exclusiva de C. Silva..", 105, 290, { align: "center" });

        doc.save(`FastStilecs_Relatorio.pdf`);
    };

    window.exportarBackup = () => {
        const blob = new Blob([JSON.stringify({ app: "FastStilecs", dados: transacoes })], { type: "application/json" });
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "Backup.json"; a.click();
    };

    window.importarBackup = () => {
        const input = document.createElement("input"); input.type = "file";
        input.onchange = e => {
            const reader = new FileReader();
            reader.onload = ev => {
                const res = JSON.parse(ev.target.result);
                if(res.app === "FastStilecs") { transacoes = res.dados; salvarEAtualizar(); }
            };
            reader.readAsText(e.target.files[0]);
        };
        input.click();
    };

    window.zerarDados = () => { if(confirm("Apagar tudo?")) { transacoes = []; salvarEAtualizar(); } };
})();
