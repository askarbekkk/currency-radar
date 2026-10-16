import { useState } from 'react';
import { CURRENCY_INFO } from '../api/currency';

const CURRENCY_META = {
  KRW: { flag: '🇰🇷', symbol: '₩' },
  KGS: { flag: CURRENCY_INFO.KGS.flag, symbol: CURRENCY_INFO.KGS.symbol },
  USD: { flag: CURRENCY_INFO.USD.flag, symbol: CURRENCY_INFO.USD.symbol },
  RUB: { flag: CURRENCY_INFO.RUB.flag, symbol: CURRENCY_INFO.RUB.symbol },
};

const ALL = ['KRW', 'KGS', 'USD', 'RUB'];

// rates[KGS] = 0.1087 means 1 KRW = 0.1087 KGS
function convertBetween(amount, from, to, rates) {
  if (!amount || !rates) return 0;
  const krw = from === 'KRW' ? amount : amount / rates[from];
  return to === 'KRW' ? krw : krw * rates[to];
}

function formatDisplay(num) {
  if (!num || num === 0) return '';
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
  if (num >= 10000) return Math.round(num).toLocaleString('en-US');
  if (num >= 1) return parseFloat(num.toFixed(2)).toString();
  return parseFloat(num.toFixed(6)).toString();
}

function formatForEdit(num) {
  if (!num || num === 0) return '';
  if (num >= 1) return parseFloat(num.toFixed(2)).toString();
  return parseFloat(num.toFixed(6)).toString();
}

export default function Converter({ rates }) {
  const [activeField, setActiveField] = useState('KRW');
  const [activeValue, setActiveValue] = useState('');

  const getComputedValue = (currency) => {
    const num = parseFloat(activeValue);
    if (!activeValue || isNaN(num) || num <= 0 || !rates) return 0;
    return convertBetween(num, activeField, currency, rates);
  };

  const handleChange = (currency, val) => {
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      setActiveField(currency);
      setActiveValue(val);
    }
  };

  const handleFocus = (currency) => {
    if (currency === activeField) return;
    const computed = getComputedValue(currency);
    setActiveField(currency);
    setActiveValue(computed ? formatForEdit(computed) : '');
  };

  return (
    <div className="glass-card rounded-2xl p-4 overflow-hidden">
      <h3 className="font-semibold text-text-primary mb-3">Конвертер</h3>

      <div className="grid gap-2">
        {ALL.map(currency => {
          const meta = CURRENCY_META[currency];
          const isActive = currency === activeField;
          const computed = isActive ? null : getComputedValue(currency);
          const displayValue = isActive ? activeValue : (computed ? formatDisplay(computed) : '');

          return (
            <div
              key={currency}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                isActive
                  ? 'bg-primary/10 border border-primary/30'
                  : 'bg-surface-2 border border-transparent'
              }`}
            >
              <span className="text-xl leading-none">{meta.flag}</span>
              <span className={`text-sm font-semibold w-8 flex-shrink-0 ${
                isActive ? 'text-primary' : 'text-text-secondary'
              }`}>
                {currency}
              </span>
              <span className="text-text-secondary text-sm flex-shrink-0">{meta.symbol}</span>
              <input
                type="text"
                inputMode="decimal"
                value={displayValue}
                onChange={e => handleChange(currency, e.target.value)}
                onFocus={() => handleFocus(currency)}
                placeholder="0"
                className="flex-1 min-w-0 bg-transparent text-right text-text-primary font-semibold text-lg outline-none placeholder:text-text-secondary/40"
              />
            </div>
          );
        })}
      </div>

      {!rates && (
        <p className="text-center text-text-secondary text-xs mt-3">Загрузка курсов...</p>
      )}
    </div>
  );
}
