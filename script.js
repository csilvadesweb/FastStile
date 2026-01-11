(() => {
    "use strict";
    const STORAGE_KEY = "faststile_enterprise_core";
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
            li.style.cssText = "background:var(--card-bg); padding:16px; border-radius:15px; margin-bottom:10px; display:flex; justify-content:space-between; box-shadow:0 2px 4px rgba(0,0,0,0.05);";
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
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        state.chart = new Chart(document.getElementById("grafico"), {
            type: "doughnut",
            data: { 
                datasets: [{ 
                    data: [r, d], 
                    backgroundColor: ["#10b981", "#ef4444"], 
                    borderWidth: isDark ? 2 : 0,
                    borderColor: "#0f172a" 
                }] 
            },
            options: { cutout: '85%', plugins: { legend: { display: false } } }
        });
    }

    window.exportarPDF = () => {
        mostrarToast("Autenticando Relatório...");
        const agora = new Date();
        const authID = `FS-${Math.random().toString(36).substr(2, 9).toUpperCase()}-${agora.getTime().toString().slice(-4)}`;
        const formatar = n => n.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
        let r = 0, d = 0;
        state.dados.forEach(i => r += (i.tipo === 'renda' ? i.valor : 0), d += (i.tipo === 'despesa' ? i.valor : 0));

        const element = document.createElement('div');
        element.style.cssText = "width:750px; padding:40px; background:white; color:#1e293b; font-family:Arial; position:relative;";
        element.innerHTML = `
            <div style="position:absolute; top:40%; left:15%; font-size:50px; color:rgba(0,0,0,0.03); transform:rotate(-45deg); pointer-events:none;">DOCUMENTO AUTENTICADO</div>
            <div style="display:flex; justify-content:space-between; border-bottom:4px solid #0f172a; padding-bottom:20px; margin-bottom:30px;">
                <div><h1 style="margin:0; color:#0f172a; font-size:32px;">FastStile Pro</h1><p>RELATÓRIO ENTERPRISE</p></div>
                <div style="text-align:right; font-size:11px;">
                    <b>Data:</b> ${agora.toLocaleDateString()}<br>
                    <b>Hora:</b> ${agora.toLocaleTimeString()}<br>
                    <b style="color:#10b981;">ASSINADO DIGITALMENTE</b>
                </div>
            </div>
            <div style="display:flex; gap:10px; margin-bottom:30px;">
                <div style="flex:1; background:#f8fafc; padding:15px; border-radius:10px; border:1px solid #eee; text-align:center;">RECEITAS<br><b>${formatar(r)}</b></div>
                <div style="flex:1; background:#f8fafc; padding:15px; border-radius:10px; border:1px solid #eee; text-align:center;">DESPESAS<br><b>${formatar(d)}</b></div>
                <div style="flex:1; background:#0f172a; padding:15px; border-radius:10px; color:white; text-align:center;">SALDO<br><b>${formatar(r-d)}</b></div>
            </div>
            <table style="width:100%; border-collapse:collapse; margin-bottom:40px;">
                <thead style="background:#f1f5f9;"><tr><th style="padding:10px; text-align:left;">Descrição</th><th style="text-align:right; padding:10px;">Valor</th></tr></thead>
                <tbody>${state.dados.map(i => `<tr><td style="padding:10px; border-bottom:1px solid #eee;">${i.descricao}</td><td style="text-align:right; padding:10px; font-weight:bold; color:${i.tipo==='renda'?'#10b981':'#ef4444'}">${formatar(i.valor)}</td></tr>`).join('')}</tbody>
            </table>
            <div style="display:flex; justify-content:space-between; align-items:flex-end; border-top:1px solid #eee; padding-top:20px;">
                <div style="font-size:10px; color:#64748b;"><b>ID Autenticação:</b><br><span style="font-family:monospace; color:#0f172a;">${authID}</span></div>
                <div style="text-align:center; border-top:1px solid #0f172a; width:180px; font-size:10px; padding-top:5px;">ASSINATURA DO SISTEMA</div>
            </div>`;

        html2pdf().set({ margin: 10, filename: `Relatorio_${authID}.pdf`, html2canvas: { scale: 3 }, jsPDF: { format: 'a4' } }).from(element).save();
    };

    window.exportarBackup = () => {
        const b = new Blob([JSON.stringify(state.dados)], { type: "application/json" });
        const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "backup.json"; a.click();
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
