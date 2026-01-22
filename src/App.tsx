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

        {/* KPIカード - ダッシュボードと同じスタイル */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <p className="text-sm font-medium text-gray-500 mb-1">総プレイ数</p>
            <p className="text-3xl font-bold text-purple-600">{totalPlays.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <p className="text-sm font-medium text-gray-500 mb-1">総ユーザー数</p>
            <p className="text-3xl font-bold text-blue-600">{totalUsers.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <p className="text-sm font-medium text-gray-500 mb-1">地域数</p>
            <p className="text-3xl font-bold text-green-600">{regionStats.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <p className="text-sm font-medium text-gray-500 mb-1">トップ地域</p>
            <p className="text-2xl font-bold text-gray-900">{regionStats[0]?.region.nameJa || '-'}</p>
          </div>
        </div>

        {/* 地図セクション - ダッシュボードと同じスタイル */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              地域別プレイ数マップ
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

          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500 opacity-60"></div>
              <span>円の大きさ = プレイ数</span>
            </div>
          </div>

          {/* 上位5地域 - グリッドでセンター配置 */}
          <div className="mt-6 grid grid-cols-5 gap-4">
            {regionStats.slice(0, 5).map((stat, index) => (
              <div
                key={stat.region.name}
                className="bg-gray-50 rounded-lg p-4 text-center border border-gray-100"
              >
                <p className="text-xs text-gray-400 mb-1">#{index + 1}</p>
                <p className="font-bold text-gray-900">{stat.region.nameJa}</p>
                <p className="text-lg font-semibold text-purple-600">
                  {stat.playCount.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  {stat.count.toLocaleString()}人
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 全地域テーブル - ダッシュボードと同じスタイル */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">全地域データ</h2>
            <span className="text-sm text-gray-500">全 {regionStats.length} 地域</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">#</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">地域</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">プレイ数</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">ユーザー数</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">割合</th>
                </tr>
              </thead>
              <tbody>
                {regionStats.map((stat, index) => (
                  <tr
                    key={stat.region.name}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                  >
                    <td className="py-3 px-4 text-sm text-gray-500">{index + 1}</td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{stat.region.nameJa}</td>
                    <td className="py-3 px-4 text-sm text-right font-semibold text-purple-600">
                      {stat.playCount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-gray-600">
                      {stat.count.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-gray-500">
                      {((stat.playCount / totalPlays) * 100).toFixed(1)}%
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
