:root {
  --primary: #0f172a; --accent: #10b981; --danger: #f43f5e; --bg: #f8fafc;
  --card: #ffffff; --text: #0f172a; --text-sub: #64748b; --border: #e2e8f0;
  --gold: #f59e0b; --shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); --blue: #3b82f6;
  --radius: 20px;
}
body.dark-theme {
  --bg: #020617; --card: #0f172a; --text: #f8fafc; --text-sub: #94a3b8; --border: #1e293b;
}

* { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; -webkit-tap-highlight-color: transparent; }

body { background: var(--bg); color: var(--text); transition: 0.3s; line-height: 1.6; }

/* Header & Topo */
.topo { background: linear-gradient(135deg, var(--primary) 0%, #1e293b 100%); color: white; padding: 40px 20px 80px; text-align: center; }
.header-wrapper { max-width: 1100px; margin: 0 auto; }
.header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.brand-logo { font-weight: 800; letter-spacing: -1px; font-size: 1.2rem; }
.btn-icon { background: rgba(255,255,255,0.1); border: none; padding: 10px; border-radius: 12px; cursor: pointer; font-size: 18px; }
.btn-premium-toggle { background: var(--gold); border: none; padding: 8px 16px; border-radius: 50px; font-weight: 700; cursor: pointer; font-size: 0.85rem; }

.saldo-principal p { font-size: 0.9rem; opacity: 0.8; }
.saldo-principal h1 { font-size: 2.5rem; font-weight: 800; margin-top: 5px; }

/* Layout Responsivo */
.container { max-width: 1100px; margin: -50px auto 40px; padding: 0 20px; }
.main-grid { display: grid; grid-template-columns: 1fr; gap: 20px; }

@media (min-width: 850px) {
    .main-grid { grid-template-columns: 450px 1fr; align-items: start; }
    .topo { padding: 60px 20px 100px; }
    .saldo-principal h1 { font-size: 3.2rem; }
}

/* Cards */
.card { background: var(--card); border-radius: var(--radius); padding: 24px; border: 1px solid var(--border); box-shadow: var(--shadow); height: fit-content; }
.card h3 { font-size: 1.1rem; margin-bottom: 15px; font-weight: 700; }

.dashboard { display: flex; align-items: center; gap: 25px; }
.chart-container { position: relative; width: 120px; height: 120px; flex-shrink: 0; }
.chart-center-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); font-weight: 800; font-size: 1.2rem; }

.resumo-mini { flex: 1; }
.item-resumo { display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 8px; }
.total-line { border-top: 1px solid var(--border); margin-top: 10px; }

/* Inputs */
.input-group { display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px; }
input { background: var(--bg); border: 1px solid var(--border); color: var(--text); padding: 14px; border-radius: 14px; outline: none; font-size: 1rem; width: 100%; }

.botoes-tipo { display: flex; gap: 10px; margin-bottom: 15px; }
.btn-tipo { flex: 1; padding: 14px; border-radius: 14px; border: 1px solid var(--border); background: var(--card); color: var(--text-sub); font-weight: 700; cursor: pointer; transition: 0.2s; }
.active-receita { background: var(--accent) !important; color: white !important; border-color: var(--accent) !important; }
.active-despesa { background: var(--danger) !important; color: white !important; border-color: var(--danger) !important; }

.btn-adicionar { width: 100%; padding: 16px; border-radius: 16px; border: none; background: var(--primary); color: white; font-weight: 800; cursor: pointer; transition: 0.2s; }
.btn-adicionar:hover { opacity: 0.9; transform: translateY(-1px); }

/* Tools Grid */
.ferramentas-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 5px; }
.tool-card { padding: 12px; border-radius: 16px; border: none; color: white; font-weight: 700; font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.2s; }
.tool-card:active { transform: scale(0.96); }

.btn-pdf { background: var(--blue); }
.btn-backup { background: var(--accent); }
.btn-restore { background: var(--primary); }
.btn-danger-soft { background: #fee2e2; color: var(--danger) !important; }
.btn-privacy { background: var(--border); color: var(--text-sub) !important; grid-column: span 2; }

/* Lista de Itens */
.lista-limpa { list-style: none; }
.item-transacao { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid var(--border); animation: slideIn 0.3s ease-out; }
@keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* Modais */
.modal { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: none; align-items: center; justify-content: center; z-index: 9999; padding: 20px; backdrop-filter: blur(8px); }
.modal-content { background: var(--card); padding: 30px; border-radius: 28px; width: 100%; max-width: 400px; text-align: center; }
.premium-badge { background: var(--gold); color: #000; width: fit-content; margin: 0 auto 15px; padding: 5px 15px; border-radius: 20px; font-weight: 800; font-size: 0.7rem; }

/* Helpers */
.txt-accent { color: var(--accent); }
.txt-danger { color: var(--danger); }
#toast { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); background: #000; color: #fff; padding: 12px 25px; border-radius: 50px; display: none; font-size: 13px; font-weight: 700; z-index: 10000; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }

/* Fix PDF */
#pdf-template { background: white; width: 210mm; min-height: 297mm; }
