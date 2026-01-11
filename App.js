const App = (() => {
    "use strict";
    
    const aplicarTema = (tema) => {
        document.documentElement.setAttribute('data-theme', tema);
        localStorage.setItem('faststile_theme', tema);
    };

    const init = () => {
        // Bloqueio de Teclas
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && (e.key === 'u' || e.key === 's' || e.key === 'i')) e.preventDefault();
        });

        // Tema Inicial
        const temaSalvo = localStorage.getItem('faststile_theme') || 
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        aplicarTema(temaSalvo);

        // Service Worker
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("./sw.js").catch(() => {});
        }

        // Privacidade
        window.addEventListener('load', () => {
            if (!localStorage.getItem('p_acc')) document.getElementById("modalPrivacidade").style.display = "flex";
        });
    };

    window.toggleTheme = () => {
        const novo = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        aplicarTema(novo);
        location.reload(); // Recarrega para ajustar cores do gráfico
    };

    return { start: init };
})();
document.addEventListener('DOMContentLoaded', App.start);
