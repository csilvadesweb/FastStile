"use strict";

const STORAGE_KEY = "faststile_pro_data";
let transacoes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let tipoSelecionado = null;
let meuGrafico = null;

/** --- INICIALIZAÇÃO --- **/
document.addEventListener("DOMContentLoaded", () => {
    render();
    verificarStatusPremium();
});

/** --- CORE TRANSAÇÕES --- **/
function setTipo(tipo) {
    tipoSelecionado = tipo;
    document.getElementById('btnReceita').classList.remove('active-receita');
    document.getElementById('btnDespesa').classList.remove('active-despesa');
    
    if(tipo === 'receita') document.getElementById('btnReceita').classList.add('active-receita');
    else document.getElementById('btnDespesa').classList.add('active-despesa');
}

function salvarTransacao() {
    const desc = document.getElementById("descricao").value.trim();
    const valor = parseFloat(document.getElementById("valor").value);

    if (!desc || isNaN(valor) || !tipoSelecionado) {
        mostrarToast("Preencha todos os campos e selecione o tipo.");
        return;
    }

    const novaTransacao = {
        id: Date.now(),
        desc,
        valor,
        tipo: tipoSelecionado,
        data: new Date().toLocaleDateString('pt-BR')
    };

    transacoes.unshift(novaTransacao);
    atualizarStorage();
    limparCampos();
    render();
    mostrarToast("Lançamento realizado!");
}

function atualizarStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transacoes));
}

function limparCampos() {
    document.getElementById("descricao").value = "";
    document.getElementById("valor").value = "";
    tipoSelecionado = null;
    document.getElementById('btnReceita').classList.remove('active-receita');
    document.getElementById('btnDespesa').classList.remove('active-despesa');
}

/** --- RENDERIZAÇÃO & UI --- **/
function render() {
    const lista = document.getElementById("listaTransacoes");
    lista.innerHTML = "";
    
    let r = 0, d = 0;

    transacoes.forEach(t => {
        if (t.tipo === "receita") r += t.valor;
        else d += t.valor;

        const li = document.createElement("li");
        li.innerHTML = `
            <span>${t.desc} <small style="display:block; color:gray; font-size:10px">${t.data}</small></span>
            <strong class="${t.tipo === 'receita' ? 'texto-receita' : 'texto-despesa'}">
                ${t.tipo === 'receita' ? '+' : '-'} ${formatarMoeda(t.valor)}
            </strong>
        `;
        lista.appendChild(li);
    });

    document.getElementById("totalRendas").innerText = formatarMoeda(r);
    document.getElementById("totalDespesas").innerText = formatarMoeda(d);
    document.getElementById("saldoTotal").innerText = formatarMoeda(r - d);
    
    atualizarGrafico(r, d);
}

function formatarMoeda(v) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** --- GRÁFICO --- **/
function atualizarGrafico(r, d) {
    const ctx = document.getElementById('graficoFinanceiro').getContext('2d');
    if (meuGrafico) meuGrafico.destroy();

    if (r === 0 && d === 0) return;

    meuGrafico = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Rendas', 'Despesas'],
            datasets: [{
                data: [r, d],
                backgroundColor: ['#10b981', '#ef4444'],
                borderWidth: 0
            }]
        },
        options: {
            cutout: '70%',
            plugins: { legend: { display: false } }
        }
    });
}

/** --- PREMIUM & UTILITÁRIOS --- **/
function isPremium() {
    return localStorage.getItem("faststile_premium") === "true";
}

function verificarStatusPremium() {
    if(isPremium()) {
        document.getElementById("btnPremiumStatus").innerText = "💎 Premium Ativo";
        document.getElementById("btnPremiumStatus").style.background = "#10b981";
    }
}

function abrirLicenca() { document.getElementById("modalLicenca").style.display = "flex"; }
function fecharLicenca() { document.getElementById("modalLicenca").style.display = "none"; }

function ativarLicenca() {
    const chave = document.getElementById("chaveLicenca").value.trim();
    if (/^FS-2026-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(chave)) {
        localStorage.setItem("faststile_premium", "true");
        mostrarToast("Premium Ativado!");
        verificarStatusPremium();
        fecharLicenca();
    } else {
        alert("Chave inválida. Use o formato FS-2026-XXXX-XXXX");
    }
}

function gerarPDF() {
    if (!isPremium()) { abrirLicenca(); return; }
    window.print(); // O CSS de impressão pode ser refinado para esconder botões
}

function exportarBackup() {
    if (!isPremium()) { abrirLicenca(); return; }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(transacoes));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "backup_faststile.json");
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function limparTudo() {
    if (confirm("Deseja apagar todos os dados permanentemente?")) {
        transacoes = [];
        atualizarStorage();
        render();
        mostrarToast("Dados limpos!");
    }
}

function mostrarToast(msg) {
    const t = document.getElementById("toast");
    t.innerText = msg;
    t.style.display = "block";
    setTimeout(() => { t.style.display = "none"; }, 3000);
}
