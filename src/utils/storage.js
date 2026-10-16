const KEYS = {
  RATES_CACHE: 'cr_rates_cache',
  HISTORY_CACHE: 'cr_history_cache',
  ALERTS: 'cr_alerts',
  SETTINGS: 'cr_settings',
  LAST_AMOUNT: 'cr_last_amount',
};

// --- Rates Cache ---
export function saveRatesCache(data) {
  try {
    localStorage.setItem(KEYS.RATES_CACHE, JSON.stringify({
      data,
      savedAt: Date.now(),
    }));
  } catch (e) {
    console.warn('Storage save error:', e);
  }
}

export function loadRatesCache() {
  try {
    const raw = localStorage.getItem(KEYS.RATES_CACHE);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Кэш валиден 5 минут
    if (Date.now() - parsed.savedAt > 5 * 60 * 1000) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

// --- History Cache ---
export function saveHistoryCache(currency, days, data) {
  try {
    const key = `${KEYS.HISTORY_CACHE}_${currency}_${days}`;
    localStorage.setItem(key, JSON.stringify({
      data,
      savedAt: Date.now(),
    }));
  } catch (e) {
    console.warn('Storage save error:', e);
  }
}

export function loadHistoryCache(currency, days) {
  try {
    const key = `${KEYS.HISTORY_CACHE}_${currency}_${days}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // История кэшируется на 1 час
    if (Date.now() - parsed.savedAt > 60 * 60 * 1000) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

// --- Alerts ---
export function loadAlerts() {
  try {
    const raw = localStorage.getItem(KEYS.ALERTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAlerts(alerts) {
  try {
    localStorage.setItem(KEYS.ALERTS, JSON.stringify(alerts));
  } catch (e) {
    console.warn('Storage save error:', e);
  }
}

export function addAlert(alert) {
  const alerts = loadAlerts();
  const newAlert = {
    id: Date.now().toString(),
    createdAt: Date.now(),
    enabled: true,
    ...alert,
  };
  alerts.push(newAlert);
  saveAlerts(alerts);
  return newAlert;
}

export function removeAlert(id) {
  const alerts = loadAlerts().filter(a => a.id !== id);
  saveAlerts(alerts);
}

export function toggleAlert(id) {
  const alerts = loadAlerts().map(a =>
    a.id === id ? { ...a, enabled: !a.enabled } : a
  );
  saveAlerts(alerts);
  return alerts;
}

// --- Settings ---
export function loadSettings() {
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : {
      defaultCurrency: 'KGS',
      notifications: true,
    };
  } catch {
    return { defaultCurrency: 'KGS', notifications: true };
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.warn('Storage save error:', e);
  }
}

// --- Last converter amount ---
export function loadLastAmount() {
  try {
    return parseFloat(localStorage.getItem(KEYS.LAST_AMOUNT)) || 10000;
  } catch {
    return 10000;
  }
}

export function saveLastAmount(amount) {
  try {
    localStorage.setItem(KEYS.LAST_AMOUNT, amount.toString());
  } catch {}
}

// --- Check alerts ---
export function checkAlerts(rates) {
  const alerts = loadAlerts().filter(a => a.enabled);
  const triggered = [];

  for (const alert of alerts) {
    const currentRate = rates[alert.currency];
    if (!currentRate) continue;

    // rate хранится как "сколько KRW за 1 единицу валюты"
    const inverseRate = 1 / currentRate;

    if (alert.condition === 'above' && inverseRate > alert.threshold) {
      triggered.push({ ...alert, currentRate: inverseRate });
    } else if (alert.condition === 'below' && inverseRate < alert.threshold) {
      triggered.push({ ...alert, currentRate: inverseRate });
    }
  }

  return triggered;
}
