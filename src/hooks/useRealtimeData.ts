import { useState, useEffect, useRef, useCallback } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../firebase';
import { getRegionFromLanguage, type RegionInfo } from '../config/regions';

export interface AccessEvent {
  id: string;
  region: RegionInfo;
  timestamp: number;
}

export interface RegionStats {
  region: RegionInfo;
  count: number;
  playCount: number;
  recentHit: boolean; // 最近アクセスがあったか
}

interface UseRealtimeDataResult {
  regionStats: RegionStats[];
  recentEvents: AccessEvent[];
  totalCount: number;
  lastMinuteCount: number;
  isConnected: boolean;
  error: string | null;
}

export function useRealtimeData(): UseRealtimeDataResult {
  const [regionStats, setRegionStats] = useState<RegionStats[]>([]);
  const [recentEvents, setRecentEvents] = useState<AccessEvent[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [lastMinuteCount, setLastMinuteCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previousDataRef = useRef<Record<string, unknown>>({});
  const recentHitsRef = useRef<Set<string>>(new Set());

  // 地域ごとの統計を計算
  const calculateStats = useCallback((usersData: Record<string, unknown>) => {
    const stats: Record<string, { count: number; playCount: number; region: RegionInfo }> = {};

    Object.entries(usersData).forEach(([, userData]) => {
      if (typeof userData !== 'object' || userData === null) return;

      const user = userData as Record<string, unknown>;
      const language = user.systemLanguage as string;
      const region = getRegionFromLanguage(language);

      if (region) {
        if (!stats[region.name]) {
          stats[region.name] = { count: 0, playCount: 0, region };
        }
        stats[region.name].count++;
        const results = user.results;
        if (results && typeof results === 'object') {
          stats[region.name].playCount += Object.keys(results).length;
        }
      }
    });

    return Object.values(stats)
      .map(s => ({
        region: s.region,
        count: s.count,
        playCount: s.playCount,
        recentHit: recentHitsRef.current.has(s.region.name)
      }))
      .sort((a, b) => b.count - a.count);
  }, []);

  // 新規アクセスを検出
  const detectNewAccess = useCallback((
    newData: Record<string, unknown>,
    prevData: Record<string, unknown>
  ): AccessEvent[] => {
    const events: AccessEvent[] = [];
    const now = Date.now();

    Object.entries(newData).forEach(([userId, userData]) => {
      if (typeof userData !== 'object' || userData === null) return;

      const user = userData as Record<string, unknown>;
      const prevUser = prevData[userId] as Record<string, unknown> | undefined;

      // 新規ユーザーまたは結果が更新された場合
      const isNew = !prevUser;
      const resultsChanged = prevUser &&
        JSON.stringify(user.results) !== JSON.stringify(prevUser.results);

      if (isNew || resultsChanged) {
        const language = user.systemLanguage as string;
        const region = getRegionFromLanguage(language);

        if (region) {
          events.push({
            id: `${userId}-${now}`,
            region,
            timestamp: now
          });

          // 「最近ヒット」フラグを設定
          recentHitsRef.current.add(region.name);

          // 3秒後にフラグをクリア
          setTimeout(() => {
            recentHitsRef.current.delete(region.name);
          }, 3000);
        }
      }
    });

    return events;
  }, []);

  useEffect(() => {
    const usersRef = ref(database, 'users');

    onValue(
      usersRef,
      (snapshot) => {
        setIsConnected(true);
        setError(null);

        const data = snapshot.val() || {};

        // 新規アクセスを検出
        const newEvents = detectNewAccess(data, previousDataRef.current);
        if (newEvents.length > 0) {
          setRecentEvents(prev => [...newEvents, ...prev].slice(0, 20));
        }

        // 統計を更新
        const stats = calculateStats(data);
        setRegionStats(stats);
        setTotalCount(Object.keys(data).length);

        // 直近1分のカウント（recent eventsから計算）
        const oneMinuteAgo = Date.now() - 60000;
        setLastMinuteCount(prev => {
          const recentCount = newEvents.filter(e => e.timestamp > oneMinuteAgo).length;
          return recentCount > 0 ? recentCount : prev;
        });

        // 前回のデータを保存
        previousDataRef.current = data;
      },
      (err) => {
        setIsConnected(false);
        setError(err.message);
        console.error('Firebase error:', err);
      }
    );

    return () => {
      off(usersRef);
    };
  }, [calculateStats, detectNewAccess]);

  return {
    regionStats,
    recentEvents,
    totalCount,
    lastMinuteCount,
    isConnected,
    error
  };
}

// デモ用のモックデータフック（Firebase未設定時用）
export function useMockData(): UseRealtimeDataResult {
  const [regionStats, setRegionStats] = useState<RegionStats[]>([]);
  const [recentEvents, setRecentEvents] = useState<AccessEvent[]>([]);
  const [totalCount, setTotalCount] = useState(1523);
  const [lastMinuteCount, setLastMinuteCount] = useState(0);

  const regions = [
    { name: 'Japan', nameJa: '日本', lat: 36.20, lng: 138.25 },
    { name: 'USA', nameJa: 'アメリカ', lat: 37.09, lng: -95.71 },
    { name: 'China', nameJa: '中国', lat: 35.86, lng: 104.19 },
    { name: 'South Korea', nameJa: '韓国', lat: 35.90, lng: 127.76 },
    { name: 'Taiwan', nameJa: '台湾', lat: 23.69, lng: 120.96 },
    { name: 'Russia', nameJa: 'ロシア', lat: 61.52, lng: 105.31 },
    { name: 'Germany', nameJa: 'ドイツ', lat: 51.16, lng: 10.45 },
    { name: 'France', nameJa: 'フランス', lat: 46.22, lng: 2.21 },
  ];

  useEffect(() => {
    // 初期データ
    setRegionStats(regions.map((r, i) => ({
      region: r,
      count: Math.floor(500 / (i + 1)),
      playCount: Math.floor(2000 / (i + 1)),
      recentHit: false
    })));

    // ランダムにアクセスイベントを生成
    const interval = setInterval(() => {
      const randomRegion = regions[Math.floor(Math.random() * regions.length)];
      const now = Date.now();

      const newEvent: AccessEvent = {
        id: `mock-${now}`,
        region: randomRegion,
        timestamp: now
      };

      setRecentEvents(prev => [newEvent, ...prev].slice(0, 20));
      setTotalCount(prev => prev + 1);
      setLastMinuteCount(prev => prev + 1);

      // 該当地域をハイライト
      setRegionStats(prev => prev.map(s => ({
        ...s,
        count: s.region.name === randomRegion.name ? s.count + 1 : s.count,
        playCount: s.region.name === randomRegion.name ? s.playCount + 1 : s.playCount,
        recentHit: s.region.name === randomRegion.name
      })));

      // 3秒後にハイライト解除
      setTimeout(() => {
        setRegionStats(prev => prev.map(s => ({
          ...s,
          recentHit: s.region.name === randomRegion.name ? false : s.recentHit
        })));
      }, 3000);

    }, 3000 + Math.random() * 5000); // 3-8秒ランダム

    // 1分ごとにlastMinuteCountをリセット
    const resetInterval = setInterval(() => {
      setLastMinuteCount(0);
    }, 60000);

    return () => {
      clearInterval(interval);
      clearInterval(resetInterval);
    };
  }, []);

  return {
    regionStats,
    recentEvents,
    totalCount,
    lastMinuteCount,
    isConnected: true,
    error: null
  };
}
