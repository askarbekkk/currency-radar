import { useState } from 'react';
import { Building2 } from 'lucide-react';
import ExchangeComparison from '../components/ExchangeComparison';
import { CURRENCY_INFO } from '../api/currency';
import { useCurrency } from '../hooks/useCurrency';

const CURRENCIES = ['KGS', 'USD', 'RUB'];

export default function Compare() {
  const [selectedCurrency, setSelectedCurrency] = useState('KGS');
  const { rates } = useCurrency();

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      {/* Шапка */}
      <div className="px-4 pt-12 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Обменники</h1>
            <p className="text-text-secondary text-sm mt-1">
              Сравнение курсов в Корее
            </p>
          </div>
          <Building2 size={22} className="text-primary mt-1" />
        </div>
      </div>

      {/* Выбор валюты */}
      <div className="px-4 mb-4">
        <p className="text-text-secondary text-xs mb-2">Показать курс для:</p>
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

      {/* Сравнение */}
      <div className="px-4">
        <ExchangeComparison
          rates={rates}
          selectedCurrency={selectedCurrency}
        />
      </div>

      {/* Доп. информация */}
      <div className="px-4 mt-4">
        <div className="glass-card rounded-2xl p-4">
          <h3 className="font-semibold text-text-primary mb-3">Советы по обмену</h3>
          <div className="grid gap-2.5">
            {[
              {
                icon: '🏦',
                title: 'Банки vs Обменники',
                text: 'В специализированных обменниках курс обычно выгоднее, чем в аэропорту или отелях.',
              },
              {
                icon: '📱',
                title: 'Онлайн-переводы',
                text: 'Wise и аналогичные сервисы предлагают самый выгодный курс для международных переводов.',
              },
              {
                icon: '💳',
                title: 'Комиссии',
                text: 'Учитывайте не только курс, но и комиссию за перевод. Иногда лучший курс съедается комиссией.',
              },
              {
                icon: '⚠️',
                title: 'Курсы приблизительные',
                text: 'Данные обновляются вручную. Всегда уточняйте актуальный курс перед сделкой.',
              },
            ].map((tip, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-xl flex-shrink-0">{tip.icon}</span>
                <div>
                  <div className="text-text-primary text-sm font-medium">{tip.title}</div>
                  <div className="text-text-secondary text-xs mt-0.5 leading-relaxed">{tip.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
