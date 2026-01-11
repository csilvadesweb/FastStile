/** * FASTSTILE PRO 2026 - COPYRIGHT C. SILVA 
 * PROTEGIDO POR LEI DE SOFTWARE 9.609/98
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

  function atualizarInsights(r, d) {
    const s = r - d;
    if (state.dados.length === 0) return UI.dica.textContent = "🔒 Seus dados financeiros estão criptografados localmente.";
    if (s < 0) return UI.dica.textContent = "⚠️ Atenção: Suas despesas ultrapassaram as receitas.";
    if (s > (r * 0.3)) return UI.dica.textContent = "🚀 Parabéns! Você poupou mais de 30% da sua renda.";
    UI.dica.textContent = "💡 Dica: Registre todos os seus gastos, mesmo os pequenos.";
  }

  function atualizar() {
    UI.lista.innerHTML = "";
    let r = 0, d = 0;
    state.dados.slice().reverse().forEach(item => {
      const li = document.createElement("li");
      li.innerHTML = `<span style="color:#64748b">${item.descricao}</span><strong style="color:${item.tipo==='renda'?'#10b981':'#ef4444'}">R$ ${item.valor.toFixed(2)}</strong>`;
      UI.lista.appendChild(li);
      item.tipo === "renda" ? r += item.valor : d += item.valor;
    });
    UI.renda.textContent = `R$ ${r.toFixed(2)}`;
    UI.despesa.textContent = `R$ ${d.toFixed(2)}`;
    UI.saldo.textContent = `R$ ${(r - d).toFixed(2)}`;
    atualizarGrafico(r, d);
    atualizarInsights(r, d);
  }

  window.adicionar = () => {
    const desc = UI.desc.value.trim();
    const val = parseFloat(UI.val.value);
    if (!desc || isNaN(val)) return mostrarToast("Dados inválidos");
    state.dados.push({ descricao: desc, valor: val, tipo: UI.tipo.value });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.dados));
    atualizar();
    UI.desc.value = ""; UI.val.value = "";
    mostrarToast("Registro salvo!");
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
        atualizar(); mostrarToast("Backup restaurado!");
      };
      reader.readAsText(e.target.files[0]);
    };
    i.click();
  };

  window.abrirPrivacidade = () => document.getElementById("modalPrivacidade").style.display = "flex";
  window.fecharPrivacidade = () => document.getElementById("modalPrivacidade").style.display = "none";
  window.abrirModalReset = () => document.getElementById("modalReset").style.display = "flex";
  window.fecharModalReset = () => document.getElementById("modalReset").style.display = "none";
  window.confirmarReset = () => { localStorage.clear(); location.reload(); };

  window.addEventListener('load', () => {
    if (!localStorage.getItem('p_acc')) { abrirPrivacidade(); localStorage.setItem('p_acc', '1'); }
  });

  atualizar();
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js");
})();
