import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const bootLogs = [
    "> INITIALIZING SYSTEM_CORE_V8.4...",
    "> LOADING KERNEL MODULES...",
    "> ESTABLISHING ENCRYPTED_TUNNEL...",
    "> CONNECTING TO GLOBAL_NODES...",
    "> SYNCING MARKET_DATA_STREAMS...",
    "> AUTHENTICATING API_GATEWAY...",
    "> DEPLOYING NEURAL_FILTERS...",
    "> SYSTEM_READY: ACCESS_GRANTED"
  ];

  useEffect(() => {
    let currentLog = 0;
    const logInterval = setInterval(() => {
      if (currentLog < bootLogs.length) {
        setLogs(prev => [...prev, bootLogs[currentLog]]);
        currentLog++;
        setProgress((currentLog / bootLogs.length) * 100);
      } else {
        clearInterval(logInterval);
        setTimeout(onComplete, 800);
      }
    }, 400);

    return () => clearInterval(logInterval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-[#050505] p-6 font-mono"
    >
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-[#00ff66]/60">
            <span>System_Initialization</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="relative h-1 w-full bg-white/5">
            <motion.div 
              className="absolute inset-y-0 left-0 bg-[#00ff66]"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <div className="h-48 overflow-hidden space-y-1">
          <AnimatePresence mode="popLayout">
            {logs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs md:text-sm text-[#00ff66] tracking-tight"
              >
                {log}
              </motion.div>
            ))}
          </AnimatePresence>
          <motion.div 
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="h-4 w-2 bg-[#00ff66] inline-block ml-1 align-middle"
          />
        </div>

        <div className="flex justify-center opacity-20">
          <svg width="40" height="40" viewBox="0 0 40 40" className="animate-spin">
            <circle cx="20" cy="20" r="18" fill="none" stroke="#00ff66" strokeWidth="2" strokeDasharray="20 80" />
          </svg>
        </div>
      </div>
      
      <div className="absolute bottom-8 text-[8px] uppercase tracking-[0.5em] text-white/20">
        Terminal_OS // Build_2026.03.20
      </div>
    </motion.div>
  );
}
