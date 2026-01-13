"use strict";

const DB_KEY="FastStile_DB";
const PREMIUM_KEY="FastStile_Premium";
let transacoes=JSON.parse(localStorage.getItem(DB_KEY))||[];
let tipoSelecionado=null;

const isPremium=()=>localStorage.getItem(PREMIUM_KEY)==="true";
const toast=m=>{const t=document.getElementById("toast");t.innerText=m;t.style.display="block";setTimeout(()=>t.style.display="none",3000)};

function setTipo(t){tipoSelecionado=t}
function salvarTransacao(){
  if(!tipoSelecionado)return toast("Selecione tipo");
  const d=descricao.value,v=parseFloat(valor.value);
  if(!d||!v)return toast("Campos inválidos");
  transacoes.unshift({id:Date.now(),desc:d,valor:v,tipo:tipoSelecionado,data:new Date().toLocaleDateString()});
  localStorage.setItem(DB_KEY,JSON.stringify(transacoes));
  render();
}
function render(){
  listaTransacoes.innerHTML="";
  transacoes.forEach(t=>{
    const li=document.createElement("li");
    li.innerHTML=`${t.data} - ${t.desc} - ${t.valor.toFixed(2)}`;
    listaTransacoes.appendChild(li);
  });
}

function gerarPDF(){
  if(!isPremium())return abrirLicenca();
  html2pdf().from(document.body).save("extrato.pdf");
}

async function exportarBackup(){
  if(!isPremium())return abrirLicenca();
  const blob=new Blob([JSON.stringify(transacoes)],{type:"application/json"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="backup.fsbackup";
  a.click();
}

function importarBackup(){
  if(!isPremium())return abrirLicenca();
  backupFileInput.click();
}

backupFileInput.onchange=async e=>{
  const file=e.target.files[0];
  transacoes=JSON.parse(await file.text());
  localStorage.setItem(DB_KEY,JSON.stringify(transacoes));
  render();
};

function ativarLicenca(){
  localStorage.setItem(PREMIUM_KEY,"true");
  location.reload();
}

function abrirLicenca(){modalLicenca.style.display="flex"}
function resetar(){localStorage.clear();location.reload()}

render();