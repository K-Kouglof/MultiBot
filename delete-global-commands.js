// delete-global-commands.js
import 'dotenv/config';
import { REST, Routes } from 'discord.js';

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

try {
  console.log('🧹 グローバルコマンドを削除中...');
  await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [] });
  console.log('✅ グローバルコマンドを削除しました。');
} catch (error) {
  console.error('❌ 削除失敗:', error);
}