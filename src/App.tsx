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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
      const utcDate = new Date(isoString);
      const jstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
      return jstDate.toLocaleString('ja-JP');
    } catch {
      return '-';
    }
  };

  const totalPlays = regionStats.reduce((sum, s) => sum + s.playCount, 0);
  const totalUsers = regionStats.reduce((sum, s) => sum + s.count, 0);
  const totalPurified = regionStats.reduce((sum, s) => sum + s.purified, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header - ダッシュボードと同じスタイル */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-gray-900">
              🗺️ World Play Map
            </h1>
            <button
              onClick={() => { logout(); setAuthenticated(false); }}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              ログアウト
            </button>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-gray-600">
              最終更新: {formatLastUpdated(lastUpdated)}
            </p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              isConnected
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {isConnected ? '● Connected' : '● Disconnected'}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">Error: {error}</p>
          </div>
        )}

        {/* KPI Cards - ダッシュボードと完全に同じスタイル */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">総プレイ数</p>
                <p className="text-3xl font-bold text-gray-900">{totalPlays.toLocaleString()}</p>
              </div>
              <div className="bg-purple-500 w-12 h-12 rounded-full flex items-center justify-center text-2xl">
                🎮
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">総ユーザー数</p>
                <p className="text-3xl font-bold text-gray-900">{totalUsers.toLocaleString()}</p>
              </div>
              <div className="bg-blue-500 w-12 h-12 rounded-full flex items-center justify-center text-2xl">
                👥
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">総浄化数</p>
                <p className="text-3xl font-bold text-gray-900">{totalPurified.toLocaleString()}</p>
              </div>
              <div className="bg-green-500 w-12 h-12 rounded-full flex items-center justify-center text-2xl">
                ✨
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">地域数</p>
                <p className="text-3xl font-bold text-gray-900">{regionStats.length}</p>
              </div>
              <div className="bg-yellow-500 w-12 h-12 rounded-full flex items-center justify-center text-2xl">
                🌍
              </div>
            </div>
          </div>
        </div>

        {/* 地図セクション - ダッシュボードと完全に同じスタイル */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              🗺️ 地域別プレイ数マップ
            </h2>
            <div className="text-right">
              <p className="text-sm text-gray-500">総プレイ数</p>
              <p className="text-2xl font-bold text-purple-600">
                {totalPlays.toLocaleString()}
              </p>
            </div>
          </div>

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

          {/* 上位5地域 - ダッシュボードと同じスタイル */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
            {regionStats.slice(0, 5).map((stat, index) => (
              <div
                key={stat.region.name}
                className="bg-gray-50 rounded-lg p-3 text-center"
              >
                <p className="text-xs text-gray-500">#{index + 1}</p>
                <p className="font-bold text-gray-900">{stat.region.nameJa}</p>
                <p className="text-purple-600 font-semibold">
                  {stat.playCount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 全地域テーブル - ダッシュボードと完全に同じスタイル */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">全地域データ</h2>
            <span className="text-sm text-gray-500">全{regionStats.length}件</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">地域</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">浄化数</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">プレイ数</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ユーザー数</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">割合</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {regionStats.map((stat, index) => (
                  <tr key={stat.region.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.region.nameJa}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">
                      {stat.purified.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stat.playCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stat.count.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {((stat.purified / totalPurified) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
