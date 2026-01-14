"use strict";

const DB_KEY = "FastStile_Pro_v2_Data";
const PREMIUM_KEY = "FastStile_Premium_Status";
let transacoes = JSON.parse(localStorage.getItem(DB_KEY)) || [];
let tipoSelecionado = null;
let meuGrafico = null;

document.addEventListener("DOMContentLoaded", () => {
    aplicarTema();
    validarPremiumUI();
    fetchCambio();
    render();
});

function aplicarTema() { document.body.className = localStorage.getItem("theme") || "light-theme"; }

function toggleTheme() {
    const novoTema = document.body.classList.contains("dark-theme") ? "light-theme" : "dark-theme";
    document.body.className = novoTema;
    localStorage.setItem("theme", novoTema);
    render();
}

function setTipo(t) {
    tipoSelecionado = t;
    document.getElementById('btnReceita').className = 'btn-tipo' + (t === 'receita' ? ' active-receita' : '');
    document.getElementById('btnDespesa').className = 'btn-tipo' + (t === 'despesa' ? ' active-despesa' : '');
}

function salvarTransacao() {
    const desc = document.getElementById("descricao").value.trim();
    const valor = parseFloat(document.getElementById("valor").value);
    if (!desc || isNaN(valor) || !tipoSelecionado) { toast("Preencha tudo corretamente."); return; }

    transacoes.unshift({ id: Date.now(), desc, valor, tipo: tipoSelecionado, data: new Date().toLocaleDateString('pt-BR') });
    localStorage.setItem(DB_KEY, JSON.stringify(transacoes));
    document.getElementById("descricao").value = "";
    document.getElementById("valor").value = "";
    setTipo(null);
    render();
    toast("Lançamento salvo!");
}

function render() {
    const lista = document.getElementById("listaTransacoes");
    lista.innerHTML = "";
    let r = 0, d = 0;
    transacoes.forEach(t => {
        if (t.tipo === 'receita') r += t.valor; else d += t.valor;
        const li = document.createElement("li");
        li.style = "list-style:none; display:flex; justify-content:space-between; padding:16px 0; border-bottom:1px solid var(--border);";
        li.innerHTML = `<div><div style="font-weight:700;">${t.desc}</div><div style="font-size:11px; color:var(--text-sub)">${t.data}</div></div>
            <div style="display:flex; align-items:center; gap:12px">
                <span style="font-weight:800; color:${t.tipo==='receita'?'var(--accent)':'var(--danger)'}">
                    ${t.tipo==='receita'?'+':'-'} ${t.valor.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}
                </span>
                <button onclick="removerItem(${t.id})" style="background:none; border:none; color:var(--text-sub); cursor:pointer;">✕</button>
            </div>`;
        lista.appendChild(li);
    });
    document.getElementById("totalRendas").innerText = r.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
    document.getElementById("totalDespesas").innerText = d.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
    document.getElementById("saldoTotal").innerText = (r-d).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
    document.getElementById("saldoPercent").innerText = (r+d) > 0 ? Math.round((r/(r+d))*100) + "%" : "0%";
    atualizarGrafico(r, d);
}

function gerarPDF() {
    if (localStorage.getItem(PREMIUM_KEY) !== "true") { abrirLicenca(); return; }
    
    const renderArea = document.getElementById("pdf-render-area");
    renderArea.style.display = "block";
    
    let r = 0, d = 0;
    transacoes.forEach(t => t.tipo === 'receita' ? r += t.valor : d += t.valor);

    renderArea.innerHTML = `
        <div style="padding:50px; background:white; font-family:sans-serif; color:#1e293b;">
            <div style="background:#0f172a; color:white; padding:40px; border-radius:15px; margin-bottom:40px;">
                <h1 style="margin:0; font-size:32px; letter-spacing:-1px;">FastStilecs Elite</h1>
                <p style="margin:5px 0 0; opacity:0.8; font-size:14px;">RELATÓRIO FINANCEIRO EXECUTIVO</p>
                <div style="margin-top:20px; font-size:12px; opacity:0.6;">
                    ID: FASTSTILECS-2026-PRO-SECURITY-BY-CSILVA<br>
                    Gerado em: ${new Date().toLocaleString('pt-BR')}
                </div>
            </div>
            
            <div style="display:flex; gap:20px; margin-bottom:40px;">
                <div style="flex:1; border:1px solid #e2e8f0; padding:20px; border-radius:12px;">
                    <span style="font-size:12px; color:#64748b; display:block; margin-bottom:5px;">Receitas</span>
                    <b style="font-size:20px; color:#10b981;">R$ ${r.toLocaleString('pt-BR')}</b>
                </div>
                <div style="flex:1; border:1px solid #e2e8f0; padding:20px; border-radius:12px;">
                    <span style="font-size:12px; color:#64748b; display:block; margin-bottom:5px;">Despesas</span>
                    <b style="font-size:20px; color:#f43f5e;">R$ ${d.toLocaleString('pt-BR')}</b>
                </div>
                <div style="flex:1; background:#f8fafc; padding:20px; border-radius:12px;">
                    <span style="font-size:12px; color:#64748b; display:block; margin-bottom:5px;">Saldo Final</span>
                    <b style="font-size:20px; color:#0f172a;">R$ ${(r-d).toLocaleString('pt-BR')}</b>
                </div>
            </div>

            <table style="width:100%; border-collapse:collapse;">
                <thead>
                    <tr style="background:#0f172a; color:white;">
                        <th style="padding:15px; text-align:left; font-size:12px; border-radius:8px 0 0 0;">DATA</th>
                        <th style="padding:15px; text-align:left; font-size:12px;">DESCRIÇÃO</th>
                        <th style="padding:15px; text-align:center; font-size:12px;">TIPO</th>
                        <th style="padding:15px; text-align:right; font-size:12px; border-radius:0 8px 0 0;">VALOR (R$)</th>
                    </tr>
                </thead>
                <tbody>
                    ${transacoes.map((t, i) => `
                        <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom:1px solid #f1f5f9;">
                            <td style="padding:15px; font-size:13px; color:#64748b;">${t.data}</td>
                            <td style="padding:15px; font-size:13px; font-weight:600;">${t.desc.toUpperCase()}</td>
                            <td style="padding:15px; font-size:11px; text-align:center; color:#94a3b8;">${t.tipo === 'receita' ? 'ENTRADA' : 'SAÍDA'}</td>
                            <td style="padding:15px; text-align:right; font-weight:700; color:${t.tipo === 'receita' ? '#10b981' : '#f43f5e'}">
                                ${t.tipo === 'receita' ? '+ ' : '- '}${t.valor.toLocaleString('pt-BR')}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div style="text-align:center; margin-top:50px; font-size:10px; color:#94a3b8; border-top:1px solid #f1f5f9; padding-top:20px;">
                2026 FastStilecs - Propriedade Intelectual Exclusiva de C. Silva.
            </div>
        </div>`;

    const opt = { margin: 0, filename: 'Relatorio_FastStile_Elite.pdf', html2canvas: { scale: 3 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } };
    
    toast("Gerando PDF Elite...");
    html2pdf().set(opt).from(renderArea).save().then(() => {
        renderArea.style.display = "none";
    });
}

function atualizarGrafico(r, d) {
    const ctx = document.getElementById('graficoFinanceiro').getContext('2d');
    if (meuGrafico) meuGrafico.destroy();
    meuGrafico = new Chart(ctx, {
        type: 'doughnut',
        data: { datasets: [{ data: (r+d)>0?[r,d]:[1,0], backgroundColor: (r+d)>0?['#10b981','#f43f5e']:['#e2e8f0','#e2e8f0'], borderWidth: 0, cutout:'82%', borderRadius: 10 }] },
        options: { plugins: { legend: { display: false } }, animation: { duration: 600 } }
    });
}

async function fetchCambio() {
    try {
        const res = await fetch("https://economia.awesomeapi.com.br/last/USD-BRL");
        const data = await res.json();
        document.getElementById("miniConverter").innerHTML = `💵 USD <strong>R$ ${parseFloat(data.USDBRL.bid).toFixed(2)}</strong>`;
    } catch { document.getElementById("miniConverter").innerText = "Câmbio Offline"; }
}

function ativarLicenca() {
    const chave = document.getElementById("chaveLicenca").value.toUpperCase().trim();
    if (/^FS-2026-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(chave)) {
        localStorage.setItem(PREMIUM_KEY, "true");
        toast("💎 Premium Ativado!");
        setTimeout(() => location.reload(), 1000);
    } else { toast("Chave Inválida"); }
}

function removerItem(id) { transacoes = transacoes.filter(t => t.id !== id); localStorage.setItem(DB_KEY, JSON.stringify(transacoes)); render(); }
function abrirLicenca() { document.getElementById("modalLicenca").style.display = "flex"; }
function fecharLicenca() { document.getElementById("modalLicenca").style.display = "none"; }
function fecharConfirmacao() { document.getElementById("modalConfirmacao").style.display = "none"; }
function abrirConfirmacao(tipo) {
    document.getElementById("modalConfirmacao").style.display = "flex";
    document.getElementById("btnConfirmarAcao").onclick = () => { if(tipo==='limpar') { transacoes=[]; localStorage.setItem(DB_KEY,"[]"); render(); } fecharConfirmacao(); };
}
function toast(m) { const t = document.getElementById("toast"); t.innerText = m; t.style.display = "block"; setTimeout(()=>t.style.display="none", 3000); }
function validarPremiumUI() { if(localStorage.getItem(PREMIUM_KEY) === "true") { const b = document.getElementById("btnPremiumStatus"); b.innerText = "💎 Plano PRO"; b.style.background = "#1e293b"; b.style.color="#fff"; } }
