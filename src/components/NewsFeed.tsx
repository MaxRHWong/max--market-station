import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { translations, Language } from "../lib/i18n";

interface NewsItem {
  id: string;
  title: string;
  source_info: {
    name: string;
  };
  published_on: number;
}

export function NewsFeed({ lang }: { lang: Language }) {
  const t = translations[lang];
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Keep track of the mock news state across renders to simulate a real live feed
  const mockNewsRef = useRef<NewsItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    
    // Initialize mock news if empty
    if (mockNewsRef.current.length === 0) {
      mockNewsRef.current = lang === 'zh' ? [...MOCK_NEWS_ZH] : [...MOCK_NEWS_EN];
      // Adjust initial timestamps to be recent
      mockNewsRef.current = mockNewsRef.current.map((item, index) => ({
        ...item,
        published_on: Math.floor(Date.now() / 1000) - (index * 180)
      }));
    } else {
      // If language changed, swap the base templates but keep the "live" feel
      const templates = lang === 'zh' ? MOCK_NEWS_ZH : MOCK_NEWS_EN;
      mockNewsRef.current = mockNewsRef.current.map((item, index) => ({
        ...item,
        title: templates[index % templates.length].title,
        source_info: templates[index % templates.length].source_info
      }));
    }

    const fetchNews = async (isInitial = false) => {
      if (isInitial && isMounted) setLoading(true);
      
      const newsLang = lang === 'zh' ? 'ZH' : 'EN';
      
      try {
        const res = await fetch(`https://min-api.cryptocompare.com/data/v2/news/?lang=${newsLang}`);
        if (!res.ok) throw new Error("API Rate Limit");
        const data = await res.json();
        
        if (data && data.Data && Array.isArray(data.Data) && data.Data.length > 0) {
          if (isMounted) setNews(data.Data.slice(0, 20));
        } else {
          throw new Error("Invalid data format or empty");
        }
      } catch (error) {
        console.error(`Failed to fetch ${lang} news, falling back to live mock`, error);
        if (isMounted) {
          // Generate a "new" news item to make it feel live if it's not the initial load
          if (!isInitial && Math.random() > 0.6) {
            const templates = lang === 'zh' ? MOCK_NEWS_ZH : MOCK_NEWS_EN;
            const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
            const newItem: NewsItem = {
              id: `${lang}-live-${Date.now()}`,
              title: randomTemplate.title,
              source_info: randomTemplate.source_info,
              published_on: Math.floor(Date.now() / 1000)
            };
            mockNewsRef.current = [newItem, ...mockNewsRef.current].slice(0, 20);
          } else if (isInitial) {
            // Initialize with templates if initial load fails
            const templates = lang === 'zh' ? MOCK_NEWS_ZH : MOCK_NEWS_EN;
            mockNewsRef.current = templates.map((item, index) => ({
              ...item,
              published_on: Math.floor(Date.now() / 1000) - (index * 300)
            }));
          }
          setNews([...mockNewsRef.current]);
        }
      } finally {
        if (isInitial && isMounted) setLoading(false);
      }
    };

    fetchNews(true);
    const interval = setInterval(() => fetchNews(false), 60000); // Minute-level updates

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [lang]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const getSourceColor = (sourceName: string) => {
    const colors = [
      'text-[#00ff66] bg-[#00ff66]/10 border-[#00ff66]/20',
      'text-[#00ccff] bg-[#00ccff]/10 border-[#00ccff]/20',
      'text-[#ff3366] bg-[#ff3366]/10 border-[#ff3366]/20',
      'text-[#ffcc00] bg-[#ffcc00]/10 border-[#ffcc00]/20',
      'text-[#cc00ff] bg-[#cc00ff]/10 border-[#cc00ff]/20',
    ];
    let hash = 0;
    for (let i = 0; i < sourceName.length; i++) {
      hash = sourceName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center border border-white/10 bg-[#111]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00ff66] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px] border border-white/10 bg-[#050505] shadow-2xl shadow-black relative group overflow-hidden">
      {/* Scanning Line */}
      <motion.div 
        animate={{ top: ["0%", "100%"] }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="absolute inset-x-0 h-[1px] bg-[#00ff66]/10 z-0 pointer-events-none"
      />
      
      <div className="flex items-center justify-between border-b border-white/10 bg-[#0a0a0a] px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="relative h-2 w-2">
            <div className="absolute inset-0 rounded-full bg-[#00ff66] animate-ping opacity-75" />
            <div className="relative h-2 w-2 rounded-full bg-[#00ff66]" />
          </div>
          <h2 className="font-display text-sm md:text-base font-bold uppercase tracking-[0.2em] text-white">
            {t.latestNews}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-[#00ff66]/40" />
            <span className="h-1 w-1 rounded-full bg-[#00ff66]/40" />
            <span className="h-1 w-1 rounded-full bg-[#00ff66]" />
          </div>
          <span className="text-[9px] font-mono text-[#00ff66] uppercase tracking-widest animate-pulse">
            Terminal_Active
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-opacity-5">
        <div className="flex flex-col">
          {news.map((item, index) => {
            const sourceColorClass = getSourceColor(item.source_info?.name || 'News');
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  duration: 0.4,
                  delay: index * 0.05,
                  ease: [0.215, 0.61, 0.355, 1]
                }}
                className="group relative flex gap-4 border-b border-white/5 hover:bg-[#00ff66]/[0.02] p-4 transition-all duration-300"
              >
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#00ff66] scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300" />
                
                <div className="flex flex-col items-end gap-1 shrink-0 pt-1 w-14">
                  <div className="font-mono text-[10px] text-[#00ff66] opacity-60 group-hover:opacity-100 transition-opacity">
                    {formatTime(item.published_on)}
                  </div>
                  <div className="h-[1px] w-4 bg-white/10 group-hover:w-8 group-hover:bg-[#00ff66]/30 transition-all" />
                </div>

                <div className="flex flex-col gap-2 w-full">
                  <div className="flex items-center justify-between">
                    <span className={`text-[8px] border px-2 py-0.5 rounded-none font-bold uppercase tracking-[0.15em] ${sourceColorClass}`}>
                      {item.source_info?.name || 'INTEL_CORE'}
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="h-1 w-1 rounded-full bg-[#00ff66] animate-pulse" />
                    </div>
                  </div>
                  <p className="text-xs md:text-[13px] text-white/90 leading-relaxed font-medium tracking-wide group-hover:text-white transition-colors">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-4 mt-1 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                    <span className="font-mono text-[8px] text-[#00ff66]/50 uppercase tracking-tighter">Encrypted_Link_Ready</span>
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-[#00ff66]/20 to-transparent" />
                  </div>
                </div>
              </motion.div>
            );
          })}
          
          <div className="p-6 flex flex-col items-center justify-center gap-3 opacity-30">
            <div className="flex gap-1">
              {[1, 2, 3].map(i => (
                <motion.div
                  key={i}
                  animate={{ height: [4, 12, 4] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                  className="w-0.5 bg-[#00ff66]"
                />
              ))}
            </div>
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#00ff66]">
              Scanning_Network...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const MOCK_NEWS_EN: NewsItem[] = [
  {
    id: "1",
    title: "Bitcoin Surges Past $70,000 as Institutional Adoption Accelerates Globally",
    source_info: { name: "Bloomberg" },
    published_on: Date.now() / 1000 - 120,
  },
  {
    id: "2",
    title: "Ethereum Foundation Announces Next Major Network Upgrade Timeline",
    source_info: { name: "AP News" },
    published_on: Date.now() / 1000 - 340,
  },
  {
    id: "3",
    title: "New Web3 Protocol Aims to Revolutionize Decentralized Identity",
    source_info: { name: "CoinTelegraph" },
    published_on: Date.now() / 1000 - 800,
  },
  {
    id: "4",
    title: "Global Markets React to Latest Federal Reserve Interest Rate Decision",
    source_info: { name: "Reuters" },
    published_on: Date.now() / 1000 - 1200,
  },
  {
    id: "5",
    title: "Major Exchange Reports Record Trading Volumes in Q1",
    source_info: { name: "CoinDesk" },
    published_on: Date.now() / 1000 - 1500,
  },
  {
    id: "6",
    title: "Regulatory Clarity Expected in Upcoming EU Crypto Framework",
    source_info: { name: "Coinglass" },
    published_on: Date.now() / 1000 - 2100,
  },
  {
    id: "7",
    title: "DeFi Total Value Locked Reaches New All-Time High",
    source_info: { name: "DefiLlama" },
    published_on: Date.now() / 1000 - 2500,
  },
  {
    id: "8",
    title: "Central Banks Explore Interoperability for Cross-Border CBDC Payments",
    source_info: { name: "Financial Times" },
    published_on: Date.now() / 1000 - 3200,
  },
  {
    id: "9",
    title: "AI Tokens Rally as Tech Giants Announce Blockchain Integrations",
    source_info: { name: "Decrypt" },
    published_on: Date.now() / 1000 - 3600,
  },
  {
    id: "10",
    title: "Layer 2 Networks See Massive Inflow of Stablecoins",
    source_info: { name: "The Block" },
    published_on: Date.now() / 1000 - 4200,
  },
  {
    id: "11",
    title: "Institutional Investors Shift Focus to Real World Asset Tokenization",
    source_info: { name: "Blockworks" },
    published_on: Date.now() / 1000 - 4800,
  },
  {
    id: "12",
    title: "GameFi Sector Rebounds with Launch of AAA Web3 Titles",
    source_info: { name: "VentureBeat" },
    published_on: Date.now() / 1000 - 5400,
  }
];

const MOCK_NEWS_ZH: NewsItem[] = [
  {
    id: "zh1",
    title: "比特币突破70,000美元大关，全球机构采用率持续加速",
    source_info: { name: "彭博社" },
    published_on: Date.now() / 1000 - 120,
  },
  {
    id: "zh2",
    title: "以太坊基金会公布下一次重大网络升级时间表",
    source_info: { name: "美联社" },
    published_on: Date.now() / 1000 - 340,
  },
  {
    id: "zh3",
    title: "美联储最新利率决议引发全球市场剧烈波动",
    source_info: { name: "金十数据" },
    published_on: Date.now() / 1000 - 800,
  },
  {
    id: "zh4",
    title: "全新Web3协议旨在彻底改变去中心化身份验证",
    source_info: { name: "律动 BlockBeats" },
    published_on: Date.now() / 1000 - 1200,
  },
  {
    id: "zh5",
    title: "主流加密货币交易所第一季度交易量创下历史新高",
    source_info: { name: "Coinglass" },
    published_on: Date.now() / 1000 - 1500,
  },
  {
    id: "zh6",
    title: "欧盟即将出台的加密货币框架有望带来监管清晰度",
    source_info: { name: "Foresight News" },
    published_on: Date.now() / 1000 - 2100,
  },
  {
    id: "zh7",
    title: "多国央行探讨数字货币(CBDC)跨境支付互操作性",
    source_info: { name: "华尔街见闻" },
    published_on: Date.now() / 1000 - 2800,
  },
  {
    id: "zh8",
    title: "Layer 2 扩容方案总锁仓量突破新高，生态持续繁荣",
    source_info: { name: "Odaily 星球日报" },
    published_on: Date.now() / 1000 - 3500,
  },
  {
    id: "zh9",
    title: "科技巨头宣布区块链整合计划，AI概念代币集体大涨",
    source_info: { name: "链闻 ChainNews" },
    published_on: Date.now() / 1000 - 3600,
  },
  {
    id: "zh10",
    title: "稳定币大规模流入Layer 2网络，链上活跃度激增",
    source_info: { name: "吴说区块链" },
    published_on: Date.now() / 1000 - 4200,
  },
  {
    id: "zh11",
    title: "机构投资者将目光转向现实世界资产(RWA)代币化",
    source_info: { name: "PANews" },
    published_on: Date.now() / 1000 - 4800,
  },
  {
    id: "zh12",
    title: "3A级Web3游戏大作发布，GameFi板块迎来强势反弹",
    source_info: { name: "深潮 TechFlow" },
    published_on: Date.now() / 1000 - 5400,
  }
];
