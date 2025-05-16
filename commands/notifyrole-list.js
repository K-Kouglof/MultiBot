// commands/notifyrole-list.js
import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { loadConfig } from '../utils/configManager.js';

export default {
  data: new SlashCommandBuilder()
    .setName('notifyrole-list')
    .setDescription('通知設定の一覧を表示します'),
  async execute(interaction) {
    const config = await loadConfig();
    console.log('🔍 notifyrole-list loaded config:', config);

    if (Object.keys(config).length === 0) {
      return interaction.reply({ content: '😶 設定が何もありません。', flags: 64 });
    }
    // …以下Embed組み立て…

    // Embed の宣言を追加
    const embed = new EmbedBuilder()
      .setTitle("📋 通知設定一覧")
      .setColor(0x00bfff);

    const components = [];

    for (const [channelId, settings] of Object.entries(config)) {
      embed.addFields({
        name: `<#${channelId}>`,
        value: `🔔 通知ロール: <@&${settings.notifyRoleId}>\n📁 VCカテゴリ: <#${settings.vcCategoryId}>`,
        inline: false,
      });

      components.push(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`delete_${channelId}`)
            .setLabel(`🗑️ <#${channelId}> を削除`)
            .setStyle(ButtonStyle.Danger)
        )
      );
    }

    await interaction.reply({ embeds: [embed], components, flags: 64 });
  }
};
