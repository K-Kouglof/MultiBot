import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { REST, Routes } from 'discord.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// スラッシュコマンド読み込み
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  commands.push(command.default.data.toJSON());
}

// 環境変数
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const isDevelopment = process.env.NODE_ENV === 'development';

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

try {
  if (isDevelopment) {
    console.log(`🛠 開発モード: ギルド（${guildId}）にコマンドを登録中...`);
    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );
    console.log('✅ ギルドコマンド登録完了（即時反映）');
  } else {
    console.log('🌍 本番モード: グローバルにコマンドを登録中...');
    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    );
    console.log('✅ グローバルコマンド登録完了（最大1時間かかる場合あり）');
  }
} catch (error) {
  console.error('❌ コマンド登録失敗:', error);
}
