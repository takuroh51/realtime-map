import { useState, useEffect } from 'react';
import WorldMap from './components/WorldMap';
import LoginForm from './components/LoginForm';
import { useRealtimeData } from './hooks/useRealtimeData';
import { isAuthenticated, logout } from './utils/auth';

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    setAuthenticated(isAuthenticated());
    setCheckingAuth(false);
  }, []);

  const { regionStats, isConnected, error, lastUpdated } = useRealtimeData();

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <LoginForm onLogin={() => setAuthenticated(true)} />;
  }

  const formatLastUpdated = (isoString: string | null) => {
    if (!isoString) return '-';
    try {
      const date = new Date(isoString);
      return date.toLocaleString('ja-JP', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '-';
    }
  };

  const totalPlays = regionStats.reduce((sum, s) => sum + s.playCount, 0);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header - ダッシュボードと同じスタイル */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                🗺️ World Play Map
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {isConnected ? (
                  <span className="text-green-600">● Connected</span>
                ) : (
                  <span className="text-red-600">● Disconnected</span>
                )}
                {lastUpdated && <span className="ml-3">更新: {formatLastUpdated(lastUpdated)}</span>}
              </p>
            </div>
            <button
              onClick={() => { logout(); setAuthenticated(false); }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">Error: {error}</p>
          </div>
        )}

        {/* メインコンテンツ - ダッシュボードのPurificationWorldMapと同じ構造 */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              地域別プレイ数
            </h2>
            <div className="text-right">
              <p className="text-sm text-gray-500">総プレイ数</p>
              <p className="text-2xl font-bold text-purple-600">
                {totalPlays.toLocaleString()}
              </p>
            </div>
          </div>

          {/* 地図 */}
          <div className="relative" style={{ height: '450px' }}>
            <WorldMap regionStats={regionStats} totalPlays={totalPlays} />
          </div>

          {/* 凡例 */}
          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500 opacity-60"></div>
              <span>円の大きさ = プレイ数</span>
            </div>
          </div>

          {/* 上位5地域のリスト */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
            {regionStats.slice(0, 5).map((stat, index) => (
              <div
                key={stat.region.name}
                className="bg-gray-50 rounded-lg p-3 text-center"
              >
                <p className="text-xs text-gray-500">#{index + 1}</p>
                <p className="font-bold text-gray-900">{stat.region.nameJa}</p>
                <p className="text-purple-600 font-semibold">
                  {stat.playCount.toLocaleString()}回
                </p>
                <p className="text-xs text-gray-500">
                  {stat.count.toLocaleString()}人
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 全地域リスト */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">全地域データ</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">#</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">地域</th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-gray-500">プレイ数</th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-gray-500">ユーザー数</th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-gray-500">割合</th>
                </tr>
              </thead>
              <tbody>
                {regionStats.map((stat, index) => (
                  <tr key={stat.region.name} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3 text-sm text-gray-500">{index + 1}</td>
                    <td className="py-2 px-3 text-sm font-medium text-gray-900">{stat.region.nameJa}</td>
                    <td className="py-2 px-3 text-sm text-right text-purple-600 font-semibold">
                      {stat.playCount.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-sm text-right text-gray-600">
                      {stat.count.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-sm text-right text-gray-500">
                      {((stat.playCount / totalPlays) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
