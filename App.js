const App = (() => {
    "use strict";

    const aplicarTema = (tema) => {
        document.documentElement.setAttribute('data-theme', tema);
        localStorage.setItem('faststile_theme', tema);
    };

    const init = () => {
        // Bloqueio de teclas para segurança mínima
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && ['u','s','i'].includes(e.key)) e.preventDefault();
        });

        // Tema inicial
        const temaSalvo = localStorage.getItem('faststile_theme') ||
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        aplicarTema(temaSalvo);

        // Service Worker
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("./sw.js").catch(() => {});
        }

        // Modal de Privacidade
        window.addEventListener('load', () => {
            if (!localStorage.getItem('p_acc')) {
                document.getElementById("modalPrivacidade").style.display = "flex";
            }
        });
    };

    window.toggleTheme = () => {
        const novoTema = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        aplicarTema(novoTema);
        document.querySelectorAll("canvas").forEach(c => c.getContext('2d').clearRect(0,0,c.width,c.height));
        // Atualiza gráfico sem reload
        if (window.updateGraph) window.updateGraph();
    };

    return { start: init };
})();

document.addEventListener('DOMContentLoaded', App.start);