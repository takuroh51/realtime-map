import { useState, useEffect } from 'react';

export interface RegionStats {
  region: {
    name: string;
    nameJa: string;
    lat: number;
    lng: number;
  };
  count: number;      // ユーザー数
  playCount: number;  // プレイ回数
  recentHit: boolean;
}

interface UseRealtimeDataResult {
  regionStats: RegionStats[];
  totalCount: number;
  isConnected: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// ダッシュボードと同じ方式：事前集計済みJSONを読み込む
const DASHBOARD_JSON_URL = 'https://takuroh51.github.io/games-dashboard/data/dashboard.json';

export function useRealtimeData(): UseRealtimeDataResult {
  const [regionStats, setRegionStats] = useState<RegionStats[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(DASHBOARD_JSON_URL);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        // purificationByRegionからデータを取得
        const purificationData = data.purificationByRegion;
        if (!purificationData?.regions) {
          throw new Error('No region data found');
        }

        // RegionStats形式に変換
        const stats: RegionStats[] = purificationData.regions.map((r: {
          region: string;
          regionJa: string;
          lat: number;
          lng: number;
          users: number;
          plays: number;
        }) => ({
          region: {
            name: r.region,
            nameJa: r.regionJa,
            lat: r.lat,
            lng: r.lng,
          },
          count: r.users,
          playCount: r.plays,
          recentHit: false,
        }));

        // 総ユーザー数を計算
        const total = stats.reduce((sum, s) => sum + s.count, 0);

        setRegionStats(stats);
        setTotalCount(total);
        setLastUpdated(data.lastUpdated || null);
        setIsConnected(true);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsConnected(false);
      }
    };

    fetchData();

    // 5分ごとに更新（ダッシュボードは1時間ごとに更新されるので十分）
    const interval = setInterval(fetchData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    regionStats,
    totalCount,
    isConnected,
    error,
    lastUpdated,
  };
}
