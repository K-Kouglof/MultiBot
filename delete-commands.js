import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// サーバーID（開発用ギルドID）とクライアントID（Bot ID）を環境変数または直接指定
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID; // グローバル削除なら省略

async function deleteCommandByName(nameToDelete) {
  try {
    const commands = await rest.get(Routes.applicationGuildCommands(clientId, guildId));
    
    const target = commands.find(cmd => cmd.name === nameToDelete);
    if (!target) {
      console.log(`コマンド "${nameToDelete}" は見つかりませんでした。`);
      return;
    }

    await rest.delete(Routes.applicationGuildCommand(clientId, guildId, target.id));
    console.log(`コマンド "${nameToDelete}" を削除しました。`);
  } catch (error) {
    console.error('削除中にエラーが発生しました:', error);
  }
}

// 削除したいコマンド名をここで指定
deleteCommandByName('targetchannel-set');
