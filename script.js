(() => {
  "use strict";

  const STORAGE_KEY = "faststile_data";

  // ELEMENTOS
  const descricaoInput = document.getElementById("descricao");
  const valorInput = document.getElementById("valor");
  const tipoSelect = document.getElementById("tipo");
  const lista = document.getElementById("lista");
  const toast = document.getElementById("toast");

  const totalRendaEl = document.getElementById("totalRenda");
  const totalDespesaEl = document.getElementById("totalDespesa");
  const saldoTotalEl = document.getElementById("saldoTotal");

  const valorConverter = document.getElementById("valorConverter");
  const moeda = document.getElementById("moeda");
  const resultadoConversao = document.getElementById("resultadoConversao");

  const modalReset = document.getElementById("modalReset");
  const graficoCanvas = document.getElementById("grafico");

  let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  let chart = null;

  // ===== STORAGE =====
  function salvar() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
  }

  // ===== TOAST =====
  function mostrarToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
  }

  // ===== ATUALIZAR UI =====
  function atualizar() {
    lista.innerHTML = "";

    let renda = 0;
    let despesa = 0;

    dados.slice().reverse().forEach(item => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span class="${item.tipo}">${item.descricao}</span>
        <strong class="${item.tipo}">R$ ${item.valor.toFixed(2)}</strong>
      `;
      lista.appendChild(li);

      item.tipo === "renda"
        ? renda += item.valor
        : despesa += item.valor;
    });

    totalRendaEl.textContent = `R$ ${renda.toFixed(2)}`;
    totalDespesaEl.textContent = `R$ ${despesa.toFixed(2)}`;
    saldoTotalEl.textContent = `R$ ${(renda - despesa).toFixed(2)}`;

    atualizarGrafico(renda, despesa);
  }

  // ===== ADICIONAR =====
  window.adicionar = function () {
    const descricao = descricaoInput.value.trim();
    const valor = Number(valorInput.value);
    const tipo = tipoSelect.value;

    if (!descricao || valor <= 0) {
      mostrarToast("Preencha corretamente");
      return;
    }

    dados.push({ descricao, valor, tipo });
    salvar();
    atualizar();

    descricaoInput.value = "";
    valorInput.value = "";

    mostrarToast("Registro salvo");
  };

  // ===== GRÁFICO =====
  function atualizarGrafico(renda, despesa) {
    if (chart) chart.destroy();

    chart = new Chart(graficoCanvas, {
      type: "doughnut",
      data: {
        labels: ["Rendas", "Despesas"],
        datasets: [{
          data: [renda, despesa],
          backgroundColor: ["#2ecc71", "#e74c3c"]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom"
          }
        }
      }
    });
  }

  // ===== PDF =====
  window.exportarPDF = function () {
    html2pdf().from(document.body).save("FastStile.pdf");
  };

  // ===== BACKUP =====
  window.exportarBackup = function () {
    const blob = new Blob(
      [JSON.stringify(dados)],
      { type: "application/json" }
    );

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "faststile_backup.json";
    a.click();
  };

  window.importarBackup = function () {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = e => {
      const reader = new FileReader();
      reader.onload = () => {
        dados = JSON.parse(reader.result) || [];
        salvar();
        atualizar();
        mostrarToast("Backup importado");
      };
      reader.readAsText(e.target.files[0]);
    };

    input.click();
  };

  // ===== CONVERSOR =====
  window.converterMoeda = function () {
    const valor = Number(valorConverter.value);
    const taxa = Number(moeda.value);

    if (!valor || !taxa) return;

    resultadoConversao.textContent =
      `R$ ${(valor * taxa).toFixed(2)}`;
  };

  // ===== RESET =====
  window.abrirModalReset = () => modalReset.style.display = "flex";
  window.fecharModalReset = () => modalReset.style.display = "none";

  window.confirmarReset = function () {
    dados = [];
    salvar();
    atualizar();

    valorConverter.value = "";
    resultadoConversao.textContent = "";

    fecharModalReset();
    mostrarToast("Dados apagados");
  };

  // ===== INIT =====
  atualizar();

  // ===== SERVICE WORKER =====
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js");
  }

})();