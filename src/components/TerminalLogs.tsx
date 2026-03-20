import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export function TerminalLogs() {
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const logTemplates = [
    "[INFO] Incoming data packet from NODE_742",
    "[WARN] High volatility detected in BTC/USDT",
    "[INFO] Neural filter optimized for market sentiment",
    "[INFO] Encrypted tunnel handshake successful",
    "[DEBUG] Garbage collection completed in 4ms",
    "[INFO] New block mined on ETH_NETWORK",
    "[INFO] API request processed: /v3/klines",
    "[INFO] System heartbeat: OPTIMAL",
    "[WARN] Latency spike detected: 42ms",
    "[INFO] Global liquidity pool rebalanced"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const newLog = `${new Date().toLocaleTimeString()} ${logTemplates[Math.floor(Math.random() * logTemplates.length)]}`;
      setLogs(prev => [...prev, newLog].slice(-50));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="border border-white/10 bg-[#050505] p-4 font-mono text-[10px] text-[#00ff66]/60 shadow-2xl shadow-black relative group overflow-hidden">
      <div className="flex items-center justify-between mb-2 border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-[#00ff66] animate-pulse" />
          <span className="uppercase tracking-widest font-bold">System_Logs</span>
        </div>
        <span className="text-[8px] opacity-40 uppercase">Buffer_Size: 50</span>
      </div>
      
      <div 
        ref={scrollRef}
        className="h-32 overflow-y-auto custom-scrollbar space-y-0.5"
      >
        {logs.map((log, i) => (
          <div key={i} className="whitespace-nowrap">
            <span className="text-white/20 mr-2">[{i.toString().padStart(3, '0')}]</span>
            {log}
          </div>
        ))}
        <motion.div 
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="h-3 w-1.5 bg-[#00ff66]/40 inline-block align-middle"
        />
      </div>

      {/* Background Scanning Line */}
      <motion.div 
        animate={{ top: ["0%", "100%"] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        className="absolute inset-x-0 h-[1px] bg-[#00ff66]/5 z-0 pointer-events-none"
      />
    </div>
  );
}
