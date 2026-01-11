(() => {
  "use strict";

  /* FASTSTILE CORE © 2026 C. SILVA
     Software protegido pela Lei 9.609/98
     Reprodução não autorizada caracteriza violação legal
  */

  const STORAGE_KEY = "faststile_v2_core";
  const AUDIT_KEY = "faststile_audit_log";

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
      options: { cutout: "85%", plugins: { legend: { display: false } } }
    });
  }

  /* =================== BLINDAGEM ENTERPRISE =================== */

  async function gerarHash(texto) {
    const buffer = new TextEncoder().encode(texto);
    const hash = await crypto.subtle.digest("SHA-256", buffer);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();
  }

  function registrarAuditoria(registro) {
    const logs = JSON.parse(localStorage.getItem(AUDIT_KEY)) || [];
    logs.push(registro);
    localStorage.setItem(AUDIT_KEY, JSON.stringify(logs));
  }

  window.exportarPDF = async () => {
    toast("Gerando relatório financeiro seguro...");

    const agora = new Date();
    const dataHora = agora.toLocaleString("pt-BR");
    const docID = gerarID();

    let r = 0, d = 0;
    state.dados.forEach(i => (i.tipo === "renda" ? (r += i.valor) : (d += i.valor)));

    const moeda = n =>
      n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    const conteudoBase = JSON.stringify({
      docID,
      dataHora,
      totalRenda: r,
      totalDespesa: d,
      saldo: r - d,
      registros: state.dados.length
    });

    const hashDoc = await gerarHash(conteudoBase);

    registrarAuditoria({
      docID,
      dataHora,
      saldo: r - d,
      hash: hashDoc
    });

    const box = document.createElement("div");
    box.style.padding = "35px";
    box.style.fontFamily = "Arial";
    box.style.width = "760px";

    box.innerHTML = `
      <h1>FastStile</h1>
      <p><strong>Relatório Financeiro Oficial</strong></p>
      <p>Emissão: ${dataHora}</p>

      <hr>

      <p>Receitas: <strong>${moeda(r)}</strong></p>
      <p>Despesas: <strong>${moeda(d)}</strong></p>
      <p>Saldo Final: <strong>${moeda(r - d)}</strong></p>

      <hr>

      <p><strong>Assinatura Digital Enterprise</strong></p>
      <p>ID do Documento: ${docID}</p>
      <p>Hash SHA-256: ${hashDoc}</p>
      <p>Responsável Técnico: C. Silva</p>
      <p>Documento autenticado localmente</p>
    `;

    html2pdf().set({
      filename: `FastStile_${docID}.pdf`,
      jsPDF: { format: "a4", orientation: "portrait" }
    }).from(box).save();
  };

  atualizar();
})();