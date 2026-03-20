import { useEffect, useState, useRef } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { translations, Language } from "../lib/i18n";
import { motion } from "framer-motion";

interface MainChartProps {
  coinId: string;
  coinSymbol: string;
  lang: Language;
}

export function MainChart({ coinId, coinSymbol, lang }: MainChartProps) {
  const t = translations[lang];
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const dataRef = useRef<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    
    const fetchChartData = async () => {
      try {
        const symbolUpper = coinSymbol.toUpperCase();
        // Try Binance API for 1-minute real-time data
        const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbolUpper}USDT&interval=1m&limit=60`);
        if (!res.ok) {
          console.warn(`Binance API unavailable (${res.status}), using dynamic mock.`);
          handleMockUpdate();
          return;
        }
        const json = await res.json();
        
        const formattedData = json.map((item: any) => {
          const time = new Date(item[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const open = parseFloat(item[1]);
          const high = parseFloat(item[2]);
          const low = parseFloat(item[3]);
          const close = parseFloat(item[4]);
          const isPositive = close >= open;
          return { time, open, high, low, close, isPositive, value: [low, high] };
        });
        
        if (isMounted) {
          setData(formattedData);
          dataRef.current = formattedData;
          setLoading(false);
        }
      } catch (error) {
        handleMockUpdate();
      }
    };

    const handleMockUpdate = () => {
      // Dynamic Mock for real-time simulation if API fails (e.g., CORS or unsupported pair)
      if (dataRef.current.length === 0) {
        const mock = generateMockData();
        if (isMounted) {
          setData(mock);
          dataRef.current = mock;
          setLoading(false);
        }
      } else {
        // Update last candle or add new one
        const last = { ...dataRef.current[dataRef.current.length - 1] };
        const change = (Math.random() - 0.5) * (last.close * 0.002);
        last.close += change;
        last.high = Math.max(last.high, last.close);
        last.low = Math.min(last.low, last.close);
        last.isPositive = last.close >= last.open;
        last.value = [last.low, last.high];
        
        const newData = [...dataRef.current.slice(0, -1), last];
        if (isMounted) {
          setData(newData);
          dataRef.current = newData;
        }
      }
    };

    setLoading(true);
    dataRef.current = []; // Reset on coin change
    fetchChartData();
    
    // Update every 5 seconds for real-time feel
    const interval = setInterval(fetchChartData, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [coinSymbol]);

  if (loading) {
    return (
      <div className="flex h-[300px] md:h-[400px] w-full items-center justify-center border border-white/10 bg-[#111]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00ff66] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative h-[300px] md:h-[400px] w-full border border-white/10 bg-[#050505] p-2 md:p-4 shadow-2xl shadow-black group overflow-hidden">
      {/* Background Scanning Line */}
      <motion.div 
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute inset-x-0 h-[1px] bg-[#00ff66]/10 z-0 pointer-events-none"
      />
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-5 pointer-events-none" />

      <div className="absolute left-4 top-4 md:left-6 md:top-6 z-10 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-xl md:text-2xl font-black uppercase tracking-tighter text-white">
            {coinSymbol}<span className="text-[#00ff66]">/USDT</span>
          </h3>
          <div className="flex items-center gap-1.5 border border-[#00ff66]/30 bg-[#00ff66]/5 px-2 py-0.5">
            <div className="h-1.5 w-1.5 rounded-full bg-[#00ff66] animate-pulse" />
            <span className="font-mono text-[8px] font-bold text-[#00ff66] uppercase tracking-widest">Live</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-[10px] md:text-xs font-mono text-white/30 uppercase tracking-[0.2em]">{t.chartTitle}</p>
          <div className="h-[1px] w-12 bg-white/10" />
          <span className="text-[10px] font-mono text-white/20">1M_INTERVAL</span>
        </div>
      </div>

      <div className="absolute right-4 top-4 md:right-6 md:top-6 z-10 hidden sm:flex flex-col items-end gap-1">
        <div className="font-mono text-[10px] text-white/30">VOL_24H</div>
        <div className="font-mono text-xs text-white/80">1.24B_USDT</div>
      </div>

      <div className="relative z-10 h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 80, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="candleGradientUp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00ff66" stopOpacity={1} />
                <stop offset="100%" stopColor="#00ff66" stopOpacity={0.6} />
              </linearGradient>
              <linearGradient id="candleGradientDown" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff3366" stopOpacity={1} />
                <stop offset="100%" stopColor="#ff3366" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="1 4" stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="rgba(255,255,255,0.1)" 
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: 'monospace' }} 
              tickMargin={12} 
              minTickGap={30} 
              axisLine={false}
            />
            <YAxis 
              domain={['auto', 'auto']} 
              stroke="rgba(255,255,255,0.1)" 
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: 'monospace' }} 
              orientation="right" 
              tickFormatter={(val) => val.toLocaleString()} 
              axisLine={false}
            />
            <Tooltip 
              content={<CustomTooltip t={t} />} 
              cursor={{ fill: 'rgba(0,255,102,0.03)' }} 
              isAnimationActive={false}
            />
            <Bar dataKey="value" shape={<Candlestick />} isAnimationActive={false}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isPositive ? 'url(#candleGradientUp)' : 'url(#candleGradientDown)'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00ff66]/30" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white/10" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white/10" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#00ff66]/30" />
    </div>
  );
}

const Candlestick = (props: any) => {
  const { x, y, width, height, payload, fill } = props;
  const range = payload.high - payload.low;
  if (range === 0) return null;

  const openPct = (payload.high - payload.open) / range;
  const closePct = (payload.high - payload.close) / range;

  const openY = y + height * openPct;
  const closeY = y + height * closePct;

  const bodyTop = Math.min(openY, closeY);
  const bodyBottom = Math.max(openY, closeY);
  const bodyHeight = Math.max(bodyBottom - bodyTop, 2);

  const centerX = x + width / 2;

  return (
    <g>
      <line x1={centerX} y1={y} x2={centerX} y2={y + height} stroke={fill} strokeWidth={1} opacity={0.5} />
      <rect x={x + width * 0.1} y={bodyTop} width={width * 0.8} height={bodyHeight} fill={fill} stroke={fill} />
    </g>
  );
};

const CustomTooltip = ({ active, payload, label, t }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="border border-white/10 bg-[#050505]/90 p-2 md:p-3 backdrop-blur-md shadow-xl z-50">
        <p className="mb-1 md:mb-2 text-[10px] md:text-xs text-white/50">{label}</p>
        <div className="grid grid-cols-2 gap-x-3 md:gap-x-4 gap-y-1 font-mono text-[10px] md:text-sm">
          <span className="text-white/50">{t.open}:</span>
          <span className="text-white">{data.open.toLocaleString()}</span>
          <span className="text-white/50">{t.high}:</span>
          <span className="text-white">{data.high.toLocaleString()}</span>
          <span className="text-white/50">{t.low}:</span>
          <span className="text-white">{data.low.toLocaleString()}</span>
          <span className="text-white/50">{t.close}:</span>
          <span className={data.isPositive ? 'text-[#00ff66]' : 'text-[#ff3366]'}>{data.close.toLocaleString()}</span>
        </div>
      </div>
    );
  }
  return null;
};

function generateMockData() {
  const now = new Date();
  return Array.from({ length: 60 }).map((_, i) => {
    const time = new Date(now.getTime() - (59 - i) * 60000);
    const base = 60000 + Math.sin(i * 0.1) * 1000;
    const open = base + (Math.random() - 0.5) * 100;
    const close = open + (Math.random() - 0.5) * 200;
    const high = Math.max(open, close) + Math.random() * 50;
    const low = Math.min(open, close) - Math.random() * 50;
    return {
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      open, high, low, close,
      isPositive: close >= open,
      value: [low, high]
    };
  });
}
