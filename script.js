(() => {
    "use strict";
    const STORAGE_KEY = "faststile_v2_core";
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
        setTimeout(() => UI.toast.classList.remove("show"), 2500);
    }

    function atualizar() {
        UI.lista.innerHTML = "";
        let r = 0, d = 0;
        state.dados.slice().reverse().forEach(item => {
            const li = document.createElement("li");
            li.innerHTML = `<span>${item.descricao}</span><strong style="color:${item.tipo==='renda'?'#10b981':'#ef4444'}">R$ ${item.valor.toFixed(2)}</strong>`;
            UI.lista.appendChild(li);
            item.tipo === "renda" ? r += item.valor : d += item.valor;
        });
        UI.renda.textContent = `R$ ${r.toFixed(2)}`;
        UI.despesa.textContent = `R$ ${d.toFixed(2)}`;
        UI.saldo.textContent = `R$ ${(r - d).toFixed(2)}`;
        atualizarGrafico(r, d);
        UI.dica.textContent = (r - d) >= 0 ? "✅ Gestão Saudável" : "⚠️ Saldo Negativo";
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
        if (r === 0 && d === 0) return;
        state.chart = new Chart(document.getElementById("grafico"), {
            type: "doughnut",
            data: { datasets: [{ data: [r, d], backgroundColor: ["#10b981", "#ef4444"], borderWeight: 0 }] },
            options: { cutout: '85%', plugins: { legend: { display: false } } }
        });
    }

    window.exportarPDF = () => {
        mostrarToast("Gerando Relatório Premium...");
        const formatar = n => n.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
        let r = 0, d = 0;
        state.dados.forEach(i => i.tipo === 'renda' ? r += i.valor : d += i.valor);

        const element = document.createElement('div');
        element.innerHTML = `
            <div style="padding: 30px; background: white; width: 750px; margin: auto; font-family: Arial, sans-serif;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 4px solid #0f172a; padding-bottom: 20px; margin-bottom: 30px;">
                    <div><h1 style="margin: 0; color: #0f172a; font-size: 32px;">FastStile</h1><p style="margin: 5px 0 0; font-size: 11px; color: #64748b; text-transform: uppercase;">Relatório Executivo</p></div>
                    <div style="text-align: right; font-size: 11px; color: #64748b;"><p>Emissão: ${new Date().toLocaleDateString()}</p><p style="color: #10b981; font-weight: bold;">Autenticado</p></div>
                </div>
                <div style="display: flex; gap: 10px; margin-bottom: 30px;">
                    <div style="flex:1; background:#f8fafc; padding:15px; border-radius:10px; border:1px solid #e2e8f0; text-align:center;"><span style="font-size:10px; color:#64748b;">RECEITAS</span><h2 style="color:#10b981; font-size:18px;">${formatar(r)}</h2></div>
                    <div style="flex:1; background:#f8fafc; padding:15px; border-radius:10px; border:1px solid #e2e8f0; text-align:center;"><span style="font-size:10px; color:#64748b;">DESPESAS</span><h2 style="color:#ef4444; font-size:18px;">${formatar(d)}</h2></div>
                    <div style="flex:1; background:#0f172a; padding:15px; border-radius:10px; text-align:center;"><span style="font-size:10px; color:#94a3b8;">SALDO</span><h2 style="color:#ffffff; font-size:18px;">${formatar(r-d)}</h2></div>
                </div>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead style="background: #f1f5f9;"><tr><th style="padding:12px; text-align:left; font-size:11px;">DESCRIÇÃO</th><th style="padding:12px; text-align:left; font-size:11px;">TIPO</th><th style="padding:12px; text-align:right; font-size:11px;">VALOR</th></tr></thead>
                    <tbody>${state.dados.map(i => `<tr><td style="padding:12px; border-bottom:1px solid #f1f5f9; font-size:11px;">${i.descricao}</td><td style="padding:12px; border-bottom:1px solid #f1f5f9; font-size:10px; color:#64748b;">${i.tipo.toUpperCase()}</td><td style="padding:12px; border-bottom:1px solid #f1f5f9; font-size:11px; text-align:right; font-weight:bold; color:${i.tipo==='renda'?'#10b981':'#ef4444'};">${formatar(i.valor)}</td></tr>`).join('')}</tbody>
                </table>
                <div style="margin-top: 50px; text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px;">© 2026 FastStile Pro - Propriedade Intelectual Protegida.</div>
            </div>`;

        html2pdf().set({ margin: 5, filename: 'Relatorio_FastStile.pdf', image: { type: 'jpeg', quality: 1 }, html2canvas: { scale: 2, useCORS: true, scrollY: 0 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } }).from(element).save();
    };

    window.exportarBackup = () => {
        const b = new Blob([JSON.stringify(state.dados)], { type: "application/json" });
        const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "faststile_backup.json"; a.click();
    };
    window.importarBackup = () => {
        const i = document.createElement("input"); i.type = "file"; i.accept = ".json";
        i.onchange = e => {
            const reader = new FileReader();
            reader.onload = () => { state.dados = JSON.parse(reader.result); localStorage.setItem(STORAGE_KEY, JSON.stringify(state.dados)); atualizar(); };
            reader.readAsText(e.target.files[0]);
        };
        i.click();
    };
    window.fecharPrivacidade = () => { localStorage.setItem('p_acc', '1'); document.getElementById("modalPrivacidade").style.display = "none"; };
    window.abrirModalReset = () => document.getElementById("modalReset").style.display = "flex";
    window.fecharModalReset = () => document.getElementById("modalReset").style.display = "none";
    window.confirmarReset = () => { localStorage.clear(); location.reload(); };
    atualizar();
})();
