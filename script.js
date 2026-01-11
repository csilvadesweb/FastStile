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
            li.style.cssText = "background:var(--card-bg); padding:16px; border-radius:15px; margin-bottom:10px; display:flex; justify-content:space-between; box-shadow:0 2px 4px rgba(0,0,0,0.05); transition: 0.3s;";
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
        if (state.dados.length === 0) return mostrarToast("Adicione dados primeiro!");
        
        mostrarToast("Autenticando e Gerando...");
        
        const agora = new Date();
        const dataH = agora.toLocaleDateString('pt-br');
        const horaH = agora.toLocaleTimeString('pt-br');
        const authID = `FS-${Math.random().toString(36).substr(2, 7).toUpperCase()}-${agora.getTime().toString().slice(-4)}`;
        
        const formatar = n => n.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
        let r = 0, d = 0;
        state.dados.forEach(i => i.tipo === 'renda' ? r += i.valor : d += i.valor);

        // Template do PDF otimizado para renderização rápida
        const element = document.createElement('div');
        element.style.cssText = "width:700px; padding:30px; background:white; color:#1e293b; font-family:Arial, sans-serif;";
        element.innerHTML = `
            <div style="border-bottom:4px solid #0f172a; padding-bottom:15px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center;">
                <div><h1 style="margin:0; color:#0f172a;">FastStile Pro</h1><p style="font-size:10px; color:#64748b;">ENTERPRISE REPORT</p></div>
                <div style="text-align:right; font-size:11px;">
                    <b>Data:</b> ${dataH} ${horaH}<br>
                    <span style="color:#10b981;">● AUTENTICADO</span>
                </div>
            </div>
            <div style="display:flex; gap:10px; margin-bottom:25px;">
                <div style="flex:1; background:#f8fafc; padding:15px; border-radius:10px; text-align:center; border:1px solid #eee;">RECEITAS<br><b style="color:#10b981;">${formatar(r)}</b></div>
                <div style="flex:1; background:#f8fafc; padding:15px; border-radius:10px; text-align:center; border:1px solid #eee;">DESPESAS<br><b style="color:#ef4444;">${formatar(d)}</b></div>
                <div style="flex:1; background:#0f172a; padding:15px; border-radius:10px; color:white; text-align:center;">SALDO<br><b>${formatar(r-d)}</b></div>
            </div>
            <table style="width:100%; border-collapse:collapse; font-size:12px;">
                <thead style="background:#f1f5f9;"><tr><th style="padding:10px; text-align:left;">Descrição</th><th style="text-align:right; padding:10px;">Valor</th></tr></thead>
                <tbody>${state.dados.map(i => `<tr><td style="padding:8px; border-bottom:1px solid #eee;">${i.descricao}</td><td style="text-align:right; padding:8px; font-weight:bold; color:${i.tipo==='renda'?'#10b981':'#ef4444'}">${formatar(i.valor)}</td></tr>`).join('')}</tbody>
            </table>
            <div style="margin-top:40px; padding-top:15px; border-top:1px solid #eee; display:flex; justify-content:space-between; align-items:flex-end;">
                <div style="font-size:9px; color:#94a3b8;">ID: ${authID}<br>© 2026 FastStile Enterprise</div>
                <div style="text-align:center; width:150px; border-top:1px solid #0f172a; font-size:9px; padding-top:5px;">ASSINATURA DIGITAL</div>
            </div>`;

        const opt = {
            margin: 10,
            filename: `FastStile_${authID}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Executa o download e limpa a memória
        html2pdf().from(element).set(opt).save().then(() => {
            mostrarToast("PDF Pronto!");
        }).catch(err => {
            console.error(err);
            mostrarToast("Erro ao gerar PDF");
        });
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
