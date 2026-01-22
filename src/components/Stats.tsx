import { motion } from 'framer-motion';
import type { RegionStats } from '../hooks/useRealtimeData';

interface StatsProps {
  totalCount: number;
  lastMinuteCount: number;
  regionStats: RegionStats[];
  isConnected: boolean;
}

export default function Stats({ totalCount, lastMinuteCount, regionStats, isConnected }: StatsProps) {
  const top5 = regionStats.slice(0, 5);

  return (
    <div className="space-y-4">
      {/* メイン統計 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700 p-4">
          <p className="text-sm text-slate-400 mb-1">Total Users</p>
          <motion.p
            key={totalCount}
            initial={{ scale: 1.1, color: '#22d3ee' }}
            animate={{ scale: 1, color: '#ffffff' }}
            className="text-3xl font-bold text-white"
          >
            {totalCount.toLocaleString()}
          </motion.p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700 p-4">
          <p className="text-sm text-slate-400 mb-1 flex items-center gap-2">
            Last 5min
            {lastMinuteCount > 0 && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            )}
          </p>
          <motion.p
            key={lastMinuteCount}
            initial={{ scale: 1.2, color: '#4ade80' }}
            animate={{ scale: 1, color: lastMinuteCount > 0 ? '#4ade80' : '#64748b' }}
            className="text-3xl font-bold"
          >
            +{lastMinuteCount}
          </motion.p>
        </div>
      </div>

      {/* 接続状態 */}
      <div className="flex items-center gap-2 text-sm">
        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
        <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Top 5 地域 */}
      <div className="bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700 p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Top Regions</h3>
        <div className="space-y-2">
          {top5.map((stat, index) => (
            <motion.div
              key={stat.region.name}
              initial={stat.recentHit ? { backgroundColor: 'rgba(34, 211, 238, 0.3)' } : {}}
              animate={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
              transition={{ duration: 2 }}
              className="flex items-center justify-between py-1"
            >
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-xs w-4">#{index + 1}</span>
                <span className={`font-medium ${stat.recentHit ? 'text-cyan-400' : 'text-slate-300'}`}>
                  {stat.region.nameJa}
                </span>
                {stat.recentHit && (
                  <motion.span
                    initial={{ opacity: 1, scale: 1 }}
                    animate={{ opacity: 0, scale: 0 }}
                    transition={{ duration: 2 }}
                    className="text-xs text-green-400 font-bold"
                  >
                    +1
                  </motion.span>
                )}
              </div>
              <motion.span
                key={stat.count}
                initial={{ scale: stat.recentHit ? 1.2 : 1 }}
                animate={{ scale: 1 }}
                className="text-cyan-400 font-semibold"
              >
                {stat.count.toLocaleString()}
              </motion.span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
