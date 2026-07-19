/* global jest */
/**
 * `expo-crypto` depende de um módulo nativo (`ExpoCrypto.randomUUID()`) que
 * não existe no ambiente de teste (jsdom/node do jest-expo), então é
 * mockado aqui com um gerador determinístico o suficiente para os
 * repositories (só precisa ser único por chamada).
 */
jest.mock('expo-crypto', () => {
  let counter = 0;
  return {
    randomUUID: () => {
      counter += 1;
      return `test-uuid-${counter}`;
    },
  };
});
