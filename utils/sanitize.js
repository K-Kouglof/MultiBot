// utils/sanitize.js
export function sanitizeThreadTitle(content) {
  return content
    // 先頭のアイコンを除去
    .replace(/^🟢/, '')
    .replace(/^🟣【終了】/, '')
    // 改行をスペースに
    .replace(/[\n\r]/g, ' ')
    // 25文字以内に切り詰め
    .slice(0, 25)
    .trim() || '募集スレッド';
}
