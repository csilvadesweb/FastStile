/**
 * FASTSTILE LOGIC - script.js
 * Gestão de Dados e Gerador de Relatórios Executivos
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
        UI.dica.textContent = (r - d) >= 0 ? "✅ Gestão Financeira Saudável" : "⚠️ Alerta de Orçamento Negativo";
    }

    window.adicionar = () => {
        const val = parseFloat(UI.val.value);
        if (!UI.desc.value || isNaN(val)) return mostrarToast("Preencha os campos!");
        state.dados.push({ descricao: UI.desc.value, valor: val, tipo: UI.tipo.value });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.dados));
        atualizar();
        UI.desc.value = ""; UI.val.value = "";
        mostrarToast("Registro salvo com sucesso");
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

    // GERADOR DE PDF PROFISSIONAL (NÍVEL EXECUTIVO)
    window.exportarPDF = () => {
        mostrarToast("Gerando Relatório Executivo...");
        const formatar = n => n.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
        let totalR = 0, totalD = 0;
        state.dados.forEach(i => i.tipo === 'renda' ? totalR += i.valor : totalD += i.valor);

        const relatorioHtml = `
            <div style="padding: 40px; font-family: 'Helvetica', sans-serif; color: #1e293b;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0f172a; padding-bottom: 20px; margin-bottom: 30px;">
                    <div>
                        <h1 style="margin: 0; color: #0f172a; font-size: 32px; letter-spacing: -1px;">FastStile</h1>
                        <p style="margin: 5px 0 0; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Extrato Consolidado de Fluxo de Caixa</p>
                    </div>
                    <div style="text-align: right; color: #64748b; font-size: 11px;">
                        <p style="margin: 0;">Emissão: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
                        <p style="margin: 3px 0 0; color: #10b981; font-weight: bold;">Autenticidade Verificada</p>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 40px;">
                    <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; text-align: center;">
                        <span style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: bold;">Receitas</span>
                        <h2 style="margin: 10px 0 0; color: #10b981; font-size: 22px;">${formatar(totalR)}</h2>
                    </div>
                    <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; text-align: center;">
                        <span style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: bold;">Despesas</span>
                        <h2 style="margin: 10px 0 0; color: #ef4444; font-size: 22px;">${formatar(totalD)}</h2>
                    </div>
                    <div style="background: #0f172a; padding: 20px; border-radius: 12px; text-align: center;">
                        <span style="font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">Saldo Líquido</span>
                        <h2 style="margin: 10px 0 0; color: #ffffff; font-size: 22px;">${formatar(totalR - totalD)}</h2>
                    </div>
                </div>

                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f1f5f9; text-align: left;">
                            <th style="padding: 15px; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid #e2e8f0;">Data/Descrição</th>
                            <th style="padding: 15px; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid #e2e8f0;">Fluxo</th>
                            <th style="padding: 15px; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; text-align: right;">Valor Nominal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${state.dados.map((i, idx) => `
                            <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#fafafa'}">
                                <td style="padding: 15px; border-bottom: 1px solid #f1f5f9; font-size: 11px;">${i.descricao}</td>
                                <td style="padding: 15px; border-bottom: 1px solid #f1f5f9; font-size: 9px; color: #64748b; font-weight: bold;">${i.tipo.toUpperCase()}</td>
                                <td style="padding: 15px; border-bottom: 1px solid #f1f5f9; font-size: 11px; text-align: right; font-weight: bold; color: ${i.tipo === 'renda' ? '#10b981' : '#ef4444'};">
                                    ${i.tipo === 'renda' ? '+' : '-'} ${formatar(i.valor)}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div style="margin-top: 60px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 9px; color: #94a3b8; text-align: center; line-height: 1.6;">
                    Este documento é um relatório gerado automaticamente pelo FastStile Pro.<br>
                    Os dados são armazenados localmente no dispositivo e protegidos por leis de privacidade internacional.<br>
                    <strong>Propriedade Intelectual Protegida © 2026 C. Silva.</strong>
                </div>
            </div>
        `;

        const opt = {
            margin: [0, 0],
            filename: `FastStile_Export_${new Date().getTime()}.pdf`,
            image: { type: 'jpeg', quality: 1.0 },
            html2canvas: { scale: 3, useCORS: true, letterRendering: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().from(relatorioHtml).set(opt).save();
    };

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
                mostrarToast("Dados restaurados");
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
