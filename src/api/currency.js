// ExchangeRate-API (free tier, no key needed for basic use)
// Fallback to Open Exchange Rates format
const BASE_URL = 'https://open.er-api.com/v6/latest';

// Мок-данные для разработки и fallback
const MOCK_RATES = {
  KGS: 0.1087,   // 1 KRW = 0.1087 KGS (примерно 1 KGS = 9.2 KRW)
  USD: 0.000735, // 1 KRW = 0.000735 USD
  RUB: 0.0685,   // 1 KRW = 0.0685 RUB
};

// Генерация исторических данных (mock)
function generateHistoricalData(baseRate, days) {
  const data = [];
  const now = Date.now();
  const dayMs = 86400000;

  for (let i = days; i >= 0; i--) {
    const date = new Date(now - i * dayMs);
    const volatility = 0.03; // 3% колебания
    const randomFactor = 1 + (Math.random() - 0.5) * volatility;
    const trendFactor = 1 + ((days - i) / days) * 0.02 * (Math.random() > 0.5 ? 1 : -1);

    data.push({
      date: date.toISOString().split('T')[0],
      rate: parseFloat((baseRate * randomFactor * trendFactor).toFixed(6)),
    });
  }
  return data;
}

// Получение текущих курсов
export async function fetchRates() {
  try {
    const response = await fetch(`${BASE_URL}/KRW`, {
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();

    if (data.result !== 'success') throw new Error('API error');

    return {
      base: 'KRW',
      rates: {
        KGS: data.rates.KGS,
        USD: data.rates.USD,
        RUB: data.rates.RUB,
      },
      timestamp: data.time_last_update_unix * 1000,
      source: 'live',
    };
  } catch (error) {
    console.warn('Falling back to mock rates:', error.message);
    // Небольшое случайное отклонение от базовых значений
    const jitter = () => 1 + (Math.random() - 0.5) * 0.02;
    return {
      base: 'KRW',
      rates: {
        KGS: parseFloat((MOCK_RATES.KGS * jitter()).toFixed(6)),
        USD: parseFloat((MOCK_RATES.USD * jitter()).toFixed(6)),
        RUB: parseFloat((MOCK_RATES.RUB * jitter()).toFixed(6)),
      },
      timestamp: Date.now(),
      source: 'mock',
    };
  }
}

// Получение исторических данных
export async function fetchHistory(currency, days = 7) {
  try {
    // Используем timeseries API если доступен, иначе mock
    // open.er-api.com не предоставляет timeseries в free tier
    // поэтому генерируем исторические данные на основе текущего курса
    const current = await fetchRates();
    const baseRate = current.rates[currency];

    return {
      currency,
      days,
      data: generateHistoricalData(baseRate, days),
    };
  } catch (error) {
    console.warn('History fetch error:', error.message);
    return {
      currency,
      days,
      data: generateHistoricalData(MOCK_RATES[currency] || 0.001, days),
    };
  }
}

// Конвертация суммы
export function convertCurrency(amount, rate) {
  if (!amount || !rate) return 0;
  return parseFloat((amount * rate).toFixed(4));
}

// Форматирование курса для отображения
export function formatRate(rate, currency) {
  if (!rate) return '—';

  // Показываем сколько KRW стоит 1 единица валюты
  const inverseRate = 1 / rate;

  const formats = {
    KGS: { decimals: 1, prefix: '' },
    USD: { decimals: 0, prefix: '' },
    RUB: { decimals: 1, prefix: '' },
  };

  const fmt = formats[currency] || { decimals: 2, prefix: '' };
  return inverseRate.toFixed(fmt.decimals);
}

// Изменение в процентах
export function calcChange(current, previous) {
  if (!previous || previous === 0) return 0;
  return parseFloat((((current - previous) / previous) * 100).toFixed(2));
}

// Символы валют
export const CURRENCY_INFO = {
  KGS: {
    name: 'Кыргызский сом',
    flag: '🇰🇬',
    symbol: 'с',
    color: '#EF4444',
  },
  USD: {
    name: 'Доллар США',
    flag: '🇺🇸',
    symbol: '$',
    color: '#22C55E',
  },
  RUB: {
    name: 'Российский рубль',
    flag: '🇷🇺',
    symbol: '₽',
    color: '#3B82F6',
  },
};
