(() => {
  "use strict";

  const STORAGE_KEY = "faststile_v2_core";

  const state = {
    dados: JSON.parse(localStorage.getItem(STORAGE_KEY)) || [],
    chart: null
  };

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

  const gerarID = () =>
    Math.random().toString(36).substring(2, 10).toUpperCase() +
    "-" +
    Date.now().toString().slice(-6);

  function toast(msg) {
    UI.toast.textContent = msg;
    UI.toast.classList.add("show");
    setTimeout(() => UI.toast.classList.remove("show"), 2500);
  }

  function atualizar() {
    UI.lista.innerHTML = "";
    let r = 0, d = 0;

    state.dados.slice().reverse().forEach(item => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span>${item.descricao}</span>
        <strong style="color:${item.tipo === "renda" ? "#10b981" : "#ef4444"}">
          R$ ${item.valor.toFixed(2)}
        </strong>`;
      UI.lista.appendChild(li);
      item.tipo === "renda" ? r += item.valor : d += item.valor;
    });

    UI.renda.textContent = `R$ ${r.toFixed(2)}`;
    UI.despesa.textContent = `R$ ${d.toFixed(2)}`;
    UI.saldo.textContent = `R$ ${(r - d).toFixed(2)}`;
    UI.dica.textContent = r - d >= 0
      ? "✅ Gestão Financeira Saudável"
      : "⚠️ Atenção ao Saldo";

    atualizarGrafico(r, d);
  }

  window.adicionar = () => {
    const valor = parseFloat(UI.val.value);
    if (!UI.desc.value || isNaN(valor)) {
      toast("Preencha os campos corretamente.");
      return;
    }

    state.dados.push({
      descricao: UI.desc.value,
      valor,
      tipo: UI.tipo.value
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.dados));
    UI.desc.value = "";
    UI.val.value = "";
    atualizar();
  };

  function atualizarGrafico(r, d) {
    if (state.chart) state.chart.destroy();
    if (r === 0 && d === 0) return;

    state.chart = new Chart(document.getElementById("grafico"), {
      type: "doughnut",
      data: {
        datasets: [{
          data: [r, d],
          backgroundColor: ["#10b981", "#ef4444"],
          borderWidth: 0
        }]
      },
      options: {
        cutout: "85%",
        plugins: { legend: { display: false } }
      }
    });
  }

  // ================= PDF FINTECH PREMIUM =================
  window.exportarPDF = () => {
    toast("Gerando relatório financeiro premium...");

    const agora = new Date();
    const dataHora = agora.toLocaleString("pt-BR");
    const docID = gerarID();

    let r = 0, d = 0;
    state.dados.forEach(i => i.tipo === "renda" ? r += i.valor : d += i.valor);

    const moeda = n =>
      n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    const box = document.createElement("div");
    box.style.width = "794px";
    box.style.padding = "40px";
    box.style.background = "#ffffff";
    box.style.fontFamily = "Arial, sans-serif";
    box.style.color = "#0f172a";
    box.style.position = "relative";

    box.innerHTML = `
      <div style="
        position:absolute;
        inset:0;
        display:flex;
        justify-content:center;
        align-items:center;
        font-size:64px;
        font-weight:bold;
        color:rgba(15,23,42,0.05);
        transform:rotate(-30deg);">
        FASTSTILE
      </div>

      <div style="position:relative; z-index:1">
        <header style="border-bottom:4px solid #0f172a; padding-bottom:20px; margin-bottom:30px">
          <h1 style="margin:0">FastStile</h1>
          <small>Relatório Financeiro Oficial</small><br>
          <small>Emitido em: ${dataHora}</small>
        </header>

        <section style="display:flex; gap:12px; margin-bottom:30px">
          <div style="flex:1; background:#f1f5f9; padding:16px; border-radius:12px">
            RECEITAS<br><strong style="color:#10b981">${moeda(r)}</strong>
          </div>
          <div style="flex:1; background:#f1f5f9; padding:16px; border-radius:12px">
            DESPESAS<br><strong style="color:#ef4444">${moeda(d)}</strong>
          </div>
          <div style="flex:1; background:#0f172a; padding:16px; border-radius:12px; color:white">
            SALDO<br><strong>${moeda(r - d)}</strong>
          </div>
        </section>

        <table style="width:100%; border-collapse:collapse; font-size:13px">
          <thead>
            <tr style="background:#f8fafc">
              <th style="text-align:left; padding:10px">Descrição</th>
              <th style="text-align:right; padding:10px">Valor</th>
            </tr>
          </thead>
          <tbody>
            ${state.dados.map(i => `
              <tr>
                <td style="padding:10px; border-bottom:1px solid #e5e7eb">${i.descricao}</td>
                <td style="padding:10px; text-align:right; color:${i.tipo === "renda" ? "#10b981" : "#ef4444"}">
                  ${moeda(i.valor)}
                </td>
              </tr>`).join("")}
          </tbody>
        </table>

        <footer style="margin-top:30px; font-size:11px; border-top:2px dashed #cbd5e1; padding-top:15px">
          Documento autenticado digitalmente<br>
          ID: ${docID}<br>
          FastStile © 2026 — C. Silva
        </footer>
      </div>
    `;

    html2pdf()
      .set({
        margin: 10,
        filename: `FastStile_${docID}.pdf`,
        html2canvas: { scale: 3 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
      })
      .from(box)
      .save();
  };

  // ================= BACKUP / IMPORT / RESET =================
  window.exportarBackup = () => {
    const blob = new Blob([JSON.stringify(state.dados)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "faststile-backup.json";
    a.click();
  };

  window.importarBackup = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        state.dados = JSON.parse(reader.result);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.dados));
        atualizar();
      };
      reader.readAsText(file);
    };
    input.click();
  };

  window.abrirModalReset = () => {
    document.getElementById("modalReset").style.display = "flex";
  };

  window.fecharModalReset = () => {
    document.getElementById("modalReset").style.display = "none";
  };

  window.confirmarReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    state.dados = [];
    atualizar();
    fecharModalReset();
  };

  atualizar();
})();