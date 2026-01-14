"use strict";

document.addEventListener("DOMContentLoaded", () => {

  /* ===============================
     CONFIG
  =============================== */
  const STORAGE_KEY = "faststile_data_v1";
  const PREMIUM_KEY = "faststile_premium";

  let transacoes = [];
  let tipoSelecionado = null;

  /* ===============================
     ELEMENTOS
  =============================== */
  const $ = (id) => document.getElementById(id);

  const descricaoInput = $("descricao");
  const valorInput = $("valor");
  const listaTransacoes = $("listaTransacoes");
  const saldoPercent = $("saldoPercent");

  const btnReceita = document.querySelector("button[onclick*='Receita'], button:contains('Receita')");
  const btnDespesa = document.querySelector("button[onclick*='Despesa'], button:contains('Despesa')");
  const btnConfirmar = document.querySelector(".btn-adicionar") || document.querySelector("button");

  /* ===============================
     UTIL
  =============================== */
  const toast = (msg) => {
    const t = $("toast");
    if (!t) return alert(msg);
    t.textContent = msg;
    t.style.display = "block";
    setTimeout(() => (t.style.display = "none"), 2500);
  };

  /* ===============================
     STORAGE
  =============================== */
  function carregar() {
    try {
      transacoes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      transacoes = [];
    }
  }

  function salvar() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transacoes));
  }

  /* ===============================
     EVENTOS
  =============================== */
  document.querySelectorAll("button").forEach(btn => {
    if (btn.textContent.includes("Receita")) {
      btn.addEventListener("click", () => {
        tipoSelecionado = "receita";
        toast("Receita selecionada");
      });
    }

    if (btn.textContent.includes("Despesa")) {
      btn.addEventListener("click", () => {
        tipoSelecionado = "despesa";
        toast("Despesa selecionada");
      });
    }

    if (btn.textContent.includes("Confirmar")) {
      btn.addEventListener("click", salvarTransacao);
    }
  });

  /* ===============================
     LÓGICA
  =============================== */
  function salvarTransacao() {
    if (!descricaoInput || !valorInput) return;

    const descricao = descricaoInput.value.trim();
    const valor = parseFloat(valorInput.value.replace(",", "."));

    if (!descricao || isNaN(valor) || !tipoSelecionado) {
      toast("Preencha descrição, valor e tipo");
      return;
    }

    transacoes.unshift({
      id: Date.now(),
      descricao,
      valor,
      tipo: tipoSelecionado,
      data: new Date().toLocaleDateString("pt-BR")
    });

    salvar();
    descricaoInput.value = "";
    valorInput.value = "";
    tipoSelecionado = null;
    render();
  }

  /* ===============================
     RENDER
  =============================== */
  function render() {
    if (!listaTransacoes) return;

    listaTransacoes.innerHTML = "";
    let receita = 0;
    let despesa = 0;

    transacoes.forEach(t => {
      const li = document.createElement("li");
      li.textContent = `${t.data} • ${t.descricao} • R$ ${t.valor.toFixed(2)}`;
      listaTransacoes.appendChild(li);

      t.tipo === "receita" ? receita += t.valor : despesa += t.valor;
    });

    const total = receita + despesa;
    const percent = total ? Math.round((receita / total) * 100) : 0;

    if (saldoPercent) saldoPercent.textContent = `${percent}%`;
  }

  /* ===============================
     INIT
  =============================== */
  carregar();
  render();

});