import { useState, useMemo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup
} from 'react-simple-maps';
import { motion, AnimatePresence } from 'framer-motion';
import type { RegionStats } from '../hooks/useRealtimeData';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

interface WorldMapProps {
  regionStats: RegionStats[];
  totalCount: number;
}

export default function WorldMap({ regionStats, totalCount }: WorldMapProps) {
  const [tooltipContent, setTooltipContent] = useState<RegionStats | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // 円のサイズを計算
  const maxCount = useMemo(() => {
    return Math.max(...regionStats.map(r => r.count), 1);
  }, [regionStats]);

  const getMarkerSize = (count: number) => {
    const minSize = 6;
    const maxSize = 35;
    const ratio = count / maxCount;
    return minSize + (maxSize - minSize) * Math.sqrt(ratio);
  };

  const handleMouseEnter = (
    region: RegionStats,
    event: React.MouseEvent
  ) => {
    setTooltipContent(region);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    setTooltipContent(null);
  };

  return (
    <div className="relative w-full h-full">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 140,
          center: [20, 20]
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup>
          {/* 世界地図の背景 */}
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#1e293b"
                  stroke="#334155"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: { fill: '#334155', outline: 'none' },
                    pressed: { outline: 'none' }
                  }}
                />
              ))
            }
          </Geographies>

          {/* マーカー（地域ごとの円） */}
          <AnimatePresence>
            {regionStats.map((stat) => (
              <Marker
                key={stat.region.name}
                coordinates={[stat.region.lng, stat.region.lat]}
                onMouseEnter={(e) => handleMouseEnter(stat, e as unknown as React.MouseEvent)}
                onMouseLeave={handleMouseLeave}
              >
                {/* ベースの円 */}
                <motion.circle
                  r={getMarkerSize(stat.count)}
                  fill="rgba(34, 211, 238, 0.5)"
                  stroke="rgba(34, 211, 238, 0.8)"
                  strokeWidth={2}
                  style={{ cursor: 'pointer' }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                />

                {/* パルスアニメーション（新規アクセス時） */}
                {stat.recentHit && (
                  <>
                    <motion.circle
                      r={getMarkerSize(stat.count)}
                      fill="transparent"
                      stroke="rgba(34, 211, 238, 1)"
                      strokeWidth={3}
                      initial={{ scale: 1, opacity: 1 }}
                      animate={{ scale: 2.5, opacity: 0 }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                    />
                    <motion.circle
                      r={getMarkerSize(stat.count)}
                      fill="transparent"
                      stroke="rgba(34, 211, 238, 1)"
                      strokeWidth={2}
                      initial={{ scale: 1, opacity: 1 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                    />
                  </>
                )}

                {/* カウント表示 */}
                <text
                  textAnchor="middle"
                  y={getMarkerSize(stat.count) + 14}
                  style={{
                    fill: '#94a3b8',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }}
                >
                  {stat.count}
                </text>
              </Marker>
            ))}
          </AnimatePresence>
        </ZoomableGroup>
      </ComposableMap>

      {/* ツールチップ */}
      <AnimatePresence>
        {tooltipContent && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed z-50 bg-slate-900/80 backdrop-blur-sm border border-cyan-500/50 text-white px-4 py-3 rounded-lg shadow-lg shadow-cyan-500/30 pointer-events-none"
            style={{
              left: tooltipPosition.x + 15,
              top: tooltipPosition.y - 15,
              transform: 'translateY(-100%)'
            }}
          >
            <p className="font-bold text-lg text-cyan-400">{tooltipContent.region.nameJa}</p>
            <p className="text-slate-300">
              ユーザー数: <span className="text-white font-semibold">{tooltipContent.count.toLocaleString()}</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {((tooltipContent.count / totalCount) * 100).toFixed(1)}% of total
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
