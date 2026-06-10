# AutoMail XP

Construtor de e-mails operacionais para assessores de investimentos da XP. O assessor preenche os dados do cliente e das operações, e a ferramenta monta o e-mail automaticamente no formato correto, pronto para exportar como `.eml` e abrir diretamente no Outlook.

---

## Funcionalidades

- **Geração automática de e-mail** com saudação por horário (Bom dia / Boa tarde)
- **Suporte a múltiplas operações** por e-mail, com agrupamento inteligente
- **Operações suportadas:**
  - Resgate: Renda Fixa, Fundo, Tesouro Direto, Compromissada
  - Aplicação: Renda Fixa, LCA Liquidez Diária, Fundo, Tesouro Direto, Compromissada
  - Transferência
- **Agrupamento de operações do mesmo tipo** — dois resgates de Fundo geram uma única tabela com duas linhas
- **Assunto gerado automaticamente** no formato `Resgate e Aplicação - 123456`
- **Exportação `.eml`** para abrir direto no Outlook e enviar ao cliente
- **Cópia de assunto e HTML** para uso em outros clientes de e-mail
- **Prévia do e-mail** renderizada na própria página
- **Tema escuro e claro**

---

## Estrutura do Projeto

```
automail-xp/
├── index.html   # Estrutura HTML da interface
├── style.css    # Estilos (tema escuro/claro, componentes)
├── config.js    # Configurações dos templates de e-mail
└── app.js       # Lógica da aplicação
```

---

## Como usar

1. Abra `index.html` em qualquer navegador moderno
2. Preencha os dados do cliente (nome, código XP, e-mail, assessor)
3. Clique em **Adicionar Ativo** e selecione o tipo de operação e ativo
4. Preencha os campos da operação
5. Repita para quantas operações forem necessárias (use ▲▼ para reordenar)
6. Clique em **⚡ Gerar E-mail**
7. Visualize a prévia, copie o assunto e clique em **📧 Abrir no Outlook** para exportar o `.eml`

> O arquivo `.eml` abre no Outlook como rascunho preenchido, pronto para revisão e envio.

---

## Editando os Templates

Os templates (títulos de tabelas, colunas, valores padrão, emissores de LCA) são configurados em `config.js`. Você pode editar o arquivo diretamente, ou usar o **AutoMailXP_Admin.html** para fazer as edições de forma visual e exportar um novo `config.js` / `index.html` atualizado.

---

## Compatibilidade de E-mail

O HTML gerado é compatível com **Outlook Clássico** e **Novo Outlook** simultaneamente. As técnicas utilizadas:

- `cellpadding` e `cellspacing` como atributos HTML (não CSS)
- `padding` + `mso-padding-alt` em todas as células
- `line-height` fixo para evitar expansão de linhas no Novo Outlook
- Fonte via CSS inline em cada elemento (nunca herdada)
- `border-collapse:collapse` nas tabelas
- Sem tabelas aninhadas dentro de `<td>`
- Sem classes ou `<style>` externo — tudo inline

---

## Requisitos

Nenhuma dependência externa. Roda diretamente no navegador, sem build, sem servidor.

- Navegador moderno com suporte a ES6+ (Chrome, Firefox, Edge, Safari)
- Fontes carregadas via Google Fonts (requer conexão na primeira abertura)

---

## Deploy no GitHub Pages / GitLab Pages

Por ser um projeto puramente estático, basta subir os 4 arquivos no repositório e habilitar o Pages apontando para a raiz (`/`) ou branch `main`.
