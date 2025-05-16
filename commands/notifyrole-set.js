// commands/notifyrole-set.js
import { SlashCommandBuilder } from 'discord.js';
import { getChannelConfig, updateChannelConfig } from '../utils/configManager.js';

export default {
  data: new SlashCommandBuilder()
    .setName('notifyrole-set')
    .setDescription('通知ロールとチャンネル、VCカテゴリを設定します')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('通知を送るロール')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('thread_channel')
        .setDescription('自動スレッドを作成するチャンネル')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('vc_category')
        .setDescription('VCを作成するカテゴリチャンネル')
        .setRequired(true)),

  async execute(interaction) {
  const role = interaction.options.getRole('role');
  const threadChannel = interaction.options.getChannel('thread_channel');
  const vcCategory = interaction.options.getChannel('vc_category');
  const channelId = threadChannel.id;

  if (vcCategory.type !== 4) {
    return interaction.reply({
      content: 'VCカテゴリにはカテゴリチャンネルを指定してください。',
      flags: 64,
    });
  }

  if (threadChannel.type !== 0) {
    return interaction.reply({
      content: '自動スレッド作成用のチャンネルにはテキストチャンネルを指定してください。',
      flags: 64,
    });
  }

  // 既存の設定を取得して同一かどうかチェック
  const existingConfig = await getChannelConfig(channelId);
  if (
    existingConfig &&
    existingConfig.notifyRoleId === role.id &&
    existingConfig.vcCategoryId === vcCategory.id &&
    existingConfig.threadChannelId === threadChannel.id
  ) {
    return interaction.reply({
      content: '⚠️ すでにこの設定は登録されています。',
      flags: 64,
    });
  }

  // 設定更新
  await updateChannelConfig(channelId, {
    notifyRoleId: role.id,
    vcCategoryId: vcCategory.id,
    threadChannelId: threadChannel.id,
  });

  return interaction.reply({
    content: `✅ 通知ロール、VCカテゴリ、及び自動スレッド作成チャンネルを設定しました。\n通知ロール: <@&${role.id}>\n自動スレッド作成チャンネル: ${threadChannel.name}\nVCカテゴリ: ${vcCategory.name}`,
    flags: 64,
  });
}
}
