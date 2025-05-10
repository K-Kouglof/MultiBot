import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import fs from 'fs';

export default {
  data: new SlashCommandBuilder()
    .setName('notifyrole-set')
    .setDescription('通知先チャンネルと通知ロールを設定します')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('通知を監視するチャンネル')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('通知を送るロール')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const role = interaction.options.getRole('role');

    if (!channel || !role) {
      return await interaction.reply({
        content: 'チャンネルまたはロールが正しく指定されていません。',
        flags: 64,
      });
    }

    const config = {
      notifyChannel: channel.id,
      notifyRole: role.id
    };

    try {
      fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
      await interaction.reply({
        content: `✅ 通知チャンネル：<#${channel.id}>\n通知ロール：<@&${role.id}> に設定しました。`,
        flags: 64,
      });
    } catch (error) {
      console.error('設定保存エラー:', error);
      await interaction.reply({
        content: '❌ 設定保存に失敗しました。',
        flags: 64,
      });
    }
  },
};
