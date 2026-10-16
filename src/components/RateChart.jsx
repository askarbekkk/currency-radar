import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CURRENCY_INFO } from '../api/currency';

const PERIOD_LABELS = {
  7: '7 дней',
  30: '30 дней',
  90: '90 дней',
};

function CustomTooltip({ active, payload, label, currency }) {
  if (!active || !payload || !payload.length) return null;
  const info = CURRENCY_INFO[currency];

  return (
    <div className="bg-surface-2 border border-white/10 rounded-xl px-3 py-2 text-sm shadow-xl">
      <div className="text-text-secondary text-xs mb-1">{label}</div>
      <div className="text-text-primary font-semibold">
        1 {info?.symbol} = {payload[0].value.toFixed(1)} ₩
      </div>
    </div>
  );
}

export default function RateChart({ history, currency, period, onPeriodChange }) {
  if (!history || history.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-text-secondary">
        Нет данных
      </div>
    );
  }

  // Форматируем данные: показываем сколько KRW стоит 1 единица валюты
  const chartData = history.map(h => ({
    date: formatDate(h.date, period),
    rate: parseFloat((1 / h.rate).toFixed(2)),
    rawDate: h.date,
  }));

  const rates = chartData.map(d => d.rate);
  const minRate = Math.min(...rates);
  const maxRate = Math.max(...rates);
  const avgRate = rates.reduce((a, b) => a + b, 0) / rates.length;

  const info = CURRENCY_INFO[currency];

  return (
    <div>
      {/* Статистика */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <StatBox label="Мин" value={`${minRate.toFixed(1)} ₩`} color="text-danger" />
        <StatBox label="Средний" value={`${avgRate.toFixed(1)} ₩`} color="text-primary" />
        <StatBox label="Макс" value={`${maxRate.toFixed(1)} ₩`} color="text-success" />
      </div>

      {/* Переключатель периода */}
      <div className="flex gap-2 mb-4">
        {Object.entries(PERIOD_LABELS).map(([days, label]) => (
          <button
            key={days}
            onClick={() => onPeriodChange(parseInt(days))}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              period === parseInt(days)
                ? 'bg-primary text-white'
                : 'bg-surface-2 text-text-secondary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* График */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
              width={40}
            />
            <Tooltip content={<CustomTooltip currency={currency} />} />
            <Area
              type="monotone"
              dataKey="rate"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#chartGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div className="bg-surface-2 rounded-xl p-3 text-center">
      <div className="text-text-secondary text-xs mb-1">{label}</div>
      <div className={`font-semibold text-sm ${color}`}>{value}</div>
    </div>
  );
}

function formatDate(dateStr, period) {
  const date = new Date(dateStr);
  if (period <= 7) {
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  }
  if (period <= 30) {
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  }
  return date.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' });
}
