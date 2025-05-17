// interactions/buttons/voice.js
import { ButtonStyle, ActionRowBuilder, ButtonBuilder } from 'discord.js';

const vcMap = new Map(); // threadId => voiceChannelId

export default {
  customIds: ['createVC', 'endVC'],
  async execute(interaction) {
    const thread = interaction.channel;

    if (!thread.isThread()) {
      return interaction.reply({ content: 'この操作はスレッド内でのみ使えます。', ephemeral: true });
    }

    if (interaction.customId === 'createVC') {
      if (vcMap.has(thread.id)) {
        return interaction.reply({ content: '既にVCが存在します。', ephemeral: true });
      }

      const parent = thread.guild.channels.cache.find(c =>
        c.type === 4 && c.name.includes('マルチ募集')
      ); // カテゴリ名などに応じて調整してください

      const vc = await thread.guild.channels.create({
        name: thread.name,
        type: 2, // Voice
        parent: parent?.id || null,
      });

      vcMap.set(thread.id, vc.id);

      const newButton = new ButtonBuilder()
        .setCustomId('endVC')
        .setLabel('VC終了')
        .setStyle(ButtonStyle.Secondary);

      const components = updateButton(interaction, 'createVC', newButton);
      await interaction.update({ components });

      // 自動削除監視
      const checkEmpty = async () => {
        const updatedVC = await interaction.guild.channels.fetch(vc.id).catch(() => null);
        if (!updatedVC) return;

        if (updatedVC.members.size === 0) {
          await updatedVC.delete().catch(console.error);
          vcMap.delete(thread.id);

          const resetButton = new ButtonBuilder()
            .setCustomId('createVC')
            .setLabel('VC作成')
            .setStyle(ButtonStyle.Primary);

          const resetComponents = updateButton(interaction, 'endVC', resetButton);
          thread.send({ content: '🔕 VCが自動削除されました。', components: resetComponents });
        } else {
          setTimeout(checkEmpty, 15000); // 15秒ごとに確認
        }
      };
      setTimeout(checkEmpty, 15000);
    } else {
      const vcId = vcMap.get(thread.id);
      const vc = await interaction.guild.channels.fetch(vcId).catch(() => null);

      if (vc) await vc.delete().catch(console.error);
      vcMap.delete(thread.id);

      const newButton = new ButtonBuilder()
        .setCustomId('createVC')
        .setLabel('VC作成')
        .setStyle(ButtonStyle.Primary);

      const components = updateButton(interaction, 'endVC', newButton);
      await interaction.update({ components });
    }
  },
};

// ボタン置換ヘルパー
function updateButton(interaction, targetId, newButton) {
  return interaction.message.components.map(row => {
    return ActionRowBuilder.from({
      type: 1,
      components: row.components.map(comp => {
        if (comp.custom_id === targetId) {
          return newButton;
        }
        return comp;
      }),
    });
  });
}
