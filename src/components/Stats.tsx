import { motion } from 'framer-motion';
import type { RegionStats } from '../hooks/useRealtimeData';

interface StatsProps {
  totalCount: number;
  lastMinuteCount: number;
  regionStats: RegionStats[];
  isConnected: boolean;
}

export default function Stats({ totalCount, regionStats }: StatsProps) {
  const top5 = regionStats.slice(0, 5);

  return (
    <div className="space-y-2">
      {top5.map((stat, index) => (
        <motion.div
          key={stat.region.name}
          initial={stat.recentHit ? { backgroundColor: 'rgba(59, 130, 246, 0.2)' } : {}}
          animate={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
          transition={{ duration: 2 }}
          className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-gray-400 dark:text-gray-500 text-sm w-5">#{index + 1}</span>
            <span className={`font-medium ${stat.recentHit ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
              {stat.region.nameJa}
            </span>
            {stat.recentHit && (
              <motion.span
                initial={{ opacity: 1, scale: 1 }}
                animate={{ opacity: 0, scale: 0 }}
                transition={{ duration: 2 }}
                className="text-xs text-green-600 dark:text-green-400 font-bold"
              >
                +1
              </motion.span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <motion.span
              key={stat.count}
              initial={{ scale: stat.recentHit ? 1.2 : 1 }}
              animate={{ scale: 1 }}
              className="font-semibold text-gray-900 dark:text-white"
            >
              {stat.count.toLocaleString()}
            </motion.span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              ({((stat.count / totalCount) * 100).toFixed(1)}%)
            </span>
          </div>
        </motion.div>
      ))}

      {regionStats.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
          No data available
        </p>
      )}
    </div>
  );
}
