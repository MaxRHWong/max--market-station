import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Cpu, Database, Globe, ShieldCheck } from 'lucide-react';
import { translations, Language } from '../lib/i18n';

export function SystemStatus({ lang }: { lang: Language }) {
  const t = translations[lang];
  const [metrics, setMetrics] = useState({
    cpu: 12,
    ram: 45,
    latency: 24,
    uptime: '99.99%',
    nodes: 12
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        cpu: Math.floor(Math.random() * 15) + 5,
        ram: Math.floor(Math.random() * 5) + 42,
        latency: Math.floor(Math.random() * 10) + 18,
        nodes: Math.floor(Math.random() * 3) + 11
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden border border-white/10 bg-[#050505] p-6 shadow-2xl shadow-black group">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
      
      {/* Decorative Circles */}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full border border-[#00ff66]/10 group-hover:border-[#00ff66]/20 transition-colors duration-700" />
      <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full border border-white/5" />
      
      <div className="relative z-10 flex h-full flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#00ff66]" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
              {t.systemStatus}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-1 w-1 rounded-full bg-[#00ff66]" />
            <div className="h-1 w-1 rounded-full bg-[#00ff66]/40" />
            <div className="h-1 w-1 rounded-full bg-[#00ff66]/20" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-display text-4xl font-black text-white tracking-tighter"
          >
            {t.optimal}
          </motion.div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-[#00ff66] shadow-[0_0_8px_#00ff66]" />
            <span className="font-mono text-[10px] font-bold text-[#00ff66] uppercase tracking-widest">
              {t.allSystemsOperational}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 opacity-40">
              <Cpu className="h-3 w-3" />
              <span className="text-[9px] font-mono uppercase">CPU_LOAD</span>
            </div>
            <div className="font-mono text-xs text-white/80">{metrics.cpu}%</div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 opacity-40">
              <Database className="h-3 w-3" />
              <span className="text-[9px] font-mono uppercase">MEM_USAGE</span>
            </div>
            <div className="font-mono text-xs text-white/80">{metrics.ram}%</div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 opacity-40">
              <Globe className="h-3 w-3" />
              <span className="text-[9px] font-mono uppercase">LATENCY</span>
            </div>
            <div className="font-mono text-xs text-white/80">{metrics.latency}ms</div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 opacity-40">
              <ShieldCheck className="h-3 w-3" />
              <span className="text-[9px] font-mono uppercase">NODES</span>
            </div>
            <div className="font-mono text-xs text-white/80">{metrics.nodes}_ACTIVE</div>
          </div>
        </div>

        <div className="relative h-1.5 w-full bg-white/5 overflow-hidden">
          <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: "88%" }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#00ff66]/40 to-[#00ff66]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.1)_50%,transparent_100%)] animate-[shimmer_2s_infinite]" />
        </div>
      </div>
    </div>
  );
}
