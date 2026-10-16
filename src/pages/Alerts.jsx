import { useState, useEffect } from 'react';
import { Bell, BellOff, Info } from 'lucide-react';
import AlertSettings from '../components/AlertSettings';
import { loadAlerts } from '../utils/storage';
import { useCurrency } from '../hooks/useCurrency';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const { rates } = useCurrency();

  useEffect(() => {
    setAlerts(loadAlerts());
  }, []);

  const activeCount = alerts.filter(a => a.enabled).length;

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      {/* Шапка */}
      <div className="px-4 pt-12 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Уведомления</h1>
            <p className="text-text-secondary text-sm mt-1">
              Следите за выгодным курсом
            </p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
            activeCount > 0 ? 'bg-primary/20 text-primary' : 'bg-surface text-text-secondary'
          }`}>
            {activeCount > 0 ? <Bell size={14} /> : <BellOff size={14} />}
            <span className="text-sm font-medium">{activeCount} активных</span>
          </div>
        </div>
      </div>

      {/* Инфо-блок */}
      <div className="px-4 mb-4">
        <div className="glass-card border-primary/30 rounded-2xl p-4 flex gap-3">
          <Info size={18} className="text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-text-primary text-sm font-medium">Как работают уведомления</p>
            <p className="text-text-secondary text-xs mt-1 leading-relaxed">
              Приложение проверяет курс каждые 5 минут. Когда курс достигнет указанного порога —
              вы увидите уведомление при открытии приложения.
            </p>
          </div>
        </div>
      </div>

      {/* Настройки алертов */}
      <div className="px-4">
        <AlertSettings
          alerts={alerts}
          onAlertsChange={setAlerts}
          currentRates={rates}
        />
      </div>

      {/* Советы */}
      {alerts.length === 0 && (
        <div className="px-4 mt-6">
          <h3 className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-3">
            Советы
          </h3>
          <div className="grid gap-2">
            {[
              { emoji: '📈', text: 'Установите порог выше текущего курса KGS, чтобы отследить рост' },
              { emoji: '💰', text: 'Курс в обменниках обычно на 1-3% ниже рыночного' },
              { emoji: '⏰', text: 'Лучшее время для обмена — рабочие часы банков' },
            ].map((tip, i) => (
              <div key={i} className="glass-card rounded-xl px-4 py-3 flex gap-3">
                <span className="text-xl">{tip.emoji}</span>
                <p className="text-text-secondary text-sm leading-relaxed">{tip.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
