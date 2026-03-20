import { useState, useEffect } from "react";
import { CryptoTable } from "./components/CryptoTable";
import { GlobalMarkets } from "./components/GlobalMarkets";
import { MainChart } from "./components/MainChart";
import { Navbar } from "./components/Navbar";
import { NewsFeed } from "./components/NewsFeed";
import { SystemStatus } from "./components/SystemStatus";
import { BootSequence } from "./components/BootSequence";
import { TerminalLogs } from "./components/TerminalLogs";
import { Language, translations } from "./lib/i18n";
import { motion, AnimatePresence } from "framer-motion";

export default function App() {
  const [lang, setLang] = useState<Language>('zh');
  const [category, setCategory] = useState('all');
  const [selectedCoin, setSelectedCoin] = useState({ id: "bitcoin", symbol: "BTC" });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isBooting, setIsBooting] = useState(true);
  
  const t = translations[lang];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#00ff66]/30 selection:text-[#00ff66] relative overflow-hidden">
      <AnimatePresence>
        {isBooting && <BootSequence onComplete={() => setIsBooting(false)} />}
      </AnimatePresence>

      {/* CRT Scanline and Flicker Effects */}
      <div className="crt-scanlines pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none z-[99] opacity-[0.02] crt-flicker" />

      {/* Terminal Background Elements */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <div className="absolute inset-0 bg-grid" />
      </div>

      {/* Floating Terminal Text */}
      <div className="fixed top-20 left-4 pointer-events-none opacity-10 z-0 hidden xl:block">
        <div className="font-mono text-[8px] leading-tight space-y-1">
          <div>SYSTEM_BOOT_SEQUENCE: SUCCESS</div>
          <div>ENCRYPTED_TUNNEL: ACTIVE</div>
          <div>API_GATEWAY: 127.0.0.1:3000</div>
          <div>LATENCY: 24ms</div>
          <div>NODES: 12_ACTIVE</div>
          <div className="text-[#00ff66]">LIVE_FEED: CONNECTED</div>
        </div>
      </div>

      <div className="fixed bottom-4 right-4 pointer-events-none opacity-10 z-0 hidden xl:block">
        <div className="font-mono text-[8px] text-right">
          <div>{currentTime.toISOString()}</div>
          <div>V_0.8.4_STABLE</div>
        </div>
      </div>

      <Navbar lang={lang} setLang={setLang} />
      
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-6 md:py-8 md:px-8">
        <motion.section 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 md:mb-12"
        >
          <GlobalMarkets lang={lang} />
        </motion.section>

        <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3">
          <div className="flex flex-col gap-6 md:gap-8 lg:col-span-2">
            <section>
              <MainChart coinId={selectedCoin.id} coinSymbol={selectedCoin.symbol} lang={lang} />
            </section>
            
            <section>
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-1 bg-[#00ff66]" />
                  <h2 className="font-display text-base md:text-lg font-bold uppercase tracking-[0.2em] text-white">
                    {t.cryptoAssets}
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['all', 'defi', 'layer1', 'layer2', 'meme', 'ai', 'gamefi'].map((cat) => (
                    <button 
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`border px-3 py-1 text-[10px] font-mono font-bold transition-all duration-300 ${category === cat ? 'border-[#00ff66] bg-[#00ff66]/10 text-[#00ff66] shadow-[0_0_10px_rgba(0,255,102,0.2)]' : 'border-white/10 text-white/40 hover:border-white/30 hover:text-white'}`}
                    >
                      {t[cat as keyof typeof t]}
                    </button>
                  ))}
                </div>
              </div>
              <CryptoTable onSelectCoin={(coin) => setSelectedCoin({ id: coin.id, symbol: coin.symbol.toUpperCase() })} category={category} lang={lang} />
            </section>
          </div>

          <div className="flex flex-col gap-6 md:gap-8">
            <section>
              <NewsFeed lang={lang} />
            </section>

            <section className="hidden lg:block">
              <SystemStatus lang={lang} />
            </section>

            <section className="hidden lg:block">
              <TerminalLogs />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

