const App = (() => {
    "use strict";

    const aplicarTema = (tema) => {
        document.documentElement.setAttribute("data-theme", tema);
        localStorage.setItem("faststile_theme", tema);
    };

    const init = () => {

        // 🔒 Bloqueios básicos
        document.addEventListener("keydown", (e) => {
            if (e.ctrlKey && ["u", "s", "i"].includes(e.key.toLowerCase())) {
                e.preventDefault();
            }
        });

        // 🎨 Tema inicial
        const temaSalvo =
            localStorage.getItem("faststile_theme") ||
            (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

        aplicarTema(temaSalvo);

        // ⚙️ Service Worker (inalterado)
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("./sw.js").catch(() => {});
        }

        // 🔐 Controle de Privacidade
        window.addEventListener("load", () => {
            if (!localStorage.getItem("p_acc")) {
                const modal = document.getElementById("modalPrivacidade");
                if (modal) modal.style.display = "flex";
            }
        });

        // ✅ Aceitar Privacidade (CORREÇÃO DEFINITIVA)
        const btnAceitar = document.getElementById("btnAceitarPrivacidade");
        if (btnAceitar) {
            btnAceitar.addEventListener("click", () => {
                localStorage.setItem("p_acc", "1");
                const modal = document.getElementById("modalPrivacidade");
                if (modal) modal.style.display = "none";
            });
        }
    };

    window.toggleTheme = () => {
        const atual = document.documentElement.getAttribute("data-theme");
        aplicarTema(atual === "dark" ? "light" : "dark");
        location.reload();
    };

    return { start: init };
})();

document.addEventListener("DOMContentLoaded", App.start);