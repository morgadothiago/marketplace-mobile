# Post para LinkedIn — MarketPlace Mobile

## Versão 1 (mais técnica)

🛍️ Novo projeto no ar: MarketPlace Mobile

Um app de marketplace local em React Native (Expo) — conecta compradores e vendedores de uma mesma região pra troca de produtos e serviços, com busca por proximidade, chat entre as partes e avaliações.

O que me interessou nesse projeto foi o processo, não só o resultado: construí tudo com Spec-Driven Development — antes de escrever uma linha de código, defini spec de produto, plano técnico e quebra de tasks, tudo versionado no repositório. Isso deu um caminho claro do "o que" pro "como" pro "linha de código", fase por fase, com commits atômicos.

Stack:
🔹 Expo + React Native + TypeScript estrito
🔹 SQLite local (offline-first, sem backend nesta fase)
🔹 Camada de repositório isolando acesso a dados — pra trocar storage local por backend real depois sem reescrever telas
🔹 expo-location pra filtro de proximidade, expo-image-picker pra fotos, React Hook Form + Zod pra formulários

Ainda é MVP, mas já dá pra rodar o fluxo completo: criar perfil → publicar anúncio → buscar/filtrar por proximidade → contato → avaliação.

Código aberto no GitHub: [link do repo]

#ReactNative #Expo #MobileDevelopment #SpecDrivenDevelopment #TypeScript

---

## Versão 2 (mais direta/pessoal)

Comecei um projeto novo: MarketPlace Mobile 📱

A ideia: um marketplace local — tipo um "OLX de bairro" — onde você anuncia produto ou serviço e quem tá por perto encontra por busca ou por distância.

Construído em React Native com Expo, 100% local nesse primeiro momento (SQLite no dispositivo, sem backend ainda) — o foco do MVP foi validar o fluxo completo: perfil → anúncio → busca/proximidade → contato → avaliação.

O que fiz diferente dessa vez: usei spec-driven development do início. Especifiquei o produto, planejei a arquitetura e quebrei em tasks antes de escrever código — tudo documentado no repositório. Ajudou muito a manter o escopo do MVP sob controle e já deixar a base pronta pra evoluir pra um backend real depois.

Repo no GitHub: [link]

Bora trocar ideia se você também tá construindo algo parecido 👇

#buildinpublic #ReactNative #Expo #DevJourney

---

## Dicas de uso
- Substitua `[link do repo]` / `[link]` por: https://github.com/morgadothiago/marketplace-mobile
- Se tiver print/gif do app rodando no simulador, adicione — posts com mídia têm bem mais alcance
- Escolha a Versão 1 se seu público no LinkedIn é mais técnico (recrutadores, devs); Versão 2 se quer engajamento mais amplo
