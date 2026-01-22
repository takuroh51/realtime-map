/**
 * パスワード認証ユーティリティ
 */

// パスワードのSHA-256ハッシュ値
// デフォルトパスワード: "skoota2025"
const DEFAULT_PASSWORD_HASH = 'bf267542668516d323ca59a4408c7b92eab9658ef0c6f1e355efbc77b3a50914'
const PASSWORD_HASH = import.meta.env.VITE_PASSWORD_HASH || DEFAULT_PASSWORD_HASH

const AUTH_STORAGE_KEY = 'skoota_livemap_auth'

/**
 * 文字列をSHA-256ハッシュに変換
 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

/**
 * パスワードが正しいかチェック
 */
export async function verifyPassword(password: string): Promise<boolean> {
  try {
    const hash = await hashPassword(password)
    return hash === PASSWORD_HASH
  } catch (error) {
    console.error('Password verification error:', error)
    return false
  }
}

/**
 * 認証状態を保存
 */
export function setAuthenticated(authenticated: boolean): void {
  if (typeof window !== 'undefined') {
    if (authenticated) {
      localStorage.setItem(AUTH_STORAGE_KEY, 'true')
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    }
  }
}

/**
 * 認証状態をチェック
 */
export function isAuthenticated(): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(AUTH_STORAGE_KEY) === 'true'
  }
  return false
}

/**
 * ログアウト
 */
export function logout(): void {
  setAuthenticated(false)
}
