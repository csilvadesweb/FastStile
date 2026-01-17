"use strict";

/**
 * ARQUITETURA DE BLINDAGEM - FASTSTILE PRO
 * Engenharia: Full Stack Senior
 * Foco: Robustez, Null Safety e Tratamento de Exceções
 */

const AppModule = (() => {
    // --- CONFIGURAÇÃO E CONSTANTES ---
    const CONFIG = {
        DB_KEY: "FastStile_Pro_v3_Data",
        PREMIUM_KEY: "FS_PRO_SYSTEM_ACTIVE",
        THEME_KEY: "theme",
        API_URL: "https://economia.awesomeapi.com.br/last/USD-BRL",
        PREMIUM_TOKEN: "FS_ACT_2026"
    };

    // --- GERENCIAMENTO DE ESTADO (State Management) ---
    const AppState = {
        transacoes: [],
        tipoSelecionado: null,
        chartInstance: null
    };

    // --- CAMADA DE DADOS (Repository Pattern) ---
    const SafeStorage = {
        get: (key, defaultValue) => {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                console.error(`[Storage Error] Falha ao ler ${key}:`, e);
                return defaultValue;
            }
        },
        set: (key, value) => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
                console.error(`[Storage Error] Falha ao salvar ${key}:`, e);
                AlertService.toast("❌ Erro de armazenamento (Disco cheio?)");
            }
        },
        getString: (key) => localStorage.getItem(key),
        setString: (key, value) => localStorage.setItem(key, value)
    };

    // --- CAMADA DE UI E UTILITÁRIOS ---
    const DOM = {
        get: (id) => document.getElementById(id),
        getValue: (id) => {
            const el = document.getElementById(id);
            return el ? el.value : "";
        },
        setValue: (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = val;
        },
        setText: (id, txt) => {
            const el = document.getElementById(id);
            if (el) el.innerText = txt;
        },
        setHtml: (id, html) => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = html;
        }
    };

    const AlertService = {
        toast: (msg) => {
            const t = DOM.get("toast");
            if (!t) return;
            t.innerText = msg;
            t.style.display = "block";
            // Limpa timeout anterior se houver (debounce simples)
            if (t.hideTimeout) clearTimeout(t.hideTimeout);
            t.hideTimeout = setTimeout(() => t.style.display = "none", 3000);
        }
    };

    // --- LOGICA DE NEGÓCIO (Core Domain) ---
    
    function init() {
        try {
            AppState.transacoes = SafeStorage.get(CONFIG.DB_KEY, []);
            aplicarTema();
            validarPremiumUI();
            fetchCambio(); // Async, não bloqueante
            render();
            setupListeners();
        } catch (error) {
            console.error("FATAL ERROR durante inicialização:", error);
            AlertService.toast("⚠️ Erro crítico ao iniciar aplicativo.");
        }
    }

    function setupListeners() {
        const btnConfirmar = DOM.get("btnConfirmarAcao");
        if (btnConfirmar) {
            btnConfirmar.onclick = () => {
                AppState.transacoes = [];
                SafeStorage.set(CONFIG.DB_KEY, AppState.transacoes);
                render();
                fecharConfirmacao();
                AlertService.toast("🗑️ Todos os dados foram apagados.");
            };
        }
    }

    function aplicarTema() {
        const savedTheme = SafeStorage.getString(CONFIG.THEME_KEY) || "light-theme";
        document.body.className = savedTheme;
    }

    function toggleTheme() {
        const novoTema = document.body.classList.contains("dark-theme") ? "light-theme" : "dark-theme";
        document.body.className = novoTema;
        SafeStorage.setString(CONFIG.THEME_KEY, novoTema);
        render(); // Re-renderiza para atualizar cores do gráfico se necessário
    }

    function setTipo(tipo) {
        AppState.tipoSelecionado = tipo;
        
        const btnRec = DOM.get('btnReceita');
        const btnDes = DOM.get('btnDespesa');
        
        if(btnRec) btnRec.className = 'btn-tipo' + (tipo === 'receita' ? ' active-receita' : '');
        if(btnDes) btnDes.className = 'btn-tipo' + (tipo === 'despesa' ? ' active-despesa' : '');
    }

    function salvarTransacao() {
        try {
            const desc = DOM.getValue("descricao").trim();
            const valor = parseFloat(DOM.getValue("valor"));
            
            // Validação Robusta
            if (!desc) { AlertService.toast("⚠️ Digite uma descrição."); return; }
            if (isNaN(valor) || valor <= 0) { AlertService.toast("⚠️ Valor inválido."); return; }
            if (!AppState.tipoSelecionado) { AlertService.toast("⚠️ Selecione Receita ou Despesa."); return; }

            const nova = {
                id: Date.now(),
                desc: desc.toUpperCase(), // Padronização
                valor: valor,
                tipo: AppState.tipoSelecionado,
                data: new Date().toLocaleDateString('pt-BR')
            };

            AppState.transacoes.unshift(nova);
            SafeStorage.set(CONFIG.DB_KEY, AppState.transacoes);
            
            // Reset UI
            DOM.setValue("descricao", "");
            DOM.setValue("valor", "");
            setTipo(null);
            
            render();
            AlertService.toast("✅ Salvo com sucesso!");
        } catch (e) {
            console.error(e);
            AlertService.toast("❌ Erro ao salvar.");
        }
    }

    function removerItem(id) {
        if(!confirm("Deseja realmente excluir este item?")) return;
        AppState.transacoes = AppState.transacoes.filter(t => t.id !== id);
        SafeStorage.set(CONFIG.DB_KEY, AppState.transacoes);
        render();
    }

    function isPremium() {
        return SafeStorage.getString(CONFIG.PREMIUM_KEY) === CONFIG.PREMIUM_TOKEN;
    }

    // --- FUNCIONALIDADES PREMIUM ---

    function exportarBackup() {
        if (!isPremium()) { abrirLicenca(); return; }
        try {
            const payload = btoa(JSON.stringify({ app: "FS-PRO", version: "2.0", data: AppState.transacoes }));
            const blob = new Blob([payload], {type: "text/plain"});
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = `BACKUP_FS_${Date.now()}.faststile`;
            a.click();
            AlertService.toast("📦 Backup exportado!");
        } catch (e) {
            AlertService.toast("❌ Erro ao gerar backup.");
        }
    }

    function tentarImportar() {
        if (!isPremium()) { abrirLicenca(); return; }
        const input = DOM.get('inputImport');
        if(input) input.click();
    }

    function importarBackup(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                // Validação de Integridade do Backup
                const decoded = atob(e.target.result);
                const backup = JSON.parse(decoded);
                
                if (backup.app === "FS-PRO" && Array.isArray(backup.data)) {
                    AppState.transacoes = backup.data;
                    SafeStorage.set(CONFIG.DB_KEY, AppState.transacoes);
                    render();
                    AlertService.toast("✅ Dados restaurados com sucesso!");
                } else {
                    throw new Error("Formato inválido");
                }
            } catch (err) { 
                console.error(err);
                AlertService.toast("❌ Arquivo de backup inválido ou corrompido."); 
            }
        };
        reader.readAsText(file);
    }

    function gerarPDF() {
        if (!isPremium()) { abrirLicenca(); return; }
        AlertService.toast("⏳ Processando PDF...");
        
        const target = DOM.get("pdf-template");
        if(!target) return;

        let r = 0, d = 0;
        AppState.transacoes.forEach(t => t.tipo === 'receita' ? r += t.valor : d += t.valor);

        // Renderização segura do template
        target.innerHTML = `
            <div style="padding:40px; background:#fff; width:210mm; font-family:sans-serif;">
                <div style="border-bottom:4px solid #0f172a; padding-bottom:10px; margin-bottom:20px;">
                    <h1 style="margin:0;">FASTSTILE PRO</h1>
                    <p>Relatório Gerado em: ${new Date().toLocaleDateString('pt-BR')}</p>
                </div>
                <div style="display:flex; gap:20px; margin-bottom:30px;">
                    <div style="flex:1; padding:15px; background:#f8fafc; border:1px solid #ddd;">RECEITAS: <b>R$ ${r.toFixed(2)}</b></div>
                    <div style="flex:1; padding:15px; background:#f8fafc; border:1px solid #ddd;">DESPESAS: <b>R$ ${d.toFixed(2)}</b></div>
                    <div style="flex:1; padding:15px; background:#0f172a; color:#fff;">SALDO: <b>R$ ${(r-d).toFixed(2)}</b></div>
                </div>
                <table style="width:100%; border-collapse:collapse;">
                    <tr style="background:#f1f5f9;">
                        <th style="padding:10px; text-align:left;">Data</th>
                        <th style="padding:10px; text-align:left;">Descrição</th>
                        <th style="padding:10px; text-align:right;">Valor</th>
                    </tr>
                    ${AppState.transacoes.map(t => `
                        <tr style="border-bottom:1px solid #eee;">
                            <td style="padding:10px;">${t.data}</td>
                            <td style="padding:10px;">${t.desc}</td>
                            <td style="padding:10px; text-align:right; color:${t.tipo==='receita'?'#10b981':'#f43f5e'}">
                                ${t.tipo==='receita'?'':'-'} R$ ${t.valor.toFixed(2)}
                            </td>
                        </tr>
                    `).join('')}
                </table>
            </div>`;

        // Verifica dependência externa
        if(typeof html2pdf === 'undefined') {
            AlertService.toast("❌ Erro: Biblioteca PDF não carregada.");
            return;
        }

        const opt = { 
            margin: 0, filename: `Extrato_FS_${Date.now()}.pdf`,
            html2canvas: { scale: 2, windowWidth: 800, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        setTimeout(() => {
            html2pdf().set(opt).from(target).save()
                .then(() => {
                    target.innerHTML = "";
                    AlertService.toast("✅ PDF Baixado!");
                })
                .catch(err => {
                    console.error(err);
                    AlertService.toast("❌ Erro ao renderizar PDF.");
                });
        }, 600);
    }

    // --- RENDER ENGINE ---
    function render() {
        const lista = DOM.get("listaTransacoes");
        if (!lista) return;
        
        lista.innerHTML = "";
        let r = 0, d = 0;

        // Fragmento para melhor performance de DOM
        const fragment = document.createDocumentFragment();

        AppState.transacoes.forEach(t => {
            if (t.tipo === 'receita') r += t.valor; else d += t.valor;
            
            const li = document.createElement("li");
            li.className = "item-transacao";
            // Tratamento contra XSS: usar textContent para inputs do usuário se possível, 
            // mas aqui mantemos estrutura HTML controlada
            li.innerHTML = `
                <div>
                    <div style="font-weight:700;">${escapeHtml(t.desc)}</div>
                    <div style="font-size:0.75rem; color:var(--text-sub)">${t.data}</div>
                </div>
                <div style="display:flex; gap:12px; align-items:center;">
                    <span style="font-weight:800; color:${t.tipo==='receita'?'var(--accent)':'var(--danger)'}">
                    ${t.tipo==='receita'?'+':'-'} R$ ${t.valor.toFixed(2)}</span>
                    <button class="btn-delete-item" data-id="${t.id}" style="border:none; background:none; color:#ccc; cursor:pointer;">✕</button>
                </div>`;
            fragment.appendChild(li);
        });

        lista.appendChild(fragment);

        // Delegation para delete buttons (Performance)
        const deleteButtons = lista.querySelectorAll('.btn-delete-item');
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', () => removerItem(parseInt(btn.getAttribute('data-id'))));
        });

        DOM.setText("totalRendas", "R$ " + r.toFixed(2));
        DOM.setText("totalDespesas", "R$ " + d.toFixed(2));
        DOM.setText("saldoTotal", "R$ " + (r-d).toFixed(2));
        
        const percent = (r+d) > 0 ? Math.round((r/(r+d))*100) : 0;
        DOM.setText("saldoPercent", percent + "%");
        
        atualizarGrafico(r, d);
    }

    function escapeHtml(text) {
        if(!text) return "";
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function atualizarGrafico(r, d) {
        const canvas = DOM.get('graficoFinanceiro');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        if (typeof Chart === 'undefined') return;

        if (AppState.chartInstance) {
            AppState.chartInstance.destroy();
        }

        AppState.chartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: { 
                datasets: [{ 
                    data: (r+d) > 0 ? [r,d] : [1,0], 
                    backgroundColor: (r+d) > 0 ? ['#10b981','#f43f5e'] : ['#e2e8f0','#e2e8f0'], 
                    borderWidth: 0, 
                    cutout:'85%', 
                    borderRadius: 10 
                }] 
            },
            options: { 
                plugins: { legend: { display: false }, tooltip: { enabled: (r+d) > 0 } },
                animation: { duration: 500 }
            }
        });
    }

    // --- API & SISTEMA ---
    async function fetchCambio() {
        try {
            // Timeout para evitar hang
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const res = await fetch(CONFIG.API_URL, { signal: controller.signal });
            clearTimeout(timeoutId);

            if(!res.ok) throw new Error("API Response not ok");

            const data = await res.json();
            const bid = parseFloat(data.USDBRL.bid);
            
            const el = DOM.get("miniConverter");
            if(el) el.innerHTML = `💵 USD <b>R$ ${bid.toFixed(2)}</b>`;
        } catch (e) {
            const el = DOM.get("miniConverter");
            if(el) el.innerText = "USD Offline";
        }
    }

    function ativarLicenca() {
        const input = DOM.get("chaveLicenca");
        if (!input) return;
        const chave = input.value.toUpperCase().trim();
        
        // Validação Regex Rígida
        if (/^FS-2026-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(chave)) {
            SafeStorage.setString(CONFIG.PREMIUM_KEY, CONFIG.PREMIUM_TOKEN);
            AlertService.toast("💎 Versão PRO Ativada!");
            setTimeout(() => location.reload(), 1000);
        } else { 
            AlertService.toast("❌ Chave Inválida"); 
        }
    }

    function validarPremiumUI() { 
        if(isPremium()) { 
            const btn = DOM.get("btnPremiumStatus");
            if(btn) { 
                btn.innerText = "💎 Plano PRO"; 
                btn.style.background = "var(--primary)"; 
                btn.style.color = "#fff"; 
                btn.onclick = null; // Remove click handler
                btn.style.cursor = "default";
            }
        } 
    }

    // Helpers UI
    function abrirLicenca() { const el = DOM.get("modalLicenca"); if(el) el.style.display = "flex"; }
    function fecharLicenca() { const el = DOM.get("modalLicenca"); if(el) el.style.display = "none"; }
    function abrirConfirmacao() { const el = DOM.get("modalConfirmacao"); if(el) el.style.display = "flex"; }
    function fecharConfirmacao() { const el = DOM.get("modalConfirmacao"); if(el) el.style.display = "none"; }

    // --- INITIALIZE ---
    document.addEventListener("DOMContentLoaded", init);

    // --- EXPOSIÇÃO PÚBLICA (Para o HTML acessar) ---
    return {
        toggleTheme,
        setTipo,
        salvarTransacao,
        exportarBackup,
        tentarImportar,
        importarBackup,
        gerarPDF,
        ativarLicenca,
        abrirLicenca,
        fecharLicenca,
        abrirConfirmacao,
        fecharConfirmacao,
        removerItem
    };
})();

// Expor métodos para o escopo global (Window) para compatibilidade com onclick="" do HTML
Object.keys(AppModule).forEach(key => {
    window[key] = AppModule[key];
});
