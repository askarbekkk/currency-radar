import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { CURRENCY_INFO, formatRate, calcChange } from '../api/currency';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

export default function CurrencyCard({ currency, rate, previousRate, history, onClick }) {
  const info = CURRENCY_INFO[currency];
  if (!info || !rate) return null;

  const change = previousRate ? calcChange(rate, previousRate) : 0;
  const inverseRate = 1 / rate; // Сколько KRW стоит 1 валюта
  const inverseFormatted = formatRate(rate, currency);

  const isUp = change > 0;
  const isDown = change < 0;

  // Для мини-графика инвертируем данные (KRW за 1 единицу валюты)
  const chartData = history
    ? history.slice(-7).map(h => ({ v: parseFloat((1 / h.rate).toFixed(2)) }))
    : [];

  const chartColor = isUp ? '#22C55E' : isDown ? '#EF4444' : '#3B82F6';

  return (
    <div
      className="glass-card rounded-2xl p-4 cursor-pointer active:scale-95 transition-transform duration-150"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        {/* Левая часть */}
        <div className="flex items-center gap-3">
          <div className="text-3xl">{info.flag}</div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-text-primary text-base">{currency}</span>
              <span className="text-text-secondary text-xs">/ KRW</span>
            </div>
            <div className="text-text-secondary text-xs mt-0.5">{info.name}</div>
          </div>
        </div>

        {/* Правая часть — курс */}
        <div className="text-right">
          <div className="font-bold text-text-primary text-xl">
            {inverseFormatted}
            <span className="text-text-secondary text-sm font-normal ml-1">₩</span>
          </div>
          <div className={`flex items-center justify-end gap-1 mt-0.5 text-sm font-medium ${
            isUp ? 'text-success' : isDown ? 'text-danger' : 'text-text-secondary'
          }`}>
            {isUp ? <TrendingUp size={14} /> : isDown ? <TrendingDown size={14} /> : <Minus size={14} />}
            <span>{isUp ? '+' : ''}{change}%</span>
          </div>
        </div>
      </div>

      {/* Мини-график */}
      {chartData.length > 0 && (
        <div className="mt-3 h-12">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`grad_${currency}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={chartColor}
                strokeWidth={2}
                fill={`url(#grad_${currency})`}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Нижняя строка */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-surface-2">
        <span className="text-text-secondary text-xs">
          1 {info.symbol} = {inverseFormatted} ₩
        </span>
        <span className="text-text-secondary text-xs">
          1 ₩ = {(rate).toFixed(4)} {currency}
        </span>
      </div>
    </div>
  );
}
