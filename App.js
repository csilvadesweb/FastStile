/**
 * FASTSTILE CORE ENGINE - App.js
 * @description Motor principal de inicialização e segurança.
 * @author C. Silva
 * @license Todos os direitos reservados © 2026.
 */

const App = (() => {
    "use strict";

    // Assinatura de autenticidade interna
    const _KEY = "FASTSTILE_CORE_AUTHLOG_2026";
    
    /**
     * Inicializa o ambiente do aplicativo
     */
    const init = () => {
        console.log("FastStile: Inicializando ambiente seguro...");
        
        // Bloqueio de teclas de inspeção (F12, Ctrl+U) para dificultar cópias
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && (e.key === 'u' || e.key === 's' || e.key === 'i')) {
                e.preventDefault();
            }
        });

        // Verifica se o Service Worker está ativo
        _registerServiceWorker();
        
        // Carrega o estado inicial do sistema
        _startupCheck();
    };

    /**
     * Registro do Service Worker para funcionalidade Offline
     */
    const _registerServiceWorker = () => {
        if ("serviceWorker" in navigator) {
            window.addEventListener("load", () => {
                navigator.serviceWorker.register("./sw.js")
                    .then(reg => console.log("FastStile: PWA Pronto."))
                    .catch(err => console.error("FastStile: Erro de SW", err));
            });
        }
    };

    /**
     * Verificação de primeira execução (Onboarding)
     */
    const _startupCheck = () => {
        const firstRun = !localStorage.getItem('faststile_initialized');
        if (firstRun) {
            console.log("FastStile: Primeira execução detectada.");
            // O modal de privacidade já é controlado no script.js, 
            // mas aqui podemos injetar logs de auditoria se necessário.
            localStorage.setItem('faststile_initialized', Date.now());
        }
    };

    /**
     * Função de criptografia simples para metadados (obfuscação)
     */
    const obfuscateData = (data) => {
        return btoa(JSON.stringify(data)); // Converte para Base64 para evitar leitura fácil
    };

    return {
        start: init,
        version: "2.0.0-PRO"
    };
})();

// Inicializa o núcleo
document.addEventListener('DOMContentLoaded', App.start);
