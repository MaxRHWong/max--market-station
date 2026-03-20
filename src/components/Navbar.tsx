import { motion, AnimatePresence } from "framer-motion";
import { Activity, Menu, Search, Share2, Globe, X } from "lucide-react";
import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { translations, Language } from "../lib/i18n";

export function Navbar({ lang, setLang }: { lang: Language; setLang: (l: Language) => void }) {
  const t = translations[lang];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const toggleLang = () => setLang(lang === 'en' ? 'zh' : 'en');
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://max-market.station';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <>
      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-pointer"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 flex flex-col items-center gap-8 rounded-none border border-white/10 bg-[#050505] p-10 shadow-2xl cursor-default max-w-sm w-full"
            >
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#00ff66]/30" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#00ff66]/30" />
              
              <button 
                onClick={() => setShowShareModal(false)}
                className="absolute right-4 top-4 text-white/30 hover:text-[#00ff66] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="flex flex-col items-center gap-2">
                <h3 className="font-display text-2xl font-black uppercase tracking-[0.3em] text-white">
                  {t.share}
                </h3>
                <div className="h-[1px] w-12 bg-[#00ff66]/50" />
              </div>

              <div className="relative p-6 bg-white group shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                <div className="absolute inset-0 border-4 border-black/5 group-hover:border-[#00ff66]/10 transition-colors" />
                <QRCodeSVG 
                  id="share-qr"
                  value="https://max-market-station.vercel.app/" 
                  size={200}
                  level="H"
                  includeMargin={false}
                />
                <div className="mt-4 text-center">
                  <span className="text-[10px] font-mono text-black/40 uppercase font-bold tracking-tighter">
                    Long Press to Save QR
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4 w-full">
                <div className="w-full bg-white/5 p-3 border border-white/5 font-mono text-[10px] text-white/40 truncate text-center">
                  https://max-market-station.vercel.app/
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText("https://max-market-station.vercel.app/");
                    showToast(lang === 'zh' ? '链接已复制' : 'Link copied');
                  }}
                  className="w-full py-3 bg-[#00ff66] text-black font-mono font-black text-xs uppercase tracking-widest hover:bg-[#00cc52] transition-all shadow-[0_0_15px_rgba(0,255,102,0.3)]"
                >
                  Copy_Access_Key
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#050505]/80 backdrop-blur-xl overflow-hidden">
        {/* Background Scanning Line */}
        <motion.div 
          animate={{ left: ["-100%", "100%"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 h-[1px] w-full bg-gradient-to-r from-transparent via-[#00ff66]/40 to-transparent z-0 pointer-events-none"
        />

        {/* Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -50, x: "-50%" }}
              animate={{ opacity: 1, y: 16, x: "-50%" }}
              exit={{ opacity: 0, y: -50, x: "-50%" }}
              className="fixed left-1/2 z-[100] rounded-none border border-[#00ff66]/50 bg-[#050505] px-6 py-3 text-xs font-mono font-bold text-[#00ff66] shadow-[0_0_20px_rgba(0,255,102,0.2)] uppercase tracking-widest"
            >
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-[#00ff66] animate-pulse" />
                {toastMessage}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex h-16 items-center justify-between px-4 md:px-10 relative z-10">
        <div className="flex items-center gap-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="relative flex h-9 w-9 items-center justify-center bg-white text-black group overflow-hidden">
              <div className="absolute inset-0 bg-[#00ff66] translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <Activity className="h-5 w-5 relative z-10 group-hover:text-black transition-colors" />
              <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-[#00ff66] border-2 border-black" />
            </div>
            <div className="flex flex-col">
              <span 
                className="font-display text-xl font-black tracking-tighter text-white uppercase leading-none glitch"
                data-text="MAX-MARKET.STATION"
              >
                MAX-MARKET<span className="text-[#00ff66]">.STATION</span>
              </span>
              <span className="font-mono text-[8px] text-[#00ff66] tracking-[0.4em] uppercase opacity-60">Quantum_Grid_Active</span>
            </div>
          </motion.div>
        </div>

        <div className="hidden md:flex items-center gap-10">
          <NavLink href="#markets-section" active>{t.markets}</NavLink>
          <NavLink href="#news-section">{t.news}</NavLink>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center bg-white/5 border border-white/10 p-1">
            <button 
              onClick={() => setLang('en')} 
              className={`px-2 py-1 text-[10px] font-mono font-bold transition-all ${lang === 'en' ? 'bg-[#00ff66] text-black' : 'text-white/40 hover:text-white'}`}
            >
              EN
            </button>
            <button 
              onClick={() => setLang('zh')} 
              className={`px-2 py-1 text-[10px] font-mono font-bold transition-all ${lang === 'zh' ? 'bg-[#00ff66] text-black' : 'text-white/40 hover:text-white'}`}
            >
              ZH
            </button>
          </div>

          <button 
            onClick={() => showToast(lang === 'zh' ? '搜索功能即将推出' : 'Search coming soon')} 
            className="hidden sm:flex h-9 w-9 items-center justify-center border border-white/10 text-white/40 hover:border-[#00ff66]/50 hover:text-[#00ff66] transition-all"
          >
            <Search className="h-4 w-4" />
          </button>

          <button 
            onClick={() => setShowShareModal(true)} 
            className="group relative flex h-9 items-center gap-2 bg-[#00ff66] px-4 text-xs font-black text-black uppercase tracking-widest hover:bg-[#00cc52] transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
            <Share2 className="h-4 w-4 relative z-10" />
            <span className="hidden sm:inline relative z-10">{t.share}</span>
          </button>

          <button 
            className="md:hidden flex h-9 w-9 items-center justify-center text-white/70"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 bg-[#050505] overflow-hidden"
          >
            <div className="flex flex-col px-6 py-8 gap-6">
              <NavLink href="#markets-section" active>{t.markets}</NavLink>
              <NavLink href="#news-section">{t.news}</NavLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
    </>
  );
}

function NavLink({ href, children, active }: { href: string; children: React.ReactNode; active?: boolean }) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const id = href.substring(1);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <a 
      href={href} 
      onClick={handleClick}
      className={`text-sm font-medium uppercase tracking-wider transition-colors ${active ? 'text-white' : 'text-white/50 hover:text-white'}`}
    >
      {children}
    </a>
  );
}
