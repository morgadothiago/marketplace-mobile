import { distanceBetweenKm, formatDistanceKm, haversineDistanceKm } from '@/utils/distance';

describe('haversineDistanceKm', () => {
  it('retorna 0 quando os dois pontos são idênticos', () => {
    expect(haversineDistanceKm(-23.5505, -46.6333, -23.5505, -46.6333)).toBe(0);
  });

  it('calcula a distância aproximada entre Praça da Sé e MASP (mesma cidade, ~2.7 km)', () => {
    // Praça da Sé: -23.5505, -46.6333 | MASP: -23.5614, -46.6558
    const distance = haversineDistanceKm(-23.5505, -46.6333, -23.5614, -46.6558);
    expect(distance).toBeGreaterThan(2);
    expect(distance).toBeLessThan(3.2);
  });

  it('calcula a distância aproximada entre São Paulo e Rio de Janeiro (~360 km)', () => {
    // São Paulo: -23.5505, -46.6333 | Rio de Janeiro: -22.9068, -43.1729
    const distance = haversineDistanceKm(-23.5505, -46.6333, -22.9068, -43.1729);
    expect(distance).toBeGreaterThan(350);
    expect(distance).toBeLessThan(370);
  });

  it('é simétrica (distância de A→B == B→A)', () => {
    const aToB = haversineDistanceKm(-23.5505, -46.6333, -22.9068, -43.1729);
    const bToA = haversineDistanceKm(-22.9068, -43.1729, -23.5505, -46.6333);
    expect(aToB).toBeCloseTo(bToA, 10);
  });
});

describe('distanceBetweenKm', () => {
  it('delega para haversineDistanceKm usando o formato Coordinates', () => {
    const from = { lat: -23.5505, lng: -46.6333 };
    const to = { lat: -22.9068, lng: -43.1729 };
    expect(distanceBetweenKm(from, to)).toBe(
      haversineDistanceKm(from.lat, from.lng, to.lat, to.lng),
    );
  });
});

describe('formatDistanceKm', () => {
  it('formata distâncias abaixo de 1 km em metros arredondados', () => {
    expect(formatDistanceKm(0.85)).toBe('~850 m');
  });

  it('formata distância zero em metros', () => {
    expect(formatDistanceKm(0)).toBe('~0 m');
  });

  it('formata distâncias de 1 km ou mais em km com uma casa decimal', () => {
    expect(formatDistanceKm(2.34)).toBe('~2.3 km');
  });

  it('arredonda km para uma casa decimal mesmo em valores exatos', () => {
    expect(formatDistanceKm(10)).toBe('~10.0 km');
  });
});
