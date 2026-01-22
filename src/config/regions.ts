// 言語コード → 地域マッピング
export interface RegionInfo {
  name: string;
  nameJa: string;
  lat: number;
  lng: number;
}

export const LANGUAGE_TO_REGION: Record<string, RegionInfo> = {
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

export function getRegionFromLanguage(language: string): RegionInfo | null {
  return LANGUAGE_TO_REGION[language] || null;
}
