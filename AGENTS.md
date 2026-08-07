# Template odontológico white-label

Este projeto é um template institucional reutilizável para clínicas odontológicas. O layout aprovado da 101 Sorrisos é o modelo visual oficial.

## Regras permanentes

1. Nunca redesenhe o layout durante uma troca de cliente sem solicitação expressa.
2. Em uma personalização comum, altere somente `src/config/clinic.ts` e os arquivos de `public/brand/`.
3. Preserve integralmente componentes, responsividade, animações, acessibilidade e comportamento em mobile e desktop.
4. Mantenha todas as imagens locais em `public/brand/`.
5. Nunca use `.asset.json`, `/__l5e/`, base64, URLs temporárias ou assets externos como dependência visual.
6. Não escreva nome, telefone, endereço, cidade, textos comerciais, caminhos de marca ou cores do cliente diretamente nos componentes.
7. Todas as cores devem vir do objeto `theme` e das variáveis CSS `--color-*`.
8. Se uma imagem opcional ou uma lista de conteúdo estiver vazia, mantenha a seção desativada; nunca exiba imagem quebrada ou espaço vazio.
9. Uma clínica pode ter uma, duas ou várias unidades. Não crie condicionais específicas para uma quantidade fixa.
10. Antes de finalizar qualquer alteração, execute `npm run lint` e `npm run build`.
11. Verifique ausência de overflow horizontal em 360px, 390px, 768px, 1024px e 1440px.
12. Teste todos os links de WhatsApp, telefone e Google Maps.
13. Confirme que todos os assets configurados existem em `public/brand/`.
14. Preserve foco visível, navegação por teclado, armadilhas de foco, `prefers-reduced-motion` e textos acessíveis.

## Estrutura de personalização

- Configuração: `src/config/clinic.ts`
- Logo: `public/brand/logo.webp`
- Hero: `public/brand/hero.webp`
- Open Graph: `public/brand/og-image.webp`
- Galeria: `public/brand/gallery/`
- Antes e depois: `public/brand/procedimentos/`

Não altere componentes para uma simples troca de clínica.
