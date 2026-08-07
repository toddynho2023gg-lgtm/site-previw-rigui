/**
 * WHITE-LABEL CONFIGURATION
 *
 * To create a site for another clinic, edit this file and replace the files in
 * public/brand. Components, layout and animations should not need changes.
 */

export type FeatureFlag =
  | "beforeAfter"
  | "treatments"
  | "units"
  | "gallery"
  | "timeline"
  | "faq"
  | "floatingWhatsApp"
  | "mobileBookingBar";

export type IconName =
  | "building"
  | "message"
  | "heartHandshake"
  | "shield"
  | "book"
  | "heartPulse"
  | "mapPin"
  | "smile"
  | "sparkles";

export type UnitAccent = "primary" | "secondary";

export type ClinicUnitConfig = {
  id: string;
  number: string;
  name: string;
  neighborhood: string;
  address: string;
  shortAddress: string;
  phone: string;
  phoneHref: string;
  whatsapp: string;
  whatsappHref: string;
  whatsappMessage: string;
  googleMapsUrl: string;
  structuredAddress: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    addressCountry: string;
  };
  accent: UnitAccent;
};

export const clinic = {
  name: "Rigui Odontologia",
  shortName: "Rigui",
  categoryLabel: "Odontologia",
  slogan: "Trazendo a cultura da saúde bucal!",
  description:
    "Cuidado próximo, prevenção e atenção para você sorrir com mais saúde e confiança.",
  city: "Gravataí",
  state: "RS",
  country: "Brasil",
  countryCode: "BR",
  locale: "pt-BR",
  copyrightYear: 2026,
  primaryWhatsapp: {
    display: "(51) 99690-1101",
    href: "https://wa.me/5551996901101",
    message:
      "Olá! Conheci a Rigui Odontologia pelo site e gostaria de agendar uma avaliação.",
  },
  phoneNumbers: ["(51) 3424-0101", "(51) 3043-5616"],
  navigation: [
    { label: "Início", href: "#inicio", id: "inicio" },
    { label: "Nossa proposta", href: "#proposta", id: "proposta" },
    {
      label: "Tratamentos",
      href: "#tratamentos",
      id: "tratamentos",
      feature: "treatments",
    },
    {
      label: "Resultados",
      href: "#resultados",
      id: "resultados",
      feature: "beforeAfter",
    },
    {
      label: "Galeria",
      href: "#galeria",
      id: "galeria",
      feature: "gallery",
    },
    {
      label: "Experiência",
      href: "#experiencia",
      id: "experiencia",
      feature: "timeline",
    },
    {
      label: "Unidades",
      href: "#unidades",
      id: "unidades",
      feature: "units",
    },
    {
      label: "Dúvidas",
      href: "#duvidas",
      id: "duvidas",
      feature: "faq",
    },
  ],
  actions: {
    schedule: "Agendar avaliação",
    scheduleLong: "Agendar uma avaliação",
    chooseUnitAria: "Escolher unidade para conversar no WhatsApp",
    whatsappAria: "Conversar pelo WhatsApp",
    call: "Ligar",
    directions: "Como chegar",
    whatsapp: "Conversar no WhatsApp",
    whatsappNow: "Conversar agora",
    backToTop: "Voltar ao topo",
  },
  accessibility: {
    primaryNavigation: "Navegação principal",
    mobileNavigation: "Navegação mobile",
    mainMenu: "Menu principal",
    openMenu: "Abrir menu",
    closeMenu: "Fechar menu",
    backHome: "Voltar ao início",
    compareProcedure: "Comparar antes e depois de {{procedureName}}",
    afterVisible: "{{value}}% da imagem de depois visível",
    callUnit: "Ligar para {{unitName}}",
    mapsRoute: "Ver rota para {{unitName}} no Google Maps",
  },
  hero: {
    eyebrow: "Rigui Odontologia",
    titlePrefix: "Trazendo a",
    titleHighlight: "cultura",
    titleSuffix: "da saúde bucal!",
    description:
      "Cuidado próximo, prevenção e atenção para você sorrir com mais saúde e confiança.",
    primaryCta: "Agendar uma avaliação",
    secondaryCta: "Conhecer as unidades",
    secondaryHref: "#unidades",
    scrollLabel: "Descubra a experiência Rigui",
    imageAlt:
      "Consultório odontológico da Rigui Odontologia com cadeira e equipamentos de atendimento",
  },
  benefitsLabel: "Diferenciais da clínica",
  benefits: [
    {
      icon: "building",
      title: "{{unitCountLabel}}",
      copy: "Em {{city}}",
    },
    {
      icon: "message",
      title: "Agendamento direto",
      copy: "Pelo WhatsApp",
    },
    {
      icon: "heartHandshake",
      title: "Cuidado próximo",
      copy: "E acolhedor",
    },
  ],
  marquee: [
    "{{shortName}}",
    "Saúde bucal",
    "Cuidado próximo",
    "{{unitCountLabel}} em {{city}}",
    "Sorrir com confiança",
  ],
  culture: {
    eyebrow: "Nossa proposta",
    title: "Saúde bucal faz parte da sua rotina.",
    description:
      "Cuidar do sorriso não começa apenas no consultório. Começa com informação, prevenção e escolhas que acompanham você todos os dias.",
    cardKicker: "Cultura Rigui",
    items: [
      {
        number: "01",
        title: "Prevenir",
        copy: "Cuidados constantes ajudam a manter a saúde bucal em dia.",
        icon: "shield",
      },
      {
        number: "02",
        title: "Entender",
        copy: "Informação clara torna cada decisão mais tranquila.",
        icon: "book",
      },
      {
        number: "03",
        title: "Cuidar",
        copy: "Um acompanhamento próximo ajuda você a sorrir com mais confiança.",
        icon: "heartPulse",
      },
    ],
  },
  treatmentsSection: {
    eyebrow: "Tratamentos",
    title: "Cuidado pensado para cada sorriso.",
    description:
      "Conheça os tratamentos disponibilizados pela clínica e converse com a equipe para saber qual cuidado é adequado para você.",
  },
  beforeAfterSection: {
    eyebrow: "Comparação interativa",
    title: "Veja a diferença em cada detalhe.",
    description:
      "Arraste a barra sobre cada imagem para comparar o antes e o depois.",
    beforeLabel: "ANTES",
    afterLabel: "DEPOIS",
    beforePlaceholder: "Adicionar imagem do antes",
    afterPlaceholder: "Adicionar imagem do depois",
    disclaimer:
      "Imagens ilustrativas. Os resultados podem variar conforme cada caso. Uma avaliação profissional é necessária para definir o cuidado adequado.",
  },
  gallerySection: {
    eyebrow: "Nossa clínica",
    title: "Conheça nossos espaços.",
    description: "Ambientes preparados para receber você com conforto e cuidado.",
  },
  experience: {
    eyebrow: "Experiência Rigui",
    title: "Começar a cuidar do seu sorriso é simples.",
    steps: [
      {
        number: "01",
        title: "Escolha sua unidade",
        copy: "Encontre a opção mais conveniente para você.",
        icon: "mapPin",
      },
      {
        number: "02",
        title: "Fale com a equipe",
        copy: "Tire suas dúvidas diretamente pelo WhatsApp.",
        icon: "message",
      },
      {
        number: "03",
        title: "Agende seu atendimento",
        copy: "Combine o melhor momento para cuidar do seu sorriso.",
        icon: "smile",
      },
    ],
  },
  unitsSection: {
    eyebrow: "{{unitCountLabel}} em {{city}}",
    title: "Encontre a {{shortName}} mais próxima de você.",
    description: "Escolha sua unidade e converse diretamente com a equipe.",
    unitLabel: "Unidade",
    copyAddressAria: "Copiar endereço da {{unitName}}",
    addressCopied: "Endereço copiado",
  },
  faqSection: {
    eyebrow: "Informação clara",
    title: "Dúvidas frequentes",
    description: "Respostas rápidas para ajudar você a dar o próximo passo.",
  },
  finalCta: {
    eyebrow: "Seu sorriso merece cuidado",
    title: "Seu próximo sorriso começa com uma conversa.",
    description:
      "Escolha a unidade mais próxima e fale agora com a equipe da {{shortName}}.",
    button: "Quero agendar minha avaliação",
  },
  unitSelector: {
    kicker: "Agendamento direto",
    title: "Qual unidade fica melhor para você?",
    intro: "Escolha uma unidade para abrir a conversa com a mensagem já preenchida.",
    menuLabel: "Escolha a unidade",
    note: "Você será direcionado ao WhatsApp da unidade escolhida.",
    closeAria: "Fechar seletor de unidades",
  },
  footer: {
    description:
      "Cuidado próximo, informação e prevenção em {{unitCountLabelLower}} de {{city}}.",
    navigationTitle: "Navegação",
    copyrightSuffix: "Todos os direitos reservados.",
  },
} as const;

export const theme = {
  primary: "#8D6A2D",
  primaryDark: "#5A421B",
  primaryDeep: "#252A30",
  accent: "#D5B76B",
  secondary: "#A7B0B8",
  background: "#F4F1EA",
  surface: "#FEFEFE",
  warm: "#E8E0D3",
  text: "#24282D",
  muted: "#666B70",
  whatsapp: "#25D366",
} as const;

export const assets = {
  logo: "/brand/logo.webp",
  hero: "/brand/hero.webp",
  ogImage: "/brand/og-image.webp",
  favicon: "/brand/logo.webp",
  gallery: [
    {
      src: "/brand/gallery/atendimento.webp",
      alt: "Profissional e paciente no consultório da Rigui Odontologia",
      width: 1152,
      height: 1536,
    },
    {
      src: "/brand/gallery/recepcao.webp",
      alt: "Área interna da Rigui Odontologia com identificação da clínica",
      width: 1152,
      height: 1536,
    },
    {
      src: "/brand/gallery/consultorio.webp",
      alt: "Consultório equipado da Rigui Odontologia",
      width: 1536,
      height: 1153,
    },
  ] as readonly { src: string; alt: string; width: number; height: number }[],
  dimensions: {
    logo: { width: 1254, height: 1254 },
    hero: { width: 1536, height: 1153 },
    ogImage: { width: 1536, height: 1153 },
  },
} as const;

export const units: readonly ClinicUnitConfig[] = [
  {
    id: "matriz",
    number: "01",
    name: "Matriz — Centro",
    neighborhood: "Centro",
    address: "Rua Anápio Gomes, 1581 Sala 202 — Centro — Gravataí/RS",
    shortAddress: "Rua Anápio Gomes, 1581, Sala 202",
    phone: "(51) 3424-0101",
    phoneHref: "tel:+555134240101",
    whatsapp: "(51) 99690-1101",
    whatsappHref: "https://wa.me/5551996901101",
    whatsappMessage:
      "Olá! Conheci a Rigui Odontologia pelo site e gostaria de agendar uma avaliação na unidade Matriz — Centro.",
    googleMapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Rua%20An%C3%A1pio%20Gomes%2C%201581%20Sala%20202%20%E2%80%94%20Centro%20%E2%80%94%20Gravata%C3%AD%2FRS",
    structuredAddress: {
      streetAddress: "Rua Anápio Gomes, 1581, Sala 202",
      addressLocality: "Gravataí",
      addressRegion: "RS",
      addressCountry: "BR",
    },
    accent: "primary",
  },
  {
    id: "filial",
    number: "02",
    name: "Filial — Parque dos Anjos",
    neighborhood: "Parque dos Anjos",
    address: "Rua Aristides Dávila, 10 Parque dos Anjos — Gravataí/RS",
    shortAddress: "Rua Aristides Dávila, 10",
    phone: "(51) 3043-5616",
    phoneHref: "tel:+555130435616",
    whatsapp: "(51) 98037-4747",
    whatsappHref: "https://wa.me/5551980374747",
    whatsappMessage:
      "Olá! Conheci a Rigui Odontologia pelo site e gostaria de agendar uma avaliação na unidade Filial — Parque dos Anjos.",
    googleMapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Rua%20Aristides%20D%C3%A1vila%2C%2010%20Parque%20dos%20Anjos%20%E2%80%94%20Gravata%C3%AD%2FRS",
    structuredAddress: {
      streetAddress: "Rua Aristides Dávila, 10",
      addressLocality: "Gravataí",
      addressRegion: "RS",
      addressCountry: "BR",
    },
    accent: "secondary",
  },
];

// Keep empty when the clinic has not supplied an official treatment list.
export const treatments = [] as readonly {
  id: string;
  title: string;
  description: string;
  icon: IconName;
}[];

export const beforeAfter = [
  {
    id: "clareamento",
    title: "Clareamento dental",
    description: "Comparação visual da tonalidade do sorriso.",
    before: "/brand/procedimentos/clareamento-antes.webp",
    after: "/brand/procedimentos/clareamento-depois.webp",
    placeholder: false,
  },
  {
    id: "alinhamento",
    title: "Alinhamento do sorriso",
    description: "Comparação visual da posição e harmonia dos dentes.",
    before: "/brand/procedimentos/alinhamento-antes.webp",
    after: "/brand/procedimentos/alinhamento-depois.webp",
    placeholder: false,
  },
  {
    id: "restauracao",
    title: "Restauração estética",
    description: "Comparação visual da recuperação estética do sorriso.",
    before: "/brand/procedimentos/restauracao-antes.webp",
    after: "/brand/procedimentos/restauracao-depois.webp",
    placeholder: false,
  },
] as const;

export const faq = [
  {
    question: "Como faço para agendar uma avaliação?",
    answer: "Escolha uma das unidades e converse diretamente com a equipe pelo WhatsApp.",
  },
  {
    question: "Qual unidade devo escolher?",
    answer: "Você pode escolher entre a Matriz, no Centro, e a Filial, no Parque dos Anjos.",
  },
  {
    question: "Posso conversar com a equipe antes de agendar?",
    answer: "Sim. Utilize o botão do WhatsApp para falar diretamente com a unidade desejada.",
  },
  {
    question: "Onde ficam as unidades?",
    answer:
      "A Matriz fica na Rua Anápio Gomes, 1581, sala 202, no Centro. A Filial fica na Rua Aristides Dávila, 10, no Parque dos Anjos, em Gravataí.",
  },
] as const;

export const seo = {
  title: "Rigui Odontologia | Saúde bucal em Gravataí",
  description:
    "Conheça a Rigui Odontologia, escolha entre as unidades Centro e Parque dos Anjos e agende seu atendimento em Gravataí.",
  canonicalUrl: "https://sorrisos-101-odontologia.nbx-ui-co.chatgpt.site",
  openGraph: {
    title: "Rigui Odontologia | Saúde bucal em Gravataí",
    description:
      "Escolha entre as unidades Centro e Parque dos Anjos e converse diretamente com a equipe.",
    locale: "pt_BR",
  },
  structuredData: {
    type: "Dentist",
    description:
      "Clínica odontológica com atendimento em Gravataí e agendamento direto pelo WhatsApp.",
    contactType: "customer service",
    availableLanguage: "Portuguese",
  },
} as const;

export const featureFlags = {
  beforeAfter: true,
  treatments: false,
  units: true,
  gallery: true,
  timeline: true,
  faq: true,
  floatingWhatsApp: true,
  mobileBookingBar: true,
} as const satisfies Record<FeatureFlag, boolean>;

export const clinicConfig = {
  clinic,
  theme,
  assets,
  units,
  treatments,
  beforeAfter,
  faq,
  seo,
  featureFlags,
} as const;

export type ClinicUnit = ClinicUnitConfig;
export type BeforeAfterItem = (typeof beforeAfter)[number];
export type ClinicConfig = typeof clinicConfig;

export function formatClinicText(
  value: string,
  replacements: Record<string, string> = {},
) {
  const unitCountLabel =
    units.length === 1 ? "Uma unidade" : `${units.length} unidades`;
  const tokens: Record<string, string> = {
    clinicName: clinic.name,
    shortName: clinic.shortName,
    city: clinic.city,
    state: clinic.state,
    unitCount: String(units.length),
    unitCountLabel,
    unitCountLabelLower: unitCountLabel.toLocaleLowerCase(clinic.locale),
    ...replacements,
  };

  return value.replace(/\{\{(\w+)\}\}/g, (match, token: string) => tokens[token] ?? match);
}

export function isFeatureEnabled(feature?: FeatureFlag) {
  return feature ? featureFlags[feature] : true;
}

export function isConfiguredAsset(path?: string | null) {
  return Boolean(path && path.startsWith("/brand/"));
}

export function whatsappUrl(unit: ClinicUnit) {
  return `${unit.whatsappHref}?text=${encodeURIComponent(unit.whatsappMessage)}`;
}

export function primaryWhatsappUrl() {
  return `${clinic.primaryWhatsapp.href}?text=${encodeURIComponent(
    clinic.primaryWhatsapp.message,
  )}`;
}
