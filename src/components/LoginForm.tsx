import { useState } from 'react'
import { verifyPassword, setAuthenticated } from '../utils/auth'

interface LoginFormProps {
  onLogin: () => void
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const isValid = await verifyPassword(password)

      if (isValid) {
        setAuthenticated(true)
        onLogin()
      } else {
        setError('パスワードが正しくありません')
        setPassword('')
      }
    } catch (err) {
      setError('エラーが発生しました')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900 px-4">
      <div className="max-w-md w-full">
        <div className="bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-2xl shadow-cyan-500/10 p-8 border border-slate-700">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">🌍</div>
            <h1 className="text-2xl font-bold text-white mb-2">
              SoundBeats Live Map
            </h1>
            <p className="text-slate-400">
              Real-time Access Visualization
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                パスワード
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-slate-400 transition-all"
                placeholder="パスワードを入力"
                required
                autoFocus
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-800 rounded-lg p-4">
                <p className="text-red-400 text-sm flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  確認中...
                </span>
              ) : (
                'ログイン'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-slate-500">
            スタッフ専用ページです
          </div>
        </div>
      </div>
    </div>
  )
}
