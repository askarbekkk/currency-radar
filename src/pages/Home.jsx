import { useState, useCallback } from 'react';
import { RefreshCw, Wifi, WifiOff, Clock } from 'lucide-react';
import { useCurrency, useHistory } from '../hooks/useCurrency';
import CurrencyCard from '../components/CurrencyCard';
import Converter from '../components/Converter';

const CURRENCIES = ['KGS', 'USD', 'RUB'];

function Skeleton() {
  return (
    <div className="bg-surface rounded-2xl p-4 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-surface-2 rounded-full" />
          <div>
            <div className="h-4 w-16 bg-surface-2 rounded mb-1" />
            <div className="h-3 w-24 bg-surface-2 rounded" />
          </div>
        </div>
        <div className="text-right">
          <div className="h-6 w-20 bg-surface-2 rounded mb-1" />
          <div className="h-3 w-12 bg-surface-2 rounded ml-auto" />
        </div>
      </div>
      <div className="h-12 bg-surface-2 rounded-lg mt-2" />
    </div>
  );
}

function HistoryLoader({ currency, rates, previousRates, onCardClick }) {
  const { history } = useHistory(currency, 7);
  return (
    <CurrencyCard
      currency={currency}
      rate={rates[currency]}
      previousRate={previousRates?.[currency]}
      history={history}
      onClick={() => onCardClick(currency)}
    />
  );
}

export default function Home({ onCurrencySelect }) {
  const { rates, previousRates, loading, refreshing, error, lastUpdate, refresh } = useCurrency();

  const [refreshStart, setRefreshStart] = useState(null);

  // Pull-to-refresh
  const handleRefresh = useCallback(() => {
    setRefreshStart(Date.now());
    refresh();
    setTimeout(() => setRefreshStart(null), 1500);
  }, [refresh]);

  const formatLastUpdate = (ts) => {
    if (!ts) return '';
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'только что';
    if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
    return new Date(ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      {/* Шапка */}
      <div className="px-4 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Currency Radar</h1>
            <div className="flex items-center gap-1.5 mt-1">
              {error ? (
                <>
                  <WifiOff size={12} className="text-danger" />
                  <span className="text-danger text-xs">Офлайн данные</span>
                </>
              ) : (
                <>
                  <Wifi size={12} className="text-success" />
                  {lastUpdate && (
                    <span className="text-text-secondary text-xs flex items-center gap-1">
                      <Clock size={10} />
                      {formatLastUpdate(lastUpdate)}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface active:bg-surface-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              size={18}
              className={`text-text-secondary ${refreshing ? 'spin' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Базовая валюта */}
      <div className="px-4 mb-4">
        <div className="glass-card border-primary/30 rounded-2xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🇰🇷</span>
            <div>
              <div className="font-semibold text-text-primary">KRW</div>
              <div className="text-text-secondary text-xs">Корейская вона (база)</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-primary font-bold text-lg">₩</div>
            <div className="text-text-secondary text-xs">Базовая</div>
          </div>
        </div>
      </div>

      {/* Карточки валют */}
      <div className="px-4 grid gap-3 mb-4">
        {loading ? (
          CURRENCIES.map(c => <Skeleton key={c} />)
        ) : rates ? (
          CURRENCIES.map(currency => (
            <HistoryLoader
              key={currency}
              currency={currency}
              rates={rates}
              previousRates={previousRates}
              onCardClick={onCurrencySelect}
            />
          ))
        ) : null}
      </div>

      {/* Конвертер */}
      {rates && (
        <div className="px-4">
          <Converter rates={rates} />
        </div>
      )}

      {/* Ошибка */}
      {error && !loading && (
        <div className="px-4 mt-3">
          <div className="bg-danger/10 border border-danger/20 rounded-xl px-4 py-3 text-danger text-sm text-center">
            Не удалось обновить курсы. Показаны кэшированные данные.
          </div>
        </div>
      )}
    </div>
  );
}
