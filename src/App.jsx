import { useState } from 'react';
import { TrendingUp, History, Bell, Building2, AlertTriangle, X, Sun, Moon } from 'lucide-react';
import Home from './pages/Home';
import HistoryPage from './pages/History';
import Alerts from './pages/Alerts';
import Compare from './pages/Compare';
import { useCurrency } from './hooks/useCurrency';
import { useTheme } from './context/ThemeContext';

const TABS = [
  { id: 'home', label: 'Курсы', Icon: TrendingUp },
  { id: 'history', label: 'История', Icon: History },
  { id: 'alerts', label: 'Алерты', Icon: Bell },
  { id: 'compare', label: 'Обменники', Icon: Building2 },
];

function AlertToast({ alerts, onDismiss }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-[480px] mx-auto">
      <div className="bg-primary rounded-2xl p-4 shadow-2xl flex items-start gap-3">
        <AlertTriangle size={20} className="text-white flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          {alerts.map(alert => (
            <div key={alert.id} className="text-white text-sm">
              <span className="font-semibold">{alert.currency}</span>
              {' '}{alert.condition === 'above' ? 'поднялся выше' : 'упал ниже'}{' '}
              <span className="font-semibold">{alert.threshold} ₩</span>
              {' '}(сейчас {alert.currentRate?.toFixed(1)} ₩)
            </div>
          ))}
        </div>
        <button onClick={onDismiss} className="text-white/70">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [historyCurrency, setHistoryCurrency] = useState('KGS');
  const { triggeredAlerts, clearAlerts } = useCurrency();
  const { theme, toggle } = useTheme();

  const handleCurrencySelect = (currency) => {
    setHistoryCurrency(currency);
    setActiveTab('history');
  };

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <Home onCurrencySelect={handleCurrencySelect} />;
      case 'history':
        return <HistoryPage initialCurrency={historyCurrency} />;
      case 'alerts':
        return <Alerts />;
      case 'compare':
        return <Compare />;
      default:
        return <Home onCurrencySelect={handleCurrencySelect} />;
    }
  };

  return (
    <>
      <AlertToast alerts={triggeredAlerts} onDismiss={clearAlerts} />

      <div className="flex-1 overflow-hidden flex flex-col">
        {renderPage()}
      </div>

      <nav className="flex-shrink-0 glass-nav">
        <div className="flex items-stretch" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {TABS.map(({ id, label, Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 min-w-0 flex flex-col items-center justify-center py-3 gap-1 transition-colors relative ${
                  isActive ? 'text-primary' : 'text-text-secondary'
                }`}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                <span className="text-xs font-medium">
                  {label}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            );
          })}

          <button
            onClick={toggle}
            className="w-10 flex flex-col items-center justify-center gap-1 text-text-secondary active:text-primary transition-colors border-l border-surface-2 ml-1"
            aria-label="Переключить тему"
          >
            {theme === 'dark' ? <Sun size={16} strokeWidth={1.8} /> : <Moon size={16} strokeWidth={1.8} />}
          </button>
        </div>
      </nav>
    </>
  );
}
