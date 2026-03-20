import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { translations, Language } from "../lib/i18n";
import { Globe2 } from "lucide-react";

interface MarketData {
  id: string;
  name: string;
  value: string;
  change: string;
  isPositive: boolean;
  history: { value: number }[];
}

function generateHistory(baseValue: number) {
  const history = [];
  let current = baseValue;
  for (let i = 0; i < 20; i++) {
    history.push({ value: current });
    current = current * (1 + (Math.random() - 0.5) * 0.005);
  }
  return history;
}

const INITIAL_MARKETS = {
  zh: [
    { id: "SH", name: "上证指数", value: "3957.05", change: "-1.24%", isPositive: false, history: generateHistory(3957.05) },
    { id: "HK", name: "恒生指数", value: "25274.40", change: "-0.88%", isPositive: false, history: generateHistory(25274.40) },
    { id: "US", name: "纳斯达克", value: "22090.69", change: "-0.28%", isPositive: false, history: generateHistory(22090.69) },
    { id: "FT", name: "纽约原油", value: "93.40", change: "-2.25%", isPositive: false, history: generateHistory(93.40) },
    { id: "FE", name: "离岸人民币", value: "6.88", change: "+0.08%", isPositive: true, history: generateHistory(6.88) },
    { id: "FT2", name: "伦敦金", value: "4707.35", change: "+1.23%", isPositive: true, history: generateHistory(4707.35) },
    { id: "JP", name: "日经225", value: "38120.50", change: "+0.45%", isPositive: true, history: generateHistory(38120.50) },
    { id: "EU", name: "欧洲斯托克", value: "4950.12", change: "+0.12%", isPositive: true, history: generateHistory(4950.12) },
  ],
  en: [
    { id: "SH", name: "SSE Composite", value: "3957.05", change: "-1.24%", isPositive: false, history: generateHistory(3957.05) },
    { id: "HK", name: "Hang Seng", value: "25274.40", change: "-0.88%", isPositive: false, history: generateHistory(25274.40) },
    { id: "US", name: "NASDAQ", value: "22090.69", change: "-0.28%", isPositive: false, history: generateHistory(22090.69) },
    { id: "FT", name: "NYMEX Crude", value: "93.40", change: "-2.25%", isPositive: false, history: generateHistory(93.40) },
    { id: "FE", name: "USD/CNH", value: "6.88", change: "+0.08%", isPositive: true, history: generateHistory(6.88) },
    { id: "FT2", name: "London Gold", value: "4707.35", change: "+1.23%", isPositive: true, history: generateHistory(4707.35) },
    { id: "JP", name: "Nikkei 225", value: "38120.50", change: "+0.45%", isPositive: true, history: generateHistory(38120.50) },
    { id: "EU", name: "Euro Stoxx 50", value: "4950.12", change: "+0.12%", isPositive: true, history: generateHistory(4950.12) },
  ]
};

export function GlobalMarkets({ lang }: { lang: Language }) {
  const t = translations[lang];
  const [markets, setMarkets] = useState<MarketData[]>(INITIAL_MARKETS[lang]);
  const [selectedMarket, setSelectedMarket] = useState<MarketData | null>(null);

  useEffect(() => {
    setMarkets(INITIAL_MARKETS[lang]);
  }, [lang]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMarkets(prev => prev.map(market => {
        const lastValue = parseFloat(market.value.replace(/,/g, ''));
        const volatility = 0.002; // 0.2% max change per minute
        const changePercent = (Math.random() - 0.5) * volatility;
        const newValue = lastValue * (1 + changePercent);
        
        const newHistory = [...market.history.slice(1), { value: newValue }];
        
        // Calculate new 24h change mock
        const currentChangeNum = parseFloat(market.change.replace('%', ''));
        const newChangeNum = currentChangeNum + (changePercent * 100);
        
        return {
          ...market,
          value: newValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          change: `${newChangeNum > 0 ? '+' : ''}${newChangeNum.toFixed(2)}%`,
          isPositive: newChangeNum >= 0,
          history: newHistory
        };
      }));
    }, 10000); // Update every 10 seconds for real-time feel

    return () => clearInterval(interval);
  }, []);

  // Double the array to create a seamless infinite scroll effect
  const marqueeItems = [...markets, ...markets];

  return (
    <>
      {/* Market Detail Modal */}
      <AnimatePresence>
        {selectedMarket && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-pointer"
            onClick={() => setSelectedMarket(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 flex flex-col gap-6 rounded-none border border-white/10 bg-[#050505] p-8 shadow-2xl cursor-default max-w-2xl w-full overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#00ff66]/30" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#00ff66]/30" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-[4px] text-xs font-bold ${getBadgeColor(selectedMarket.id)} text-white shadow-lg`}>
                    {selectedMarket.id.replace(/[0-9]/g, '')}
                  </span>
                  <div>
                    <h3 className="font-display text-2xl font-black uppercase tracking-widest text-white">
                      {selectedMarket.name}
                    </h3>
                    <p className="font-mono text-[10px] text-[#00ff66] uppercase tracking-[0.3em] opacity-60">
                      Real-Time_Index_Stream
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-3xl font-bold text-white tracking-tighter">
                    {selectedMarket.value}
                  </div>
                  <div className={`font-mono text-sm font-bold ${selectedMarket.isPositive ? 'text-[#00ff66]' : 'text-[#ff3366]'}`}>
                    {selectedMarket.change}
                  </div>
                </div>
              </div>

              <div className="h-64 w-full bg-white/[0.02] border border-white/5 p-4 relative">
                <div className="absolute inset-0 pointer-events-none opacity-10">
                  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="grid-modal" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                        <rect x="0" y="0" width="40" height="40" fill="none" stroke="#ffffff" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect x="0" y="0" width="100%" height="100%" fill="url(#grid-modal)"></rect>
                  </svg>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={selectedMarket.history}>
                    <defs>
                      <linearGradient id="modal-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={selectedMarket.isPositive ? '#00ff66' : '#ff3366'} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={selectedMarket.isPositive ? '#00ff66' : '#ff3366'} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <YAxis domain={['dataMin', 'dataMax']} hide />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke={selectedMarket.isPositive ? '#00ff66' : '#ff3366'} 
                      fillOpacity={1} 
                      fill="url(#modal-gradient)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "High", value: (parseFloat(selectedMarket.value.replace(/,/g, '')) * 1.01).toFixed(2) },
                  { label: "Low", value: (parseFloat(selectedMarket.value.replace(/,/g, '')) * 0.99).toFixed(2) },
                  { label: "Vol", value: "1.2B" }
                ].map((stat, i) => (
                  <div key={i} className="bg-white/5 p-3 border border-white/5">
                    <div className="text-[10px] font-mono text-white/40 uppercase mb-1">{stat.label}</div>
                    <div className="font-mono text-sm font-bold text-white">{stat.value}</div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setSelectedMarket(null)}
                className="w-full py-3 bg-white/5 border border-white/10 text-white font-mono text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Close_Terminal
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div id="markets-section" className="relative flex items-center overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl shadow-2xl shadow-[#00ff66]/5 group">
        {/* Scanning Line */}
        <motion.div 
          animate={{ left: ["-100%", "100%"] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-y-0 w-[1px] bg-[#00ff66]/20 z-10 pointer-events-none"
        />
        
        {/* Fixed Label on the Left */}
        <div className="relative z-20 flex h-full shrink-0 items-center gap-2 border-r border-white/10 bg-[#050505] px-4 py-4 md:px-6 shadow-[10px_0_20px_-10px_rgba(0,0,0,0.8)]">
          <Globe2 className="h-5 w-5 text-[#00ff66]" />
          <div className="flex flex-col">
            <span className="font-display text-xs font-bold uppercase tracking-widest text-white md:text-sm">
              {t.markets}
            </span>
            <span className="font-mono text-[9px] text-[#00ff66]/70 uppercase tracking-widest">
              Live Data
            </span>
          </div>
        </div>

        {/* Marquee Container */}
        <div className="relative flex-1 overflow-hidden py-2">
          <div className="pointer-events-none absolute inset-0 opacity-[0.02] z-0">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid-pattern-markets" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <rect x="0" y="0" width="20" height="20" fill="none" stroke="#ffffff" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect x="0" y="0" width="100%" height="100%" fill="url(#grid-pattern-markets)"></rect>
            </svg>
          </div>

          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />

          <div className="flex w-max animate-marquee items-center hover:[animation-play-state:paused]">
            {marqueeItems.map((market, index) => (
              <div
                key={`${market.id}-${index}`}
                onClick={() => setSelectedMarket(market)}
                className="group relative flex w-60 shrink-0 flex-col border-r border-white/5 px-5 transition-colors hover:bg-white/[0.02] cursor-pointer"
              >
              <div className="mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`flex h-4 w-4 items-center justify-center rounded-[2px] text-[9px] font-bold ${getBadgeColor(market.id)} text-white shadow-sm`}>
                    {market.id.replace(/[0-9]/g, '')}
                  </span>
                  <span className="text-xs font-medium text-white/90 uppercase tracking-wider">{market.name}</span>
                </div>
                <span className={`font-mono text-xs font-bold ${market.isPositive ? 'text-[#00ff66]' : 'text-[#ff3366]'}`}>
                  {market.change}
                </span>
              </div>
              
              <div className="flex items-end justify-between gap-3">
                <span className="font-mono text-lg font-bold text-white tracking-tight drop-shadow-md">
                  {market.value}
                </span>
                <div className="h-8 w-16 opacity-70 group-hover:opacity-100 transition-opacity">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={market.history}>
                      <defs>
                        <linearGradient id={`gradient-mkt-${market.id}-${index}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={market.isPositive ? '#00ff66' : '#ff3366'} stopOpacity={0.4}/>
                          <stop offset="95%" stopColor={market.isPositive ? '#00ff66' : '#ff3366'} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <YAxis domain={['dataMin', 'dataMax']} hide />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke={market.isPositive ? '#00ff66' : '#ff3366'} 
                        fillOpacity={1} 
                        fill={`url(#gradient-mkt-${market.id}-${index})`} 
                        strokeWidth={1.5}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}

function getBadgeColor(id: string) {
  switch (id.replace(/[0-9]/g, '')) {
    case 'SH': return 'bg-yellow-600/80 border border-yellow-500/50';
    case 'HK': return 'bg-orange-600/80 border border-orange-500/50';
    case 'US': return 'bg-blue-600/80 border border-blue-500/50';
    case 'FT': return 'bg-red-600/80 border border-red-500/50';
    case 'FE': return 'bg-purple-600/80 border border-purple-500/50';
    case 'JP': return 'bg-indigo-600/80 border border-indigo-500/50';
    case 'EU': return 'bg-teal-600/80 border border-teal-500/50';
    default: return 'bg-gray-600/80 border border-gray-500/50';
  }
}
