// utils/configManager.js
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const configPath = path.join(__dirname, '..', 'config.json');

// 設定ファイルの読み込み
export async function loadConfig() {
  try {
    const raw = await fs.readFile(configPath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

// 設定ファイルの保存
export async function saveConfig(config) {
  try {
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
  } catch (err) {
    console.error('設定ファイル保存エラー:', err);
  }
}

// チャンネル設定の更新
export async function updateChannelConfig(channelId, updateData) {
  try {
    const config = await loadConfig();
    config[channelId] = {
      ...(config[channelId] || {}),
      ...updateData,
    };
    await saveConfig(config);
  } catch (err) {
    console.error('設定更新エラー:', err);
    throw new Error('設定の更新に失敗しました');
  }
}

// チャンネル設定を取得
export async function getChannelConfig(channelId) {
  try {
    const config = await loadConfig();
    return config[channelId] || null;
  } catch (err) {
    console.error('設定取得エラー:', err);
    throw new Error('設定の取得に失敗しました');
  }
}

// デバッグ用ログ
