"use strict";

const STORAGE_KEY = "faststile_pro_v3_core";
let transacoes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let tipoSelecionado = null;
let meuGrafico = null;

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    render();
    verificarStatusPremium();
});

// --- PREMIUM ---
function abrirLicenca() { document.getElementById("modalLicenca").style.display = "flex"; }
function fecharLicenca() { document.getElementById("modalLicenca").style.display = "none"; }
function ativarLicenca() {
    const chave = document.getElementById("chaveLicenca").value.trim().toUpperCase();
    if (/^FS-2026-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(chave)) {
        localStorage.setItem("faststile_premium", "true");
        mostrarToast("💎 Premium Ativado!");
        setTimeout(() => location.reload(), 1200);
    } else {
        alert("Chave inválida! Use o formato: FS-2026-XXXX-XXXX");
        document.getElementById("chaveLicenca").style.borderColor = "var(--danger)";
    }
}

// --- CONFIRMAÇÃO ---
function abrirConfirmacao(tipo, id = null) {
    const modal = document.getElementById("modalConfirmacao");
    const msg = document.getElementById("confirmMessage");
    const btn = document.getElementById("btnConfirmarAcao");
    modal.style.display = "flex";
    if (tipo === 'limpar') {
        msg.innerText = "Apagar todos os dados permanentemente?";
        btn.onclick = () => { transacoes = []; salvarEAtualizar(); fecharConfirmacao(); };
    } else if (tipo === 'deletar') {
        msg.innerText = "Deseja excluir esta transação?";
        btn.onclick = () => { transacoes = transacoes.filter(t => t.id !== id); salvarEAtualizar(); fecharConfirmacao(); };
    }
}
function fecharConfirmacao() { document.getElementById("modalConfirmacao").style.display = "none"; }

// --- CORE ---
function setTipo(tipo) {
    tipoSelecionado = tipo;
    document.getElementById('btnReceita').className = 'btn-tipo' + (tipo==='receita'?' active-receita':'');
    document.getElementById('btnDespesa').className = 'btn-tipo' + (tipo==='despesa'?' active-despesa':'');
}
function salvarTransacao() {
    const desc = document.getElementById("descricao").value.trim();
    const valor = parseFloat(document.getElementById("valor").value);
    if (!desc || isNaN(valor) || !tipoSelecionado) { mostrarToast("Preencha tudo corretamente."); return; }
    transacoes.unshift({ id: Date.now(), desc, valor, tipo: tipoSelecionado, data: new Date().toLocaleDateString('pt-BR') });
    salvarEAtualizar();
    limparCampos();
}
function salvarEAtualizar() { localStorage.setItem(STORAGE_KEY, JSON.stringify(transacoes)); render(); }

function render() {
    const lista = document.getElementById("listaTransacoes");
    lista.innerHTML = "";
    let r=0, d=0;
    transacoes.forEach(t=>{
        if(t.tipo==="receita") r+=t.valor; else d+=t.valor;
        const li = document.createElement("li");
        li.innerHTML = `<div><strong>${t.desc}</strong><small style="display:block;color:var(--text-sub);font-size:10px">${t.data}</small></div>
        <div style="display:flex;align-items:center"><span style="font-weight:700;color:${t.tipo==='receita'?'#10b981':'#ef4444'}">${t.valor.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</span>
        <button onclick="abrirConfirmacao('deletar', ${t.id})" style="background:none;border:none;color:#cbd5e1;margin-left:12px;cursor:pointer">✕</button></div>`;
        lista.appendChild(li);
    });
    document.getElementById("totalRendas").innerText = r.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
    document.getElementById("totalDespesas").innerText = d.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
    document.getElementById("saldoTotal").innerText = (r-d).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
    const perc = (r+d)>0?Math.round((r/(r+d))*100):0;
    document.getElementById("saldoPercent").innerText = perc+"%";
    atualizarGrafico