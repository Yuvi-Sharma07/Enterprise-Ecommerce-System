import { Injectable, signal, computed } from '@angular/core';

export type CurrencyCode = 'USD' | 'INR' | 'EUR' | 'GBP';

interface CurrencyInfo {
  rate: number;
  symbol: string;
  label: string;
  flag: string;
}

export const CURRENCY_MAP: Record<CurrencyCode, CurrencyInfo> = {
  USD: { rate: 1.0, symbol: '$', label: 'USD', flag: '🇺🇸' },
  INR: { rate: 83.5, symbol: '₹', label: 'INR', flag: '🇮🇳' },
  EUR: { rate: 0.92, symbol: '€', label: 'EUR', flag: '🇪🇺' },
  GBP: { rate: 0.78, symbol: '£', label: 'GBP', flag: '🇬🇧' },
};

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private currentCurrencyCode = signal<CurrencyCode>('USD');

  // Computed signals
  public currency = computed(() => this.currentCurrencyCode());
  public symbol = computed(() => CURRENCY_MAP[this.currentCurrencyCode()].symbol);
  public info = computed(() => CURRENCY_MAP[this.currentCurrencyCode()]);

  constructor() {
    this.detectAndLoadCurrency();
  }

  private detectAndLoadCurrency() {
    const saved = localStorage.getItem('currency') as CurrencyCode | null;
    if (saved && CURRENCY_MAP[saved]) {
      this.currentCurrencyCode.set(saved);
      return;
    }

    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz && (tz.includes('Kolkata') || tz.includes('Calcutta') || tz.includes('India'))) {
        this.setCurrency('INR');
      } else if (tz && (tz.includes('Europe') || tz.includes('Paris') || tz.includes('Berlin') || tz.includes('Rome'))) {
        this.setCurrency('EUR');
      } else if (tz && (tz.includes('London') || tz.includes('GB'))) {
        this.setCurrency('GBP');
      } else {
        this.setCurrency('USD');
      }
    } catch (e) {
      console.warn("Timezone check failed, defaulting to USD", e);
      this.setCurrency('USD');
    }
  }

  public setCurrency(code: CurrencyCode) {
    if (CURRENCY_MAP[code]) {
      this.currentCurrencyCode.set(code);
      localStorage.setItem('currency', code);
    }
  }

  public convertPrice(usdPrice: number): number {
    const rate = CURRENCY_MAP[this.currency()].rate;
    return usdPrice * rate;
  }

  public formatPrice(usdPrice: number): string {
    const info = CURRENCY_MAP[this.currency()];
    const converted = usdPrice * info.rate;
    return `${info.symbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}
