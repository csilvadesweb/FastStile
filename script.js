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
    let r = 0,
      d = 0;

    state.dados
      .slice()
      .reverse()
      .forEach(item => {
        const li = document.createElement("li");
        li.innerHTML = `
          <span>${item.descricao}</span>
          <strong style="color:${item.tipo === "renda" ? "#10b981" : "#ef4444"}">
            R$ ${item.valor.toFixed(2)}
          </strong>`;
        UI.lista.appendChild(li);
        item.tipo === "renda" ? (r += item.valor) : (d += item.valor);
      });

    UI.renda.textContent = `R$ ${r.toFixed(2)}`;
    UI.despesa.textContent = `R$ ${d.toFixed(2)}`;
    UI.saldo.textContent = `R$ ${(r - d).toFixed(2)}`;
    UI.dica.textContent =
      r - d >= 0 ? "✅ Gestão Financeira Saudável" : "⚠️ Atenção ao Saldo";
    atualizarGrafico(r, d);
  }

  window.adicionar = () => {
    const valor = parseFloat(UI.val.value);
    if (!UI.desc.value || isNaN(valor))
      return toast("Preencha os campos corretamente.");
    state.dados.push({ descricao: UI.desc.value, valor, tipo: UI.tipo.value });
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
        datasets: [
          {
            data: [r, d],
            backgroundColor: ["#10b981", "#ef4444"],
            borderWidth: 0
          }
        ]
      },
      options: { cutout: "85%", plugins: { legend: { display: false } } }
    });
  }

  // ================= PDF FINTECH FINAL =================
  window.exportarPDF = () => {
    toast("Gerando relatório financeiro...");
    const agora = new Date();
    const dataHora = agora.toLocaleString("pt-BR");
    const docID = gerarID();

    let r = 0,
      d = 0;
    state.dados.forEach(i => (i.tipo === "renda" ? (r += i.valor) : (d += i.valor)));

    const moeda = n =>
      n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    const box = document.createElement("div");
    box.style.background = "#ffffff";
    box.style.padding = "35px";
    box.style.fontFamily = "Arial, sans-serif";
    box.style.color = "#1e293b";
    box.style.width = "760px";
    box.style.position = "relative";

    box.innerHTML = `
      <div style="
        position:absolute;
        inset:0;
        display:flex;
        justify-content:center;
        align-items:center;
        font-size:56px;
        font-weight:bold;
        color:rgba(15,23,42,0.07);
        transform:rotate(-30deg);
        z-index:0;">
        DOCUMENTO FINANCEIRO CONFIDENCIAL
      </div>

      <div style="position:relative; z-index:1;">
        <header style="border-bottom:4px solid #0f172a; padding-bottom:18px; margin-bottom:25px">
          <h1 style="margin:0; color:#0f172a">FastStile</h1>
          <small>Relatório Financeiro Oficial</small>
          <div style="font-size:11px; margin-top:4px">Emissão: ${dataHora}</div>
        </header>

        <section style="display:flex; gap:10px; margin-bottom:25px">
          <div style="flex:1; background:#f1f5f9; padding:14px; border-radius:10px">
            RECEITAS<br><strong style="color:#10b981">${moeda(r)}</strong>
          </div>
          <div style="flex:1; background:#f1f5f9; padding:14px; border-radius:10px">
            DESPESAS<br><strong style="color:#ef4444">${moeda(d)}</strong>
          </div>
          <div style="flex:1; background:#0f172a; padding:14px; border-radius:10px; color:white">
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
            ${state.dados
              .map(
                i => `
              <tr>
                <td style="padding:10px; border-bottom:1px solid #e5e7eb">${i.descricao}</td>
                <td style="padding:10px; text-align:right; color:${
                  i.tipo === "renda" ? "#10b981" : "#ef4444"
                }">${moeda(i.valor)}</td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>

        <footer style="margin-top:35px; border-top:2px dashed #cbd5e1; padding-top:18px; font-size:11px">
          <strong>Assinatura Digital Financeira</strong><br>
          FastStile – Gestão Financeira Inteligente<br>
          Responsável: C. Silva<br>
          Documento autenticado digitalmente<br><br>
          ID do Documento: ${docID}<br>
          Data e Hora: ${dataHora}
        </footer>
      </div>
    `;

    html2pdf()
      .set({
        margin: 10,
        filename: `FastStile_Relatorio_${docID}.pdf`,
        html2canvas: { scale: 2, scrollY: 0 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
      })
      .from(box)
      .save();
  };

  atualizar();
})();