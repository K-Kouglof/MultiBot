import { REST, Routes } from 'discord.js';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname 相当の設定（ESM用）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// スラッシュコマンドを収集
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = await import(`file://${filePath}`);
  commands.push(command.default.data.toJSON());
}

// REST API セットアップ
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// コマンド登録（グローバルまたはギルド）
try {
  console.log('🔄 スラッシュコマンドを登録中...');

  await rest.put(
    Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), // テスト用はギルドに登録
    // Routes.applicationCommands(process.env.CLIENT_ID), // グローバル登録したい場合はこちらに切り替え
    { body: commands },
  );

  console.log('✅ スラッシュコマンドの登録が完了しました。');
} catch (error) {
  console.error('❌ スラッシュコマンド登録中にエラーが発生:', error);
}
