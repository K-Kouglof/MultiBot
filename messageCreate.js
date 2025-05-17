// events/messageCreate.js
import { ChannelType, EmbedBuilder } from 'discord.js';
import { loadConfig } from '../utils/configManager.js';
import { getThreadButtons } from '../utils/buttons.js';
import { sanitizeThreadTitle } from '../utils/sanitize.js';

export default {
  name: 'messageCreate',
  async execute(message, client) {
    console.log('💬 messageCreate fired:', message.channel.id, message.content);

    // 前提チェック
    if (message.author.bot || !message.guild) return;
    if (message.channel.type !== ChannelType.GuildText) return;

    // 設定読み込み
    const config = await loadConfig();
    console.log('⚙️ loaded config:', config);

    const settings = config[message.channel.id];
    if (!settings) {
  console.log('⚠️ no settings for this channel:', message.channel.id);
  return;
  }

          console.log('✅ settings found:', settings);

    try {
      // 通知ロールにメンション
      await message.channel.send({
  content: `<@&${settings.notifyRoleId}>`,
  allowedMentions: { roles: [settings.notifyRoleId] },
  embeds: [
    new EmbedBuilder()
      .setColor(0x00bfff)
      .setTitle('🔔 通知')
      .setDescription('通知が届いているわ！\n見に行ってみましょう！')
  ]
});

      // スレッド作成（🟢プレフィックス）
      console.log('…creating thread');
      const thread = await message.startThread({
        name: `🟢${sanitizeThreadTitle(message.content)}`,
        autoArchiveDuration: 60,
      });
      console.log('…thread created:', thread.id);

      // Embed ＆ ボタン送信
      const embed = new EmbedBuilder()
        .setTitle('スレッドの使い方')
        .setDescription(`🚪【募集終了】\n
・募集を終了する時はこのボタンを押します。
🔊【VC作成】\n
・VC部屋を作成することができます。`)
        .setColor(0x00bfff);

      const [row] = getThreadButtons({ ended: false, hasVC: false });

      await thread.send({
        embeds: [embed],
        components: [row],
      });
    } catch (error) {
      console.error('❌ thread creation error:', error);
      await message.reply({
        content: '❌ スレッド作成中にエラーが発生しました。',
        flags: 64
      });
    }
  }
};
