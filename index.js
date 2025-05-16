// index.js
import 'dotenv/config';
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';


// clientは最初に定義する！
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
client.commands = new Collection();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// イベントハンドラー読み込み
import messageCreateHandler   from './events/messageCreate.js';
import interactionCreateHandler from './events/interactionCreate.js';

// メッセージCreate（自動スレッド生成）
client.on('messageCreate', message => messageCreateHandler.execute(message, client));

// InteractionCreate（スラッシュ & ボタン両対応）
client.on('interactionCreate', interaction => {
  // まずボタン処理を優先
  interactionCreateHandler.execute(interaction, client);
  // スラッシュコマンドは下の既存ロジックで処理します
});

// スラッシュコマンド読み込み
const commandFiles = readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const commandModule = await import(`./commands/${file}`);
  const command = commandModule.default || commandModule;

  if (!command.data || !command.execute) {
    console.warn(`❌ 無効なコマンド形式: ${file}`);
    continue;
  }

  client.commands.set(command.data.name, command);
}

// スラッシュコマンド処理
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: '❌ コマンドの実行に失敗しました。', ephemeral: true });
    } else {
      await interaction.reply({ content: '❌ コマンドの実行に失敗しました。', ephemeral: true });
    }
  }
});

client.once('ready', () => {
  console.log(`Bot is logged in as ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);

const app = express();
const port = process.env.PORT || 3000; // Renderは自動でPORTを設定します

app.get('/', (req, res) => {
    res.send('Bot is running!');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
