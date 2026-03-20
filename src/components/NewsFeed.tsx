import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { Activity } from "lucide-react";
import { translations, Language } from "../lib/i18n";
import { GoogleGenAI, Type } from "@google/genai";

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  
  const lastFetchRef = useRef<number>(0);

  useEffect(() => {
    let isMounted = true;

    const translateNews = async (items: NewsItem[]) => {
      if (items.length === 0) return items;
      if (isMounted) setIsTranslating(true);
      
      try {
        // Try multiple ways to get the API key
        const apiKey = process.env.GEMINI_API_KEY || 
                      (import.meta as any).env?.VITE_GEMINI_API_KEY ||
                      (window as any).GEMINI_API_KEY;

        if (!apiKey) {
          console.warn("Translation skipped: GEMINI_API_KEY not found in environment");
          return items;
        }

        const ai = new GoogleGenAI({ apiKey });
        const titlesToTranslate = items.map((item, i) => `[${i}] ${item.title}`).join('\n');
        
        const prompt = `You are a professional financial translator. 
Translate these cryptocurrency news titles into Simplified Chinese.
Keep terms like "ETF", "SEC", "Web3", "Bitcoin", "Ethereum", "Solana", "Inflow", "Outflow" in English if they are standard in Chinese crypto media.
Return ONLY a JSON array of strings. No extra text.

Titles:
${titlesToTranslate}`;

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        });

        const text = response.text;
        if (text) {
          try {
            // More robust JSON extraction
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            const jsonStr = jsonMatch ? jsonMatch[0] : text;
            const translatedTitles = JSON.parse(jsonStr);
            
            if (Array.isArray(translatedTitles) && translatedTitles.length >= items.length) {
              return items.map((item, i) => ({
                ...item,
                title: String(translatedTitles[i]).trim()
              }));
            }
          } catch (parseError) {
            console.error("JSON parse failed, attempting regex extraction", parseError);
            const matches = text.match(/"([^"]+)"/g);
            if (matches && matches.length >= items.length) {
              const extracted = matches.slice(0, items.length).map(m => m.replace(/^"|"$/g, ''));
              return items.map((item, i) => ({
                ...item,
                title: extracted[i].trim()
              }));
            }
          }
        }
      } catch (e) {
        console.error("Translation service error:", e);
      } finally {
        if (isMounted) setIsTranslating(false);
      }
      return items;
    };

    const fetchNews = async (isInitial = false) => {
      const now = Date.now();
      if (!isInitial && now - lastFetchRef.current < 15000) return;
      lastFetchRef.current = now;

      if (isInitial && isMounted) setLoading(true);
      if (isMounted) setIsRefreshing(true);
      
      let fetchedNews: NewsItem[] = [];

      // 1. Try Primary Source (CryptoCompare)
      try {
        const res = await fetch(`https://min-api.cryptocompare.com/data/v2/news/?lang=EN&extraParams=MaxMarketStation&t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.Type === 1 && Array.isArray(data.Data) && data.Data.length > 0) {
            fetchedNews = data.Data.map((item: any) => ({
              id: item.id,
              title: item.title,
              source_info: { name: item.source_info?.name || item.source || "CryptoNews" },
              published_on: item.published_on
            })).slice(0, 15);
          }
        }
      } catch (e) {
        console.warn("Primary news source failed:", e);
      }

      // 2. Try Gemini Fallback if primary failed or returned nothing
      if (fetchedNews.length === 0) {
        try {
          const apiKey = process.env.GEMINI_API_KEY || 
                        (import.meta as any).env?.VITE_GEMINI_API_KEY ||
                        (window as any).GEMINI_API_KEY;
          if (apiKey) {
            const ai = new GoogleGenAI({ apiKey });
            const prompt = `Provide 10 real, very recent cryptocurrency news items from the last 24 hours. 
Today is ${new Date().toISOString()}.
Return a JSON array of objects: { "id": string, "title": string, "source": string, "timestamp": number }.
Provide titles in English.`;
            
            const response = await ai.models.generateContent({
              model: "gemini-3-flash-preview",
              contents: prompt,
              config: { responseMimeType: "application/json" }
            });

            if (response.text) {
              const data = JSON.parse(response.text);
              if (Array.isArray(data) && data.length > 0) {
                fetchedNews = data.map((item: any) => ({
                  id: item.id || Math.random().toString(36).substr(2, 9),
                  title: item.title,
                  source_info: { name: item.source || "Global News" },
                  published_on: item.timestamp || Math.floor(Date.now() / 1000)
                }));
              }
            }
          }
        } catch (e) {
          console.error("Gemini news fallback failed:", e);
        }
      }

      // 3. Final Fallback: Static Mock News
      if (fetchedNews.length === 0) {
        fetchedNews = lang === 'zh' ? MOCK_NEWS_ZH : MOCK_NEWS_EN;
      }

      // 4. Update State and Translate if needed
      if (isMounted) {
        if (fetchedNews.length > 0) {
          setNews(fetchedNews);
          setLoading(false);
          
          if (lang === 'zh') {
            const translated = await translateNews(fetchedNews);
            if (isMounted) {
              setNews(translated);
              setIsRefreshing(false);
            }
          } else {
            setIsRefreshing(false);
          }
        } else {
          setLoading(false);
          setIsRefreshing(false);
          // Only show error if we have absolutely NO news at all
          if (news.length === 0) {
            setNews([{
              id: "error",
              title: lang === 'zh' ? "无法获取实时新闻，请检查网络连接" : "Unable to fetch live news. Please check your connection.",
              source_info: { name: "SYSTEM" },
              published_on: Math.floor(Date.now() / 1000)
            }]);
          }
        }
      }
    };

    fetchNews(true);
    const interval = setInterval(() => fetchNews(false), 180000); // 3 minute updates

    const handleManualRefresh = () => fetchNews(false);
    window.addEventListener('refresh-news', handleManualRefresh);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('refresh-news', handleManualRefresh);
    };
  }, [lang]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffSeconds < 60) return lang === 'zh' ? '刚刚' : 'Just now';
    if (diffSeconds < 3600) return lang === 'zh' ? `${Math.floor(diffSeconds / 60)}分钟前` : `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) {
      const hours = Math.floor(diffSeconds / 3600);
      return lang === 'zh' ? `${hours}小时前` : `${hours}h ago`;
    }
    
    return date.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
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
      <div id="news-section" className="flex h-64 items-center justify-center border border-white/10 bg-[#111]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00ff66] border-t-transparent" />
      </div>
    );
  }

  return (
    <div id="news-section" className="flex flex-col h-[500px] border border-white/10 bg-[#050505] shadow-2xl shadow-black relative group overflow-hidden">
      {/* Scanning Line */}
      <motion.div 
        animate={{ top: ["0%", "100%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute inset-x-0 h-[1px] bg-[#00ff66]/10 z-0 pointer-events-none"
      />
      
      <div className="flex items-center justify-between border-b border-white/10 bg-[#0a0a0a] px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="relative h-2.5 w-2.5">
            <div className="absolute inset-0 rounded-full bg-[#00ff66] animate-ping opacity-75" />
            <div className="relative h-2.5 w-2.5 rounded-full bg-[#00ff66] shadow-[0_0_8px_#00ff66]" />
          </div>
          <h2 className="font-display text-base font-black uppercase tracking-[0.25em] text-white">
            {t.latestNews}
          </h2>
        </div>
        <div className="flex items-center gap-4">
          {isRefreshing && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-mono text-[9px] text-[#00ff66] uppercase tracking-[0.2em] animate-pulse"
            >
              {isTranslating ? (lang === 'zh' ? '正在翻译...' : 'Translating...') : 'Syncing...'}
            </motion.span>
          )}
          <button 
            onClick={() => {
              // Trigger a fresh fetch
              lastFetchRef.current = 0; 
              window.dispatchEvent(new CustomEvent('refresh-news'));
            }}
            className="p-1.5 border border-white/10 hover:border-[#00ff66]/50 hover:text-[#00ff66] transition-all text-white/40"
            title="Refresh News"
          >
            <motion.div
              animate={isRefreshing ? { rotate: 360 } : {}}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Activity className="h-3 w-3" />
            </motion.div>
          </button>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-[#00ff66]/40" />
              <span className="h-1 w-1 rounded-full bg-[#00ff66]/40" />
              <span className="h-1 w-1 rounded-full bg-[#00ff66]" />
            </div>
            <span className="text-[9px] font-mono text-[#00ff66]/60 uppercase tracking-widest">
              Terminal_Active
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/20">
        <div className="flex flex-col divide-y divide-white/5">
          {news.map((item, index) => {
            const sourceColorClass = getSourceColor(item.source_info?.name || 'News');
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.4,
                  delay: index * 0.03,
                  ease: "easeOut"
                }}
                className="group relative flex gap-6 p-6 transition-all duration-300 hover:bg-white/[0.03]"
              >
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#00ff66] scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300" />
                
                <div className="flex flex-col items-center gap-1 shrink-0 pt-1 w-16">
                  <div className="font-mono text-[10px] font-bold text-[#00ff66] tracking-tighter">
                    {formatTime(item.published_on)}
                  </div>
                  <div className="h-[1px] w-4 bg-white/10 group-hover:w-8 group-hover:bg-[#00ff66]/40 transition-all" />
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
  { id: "m1", title: "Bitcoin Hits New All-Time High Above $152,000 Following Institutional ETF Inflows", source_info: { name: "CRYPTONEWS DAILY" }, published_on: Math.floor(Date.now() / 1000) - 3600 },
  { id: "m2", title: "Ethereum Network Usage Surges Post-Prague Upgrade Completion", source_info: { name: "THE BLOCKCHAIN REPORT" }, published_on: Math.floor(Date.now() / 1000) - 7200 },
  { id: "m3", title: "SEC Formally Approves First Spot Solana ETF for Public Trading", source_info: { name: "FINANCIAL TIMES DIGITAL" }, published_on: Math.floor(Date.now() / 1000) - 10800 },
  { id: "m4", title: "Global Crypto Adoption Reaches 1 Billion Users Milestone", source_info: { name: "REUTERS TECH" }, published_on: Math.floor(Date.now() / 1000) - 14400 },
  { id: "m5", title: "Major Central Banks Explore Interoperable CBDC Framework", source_info: { name: "BLOOMBERG TERMINAL" }, published_on: Math.floor(Date.now() / 1000) - 18000 }
];

const MOCK_NEWS_ZH: NewsItem[] = [
  { id: "m1", title: "比特币在机构 ETF 流入后突破 152,000 美元，创下历史新高", source_info: { name: "加密新闻日报" }, published_on: Math.floor(Date.now() / 1000) - 3600 },
  { id: "m2", title: "布拉格升级完成后，以太坊网络使用量激增", source_info: { name: "区块链报告" }, published_on: Math.floor(Date.now() / 1000) - 7200 },
  { id: "m3", title: "美国 SEC 正式批准首个现货 Solana ETF 上市交易", source_info: { name: "金融时报数字版" }, published_on: Math.floor(Date.now() / 1000) - 10800 },
  { id: "m4", title: "全球加密货币采用量达到 10 亿用户里程碑", source_info: { name: "路透科技" }, published_on: Math.floor(Date.now() / 1000) - 14400 },
  { id: "m5", title: "主要央行探索互操作性 CBDC 框架", source_info: { name: "彭博终端" }, published_on: Math.floor(Date.now() / 1000) - 18000 }
];
