const STORAGE_KEY = "faststile_data";
let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

function salvar() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
  atualizar();
}

function adicionar() {
  const desc = descricao.value;
  const val = parseFloat(valor.value);
  const tipo = tipo.value;

  if (!desc || !val) return;

  dados.push({ desc, val, tipo });
  salvar();
}

function atualizar() {
  lista.innerHTML = "";
  let r = 0, d = 0;

  dados.forEach((i) => {
    i.tipo === "renda" ? r += i.val : d += i.val;
    lista.innerHTML += `<li>${i.desc} - R$ ${i.val.toFixed(2)}</li>`;
  });

  totalRenda.textContent = `R$ ${r.toFixed(2)}`;
  totalDespesa.textContent = `R$ ${d.toFixed(2)}`;
  saldoTotal.textContent = `R$ ${(r-d).toFixed(2)}`;
}

function exportarPDF() {
  html2pdf().set({
    margin: 10,
    filename: `FastStile-Relatorio-${Date.now()}.pdf`,
    html2canvas: { scale: 3 },
    jsPDF: { unit: 'mm', format: 'a4' }
  }).from(document.getElementById("conteudoPDF")).save();
}

function exportarBackup() {
  const blob = new Blob([JSON.stringify(dados)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "faststile-backup.json";
  a.click();
}

function importarBackup() {
  const input = document.createElement("input");
  input.type = "file";
  input.onchange = e => {
    const file = e.target.files[0];
    file.text().then(t => {
      dados = JSON.parse(t);
      salvar();
    });
  };
  input.click();
}

function resetar() {
  if (confirm("Resetar tudo?")) {
    dados = [];
    salvar();
  }
}

atualizar();