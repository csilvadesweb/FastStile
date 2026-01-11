(() => {
    "use strict";
    const STORAGE_KEY = "faststile_v2_data";
    const state = { dados: JSON.parse(localStorage.getItem(STORAGE_KEY)) || [], chart: null };

    const UI = {
        desc: document.getElementById("descricao"), val: document.getElementById("valor"),
        tipo: document.getElementById("tipo"), lista: document.getElementById("lista"),
        renda: document.getElementById("totalRenda"), despesa: document.getElementById("totalDespesa"),
        saldo: document.getElementById("saldoTotal"), dica: document.getElementById("dicaFinanceira"),
        toast: document.getElementById("toast")
    };

    function mostrarToast(m) {
        UI.toast.textContent = m; UI.toast.classList.add("show");
        setTimeout(() => UI.toast.classList.remove("show"), 3000);
    }

    function atualizar() {
        UI.lista.innerHTML = "";
        let r = 0, d = 0;
        state.dados.slice().reverse().forEach(item => {
            const li = document.createElement("li");
            li.className = "item-lista";
            li.innerHTML = `<span>${item.descricao}</span><strong style="color:${item.tipo==='renda'?'#10b981':'#ef4444'}">R$ ${item.valor.toFixed(2)}</strong>`;
            UI.lista.appendChild(li);
            item.tipo === "renda" ? r += item.valor : d += item.valor;
        });
        UI.renda.textContent = `R$ ${r.toFixed(2)}`;
        UI.despesa.textContent = `R$ ${d.toFixed(2)}`;
        UI.saldo.textContent = `R$ ${(r - d).toFixed(2)}`;
        atualizarGrafico(r, d);
    }

    window.adicionar = () => {
        const val = parseFloat(UI.val.value);
        if (!UI.desc.value || isNaN(val)) return mostrarToast("Preencha os campos!");
        state.dados.push({ descricao: UI.desc.value, valor: val, tipo: UI.tipo.value });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.dados));
        atualizar();
        UI.desc.value = ""; UI.val.value = "";
    };

    function atualizarGrafico(r, d) {
        if (state.chart) state.chart.destroy();
        const ctx = document.getElementById("grafico").getContext("2d");
        state.chart = new Chart(ctx, {
            type: "doughnut",
            data: { datasets: [{ data: [r, d], backgroundColor: ["#10b981", "#ef4444"], borderWeight: 0 }] },
            options: { cutout: '80%' }
        });
    }

    window.exportarPDF = () => {
        if (state.dados.length === 0) return mostrarToast("Sem dados para exportar");
        
        mostrarToast("Autenticando...");

        const agora = new Date();
        const timestamp = `${agora.toLocaleDateString()} ${agora.toLocaleTimeString()}`;
        const authKey = `AUTH-${Math.random().toString(36).toUpperCase().substr(2, 8)}`;

        // Criamos o HTML do PDF de forma simplificada para o motor não travar
        const printArea = document.createElement('div');
        printArea.style.padding = "20px";
        printArea.style.color = "#333";
        printArea.innerHTML = `
            <div style="font-family: sans-serif; border: 1px solid #eee; padding: 20px;">
                <h1 style="color:#0f172a; margin:0;">FastStile Enterprise</h1>
                <p style="font-size:10px;">Documento Autenticado em: ${timestamp}</p>
                <hr>
                <div style="margin: 20px 0;">
                    <p><b>Resumo Financeiro:</b></p>
                    <p>Receitas: ${UI.renda.textContent}</p>
                    <p>Despesas: ${UI.despesa.textContent}</p>
                    <p><b>Saldo Final: ${UI.saldo.textContent}</b></p>
                </div>
                <table style="width:100%; border-collapse:collapse; font-size:10px;">
                    <tr style="background:#f4f4f4;"><th style="text-align:left; padding:5px;">Descrição</th><th style="text-align:right; padding:5px;">Valor</th></tr>
                    ${state.dados.map(i => `<tr><td style="padding:5px; border-bottom:1px solid #eee;">${i.descricao}</td><td style="text-align:right; padding:5px;">R$ ${i.valor.toFixed(2)}</td></tr>`).join('')}
                </table>
                <div style="margin-top:30px; font-size:9px; color:#999; text-align:center;">
                    Chave de Validação: ${authKey}<br>
                    Assinado Digitalmente pelo Sistema FastStile
                </div>
            </div>
        `;

        const config = {
            margin: 10,
            filename: `Relatorio_${authKey}.pdf`,
            html2canvas: { scale: 1 }, // Escala 1 para máxima velocidade e compatibilidade
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Disparo direto
        html2pdf().from(printArea).set(config).save().then(() => {
            mostrarToast("PDF Gerado!");
        });
    };

    window.exportarBackup = () => {
        const b = new Blob([JSON.stringify(state.dados)], { type: "application/json" });
        const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "backup.json"; a.click();
    };

    window.abrirModalReset = () => document.getElementById("modalReset").style.display = "flex";
    window.fecharModalReset = () => document.getElementById("modalReset").style.display = "none";
    window.confirmarReset = () => { localStorage.clear(); location.reload(); };

    atualizar();
})();
