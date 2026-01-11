/**
 * FASTSTILE LOGIC - script.js
 * Gestão de Dados e Gráficos
 */
(() => {
    "use strict";
    const STORAGE_KEY = "faststile_v2_core";
    const state = { dados: JSON.parse(localStorage.getItem(STORAGE_KEY)) || [], chart: null };

    const UI = {
        desc: document.getElementById("descricao"),
        val: document.getElementById("valor"),
        tipo: document.getElementById("tipo"),
        lista: document.getElementById("lista"),
        renda: document.getElementById("totalRenda"),
        despesa: document.getElementById("totalDespesa"),
        saldo: document.getElementById("saldoTotal"),
        dica: document.getElementById("dicaFinanceira"),
        toast: document.getElementById("toast")
    };

    function mostrarToast(m) {
        UI.toast.textContent = m;
        UI.toast.classList.add("show");
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
        UI.dica.textContent = (r - d) >= 0 ? "✅ Saldo positivo." : "⚠️ Atenção aos gastos.";
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

    window.exportarPDF = () => html2pdf().from(document.body).save("FastStile_Relatorio.pdf");
    window.exportarBackup = () => {
        const b = new Blob([JSON.stringify(state.dados)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(b); a.download = "faststile_backup.json"; a.click();
    };
    window.importarBackup = () => {
        const i = document.createElement("input"); i.type = "file"; i.accept = ".json";
        i.onchange = e => {
            const reader = new FileReader();
            reader.onload = () => {
                state.dados = JSON.parse(reader.result);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(state.dados));
                atualizar();
            };
            reader.readAsText(e.target.files[0]);
        };
        i.click();
    };

    window.fecharPrivacidade = () => { 
        localStorage.setItem('p_acc', '1'); 
        document.getElementById("modalPrivacidade").style.display = "none"; 
    };
    window.abrirModalReset = () => document.getElementById("modalReset").style.display = "flex";
    window.fecharModalReset = () => document.getElementById("modalReset").style.display = "none";
    window.confirmarReset = () => { localStorage.clear(); location.reload(); };

    atualizar();
})();
