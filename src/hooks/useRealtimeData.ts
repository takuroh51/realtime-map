import { useState, useEffect, useRef } from 'react';
import { database } from '../lib/firebase';
import { ref, onChildAdded, query, limitToLast, get } from 'firebase/database';

export interface RegionStats {
  region: {
    name: string;
    nameJa: string;
    lat: number;
    lng: number;
  };
  count: number;      // ユーザー数
  playCount: number;  // プレイ回数
  purified: number;   // 浄化数
  recentHit: boolean;
}

interface UseRealtimeDataResult {
  regionStats: RegionStats[];
  totalCount: number;
  isConnected: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// 言語から地域へのマッピング（data_aggregator.pyと同じ）
const LANGUAGE_TO_REGION: Record<string, { name: string; nameJa: string; lat: number; lng: number }> = {
  'ChineseSimplified': { name: 'China', nameJa: '中国', lat: 35.86, lng: 104.19 },
  'ChineseTraditional': { name: 'Taiwan', nameJa: '台湾', lat: 23.69, lng: 120.96 },
  'Chinese': { name: 'China', nameJa: '中国', lat: 35.86, lng: 104.19 },
  'English': { name: 'USA', nameJa: 'アメリカ', lat: 37.09, lng: -95.71 },
  'Japanese': { name: 'Japan', nameJa: '日本', lat: 36.20, lng: 138.25 },
  'Russian': { name: 'Russia', nameJa: 'ロシア', lat: 61.52, lng: 105.31 },
  'Korean': { name: 'South Korea', nameJa: '韓国', lat: 35.90, lng: 127.76 },
  'Spanish': { name: 'Spain', nameJa: 'スペイン', lat: 40.46, lng: -3.74 },
  'French': { name: 'France', nameJa: 'フランス', lat: 46.22, lng: 2.21 },
  'Portuguese': { name: 'Brazil', nameJa: 'ブラジル', lat: -14.23, lng: -51.92 },
  'German': { name: 'Germany', nameJa: 'ドイツ', lat: 51.16, lng: 10.45 },
  'Italian': { name: 'Italy', nameJa: 'イタリア', lat: 41.87, lng: 12.56 },
  'Polish': { name: 'Poland', nameJa: 'ポーランド', lat: 51.91, lng: 19.14 },
  'Ukrainian': { name: 'Ukraine', nameJa: 'ウクライナ', lat: 48.37, lng: 31.16 },
  'Thai': { name: 'Thailand', nameJa: 'タイ', lat: 15.87, lng: 100.99 },
  'Turkish': { name: 'Turkey', nameJa: 'トルコ', lat: 38.96, lng: 35.24 },
  'Vietnamese': { name: 'Vietnam', nameJa: 'ベトナム', lat: 14.05, lng: 108.27 },
  'Hungarian': { name: 'Hungary', nameJa: 'ハンガリー', lat: 47.16, lng: 19.50 },
  'Norwegian': { name: 'Norway', nameJa: 'ノルウェー', lat: 60.47, lng: 8.46 },
  'Finnish': { name: 'Finland', nameJa: 'フィンランド', lat: 61.92, lng: 25.74 },
  'Czech': { name: 'Czech Republic', nameJa: 'チェコ', lat: 49.81, lng: 15.47 },
  'Arabic': { name: 'Saudi Arabia', nameJa: 'サウジアラビア', lat: 23.88, lng: 45.07 },
  'Dutch': { name: 'Netherlands', nameJa: 'オランダ', lat: 52.13, lng: 5.29 },
  'Greek': { name: 'Greece', nameJa: 'ギリシャ', lat: 39.07, lng: 21.82 },
  'Swedish': { name: 'Sweden', nameJa: 'スウェーデン', lat: 60.12, lng: 18.64 },
  'Lithuanian': { name: 'Lithuania', nameJa: 'リトアニア', lat: 55.16, lng: 23.88 },
  'Latvian': { name: 'Latvia', nameJa: 'ラトビア', lat: 56.87, lng: 24.60 },
  'Slovak': { name: 'Slovakia', nameJa: 'スロバキア', lat: 48.66, lng: 19.69 },
  'SerboCroatian': { name: 'Serbia', nameJa: 'セルビア', lat: 44.01, lng: 21.00 },
  'Belarusian': { name: 'Belarus', nameJa: 'ベラルーシ', lat: 53.71, lng: 27.95 },
};

const DASHBOARD_JSON_URL = 'https://takuroh51.github.io/games-dashboard/data/dashboard.json';

export function useRealtimeData(): UseRealtimeDataResult {
  const [regionStats, setRegionStats] = useState<RegionStats[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // 既知のユーザーIDを追跡（重複カウント防止）
  const knownUserIds = useRef<Set<string>>(new Set());
  // 地域別の統計（mutableで管理）
  const statsMap = useRef<Map<string, RegionStats>>(new Map());

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const initialize = async () => {
      try {
        // 1. まずdashboard.jsonから初期データを取得
        const response = await fetch(DASHBOARD_JSON_URL);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        const purificationData = data.purificationByRegion;

        if (purificationData?.regions) {
          // 初期データをセット
          const initialStats: RegionStats[] = purificationData.regions.map((r: {
            region: string;
            regionJa: string;
            lat: number;
            lng: number;
            users: number;
            plays: number;
            purified: number;
          }) => ({
            region: {
              name: r.region,
              nameJa: r.regionJa,
              lat: r.lat,
              lng: r.lng,
            },
            count: r.users,
            playCount: r.plays,
            purified: r.purified,
            recentHit: false,
          }));

          // statsMapを初期化
          initialStats.forEach(stat => {
            statsMap.current.set(stat.region.name, stat);
          });

          setRegionStats(initialStats);
          setTotalCount(initialStats.reduce((sum, s) => sum + s.count, 0));
          setLastUpdated(data.lastUpdated || null);
        }

        // 2. Firebaseから既存ユーザーIDを取得（重複防止用）
        const usersRef = ref(database, 'users');
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
          const users = snapshot.val();
          Object.keys(users).forEach(userId => {
            knownUserIds.current.add(userId);
          });
          console.log(`Loaded ${knownUserIds.current.size} existing users`);
        }

        // 3. 新しいユーザーをリアルタイム監視
        const newUsersQuery = query(usersRef, limitToLast(1));

        unsubscribe = onChildAdded(newUsersQuery, (snapshot) => {
          const userId = snapshot.key;
          if (!userId || knownUserIds.current.has(userId)) {
            return; // 既知のユーザーはスキップ
          }

          knownUserIds.current.add(userId);
          const userData = snapshot.val();
          const systemLanguage = userData?.systemLanguage || 'Unknown';

          // 言語から地域を特定
          const regionInfo = LANGUAGE_TO_REGION[systemLanguage];
          const regionKey = regionInfo ? regionInfo.name : 'Other';

          // プレイ数と浄化数を計算
          const results = userData?.results || {};
          let playCount = 0;
          let purified = 0;

          if (typeof results === 'object') {
            for (const resultData of Object.values(results)) {
              if (typeof resultData === 'object' && resultData !== null) {
                const r = resultData as { maxScore?: number; clearRate?: number };
                const maxScore = r.maxScore || 0;
                const clearRate = r.clearRate || 0;
                if (maxScore > 0) {
                  const maxNotes = Math.floor(maxScore / 100);
                  purified += Math.floor(maxNotes * clearRate / 100);
                  playCount += 1;
                }
              }
            }
          }

          // 統計を更新
          const currentStat = statsMap.current.get(regionKey);
          if (currentStat) {
            currentStat.count += 1;
            currentStat.playCount += playCount;
            currentStat.purified += purified;
            currentStat.recentHit = true;

            // recentHitを3秒後にリセット
            setTimeout(() => {
              currentStat.recentHit = false;
              updateStats();
            }, 3000);
          } else if (regionInfo) {
            // 新しい地域
            statsMap.current.set(regionKey, {
              region: regionInfo,
              count: 1,
              playCount: playCount,
              purified: purified,
              recentHit: true,
            });
          }

          updateStats();
          setLastUpdated(new Date().toISOString());
          console.log(`New user from ${regionKey}: +1 user, +${playCount} plays`);
        });

        setIsConnected(true);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsConnected(false);
      }
    };

    const updateStats = () => {
      const stats = Array.from(statsMap.current.values())
        .sort((a, b) => b.playCount - a.playCount);
      setRegionStats(stats);
      setTotalCount(stats.reduce((sum, s) => sum + s.count, 0));
    };

    initialize();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return {
    regionStats,
    totalCount,
    isConnected,
    error,
    lastUpdated,
  };
}
