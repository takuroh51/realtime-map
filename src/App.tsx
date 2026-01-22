import { useState, useEffect } from 'react';
import WorldMap from './components/WorldMap';
import LiveFeed from './components/LiveFeed';
import Stats from './components/Stats';
import LoginForm from './components/LoginForm';
import { useRealtimeData } from './hooks/useRealtimeData';
import { isAuthenticated, logout } from './utils/auth';

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // 認証状態をチェック
  useEffect(() => {
    setAuthenticated(isAuthenticated());
    setCheckingAuth(false);
  }, []);

  // Firebase生データ接続
  const { regionStats, recentEvents, totalCount, lastMinuteCount, isConnected, error } = useRealtimeData();

  // 認証チェック中
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // 未認証の場合はログインフォームを表示
  if (!authenticated) {
    return <LoginForm onLogin={() => setAuthenticated(true)} />;
  }

  // 認証済みの場合はダッシュボードを表示
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                SKOOTA GAMES Live Map
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} opacity-75`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  </span>
                  <span className={isConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {isConnected ? 'LIVE' : 'Disconnected'}
                  </span>
                </div>
                {lastMinuteCount > 0 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    +{lastMinuteCount} in last 5min
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                setAuthenticated(false);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400">Error: {error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</p>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              {totalCount.toLocaleString()}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Regions</p>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              {regionStats.length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Top Region</p>
            <p className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
              {regionStats[0]?.region.nameJa || '-'}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Recent Activity</p>
            <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
              +{lastMinuteCount}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map (3 columns) */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  🗺️ World Access Map
                </h2>
              </div>
              <div style={{ height: '500px' }}>
                <WorldMap regionStats={regionStats} totalCount={totalCount} />
              </div>
            </div>
          </div>

          {/* Sidebar (1 column) */}
          <div className="space-y-6">
            {/* Top Regions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  📊 Top Regions
                </h3>
              </div>
              <div className="p-4">
                <Stats
                  totalCount={totalCount}
                  lastMinuteCount={lastMinuteCount}
                  regionStats={regionStats}
                  isConnected={isConnected}
                />
              </div>
            </div>

            {/* Live Feed */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Live Feed
                </h3>
              </div>
              <div className="p-4">
                <LiveFeed events={recentEvents} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
