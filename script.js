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

  function salvar() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
  }

  function mostrarToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
  }

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
      item.tipo === "renda" ? renda += item.valor : despesa += item.valor;
    });

    totalRendaEl.textContent = `R$ ${renda.toFixed(2)}`;
    totalDespesaEl.textContent = `R$ ${despesa.toFixed(2)}`;
    saldoTotalEl.textContent = `R$ ${(renda - despesa).toFixed(2)}`;

    atualizarGrafico(renda, despesa);
  }

  window.adicionar = function () {
    const descricao = descricaoInput.value.trim();
    const valor = parseFloat(valorInput.value);
    if (!descricao || isNaN(valor) || valor <= 0) {
      mostrarToast("Preencha os campos corretamente");
      return;
    }
    dados.push({ descricao, valor, tipo: tipoSelect.value });
    salvar();
    atualizar();
    descricaoInput.value = "";
    valorInput.value = "";
    mostrarToast("Salvo com sucesso!");
  };

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
      options: { responsive: true }
    });
  }

  window.exportarPDF = function () {
    const opt = { margin: 1, filename: 'FastStile.pdf', image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } };
    html2pdf().set(opt).from(document.body).save();
  };

  window.exportarBackup = function () {
    const blob = new Blob([JSON.stringify(dados)], { type: "application/json" });
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
        try {
          dados = JSON.parse(reader.result);
          salvar();
          atualizar();
          mostrarToast("Backup importado!");
        } catch(err) { mostrarToast("Erro no arquivo"); }
      };
      reader.readAsText(e.target.files[0]);
    };
    input.click();
  };

  window.converterMoeda = function () {
    const valor = parseFloat(valorConverter.value);
    const taxa = parseFloat(moeda.value);
    if (isNaN(valor)) return;
    resultadoConversao.textContent = `R$ ${(valor * taxa).toFixed(2)}`;
  };

  window.abrirModalReset = () => modalReset.style.display = "flex";
  window.fecharModalReset = () => modalReset.style.display = "none";
  window.confirmarReset = () => {
    dados = [];
    salvar();
    atualizar();
    fecharModalReset();
    mostrarToast("Dados zerados");
  };

  atualizar();

  // Registro do Service Worker corrigido
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js")
        .then(reg => console.log("SW OK"))
        .catch(err => console.log("SW Erro", err));
    });
  }
})();
