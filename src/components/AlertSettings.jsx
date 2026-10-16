import { useState } from 'react';
import { Bell, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { CURRENCY_INFO } from '../api/currency';
import { addAlert, removeAlert, toggleAlert } from '../utils/storage';

const CURRENCIES = ['KGS', 'USD', 'RUB'];

export default function AlertSettings({ alerts, onAlertsChange, currentRates }) {
  const [showForm, setShowForm] = useState(false);
  const [newAlert, setNewAlert] = useState({
    currency: 'KGS',
    condition: 'above',
    threshold: '',
  });

  const handleAdd = () => {
    if (!newAlert.threshold || parseFloat(newAlert.threshold) <= 0) return;

    const alert = addAlert({
      currency: newAlert.currency,
      condition: newAlert.condition,
      threshold: parseFloat(newAlert.threshold),
    });

    onAlertsChange(prev => [...prev, alert]);
    setNewAlert({ currency: 'KGS', condition: 'above', threshold: '' });
    setShowForm(false);
  };

  const handleRemove = (id) => {
    removeAlert(id);
    onAlertsChange(prev => prev.filter(a => a.id !== id));
  };

  const handleToggle = (id) => {
    const updated = toggleAlert(id);
    onAlertsChange(updated);
  };

  const getCurrentRateDisplay = (currency) => {
    if (!currentRates || !currentRates[currency]) return null;
    return (1 / currentRates[currency]).toFixed(1);
  };

  return (
    <div>
      {/* Список алертов */}
      {alerts.length === 0 && !showForm && (
        <div className="text-center py-8 text-text-secondary">
          <Bell size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Нет активных уведомлений</p>
          <p className="text-xs mt-1 opacity-70">Добавьте уведомление о выгодном курсе</p>
        </div>
      )}

      <div className="grid gap-3">
        {alerts.map(alert => {
          const info = CURRENCY_INFO[alert.currency];
          const currentRate = getCurrentRateDisplay(alert.currency);

          return (
            <div
              key={alert.id}
              className={`glass-card rounded-2xl p-4 transition-opacity ${
                !alert.enabled ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{info?.flag}</span>
                  <div>
                    <div className="text-text-primary font-medium text-sm">
                      {alert.currency}  {alert.condition === 'above' ? '>' : '<'} {alert.threshold} ₩
                    </div>
                    <div className="text-text-secondary text-xs mt-0.5">
                      {alert.condition === 'above' ? 'Уведомить когда выше' : 'Уведомить когда ниже'}
                    </div>
                    {currentRate && (
                      <div className="text-text-secondary text-xs mt-0.5">
                        Сейчас: {currentRate} ₩
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(alert.id)}
                    className="text-primary"
                  >
                    {alert.enabled
                      ? <ToggleRight size={24} className="text-primary" />
                      : <ToggleLeft size={24} className="text-text-secondary/40" />
                    }
                  </button>
                  <button
                    onClick={() => handleRemove(alert.id)}
                    className="text-danger p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Форма добавления */}
      {showForm && (
        <div className="glass-card rounded-2xl p-4 mt-3">
          <h4 className="font-semibold text-text-primary mb-3">Новое уведомление</h4>

          {/* Валюта */}
          <div className="mb-3">
            <label className="text-text-secondary text-xs mb-1.5 block">Валюта</label>
            <div className="flex gap-2">
              {CURRENCIES.map(c => {
                const info = CURRENCY_INFO[c];
                return (
                  <button
                    key={c}
                    onClick={() => setNewAlert(a => ({ ...a, currency: c }))}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-all ${
                      newAlert.currency === c
                        ? 'bg-primary text-white'
                        : 'bg-surface text-text-secondary'
                    }`}
                  >
                    <span>{info.flag}</span>
                    <span>{c}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Условие */}
          <div className="mb-3">
            <label className="text-text-secondary text-xs mb-1.5 block">Условие</label>
            <div className="flex gap-2">
              {[
                { value: 'above', label: 'Выше ↑' },
                { value: 'below', label: 'Ниже ↓' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setNewAlert(a => ({ ...a, condition: opt.value }))}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                    newAlert.condition === opt.value
                      ? 'bg-primary text-white'
                      : 'bg-surface text-text-secondary'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Порог */}
          <div className="mb-4">
            <label className="text-text-secondary text-xs mb-1.5 block">
              Порог (₩ за 1 {CURRENCY_INFO[newAlert.currency]?.symbol})
              {currentRates && currentRates[newAlert.currency] && (
                <span className="ml-2 text-primary">
                  Сейчас: {(1 / currentRates[newAlert.currency]).toFixed(1)} ₩
                </span>
              )}
            </label>
            <input
              type="number"
              value={newAlert.threshold}
              onChange={e => setNewAlert(a => ({ ...a, threshold: e.target.value }))}
              placeholder="Введите значение..."
              className="w-full bg-surface rounded-xl px-4 py-3 text-text-primary outline-none focus:ring-2 focus:ring-primary/50"
              inputMode="decimal"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 py-3 rounded-xl bg-surface text-text-secondary font-medium"
            >
              Отмена
            </button>
            <button
              onClick={handleAdd}
              disabled={!newAlert.threshold}
              className="flex-1 py-3 rounded-xl bg-primary text-white font-medium disabled:opacity-50"
            >
              Добавить
            </button>
          </div>
        </div>
      )}

      {/* Кнопка добавления */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full mt-3 py-3 rounded-2xl border-2 border-dashed border-surface-2 text-text-secondary flex items-center justify-center gap-2 text-sm font-medium active:border-primary active:text-primary transition-colors"
        >
          <Plus size={18} />
          Добавить уведомление
        </button>
      )}
    </div>
  );
}
