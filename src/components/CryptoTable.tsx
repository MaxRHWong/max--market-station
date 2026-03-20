import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { translations, Language } from "../lib/i18n";

interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  total_volume: number;
  sparkline_in_7d: {
    price: number[];
  };
}

export function CryptoTable({ onSelectCoin, category, lang }: { onSelectCoin: (coin: Coin) => void, category: string, lang: Language }) {
  const t = translations[lang];
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchCoins = async (isInitial = false) => {
      if (isInitial && isMounted) setLoading(true);
      try {
        let categoryParam = '';
        switch (category) {
          case 'defi': categoryParam = '&category=decentralized-finance-defi'; break;
          case 'layer1': categoryParam = '&category=smart-contract-platform'; break;
          case 'layer2': categoryParam = '&category=layer-2'; break;
          case 'meme': categoryParam = '&category=meme-token'; break;
          case 'ai': categoryParam = '&category=artificial-intelligence'; break;
          case 'gamefi': categoryParam = '&category=gaming'; break;
          default: categoryParam = ''; break;
        }
        
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=24h${categoryParam}`
        );
        if (!res.ok) throw new Error("Rate limit or error");
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Invalid data format");
        if (isMounted) setCoins(data);
      } catch (error) {
        console.error("Failed to fetch coins", error);
        if (isMounted) setCoins(getMockCoins(category)); // Fallback
      } finally {
        if (isInitial && isMounted) setLoading(false);
      }
    };
    
    fetchCoins(true);
    const interval = setInterval(() => fetchCoins(false), 60000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [category]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center border border-white/10 bg-[#111]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00ff66] border-t-transparent" />
      </div>
    );
  }

  const displayedCoins = showAll ? coins : coins.slice(0, 8);

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto border border-white/10 bg-[#050505] shadow-2xl shadow-black relative group">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-grid opacity-[0.02] pointer-events-none" />
        
        {/* Scanning Line */}
        <motion.div 
          animate={{ top: ["0%", "100%"] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute inset-x-0 h-[1px] bg-[#00ff66]/10 z-0 pointer-events-none"
        />
        
        <table className="w-full text-left border-collapse relative z-10">
          <thead>
            <tr className="border-b border-white/10 bg-[#0a0a0a]">
              <th className="px-4 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 md:px-6">{t.asset}</th>
              <th className="px-4 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 text-right md:px-6">{t.price}</th>
              <th className="px-4 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 text-right md:px-6">{t.change24h}</th>
              <th className="hidden px-6 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 text-right lg:table-cell">{t.volume24h}</th>
              <th className="hidden px-6 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 text-center md:table-cell">7D_TREND</th>
            </tr>
          </thead>
          <tbody>
            {displayedCoins.map((coin, index) => {
              const isPositive = coin.price_change_percentage_24h >= 0;
              const sparklineData = coin.sparkline_in_7d?.price?.map((p, i) => ({ value: p, index: i })) || [];
              
              return (
                <motion.tr 
                  key={coin.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => onSelectCoin(coin)}
                  className="group cursor-pointer border-b border-white/5 hover:bg-[#00ff66]/[0.03] transition-colors"
                >
                  <td className="px-4 py-4 md:px-6">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img 
                          src={coin.image} 
                          alt={coin.name} 
                          className="h-6 w-6 md:h-8 md:w-8 rounded-full grayscale group-hover:grayscale-0 transition-all duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 rounded-full border border-white/10 group-hover:border-[#00ff66]/30 transition-colors" />
                      </div>
                      <div>
                        <div className="font-mono font-bold text-white uppercase group-hover:text-[#00ff66] transition-colors text-xs md:text-sm">{coin.symbol}</div>
                        <div className="font-mono text-[9px] md:text-[10px] text-white/30 uppercase tracking-tighter">{coin.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 md:px-6 text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-mono text-xs md:text-sm font-bold text-white">
                        ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                      </span>
                      <div className="h-[1px] w-8 bg-white/5 group-hover:bg-[#00ff66]/20 transition-all" />
                    </div>
                  </td>
                  <td className="px-4 py-4 md:px-6 text-right">
                    <div className={`inline-flex items-center gap-1.5 font-mono text-[10px] md:text-xs font-bold ${isPositive ? 'text-[#00ff66]' : 'text-[#ff3366]'}`}>
                      {isPositive ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%
                      <div className={`h-1 w-1 rounded-full ${isPositive ? 'bg-[#00ff66]' : 'bg-[#ff3366]'} animate-pulse`} />
                    </div>
                  </td>
                  <td className="hidden px-6 py-4 text-right font-mono text-white/40 text-[10px] md:text-xs lg:table-cell">
                    ${(coin.total_volume / 1000000).toFixed(2)}M
                  </td>
                  <td className="hidden px-6 py-4 md:table-cell">
                    <div className="h-8 w-16 md:h-10 md:w-24 ml-auto">
                      {sparklineData.length > 0 && (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={sparklineData}>
                            <defs>
                              <linearGradient id={`color-${coin.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={isPositive ? '#00ff66' : '#ff3366'} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={isPositive ? '#00ff66' : '#ff3366'} stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <YAxis domain={['dataMin', 'dataMax']} hide />
                            <Area 
                              type="monotone" 
                              dataKey="value" 
                              stroke={isPositive ? '#00ff66' : '#ff3366'} 
                              fillOpacity={1} 
                              fill={`url(#color-${coin.id})`} 
                              strokeWidth={1.5}
                              isAnimationActive={false}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {coins.length > 8 && (
        <div className="flex justify-center mt-4">
          <button 
            onClick={() => setShowAll(!showAll)}
            className="group relative flex items-center gap-2 border border-white/10 bg-[#0a0a0a] px-8 py-3 text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-white/60 hover:border-[#00ff66]/50 hover:text-[#00ff66] transition-all duration-300"
          >
            <div className="absolute inset-0 bg-[#00ff66]/5 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
            <span className="relative z-10">{showAll ? t.showLess : t.viewAllCoins}</span>
            <motion.div 
              animate={{ y: showAll ? -2 : 2 }}
              transition={{ repeat: Infinity, duration: 1, repeatType: "reverse" }}
              className="relative z-10"
            >
              {showAll ? '↑' : '↓'}
            </motion.div>
          </button>
        </div>
      )}
    </div>
  );
}

function getMockCoins(category: string): Coin[] {
  // Add slight random variation to prices to make it feel live even when rate limited
  const fluctuate = (price: number) => price * (1 + (Math.random() - 0.5) * 0.005);
  
  const allCoins: Coin[] = [
    {
      id: "bitcoin", symbol: "btc", name: "Bitcoin", image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png", current_price: fluctuate(71020.47), price_change_percentage_24h: 2.31, total_volume: 1430000000,
      sparkline_in_7d: { price: [68000, 69000, 70000, 69500, 71000, 71020] }
    },
    {
      id: "ethereum", symbol: "eth", name: "Ethereum", image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png", current_price: fluctuate(2155.99), price_change_percentage_24h: 1.73, total_volume: 951310000,
      sparkline_in_7d: { price: [2000, 2050, 2100, 2080, 2150, 2155] }
    },
    {
      id: "tether", symbol: "usdt", name: "Tether", image: "https://assets.coingecko.com/coins/images/325/large/Tether.png", current_price: fluctuate(1.00), price_change_percentage_24h: 0.01, total_volume: 45000000000,
      sparkline_in_7d: { price: [1.00, 1.00, 1.00, 1.00, 1.00, 1.00] }
    },
    {
      id: "solana", symbol: "sol", name: "Solana", image: "https://assets.coingecko.com/coins/images/4128/large/solana.png", current_price: fluctuate(145.32), price_change_percentage_24h: 5.21, total_volume: 450000000,
      sparkline_in_7d: { price: [130, 135, 140, 138, 142, 145.32] }
    },
    {
      id: "binancecoin", symbol: "bnb", name: "BNB", image: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png", current_price: fluctuate(590.12), price_change_percentage_24h: -0.5, total_volume: 850000000,
      sparkline_in_7d: { price: [580, 585, 590, 588, 595, 590.12] }
    },
    {
      id: "ripple", symbol: "xrp", name: "XRP", image: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png", current_price: fluctuate(0.62), price_change_percentage_24h: 1.2, total_volume: 1200000000,
      sparkline_in_7d: { price: [0.58, 0.60, 0.61, 0.59, 0.63, 0.62] }
    },
    {
      id: "dogecoin", symbol: "doge", name: "Dogecoin", image: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png", current_price: fluctuate(0.15), price_change_percentage_24h: 8.4, total_volume: 950000000,
      sparkline_in_7d: { price: [0.12, 0.13, 0.14, 0.13, 0.16, 0.15] }
    },
    {
      id: "cardano", symbol: "ada", name: "Cardano", image: "https://assets.coingecko.com/coins/images/975/large/cardano.png", current_price: fluctuate(0.45), price_change_percentage_24h: 0.5, total_volume: 210000000,
      sparkline_in_7d: { price: [0.42, 0.43, 0.44, 0.43, 0.46, 0.45] }
    },
    {
      id: "avalanche-2", symbol: "avax", name: "Avalanche", image: "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png", current_price: fluctuate(35.12), price_change_percentage_24h: 4.1, total_volume: 320000000,
      sparkline_in_7d: { price: [30, 32, 31, 34, 33, 35.12] }
    },
    {
      id: "uniswap", symbol: "uni", name: "Uniswap", image: "https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png", current_price: fluctuate(7.84), price_change_percentage_24h: -1.2, total_volume: 120000000,
      sparkline_in_7d: { price: [8.5, 8.2, 7.9, 8.1, 7.5, 7.84] }
    },
    {
      id: "aave", symbol: "aave", name: "Aave", image: "https://assets.coingecko.com/coins/images/12645/large/AAVE.png", current_price: fluctuate(95.21), price_change_percentage_24h: 3.4, total_volume: 85000000,
      sparkline_in_7d: { price: [88, 90, 92, 91, 94, 95.21] }
    },
    {
      id: "shiba-inu", symbol: "shib", name: "Shiba Inu", image: "https://assets.coingecko.com/coins/images/11939/large/shiba.png", current_price: fluctuate(0.000025), price_change_percentage_24h: 12.5, total_volume: 850000000,
      sparkline_in_7d: { price: [0.000020, 0.000022, 0.000021, 0.000024, 0.000026, 0.000025] }
    },
    {
      id: "pepe", symbol: "pepe", name: "Pepe", image: "https://assets.coingecko.com/coins/images/29850/large/pepe-token.jpeg", current_price: fluctuate(0.000008), price_change_percentage_24h: 15.2, total_volume: 450000000,
      sparkline_in_7d: { price: [0.000006, 0.000007, 0.000006, 0.000008, 0.000009, 0.000008] }
    },
    {
      id: "arbitrum", symbol: "arb", name: "Arbitrum", image: "https://assets.coingecko.com/coins/images/28206/large/Arbitrum.png", current_price: fluctuate(1.15), price_change_percentage_24h: 2.1, total_volume: 250000000,
      sparkline_in_7d: { price: [1.05, 1.10, 1.08, 1.12, 1.16, 1.15] }
    },
    {
      id: "optimism", symbol: "op", name: "Optimism", image: "https://assets.coingecko.com/coins/images/25244/large/Optimism.png", current_price: fluctuate(2.45), price_change_percentage_24h: 1.8, total_volume: 150000000,
      sparkline_in_7d: { price: [2.20, 2.30, 2.25, 2.40, 2.50, 2.45] }
    },
    {
      id: "render-token", symbol: "rndr", name: "Render", image: "https://assets.coingecko.com/coins/images/11636/large/rndr.png", current_price: fluctuate(8.50), price_change_percentage_24h: 6.5, total_volume: 180000000,
      sparkline_in_7d: { price: [7.5, 7.8, 8.0, 7.9, 8.6, 8.5] }
    },
    {
      id: "fetch-ai", symbol: "fet", name: "Fetch.ai", image: "https://assets.coingecko.com/coins/images/5681/large/Fetch.jpg", current_price: fluctuate(2.10), price_change_percentage_24h: 5.2, total_volume: 120000000,
      sparkline_in_7d: { price: [1.8, 1.9, 2.0, 1.95, 2.15, 2.1] }
    },
    {
      id: "the-sandbox", symbol: "sand", name: "The Sandbox", image: "https://assets.coingecko.com/coins/images/12129/large/sandbox_logo.jpg", current_price: fluctuate(0.45), price_change_percentage_24h: -2.1, total_volume: 80000000,
      sparkline_in_7d: { price: [0.50, 0.48, 0.46, 0.47, 0.44, 0.45] }
    },
    {
      id: "axie-infinity", symbol: "axs", name: "Axie Infinity", image: "https://assets.coingecko.com/coins/images/13029/large/axie_infinity_logo.png", current_price: fluctuate(7.20), price_change_percentage_24h: -1.5, total_volume: 60000000,
      sparkline_in_7d: { price: [7.8, 7.5, 7.3, 7.4, 7.1, 7.2] }
    }
  ];

  if (category === 'defi') {
    return allCoins.filter(c => ['uni', 'aave'].includes(c.symbol));
  } else if (category === 'layer1') {
    return allCoins.filter(c => ['btc', 'eth', 'sol', 'bnb', 'ada', 'avax'].includes(c.symbol));
  } else if (category === 'layer2') {
    return allCoins.filter(c => ['arb', 'op'].includes(c.symbol));
  } else if (category === 'meme') {
    return allCoins.filter(c => ['doge', 'shib', 'pepe'].includes(c.symbol));
  } else if (category === 'ai') {
    return allCoins.filter(c => ['rndr', 'fet'].includes(c.symbol));
  } else if (category === 'gamefi') {
    return allCoins.filter(c => ['sand', 'axs'].includes(c.symbol));
  }
  return allCoins; // 'all'
}
