# 🚀 FastStile Financeiro Pro

![Versão](https://img.shields.io/badge/Vers%C3%A3o-2.0.0--PRO-10b981)
![Licença](https://img.shields.io/badge/Licen%C3%A7a-Propriet%C3%A1ria-0f172a)
![Plataforma](https://img.shields.io/badge/Plataforma-Android%20%7C%20iOS%20%7C%20Web-blue)

**FastStile** é uma solução de alta performance para gestão financeira pessoal, desenhada com foco em **privacidade absoluta** e **experiência do usuário (UX) premium**. Diferente de outros apps, o FastStile processa e armazena todos os dados localmente, garantindo que suas informações bancárias nunca saiam do seu dispositivo.

---

## 💎 Diferenciais do Produto

* **Soberania de Dados:** 100% Offline. Sem bancos de dados em nuvem, sem rastreadores.
* **Relatórios Executivos:** Geração de PDF em nível bancário para análise de fluxo de caixa.
* **Segurança Integrada:** Proteção contra inspeção de código e engenharia reversa via `App.js`.
* **PWA Ready:** Instalável diretamente no Android e iOS com suporte a Service Workers para funcionamento sem internet.

---

## 🛠️ Arquitetura Técnica

O projeto foi segmentado em módulos para facilitar a manutenção e a subida para as lojas oficiais:

* **`index.html`**: Estrutura semântica e interface mobile-first.
* **`App.js`**: Motor de inicialização, registro de PWA e camadas de segurança.
* **`script.js`**: Lógica de negócios, cálculos financeiros e motor de renderização de PDF.
* **`style.css`**: Design System moderno baseado em cores "Fintech" (Navy Blue & Emerald).
* **`sw.js`**: Gerenciamento de cache e capacidades offline.

---

## ⚖️ Proteção Jurídica e Licença

Este software está protegido sob as leis de propriedade intelectual vigentes:
1.  **Lei de Software (Nº 9.609/98)**: Protege a originalidade do código-fonte aqui apresentado.
2.  **Lei de Direitos Autorais (Nº 9.610/98)**: Resguarda o design e a marca FastStile.

**Licença:** Uso Proprietário. A cópia, redistribuição ou comercialização sem autorização expressa do autor (C. Silva) é proibida.

---

## 📱 Como Publicar nas Lojas

### Google Play Store (Android)
1. Use o [PWABuilder](https://www.pwabuilder.com/) para gerar o arquivo `.aab`.
2. Envie o pacote para o Google Play Console.
3. Utilize o link do arquivo `privacy.html` deste repositório como sua Política de Privacidade oficial.

### Apple App Store (iOS)
1. Integre este código com **Capacitor** ou **Cordova**.
2. Compile o projeto via Xcode em um ambiente macOS.
3. Submeta para revisão da Apple seguindo as diretrizes de privacidade local.

---

## 👤 Autor
Desenvolvido por **C. Silva** (2026).
*Focado em criar soluções que devolvem o controle dos dados ao usuário.*
