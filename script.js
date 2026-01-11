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
    toast: document.getElementById("toast"),
    modalReset: document.getElementById("modalReset")
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

  function salvar() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.dados));
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

      item.tipo === "renda" ? (r += item.valor) : (d += item.valor);
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

    salvar();
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

  // ================== PDF (CORRIGIDO) ==================
  window.exportarPDF = () => {
    toast("Gerando PDF financeiro...");

    const agora = new Date();
    const dataHora = agora.toLocaleString("pt-BR");
    const docID = gerarID();

    let r = 0, d = 0;
    state.dados.forEach(i => i.tipo === "renda" ? r += i.valor : d += i.valor);

    const moeda = n =>
      n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    const box = document.createElement("div");
    box.style.padding = "30px";
    box.style.background = "#ffffff";
    box.style.color = "#1e293b";
    box.style.fontFamily = "Arial";
    box.style.width = "800px";

    box.innerHTML = `
      <h1>FastStile</h1>
      <p><strong>Relatório Financeiro</strong></p>
      <p>Emitido em: ${dataHora}</p>
      <hr>
      <p>Receitas: <strong>${moeda(r)}</strong></p>
      <p>Despesas: <strong>${moeda(d)}</strong></p>
      <p>Saldo: <strong>${moeda(r - d)}</strong></p>
      <hr>
      <ul>
        ${state.dados.map(i =>
          `<li>${i.descricao} — ${moeda(i.valor)}</li>`
        ).join("")}
      </ul>
      <small>ID do Documento: ${docID}</small>
    `;

    document.body.appendChild(box);

    html2pdf()
      .set({
        margin: 10,
        filename: `FastStile_${docID}.pdf`,
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
      })
      .from(box)
      .save()
      .then(() => box.remove());
  };

  // ================= BACKUP =================
  window.exportarBackup = () => {
    const blob = new Blob(
      [JSON.stringify(state.dados, null, 2)],
      { type: "application/json" }
    );

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "faststile_backup.json";
    a.click();
    URL.revokeObjectURL(a.href);
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
        try {
          state.dados = JSON.parse(reader.result);
          salvar();
          atualizar();
          toast("Backup importado com sucesso.");
        } catch {
          toast("Arquivo inválido.");
        }
      };
      reader.readAsText(file);
    };

    input.click();
  };

  // ================= RESET =================
  window.abrirModalReset = () => {
    UI.modalReset.style.display = "flex";
  };

  window.fecharModalReset = () => {
    UI.modalReset.style.display = "none";
  };

  window.confirmarReset = () => {
    state.dados = [];
    salvar();
    atualizar();
    fecharModalReset();
    toast("Dados apagados com sucesso.");
  };

  atualizar();
})();