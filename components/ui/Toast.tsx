'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

let listeners: ((msg: string) => void)[] = [];
export function toast(msg: string) {
  listeners.forEach(l => l(msg));
}

export function ToastHost() {
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const fn = (m: string) => {
      setMsg(m);
      setTimeout(() => setMsg(null), 2500);
    };
    listeners.push(fn);
    return () => { listeners = listeners.filter(l => l !== fn); };
  }, []);

  return (
    <AnimatePresence>
      {msg && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-surface border border-border rounded px-4 py-2 text-sm text-text shadow"
        >
          {msg}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
