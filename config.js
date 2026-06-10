/**
 * config.js — AutoMail XP
 *
 * Configurações de templates de e-mail: títulos de tabelas, colunas,
 * valores padrão, emissores fixos e textos de rodapé.
 *
 * Para editar os templates de forma visual, utilize o AutoMailXP_Admin.html.
 */

const CFG = {
  // Textos gerais
  fechamento: "Fico à disposição.",
  antesAssinatura: "Atenciosamente,",

  // Resgate — Renda Fixa
  rrfTitle: "RENDA FIXA RESGATE COTADO - SAÍREMOS COM TAXA A MERCADO",
  rrfCols: [
    "Emissor",
    "Ativo",
    "Venc.",
    "Preço Unitário do Título",
    "Quantidade Aprox.",
    "Valor a ser resgatado/cotado (em caso de cotação)"
  ],
  rrfDefaultPu: "A MERCADO",

  // Resgate — Fundo
  rfundoTitle: "RESGATE FUNDO",
  rfundoCols: ["Fundo", "Cotização", "Liquidação", "Valor a ser resgatado"],

  // Resgate — Tesouro
  rtesTitle: "RESGATE TESOURO DIRETO",
  rtesCols: ["Título", "Vencimento", "Valor a ser resgatado"],

  // Resgate — Compromissada
  rcompOperacao: "Renda Fixa Compromissada XP Investimentos",
  rcompTipo: "Venda",
  rcompIr: "22,5%",
  rcompIof: "Não há",

  // Aplicação — Renda Fixa
  arfTitle: "RENDA FIXA APLICAÇÃO",
  arfCols: [
    "EMISSOR",
    "ATIVO",
    "CARÊNCIA",
    "VENCIMENTO",
    "TAXA DE NEGOCIAÇÃO APROXIMADA",
    "P.U. APROXIMADO",
    "VALOR FINANCEIRO LIMITE"
  ],
  arfDefaultPu: "A MERCADO",

  // Aplicação — LCA Liquidez Diária
  alcaTitle: "RENDA FIXA APLICAÇÃO",
  alcaCols: [
    "EMISSOR",
    "ATIVO",
    "CARÊNCIA",
    "VENCIMENTO",
    "TAXA DE NEGOCIAÇÃO",
    "P.U. APROXIMADO"
  ],
  alcaDefaultTaxa: "87% CDI",
  lcaEmitters: [
    ["LCA BANCO ABC",            "LCA", "DIÁRIA", "DIÁRIA"],
    ["LCA BANCO BOCOM BBM SA",   "LCA", "DIÁRIA", "DIÁRIA"],
    ["LCA BANCO BV S/A",         "LCA", "DIÁRIA", "DIÁRIA"],
    ["LCA BANCO JOHN DEERE S.A.","LCA", "DIÁRIA", "DIÁRIA"],
    ["LCA BNDES",                "LCA", "DIÁRIA", "DIÁRIA"],
    ["LCA RABOBANK",             "LCA", "DIÁRIA", "DIÁRIA"],
    ["LCI POUPEX",               "LCI", "DIÁRIA", "DIÁRIA"],
    ["LCD BNDES",                "LCD", "DIÁRIA", "DIÁRIA"]
  ],
  alcaTextoPos: "Informo que será aplicado o saldo em conta no valor aproximado de R$ {valorTotal} entre os ativos acima, de acordo com a disponibilidade.",

  // Aplicação — Fundo
  afundoTitle: "APLICAÇÃO",
  afundoCols: ["Fundo", "Cotização", "Liquidação", "Valor a ser aplicado"],

  // Aplicação — Tesouro
  atesTitle: "APLICAÇÃO TESOURO – APLICAREMOS COM TAXA A MERCADO",
  atesCols: [
    "Título",
    "Rent. a.a.",
    "Vencimento",
    "Pagamento de juros",
    "Quantidade",
    "Valor a ser aplicado"
  ],

  // Aplicação — Compromissada
  acompOperacao: "Compromissada XP Investimentos",
  acompTipo: "Compra",
  acompIr: "22,5%",

  // Transferência
  transfTexto: "Informo que enviaremos o valor aproximado de R$ {valor} para a sua conta cadastrada no Banco {banco} (Agência: {agencia} | Conta: {conta})."
};
