"use strict";

(function () {
    const STORAGE_KEY = "faststile_data";
    let transacoes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    let meuGrafico = null;

    // Paleta de Cores FinTech Premium para Categorias
    const categoriaCores = {
        moradia: "#6366f1",
        transporte: "#3b82f6",
        saude: "#f43f5e",
        educacao: "#a855f7",
        compras: "#ec4899",
        assinaturas: "#06b6d4",
        investimentos: "#10b981",
        dividas: "#f59e0b",
        outros: "#94a3b8",
        imprevistos: "#ef4444",
        impostos: "#1e293b"
    };

    window.onload = () => {
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-mode');
        }
        atualizarInterface();
    };

    // Sistema de Notificação Elite (Toasts)
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
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        atualizarInterface();
    };

    window.adicionar = function(tipo) {
        const descInput = document.getElementById('nomeDesc');
        const valorInput = document.getElementById('valorMontante');
        const categoriaInput = document.getElementById('categoriaSelect');
        const nome = descInput.value.trim();
        const valor = parseFloat(valorInput.value);
        const categoria = categoriaInput.value;

        if (!nome || isNaN(valor) || valor <= 0) { 
            notify("Preencha os dados corretamente", "erro"); 
            return; 
        }

        transacoes.push({
            id: Date.now(),
            nome,
            valor,
            tipo,
            categoria,
            data: new Date().toLocaleDateString('pt-BR')
        });

        descInput.value = "";
        valorInput.value = "";
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

        const colorIncome = isDark ? '#34d399' : '#10b981';
        const colorExpense = isDark ? '#fb7185' : '#ef4444';

        [...transacoes].reverse().forEach(t => {
            if(t.tipo === 'renda') rT += t.valor; else dT += t.valor;
            html += `
            <div class="hist-item">
                <span style="display:flex; flex-direction:column">
                    <b style="font-size: 0.95rem">${t.nome}</b>
                    <small style="color: var(--text-muted); font-size: 0.75rem">${t.data} • ${t.categoria.toUpperCase()}</small>
                </span>
                <span style="color: ${t.tipo === 'renda' ? colorIncome : colorExpense}; font-weight: 800; font-size: 1rem">
                    ${t.tipo === 'renda' ? '+' : '-'} R$ ${t.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                </span>
            </div>`;
        });

        if(lista) lista.innerHTML = html || "<p style='text-align:center; padding:30px; opacity:0.5; font-size:0.85rem'>Nenhum registro encontrado.</p>";
        
        document.getElementById('resumoRenda').innerText = `R$ ${rT.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
        document.getElementById('resumoDespesa').innerText = `R$ ${dT.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
        document.getElementById('resumoSaldo').innerText = `R$ ${(rT-dT).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
        
        renderGrafico();
    }

    function renderGrafico() {
        const ctx = document.getElementById('graficoFinanceiro').getContext('2d');
        const isDark = document.body.classList.contains('dark-mode');
        const textColor = isDark ? '#94a3b8' : '#64748b';
        
        if(meuGrafico) meuGrafico.destroy();

        const categorias = {};
        transacoes.forEach(t => { 
            if(!categorias[t.categoria]) categorias[t.categoria] = 0;
            categorias[t.categoria] += t.valor;
        });

        meuGrafico = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(categorias).map(c => c.toUpperCase()),
                datasets: [{
                    data: Object.values(categorias),
                    backgroundColor: Object.keys(categorias).map(cat => categoriaCores[cat] || '#94a3b8'),
                    borderRadius: 10,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { 
                        beginAtZero: true,
                        grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
                        ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', weight: '600', size: 10 } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', weight: '600', size: 9 } }
                    }
                }
            }
        });
    }

    window.exportarPDF = function() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const primaryColor = [15, 23, 42]; 
        
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255);
        doc.setFontSize(22);
        doc.text("FastStile Executive Report", 15, 25);
        
        let rT=0, dT=0;
        transacoes.forEach(t => { if(t.tipo==='renda') rT+=t.valor; else dT+=t.valor; });

        doc.setTextColor(40);
        doc.setFontSize(10);
        doc.text(`SALDO ATUAL: R$ ${(rT-dT).toFixed(2)}`, 15, 50);

        const colunas = ["DATA", "DESCRIÇÃO", "CATEGORIA", "VALOR"];
        const linhas = transacoes.slice().reverse().map(t => [
            t.data, t.nome.toUpperCase(), t.categoria.toUpperCase(),
            `${t.tipo === 'renda' ? '+' : '-'} R$ ${t.valor.toFixed(2)}`
        ]);

        doc.autoTable({ 
            head: [colunas], body: linhas, startY: 60,
            theme: 'striped', headStyles: { fillColor: primaryColor }
        });

        notify("Relatório PDF gerado!");
        doc.save(`FastStile_Relatorio_${Date.now()}.pdf`);
    };

    window.exportarBackup = () => {
        const blob = new Blob([JSON.stringify({app:"FastStile", dados:transacoes})], {type:"application/json"});
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `FastStile_Backup.json`;
        a.click();
        notify("Backup concluído!");
    };

    window.importarBackup = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";
        input.onchange = e => {
            const reader = new FileReader();
            reader.onload = ev => {
                try {
                    const res = JSON.parse(ev.target.result);
                    if(res.app === "FastStile"){
                        transacoes = res.dados;
                        salvarEAtualizar();
                        notify("Dados restaurados!");
                    }
                } catch (err) { notify("Erro ao importar backup", "erro"); }
            };
            reader.readAsText(e.target.files[0]);
        };
        input.click();
    };

    window.zerarDados = () => { 
        if(confirm("Deseja resetar todos os registros?")) { 
            transacoes = []; salvarEAtualizar(); notify("Banco de dados limpo", "erro");
        } 
    };

    window.converterMoeda = function(tipo){
        const v = parseFloat(document.getElementById('valorConvert').value);
        if(isNaN(v) || v <= 0) return;
        const c = { USD: 5.15, EUR: 5.55 };
        const res = (v / c[tipo]).toFixed(2);
        document.getElementById('resultadoConversao').innerHTML = `Conversão ${tipo}: <b>${res}</b>`;
        notify(`Valor convertido para ${tipo}`);
    };

    // REGISTRO DO SERVICE WORKER (PWA)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/FastStile/sw.js')
                .then(reg => console.log('FastStile: Service Worker Ativo'))
                .catch(err => console.error('Erro SW:', err));
        });
    }

})();
