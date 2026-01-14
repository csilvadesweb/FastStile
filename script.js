/**
 * @license
 * FASTSTILE FINANCE PRO - SISTEMA PROPRIETÁRIO
 * Copyright (c) 2026 C. Silva. Todos os direitos reservados.
 * É proibida a cópia, alteração ou distribuição não autorizada deste código.
 * Protegido pela Lei nº 9.609 (Software) e Lei nº 9.610 (Direitos Autorais).
 */

"use strict";

const DB_KEY = "FS_DATA_PRO_SECURE";
const PREMIUM_KEY = "FS_LICENSE_STATUS";
const APP_SIGNATURE = "ORIGINAL_FASTSTILE_CORE_2026"; // Assinatura interna para prova de autoria

let transacoes = JSON.parse(localStorage.getItem(DB_KEY)) || [];
let tipoSelecionado = null;
let meuGrafico = null;

// Proteção Básica: Impede atalhos de inspeção (Ctrl+Shift+I, F12)
document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && (e.shiftKey && e.key === "I" || e.key === "J" || e.key === "U") || e.key === "F12") {
        e.preventDefault();
        toast("🛡️ Modo de Proteção Ativado");
    }
});

document.addEventListener("DOMContentLoaded", () => {
    aplicarTema();
    validarPremiumUI();
    fetchCambio();
    render();
    
    const btnConfirmar = document.getElementById("btnConfirmarAcao");
    if(btnConfirmar) {
        btnConfirmar.onclick = () => {
            transacoes = [];
            localStorage.setItem(DB_KEY, JSON.stringify(transacoes));
            render();
            fecharConfirmacao();
            toast("🗑️ Base de dados limpa.");
        };
    }
});

// Restante das funções (salvarTransacao, render, gerarPDF...) seguem a mesma lógica anterior, 
// porém agora operam sob a licença proprietária acima.

function salvarTransacao() {
    const desc = document.getElementById("descricao").value.trim();
    const valor = parseFloat(document.getElementById("valor").value);
    if (!desc || isNaN(valor) || !tipoSelecionado) { toast("⚠️ Dados incompletos."); return; }

    const nova = {
        id: Date.now(),
        desc: desc.toUpperCase(),
        valor,
        tipo: tipoSelecionado,
        data: new Date().toLocaleDateString('pt-BR'),
        _sig: APP_SIGNATURE // Marca d'água invisível em cada transação
    };

    transacoes.unshift(nova);
    localStorage.setItem(DB_KEY, JSON.stringify(transacoes));
    document.getElementById("descricao").value = "";
    document.getElementById("valor").value = "";
    setTipo(null);
    render();
}

function ativarLicenca() {
    const chave = document.getElementById("chaveLicenca").value.toUpperCase().trim();
    // Algoritmo de validação (exemplo: FS-2026-XXXX-XXXX)
    if (/^FS-2026-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(chave)) {
        localStorage.setItem(PREMIUM_KEY, "FS_AUTHORIZED_2026");
        toast("💎 Licença Verificada!");
        setTimeout(() => location.reload(), 1000);
    } else { toast("❌ Licença Inválida ou Pirata"); }
}

// ... Manter funções: render(), atualizarGrafico(), gerarPDF(), exportarBackup() ...
// ... Incluindo toast(), abrirLicenca(), fecharLicenca(), etc. ...
