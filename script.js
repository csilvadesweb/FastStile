"use strict";

document.addEventListener("DOMContentLoaded", () => {

  /* ===============================
     CONFIGURAÇÃO CENTRAL
  =============================== */
  const STORAGE_KEY = "faststile_data_v1";
  const PREMIUM_KEY = "faststile_premium";

  /* ===============================
     ESTADO DO APP
  =============================== */
  let transacoes = [];
  let tipoSelecionado = null;

  /* ===============================
     ELEMENTOS (SAFE)
  =============================== */
  const el = (id) => document.getElementById(id);

  const descricaoInput = el("descricao");
  const valorInput = el("valor");
  const listaTransacoes = el("listaTransacoes");
  const saldoPercent = el("saldoPercent");

  /* ===============================
     UTILIDADES
  =============================== */
  const isPremium = () => localStorage.getItem(PREMIUM_KEY) === "true";

  const toast = (msg) => {
    const t = el("toast");
    if (!t) return alert(msg);
    t.textContent = msg;
    t.style.display = "block";
    setTimeout(() => (t.style.display = "none"), 3000);
  };

  /* ===============================
     STORAGE
  =============================== */
  const carregarDados = () => {
    try {
      transacoes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      transacoes = [];
    }
  };

  const salvarDados = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transacoes));
  };

  /* ===============================
     LÓGICA DE NEGÓCIO
  =============================== */
  window.setTipo = (tipo) => {
    tipoSelecionado = tipo;
  };

  window.salvarTransacao = () => {
    if (!descricaoInput || !valorInput) return;

    const descricao = descricaoInput.value.trim();
    const valor = parseFloat(valorInput.value);

    if (!descricao || isNaN(valor) || !tipoSelecionado) {
      toast("Preencha todos os campos");
      return;
    }

    transacoes.unshift({
      id: Date.now(),
      descricao,
      valor,
      tipo: tipoSelecionado,
      data: new Date().toLocaleDateString("pt-BR"),
    });

    salvarDados();
    descricaoInput.value = "";
    valorInput.value = "";
    tipoSelecionado = null;
    renderizar();
  };

  /* ===============================
     RENDER
  =============================== */
  const renderizar = () => {
    if (!listaTransacoes) return;

    listaTransacoes.innerHTML = "";

    let totalReceita = 0;
    let totalDespesa = 0;

    transacoes.forEach((t) => {
      const li = document.createElement("li");
      li.textContent = `${t.data} • ${t.descricao} • R$ ${t.valor.toFixed(2)}`;
      listaTransacoes.appendChild(li);

      t.tipo === "receita"
        ? (totalReceita += t.valor)
        : (totalDespesa += t.valor);
    });

    const total = totalReceita + totalDespesa;
    const percentual =
      total > 0 ? Math.round((totalReceita / total) * 100) : 0;

    if (saldoPercent) saldoPercent.textContent = `${percentual}%`;
  };

  /* ===============================
     PREMIUM (BÁSICO)
  =============================== */
  window.ativarLicenca = () => {
    localStorage.setItem(PREMIUM_KEY, "true");
    toast("Premium ativado");
    setTimeout(() => location.reload(), 800);
  };

  window.abrirLicenca = () => {
    const modal = el("modalLicenca");
    if (modal) modal.style.display = "flex";
  };

  /* ===============================
     RESET
  =============================== */
  window.resetar = () => {
    if (confirm("Deseja apagar todos os dados?")) {
      localStorage.clear();
      location.reload();
    }
  };

  /* ===============================
     INIT
  =============================== */
  carregarDados();
  renderizar();
});