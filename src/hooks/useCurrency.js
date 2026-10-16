import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchRates, fetchHistory } from '../api/currency';
import {
  saveRatesCache,
  loadRatesCache,
  saveHistoryCache,
  loadHistoryCache,
  checkAlerts,
} from '../utils/storage';

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 минут

export function useCurrency() {
  const [rates, setRates] = useState(null);
  const [previousRates, setPreviousRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [triggeredAlerts, setTriggeredAlerts] = useState([]);
  const intervalRef = useRef(null);

  const loadRates = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      // Попытка загрузить из кэша
      const cached = loadRatesCache();
      if (cached) {
        setRates(cached.rates);
        setLastUpdate(cached.timestamp);
        setLoading(false);
        return;
      }
      setLoading(true);
    }

    setError(null);

    try {
      const data = await fetchRates();

      // Сохраняем предыдущие курсы для расчёта изменений
      setRates(prev => {
        if (prev) setPreviousRates(prev);
        return data.rates;
      });

      setLastUpdate(data.timestamp);
      saveRatesCache(data);

      // Проверяем алерты
      const alerts = checkAlerts(data.rates);
      if (alerts.length > 0) {
        setTriggeredAlerts(alerts);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Инициализация
  useEffect(() => {
    loadRates(false);

    // Авто-обновление
    intervalRef.current = setInterval(() => {
      loadRates(true);
    }, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [loadRates]);

  const refresh = useCallback(() => {
    loadRates(true);
  }, [loadRates]);

  return {
    rates,
    previousRates,
    loading,
    refreshing,
    error,
    lastUpdate,
    triggeredAlerts,
    refresh,
    clearAlerts: () => setTriggeredAlerts([]),
  };
}

export function useHistory(currency, days) {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currency || !days) return;

    setLoading(true);
    setError(null);

    // Проверяем кэш
    const cached = loadHistoryCache(currency, days);
    if (cached) {
      setHistory(cached);
      setLoading(false);
      return;
    }

    fetchHistory(currency, days)
      .then(data => {
        setHistory(data.data);
        saveHistoryCache(currency, days, data.data);
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currency, days]);

  return { history, loading, error };
}
