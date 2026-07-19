import React, { createContext, useState, useEffect, useContext } from 'react';

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

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (usdPrice: number) => string;
  convertPrice: (usdPrice: number) => number;
  getSymbol: () => string;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>('USD');

  useEffect(() => {
    // 1. Check local storage
    const saved = localStorage.getItem('currency') as CurrencyCode | null;
    if (saved && CURRENCY_MAP[saved]) {
      setCurrencyState(saved);
      return;
    }

    // 2. Geo-detect timezone
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz && (tz.includes('Kolkata') || tz.includes('Calcutta') || tz.includes('India'))) {
        setCurrencyState('INR');
      } else if (tz && (tz.includes('Europe') || tz.includes('Paris') || tz.includes('Berlin') || tz.includes('Rome'))) {
        setCurrencyState('EUR');
      } else if (tz && (tz.includes('London') || tz.includes('GB'))) {
        setCurrencyState('GBP');
      } else {
        setCurrencyState('USD');
      }
    } catch (e) {
      console.warn("Timezone check failed, defaulting to USD", e);
    }
  }, []);

  const setCurrency = (code: CurrencyCode) => {
    if (CURRENCY_MAP[code]) {
      setCurrencyState(code);
      localStorage.setItem('currency', code);
    }
  };

  const convertPrice = (usdPrice: number): number => {
    const rate = CURRENCY_MAP[currency].rate;
    return usdPrice * rate;
  };

  const formatPrice = (usdPrice: number): string => {
    const info = CURRENCY_MAP[currency];
    const converted = usdPrice * info.rate;
    return `${info.symbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getSymbol = (): string => {
    return CURRENCY_MAP[currency].symbol;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, convertPrice, getSymbol }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
