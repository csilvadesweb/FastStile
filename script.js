(() => {
  "use strict";

  const STORAGE_KEY = "faststile_data";
  let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  let chart;

  const lista = document.getElementById("lista");
  const toast = document.getElementById("toast");

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
    let renda = 0, despesa = 0;

    dados.slice().reverse().forEach(t => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span class="${t.tipo}">${t.descricao}</span>
        <strong class="${t.tipo}">R$ ${t.valor.toFixed(2)}</strong>
      `;
      lista.appendChild(li);

      t.tipo === "renda" ? renda += t.valor : despesa += t.valor;
    });

    document.getElementById("totalRenda").textContent = `R$ ${renda.toFixed(2)}`;
    document.getElementById("totalDespesa").textContent = `R$ ${despesa.toFixed(2)}`;
    document.getElementById("saldoTotal").textContent = `R$ ${(renda - despesa).toFixed(2)}`;

    atualizarGrafico(renda, despesa);
  }

  window.adicionar = () => {
    const descricao = descricaoInput.value.trim();
    const valor = parseFloat(valorInput.value);
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
    mostrarToast("Registro adicionado");
  };

  function atualizarGrafico(r, d) {
    if (chart) chart.destroy();
    chart = new Chart(grafico, {
      type: "doughnut",
      data: {
        labels: ["Rendas", "Despesas"],
        datasets: [{
          data: [r, d],
          backgroundColor: ["#2ecc71", "#e74c3c"]
        }]
      }
    });
  }

  window.exportarPDF = () => {
    html2pdf().from(document.body).save("FastStile.pdf");
  };

  window.exportarBackup = () => {
    const blob = new Blob([JSON.stringify(dados)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "faststile_backup.json";
    a.click();
  };

  window.importarBackup = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = e => {
      const reader = new FileReader();
      reader.onload = () => {
        dados = JSON.parse(reader.result);
        salvar();
        atualizar();
        mostrarToast("Backup importado");
      };
      reader.readAsText(e.target.files[0]);
    };
    input.click();
  };

  window.converterMoeda = () => {
    const valor = parseFloat(valorConverter.value);
    const taxa = parseFloat(moeda.value);
    if (!valor) return;
    resultadoConversao.textContent = `R$ ${(valor * taxa).toFixed(2)}`;
  };

  window.abrirModalReset = () => modalReset.style.display = "flex";
  window.fecharModalReset = () => modalReset.style.display = "none";

  window.confirmarReset = () => {
    dados = [];
    salvar();
    atualizar();
    valorConverter.value = "";
    resultadoConversao.textContent = "";
    fecharModalReset();
    mostrarToast("Dados resetados");
  };

  atualizar();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/FastStile/sw.js");
  }

})();