import { useState, useMemo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup
} from 'react-simple-maps';
import type { RegionStats } from '../hooks/useRealtimeData';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

interface WorldMapProps {
  regionStats: RegionStats[];
  totalPurified: number;
}

export default function WorldMap({ regionStats, totalPurified }: WorldMapProps) {
  const [tooltipContent, setTooltipContent] = useState<RegionStats | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // 円のサイズを計算（浄化数ベース）
  const maxPurified = useMemo(() => {
    return Math.max(...regionStats.map(r => r.purified), 1);
  }, [regionStats]);

  const getMarkerSize = (purified: number) => {
    const minSize = 4;
    const maxSize = 30;
    const ratio = purified / maxPurified;
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

  // 座標がない地域を除外
  const markersData = regionStats.filter(r => r.region.lat !== 0 && r.purified > 0);

  return (
    <div className="relative w-full h-full">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 120,
          center: [20, 30]
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#E5E7EB"
                  stroke="#D1D5DB"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: { fill: '#D1D5DB', outline: 'none' },
                    pressed: { outline: 'none' }
                  }}
                />
              ))
            }
          </Geographies>

          {markersData.map((stat) => (
            <Marker
              key={stat.region.name}
              coordinates={[stat.region.lng, stat.region.lat]}
              onMouseEnter={(e) => handleMouseEnter(stat, e as unknown as React.MouseEvent)}
              onMouseLeave={handleMouseLeave}
            >
              <circle
                r={getMarkerSize(stat.purified)}
                fill="rgba(147, 51, 234, 0.6)"
                stroke="rgba(147, 51, 234, 1)"
                strokeWidth={1}
                style={{ cursor: 'pointer' }}
              />
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>

      {/* ツールチップ */}
      {tooltipContent && (
        <div
          className="fixed z-50 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg text-sm pointer-events-none"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 10,
            transform: 'translateY(-100%)'
          }}
        >
          <p className="font-bold text-lg">{tooltipContent.region.nameJa}</p>
          <p className="text-purple-300">
            浄化数: {tooltipContent.purified.toLocaleString()}
          </p>
          <p className="text-gray-400">
            プレイ: {tooltipContent.playCount.toLocaleString()}回
          </p>
          <p className="text-gray-400">
            ユーザー: {tooltipContent.count.toLocaleString()}人
          </p>
          <p className="text-gray-400 text-xs mt-1">
            {((tooltipContent.purified / totalPurified) * 100).toFixed(1)}% of total
          </p>
        </div>
      )}
    </div>
  );
}
