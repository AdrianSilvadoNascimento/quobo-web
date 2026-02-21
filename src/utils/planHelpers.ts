/**
 * Get the billing period label based on plan interval
 * @param interval - Number of months in the billing cycle
 * @returns Formatted billing period string
 */
export function getBillingPeriod(interval: number): string {
  switch (interval) {
    case 1:
      return '/mês';
    case 3:
      return '/trimestre';
    case 6:
      return '/semestre';
    case 12:
      return '/ano';
    default:
      return interval > 1 ? `/${interval} meses` : '/mês';
  }
}

/**
 * Get the billing period description (used in feature lists)
 * @param interval - Number of months in the billing cycle
 * @returns Formatted billing period description
 */
export function getBillingPeriodDescription(interval: number): string {
  switch (interval) {
    case 1:
      return 'Cobrança mensal';
    case 3:
      return 'Cobrança trimestral';
    case 6:
      return 'Cobrança semestral';
    case 12:
      return 'Cobrança anual';
    default:
      return interval > 1 ? `Cobrança a cada ${interval} meses` : 'Cobrança mensal';
  }
}
