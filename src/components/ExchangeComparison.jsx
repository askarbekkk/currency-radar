import { useState } from 'react';
import { MapPin, Star, Navigation, TrendingUp, X } from 'lucide-react';
import { CURRENCY_INFO } from '../api/currency';

const EXCHANGES = [
  {
    id: 1,
    name: 'Myeongdong Exchange',
    nameKo: '명동환전소',
    location: 'Myeongdong, Seoul',
    lat: 37.5633,
    lng: 126.9847,
    rating: 4.8,
    spread: 0.5,
    notes: 'Лучший курс в центре Сеула',
    highlight: true,
  },
  {
    id: 2,
    name: 'Incheon Airport Exchange',
    nameKo: '인천공항 환전',
    location: 'Incheon Airport',
    lat: 37.4602,
    lng: 126.4407,
    rating: 3.9,
    spread: 3.5,
    notes: 'Удобно, но невыгодный курс',
    highlight: false,
  },
  {
    id: 3,
    name: 'Hana Bank',
    nameKo: '하나은행',
    location: 'Myeongdong, Seoul',
    lat: 37.5628,
    lng: 126.9817,
    rating: 4.2,
    spread: 1.5,
    notes: 'Работает с переводами в KGS',
    highlight: false,
  },
  {
    id: 4,
    name: 'KB Kookmin Bank',
    nameKo: 'KB국민은행',
    location: 'Myeongdong, Seoul',
    lat: 37.5636,
    lng: 126.9820,
    rating: 4.1,
    spread: 1.8,
    notes: 'Онлайн-обмен выгоднее',
    highlight: false,
  },
  {
    id: 5,
    name: 'Wise (TransferWise)',
    nameKo: 'Wise 송금',
    location: 'Online',
    rating: 4.9,
    spread: 0.8,
    notes: 'Лучший вариант для переводов',
    highlight: true,
    isOnline: true,
    url: 'https://wise.com',
  },
  {
    id: 6,
    name: 'Dongdaemun Market',
    nameKo: '동대문 환전소',
    location: 'Dongdaemun, Seoul',
    lat: 37.5663,
    lng: 127.0091,
    rating: 4.5,
    spread: 1.0,
    notes: 'Выгодный курс, рядом с рынком',
    highlight: false,
  },
];

function getEffectiveRate(marketRate, spread) {
  return marketRate * (1 - spread / 100);
}

function openGoogleMaps(exchange) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${exchange.lat},${exchange.lng}&travelmode=transit`;
  window.open(url, '_blank', 'noopener');
}

function openNaverMaps(exchange) {
  const name = encodeURIComponent(exchange.nameKo);
  const deepLink = `nmap://route/public?dlat=${exchange.lat}&dlng=${exchange.lng}&dname=${name}&appname=com.askar.currencyradar`;
  const webFallback = `https://map.naver.com/v5/directions/-/-/${exchange.lat},${exchange.lng},${name}/-/transit?c=${exchange.lng},${exchange.lat},15,0,0,0,dh`;

  // Try deep link; if Naver Maps not installed, fall back to web after 1.5s
  window.location.href = deepLink;
  const timer = setTimeout(() => {
    window.open(webFallback, '_blank', 'noopener');
  }, 1500);

  const cancel = () => { if (document.hidden) clearTimeout(timer); };
  document.addEventListener('visibilitychange', cancel, { once: true });
}

function MapSheet({ exchange, onClose }) {
  if (!exchange) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 max-w-[480px] mx-auto">
        <div className="glass-card rounded-t-3xl p-6 pb-8">
          {/* Handle */}
          <div className="w-10 h-1 bg-surface-2 rounded-full mx-auto mb-5" />

          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="font-semibold text-text-primary">{exchange.name}</p>
              <div className="flex items-center gap-1 text-text-secondary text-sm mt-0.5">
                <MapPin size={12} />
                <span>{exchange.location}</span>
              </div>
            </div>
            <button onClick={onClose} className="text-text-secondary p-1">
              <X size={20} />
            </button>
          </div>

          <p className="text-text-secondary text-xs mb-4 text-center">
            Выберите приложение для маршрута
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { openGoogleMaps(exchange); onClose(); }}
              className="flex flex-col items-center gap-2 bg-surface-2 rounded-2xl py-4 active:bg-primary/20 transition-colors"
            >
              <span className="text-2xl">🗺️</span>
              <span className="text-text-primary text-sm font-medium">Google Maps</span>
            </button>

            <button
              onClick={() => { openNaverMaps(exchange); onClose(); }}
              className="flex flex-col items-center gap-2 bg-surface-2 rounded-2xl py-4 active:bg-primary/20 transition-colors"
            >
              <span className="text-2xl">🟢</span>
              <span className="text-text-primary text-sm font-medium">Naver Maps</span>
              <span className="text-text-secondary text-xs -mt-1">앱 또는 웹</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ExchangeComparison({ rates, selectedCurrency }) {
  const [mapTarget, setMapTarget] = useState(null);
  const currency = selectedCurrency || 'KGS';
  const info = CURRENCY_INFO[currency];
  const marketRate = rates ? (1 / rates[currency]) : null;

  const sorted = [...EXCHANGES].sort((a, b) => a.spread - b.spread);

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-text-secondary text-sm">
              Сравнение обменников для <span className="text-primary font-medium">{currency}</span>
            </p>
            {marketRate && (
              <p className="text-text-secondary text-xs mt-0.5">
                Рыночный курс: {marketRate.toFixed(1)} ₩ за 1 {info?.symbol}
              </p>
            )}
          </div>
          <TrendingUp size={18} className="text-primary" />
        </div>

        <div className="grid gap-3">
          {sorted.map((exchange, index) => {
            const effectiveRate = marketRate
              ? getEffectiveRate(marketRate, exchange.spread)
              : null;

            return (
              <div
                key={exchange.id}
                className={`glass-card rounded-2xl p-4 relative ${
                  exchange.highlight ? 'border-primary/30' : ''
                }`}
              >
                {index === 0 && (
                  <div className="absolute top-3 right-3 bg-success text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    Лучший
                  </div>
                )}

                <div className="flex items-start justify-between pr-14">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-text-primary text-sm">
                        {exchange.name}
                      </span>
                      {exchange.isOnline && (
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
                          Онлайн
                        </span>
                      )}
                    </div>
                    <div className="text-text-secondary text-xs mt-0.5">{exchange.nameKo}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-1.5 mb-2">
                  {!exchange.isOnline && (
                    <div className="flex items-center gap-1 text-text-secondary text-xs">
                      <MapPin size={11} />
                      <span>{exchange.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-yellow-400 text-xs">
                    <Star size={11} fill="currentColor" />
                    <span>{exchange.rating}</span>
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    {effectiveRate ? (
                      <div>
                        <span className={`font-bold text-base ${
                          index === 0 ? 'text-success' : 'text-text-primary'
                        }`}>
                          {effectiveRate.toFixed(1)} ₩
                        </span>
                        <span className="text-text-secondary text-xs ml-1">
                          за 1 {info?.symbol}
                        </span>
                      </div>
                    ) : (
                      <span className="text-text-secondary text-sm">Курс недоступен</span>
                    )}
                    <div className="text-text-secondary text-xs mt-0.5">
                      Комиссия: ~{exchange.spread}%
                    </div>
                    <div className="text-text-secondary text-xs">{exchange.notes}</div>
                  </div>

                  {/* Map / Link button */}
                  {exchange.isOnline ? (
                    <a
                      href={exchange.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-primary/10 text-primary rounded-xl px-3 py-2 text-xs font-medium active:bg-primary/20 transition-colors"
                    >
                      <span>Открыть</span>
                    </a>
                  ) : (
                    <button
                      onClick={() => setMapTarget(exchange)}
                      className="flex items-center gap-1.5 bg-primary/10 text-primary rounded-xl px-3 py-2 text-xs font-medium active:bg-primary/20 transition-colors"
                    >
                      <Navigation size={13} />
                      <span>Маршрут</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-text-secondary text-xs text-center mt-4 px-4">
          * Курсы обменников приблизительные. Уточняйте актуальный курс перед обменом.
        </p>
      </div>

      <MapSheet exchange={mapTarget} onClose={() => setMapTarget(null)} />
    </>
  );
}
