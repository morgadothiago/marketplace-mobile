# Post para LinkedIn — MarketPlace Mobile

## Versão 1 (mais técnica)

🛍️ MVP no ar: MarketPlace Mobile

Um app de marketplace local em React Native (Expo) — conecta compradores e vendedores de uma mesma região pra troca de produtos e serviços, com busca por proximidade, chat entre as partes e avaliações.

O que me interessou nesse projeto foi o processo, não só o resultado: construí tudo com Spec-Driven Development — antes de escrever uma linha de código, defini spec de produto, plano técnico e quebra de tasks, tudo versionado no repositório. Isso deu um caminho claro do "o que" pro "como" pro "linha de código", fase por fase, com commits atômicos e rastreáveis.

Stack:
🔹 Expo (SDK 54) + React Native + TypeScript estrito
🔹 SQLite local (offline-first, sem backend nesta fase — decisão de escopo, não limitação técnica)
🔹 Camada de repositório isolando acesso a dados — pra trocar storage local por backend real depois sem reescrever telas
🔹 expo-location pra filtro de proximidade (haversine), expo-image-picker pra fotos, React Hook Form + Zod pra formulários

O fluxo completo já roda de ponta a ponta: criar perfil → publicar anúncio (com fotos e localização) → buscar/filtrar por categoria e proximidade → contato via chat mock ou WhatsApp → avaliação com estrelas.

Código aberto no GitHub: https://github.com/morgadothiago/marketplace-mobile

#ReactNative #Expo #MobileDevelopment #SpecDrivenDevelopment #TypeScript

---

## Versão 2 (mais direta/pessoal)

Terminei o MVP de um projeto novo: MarketPlace Mobile 📱

A ideia: um marketplace local — tipo um "OLX de bairro" — onde você anuncia produto ou serviço e quem tá por perto encontra por busca ou por distância.

Construído em React Native com Expo, 100% local nesse primeiro momento (SQLite no dispositivo, sem backend ainda) — o foco do MVP foi validar o fluxo completo: perfil → anúncio → busca/proximidade → contato → avaliação. E funciona, de ponta a ponta, no celular de verdade.

O que fiz diferente dessa vez: usei spec-driven development do início ao fim. Especifiquei o produto, planejei a arquitetura e quebrei em tasks antes de escrever código — tudo documentado e versionado no repositório, fase por fase. Ajudou muito a manter o escopo do MVP sob controle e já deixar a base pronta pra evoluir pra um backend real depois (a camada de dados já é isolada pra isso).

Repo no GitHub: https://github.com/morgadothiago/marketplace-mobile

Bora trocar ideia se você também tá construindo algo parecido 👇

#buildinpublic #ReactNative #Expo #DevJourney

---

## Dicas de uso
- Link do repo já preenchido nas duas versões: https://github.com/morgadothiago/marketplace-mobile
- Adicione print/gif do app rodando (feed, busca por proximidade, chat, avaliação) — posts com mídia têm bem mais alcance
- Escolha a Versão 1 se seu público no LinkedIn é mais técnico (recrutadores, devs); Versão 2 se quer engajamento mais amplo
