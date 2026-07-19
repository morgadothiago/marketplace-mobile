/**
 * Deriva a ação de contato externo (T028) a partir do campo livre
 * `profiles.external_contact` (telefone/whatsapp digitado sem formato
 * fixo, ex: "(11) 91234-5678", "+55 11 91234-5678", "1132345678").
 *
 * Função pura (mesmo padrão de `utils/distance.ts`) para poder ser testada
 * isoladamente, sem acoplar a regra de negócio a `Linking`/UI.
 *
 * Heurística: só considera "parece telefone" a partir de `MIN_PHONE_DIGITS`
 * dígitos. Com DDI+DDD (>= 10 dígitos) preferimos `wa.me`, que exige o
 * número completo em formato internacional; com menos dígitos (número local
 * sem DDI, ex: telefone fixo de 8 dígitos) caímos para `tel:`, que discador
 * nativo resolve mesmo sem DDI.
 */

export type ExternalContactAction = {
  label: string;
  icon: 'logo-whatsapp' | 'call-outline';
  url: string;
};

const MIN_PHONE_DIGITS = 8;
const MIN_WHATSAPP_DIGITS = 10;

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function resolveExternalContactAction(
  rawContact: string | null | undefined,
): ExternalContactAction | null {
  const contact = rawContact?.trim();
  if (!contact) {
    return null;
  }

  const digits = onlyDigits(contact);
  if (digits.length < MIN_PHONE_DIGITS) {
    return null;
  }

  if (digits.length >= MIN_WHATSAPP_DIGITS) {
    return {
      label: 'Chamar no WhatsApp',
      icon: 'logo-whatsapp',
      url: `https://wa.me/${digits}`,
    };
  }

  return {
    label: 'Ligar para o vendedor',
    icon: 'call-outline',
    url: `tel:${digits}`,
  };
}
