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
    <div className="space-y-2 max-h-[300px] overflow-y-auto">
      <AnimatePresence mode="popLayout">
        {events.slice(0, 10).map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20, height: 0 }}
            animate={{ opacity: 1, x: 0, height: 'auto' }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <motion.span
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
                className="text-blue-600 dark:text-blue-400 font-medium"
              >
                {event.region.nameJa}
              </motion.span>
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="text-green-600 dark:text-green-400 text-sm font-bold"
              >
                +1
              </motion.span>
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {formatTimeAgo(event.timestamp)}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>

      {events.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
          Waiting for activity...
        </p>
      )}
    </div>
  );
}
