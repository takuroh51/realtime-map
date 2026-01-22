import { motion, AnimatePresence } from 'framer-motion';
import type { AccessEvent } from '../hooks/useRealtimeData';

interface LiveFeedProps {
  events: AccessEvent[];
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

export default function LiveFeed({ events }: LiveFeedProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700 p-4 h-full">
      <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        Live Feed
      </h3>

      <div className="space-y-2 overflow-y-auto max-h-[300px] scrollbar-thin scrollbar-thumb-slate-600">
        <AnimatePresence mode="popLayout">
          {events.slice(0, 10).map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="flex items-center justify-between py-2 px-3 bg-slate-700/50 rounded-md"
            >
              <div className="flex items-center gap-2">
                <motion.span
                  initial={{ scale: 1.5 }}
                  animate={{ scale: 1 }}
                  className="text-cyan-400 font-semibold"
                >
                  {event.region.nameJa}
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-green-400 text-sm font-bold"
                >
                  +1
                </motion.span>
              </div>
              <span className="text-xs text-slate-500">
                {formatTimeAgo(event.timestamp)}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>

        {events.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-4">
            Waiting for activity...
          </p>
        )}
      </div>
    </div>
  );
}
