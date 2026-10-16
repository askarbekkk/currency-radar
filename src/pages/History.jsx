import { useState } from 'react';
import { useHistory } from '../hooks/useCurrency';
import RateChart from '../components/RateChart';
import { CURRENCY_INFO } from '../api/currency';

const CURRENCIES = ['KGS', 'USD', 'RUB'];

export default function History({ initialCurrency }) {
  const [selectedCurrency, setSelectedCurrency] = useState(initialCurrency || 'KGS');
  const [period, setPeriod] = useState(7);

  const { history, loading } = useHistory(selectedCurrency, period);

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      {/* Шапка */}
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-text-primary">История курсов</h1>
        <p className="text-text-secondary text-sm mt-1">
          Динамика KRW к выбранной валюте
        </p>
      </div>

      {/* Выбор валюты */}
      <div className="px-4 mb-4">
        <div className="flex gap-2">
          {CURRENCIES.map(currency => {
            const info = CURRENCY_INFO[currency];
            return (
              <button
                key={currency}
                onClick={() => setSelectedCurrency(currency)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl text-sm font-medium transition-all ${
                  selectedCurrency === currency
                    ? 'bg-primary text-white'
                    : 'bg-surface text-text-secondary'
                }`}
              >
                <span className="text-base">{info.flag}</span>
                <span>{currency}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* График */}
      <div className="px-4">
        <div className="glass-card rounded-2xl p-4">
          {/* Заголовок графика */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{CURRENCY_INFO[selectedCurrency]?.flag}</span>
            <div>
              <div className="font-semibold text-text-primary">
                KRW / {selectedCurrency}
              </div>
              <div className="text-text-secondary text-xs">
                {CURRENCY_INFO[selectedCurrency]?.name}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map(i => (
                  <div key={i} className="h-16 bg-surface-2 rounded-xl animate-pulse" />
                ))}
              </div>
              <div className="flex gap-2">
                {[0, 1, 2].map(i => (
                  <div key={i} className="flex-1 h-10 bg-surface-2 rounded-xl animate-pulse" />
                ))}
              </div>
              <div className="h-48 bg-surface-2 rounded-xl animate-pulse" />
            </div>
          ) : (
            <RateChart
              history={history}
              currency={selectedCurrency}
              period={period}
              onPeriodChange={setPeriod}
            />
          )}
        </div>
      </div>

      {/* Описание */}
      <div className="px-4 mt-3">
        <div className="glass-card rounded-2xl p-4">
          <h3 className="font-semibold text-text-primary mb-2">О данных</h3>
          <p className="text-text-secondary text-sm leading-relaxed">
            Исторические данные курса <strong className="text-text-primary">KRW/{selectedCurrency}</strong>.
            {' '}График показывает стоимость 1 {CURRENCY_INFO[selectedCurrency]?.name.toLowerCase()} в корейских вонах.
          </p>
          <p className="text-text-secondary text-xs mt-2 opacity-70">
            * Данные предоставляются в ознакомительных целях. Используйте актуальный курс для реальных операций.
          </p>
        </div>
      </div>
    </div>
  );
}
