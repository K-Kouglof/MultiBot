import dotenv from 'dotenv';
dotenv.config();

import {
  Client,
  GatewayIntentBits,
  Partials,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from 'discord.js';
import fs from 'fs';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

// ✅ 起動確認
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// ✅ メッセージ → スレッド作成 & 通知ロールping
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const configPath = './config.json';
  if (!fs.existsSync(configPath)) return;
  const { notifyChannel, notifyRole } = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  if (message.channel.id !== notifyChannel) return;

  try {
    await message.channel.send(`<@&${notifyRole}> が来ています～！\n見に行ってみましょう！`);

    const thread = await message.startThread({
      name: message.content,
      autoArchiveDuration: 60,
      reason: '新しい募集スレッド作成',
    });

    console.log('✅ スレッド作成:', thread.id);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('end').setLabel('募集終了').setStyle(ButtonStyle.Danger)
    );

    const embed = new EmbedBuilder()
      .setColor(0x00bfff)
      .setTitle('🎮 スレッド操作方法')
      .setDescription('⬇️ 下のボタンで参加管理ができます。\n「募集終了」はスレッドを閉じることができます。')
      .setTimestamp();

    await thread.send({ embeds: [embed], components: [row] });
  } catch (error) {
    console.error('❌ スレッド作成または送信エラー:', error);
  }
});

// ✅ ボタン操作
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  const configPath = './config.json';
  if (!fs.existsSync(configPath)) return;
  const { notifyRole } = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  const thread = interaction.channel?.isThread() ? interaction.channel : null;

  if (!thread) {
    await interaction.reply({
      content: '❌ スレッドが見つかりませんでした。',
      flags: 64,
    });
    return;
  }

  try {
    if (interaction.customId === 'end') {
      await thread.setLocked(true);
      if (!thread.name.startsWith('〆 ')) {
        await thread.setName(`〆 ${thread.name}`);
      }
      await interaction.reply({ content: '✅ 募集は終了しました。' });
    }
  } catch (error) {
    console.error('❌ インタラクションエラー:', error);
    const replyData = { content: 'エラーが発生しました。', flags: 64 };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(replyData);
    } else {
      await interaction.reply(replyData);
    }
  }
});

client.login(process.env.TOKEN);

import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot is running!');
});

app.listen(PORT, () => {
  console.log(`HTTP server is listening on port ${PORT}`);
});

