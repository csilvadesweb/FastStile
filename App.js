const App = (() => {
    "use strict";
    const init = () => {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && (e.key === 'u' || e.key === 's' || e.key === 'i')) e.preventDefault();
        });

        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("./sw.js").catch(err => console.log(err));
        }

        window.addEventListener('load', () => {
            if (!localStorage.getItem('p_acc')) {
                document.getElementById("modalPrivacidade").style.display = "flex";
            }
        });
    };
    return { start: init };
})();
document.addEventListener('DOMContentLoaded', App.start);
