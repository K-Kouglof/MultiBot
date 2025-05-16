import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { REST, Routes } from 'discord.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// コマンド読み込み
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  commands.push(command.default.data.toJSON());
}

// REST APIで登録
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

const guildId = process.env.GUILD_ID;

try {
  console.log(`🔄 スラッシュコマンドをギルド ${guildId} に登録中...`);

  await rest.put(
    Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
    { body: commands }
  );

  console.log(`✅ 登録完了: ${guildId}`);
} catch (error) {
  console.error('❌ コマンド登録失敗:', error);
}
