/**
 * FASTSTILE CORE - App.js
 * Blindagem de Sistema e PWA
 */
const App = (() => {
    "use strict";
    const _KEY = "FASTSTILE_CORE_2026";
    
    const init = () => {
        // Bloqueio de Inspeção
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && (e.key === 'u' || e.key === 's' || e.key === 'i')) e.preventDefault();
        });

        // Registro Service Worker
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("./sw.js").catch(err => console.log(err));
        }

        // Verificação de Privacidade
        window.addEventListener('load', () => {
            if (!localStorage.getItem('p_acc')) {
                document.getElementById("modalPrivacidade").style.display = "flex";
            }
        });
    };

    return { start: init };
})();

document.addEventListener('DOMContentLoaded', App.start);
