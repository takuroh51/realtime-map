import { useState, useEffect } from 'react';
import WorldMap from './components/WorldMap';
import LiveFeed from './components/LiveFeed';
import Stats from './components/Stats';
import LoginForm from './components/LoginForm';
import { useMockData } from './hooks/useRealtimeData';
import { isAuthenticated, logout } from './utils/auth';

// Firebase設定が完了したら useRealtimeData に切り替え
// import { useRealtimeData } from './hooks/useRealtimeData';

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // 認証状態をチェック
  useEffect(() => {
    setAuthenticated(isAuthenticated());
    setCheckingAuth(false);
  }, []);

  // デモモード（Firebase未設定時）
  const { regionStats, recentEvents, totalCount, lastMinuteCount, isConnected, error } = useMockData();

  // Firebase設定後はこちらを使用
  // const { regionStats, recentEvents, totalCount, lastMinuteCount, isConnected, error } = useRealtimeData();

  // 認証チェック中
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-cyan-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // 未認証の場合はログインフォームを表示
  if (!authenticated) {
    return <LoginForm onLogin={() => setAuthenticated(true)} />;
  }

  // 認証済みの場合はダッシュボードを表示
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* ヘッダー */}
      <header className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌍</span>
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              SoundBeats Live Map
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span>LIVE</span>
            </div>
            <button
              onClick={() => {
                logout();
                setAuthenticated(false);
              }}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-300">
            Error: {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 地図（3カラム分） */}
          <div className="lg:col-span-3">
            <div className="bg-slate-800/30 backdrop-blur rounded-xl border border-slate-700 overflow-hidden" style={{ height: '500px' }}>
              <WorldMap regionStats={regionStats} totalCount={totalCount} />
            </div>
          </div>

          {/* サイドバー（1カラム分） */}
          <div className="space-y-4">
            <Stats
              totalCount={totalCount}
              lastMinuteCount={lastMinuteCount}
              regionStats={regionStats}
              isConnected={isConnected}
            />
            <LiveFeed events={recentEvents} />
          </div>
        </div>

        {/* フッター */}
        <footer className="mt-8 text-center text-sm text-slate-500">
          <p>🎮 SoundBeats Dashboard - Real-time Access Map</p>
          <p className="text-xs mt-1">
            Data refreshes automatically • Demo Mode
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
