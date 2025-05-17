// interactions/buttons/recruit.js
import { ButtonStyle, ActionRowBuilder, ButtonBuilder } from 'discord.js';

export default {
  customIds: ['endRecruit', 'resumeRecruit'],
  async execute(interaction) {
    const thread = interaction.channel;

    if (!thread.isThread()) {
      return interaction.reply({ content: 'この操作はスレッド内でのみ使えます。', ephemeral: true });
    }

    const oldName = thread.name;
    let newName;
    let newButton;

    if (interaction.customId === 'endRecruit') {
      if (oldName.startsWith('〆【終了】')) {
        return interaction.reply({ content: '既に募集終了状態です。', ephemeral: true });
      }
      newName = `〆【終了】${oldName}`;
      newButton = new ButtonBuilder()
        .setCustomId('resumeRecruit')
        .setLabel('募集再開')
        .setStyle(ButtonStyle.Success);
    } else {
      newName = oldName.replace(/^〆【終了】/, '');
      newButton = new ButtonBuilder()
        .setCustomId('endRecruit')
        .setLabel('募集終了')
        .setStyle(ButtonStyle.Danger);
    }

    try {
      await thread.setName(newName);
      const components = interaction.message.components.map(row => {
        return ActionRowBuilder.from({
          type: 1,
          components: row.components.map(comp => {
            if (
              comp.custom_id === 'endRecruit' ||
              comp.custom_id === 'resumeRecruit'
            ) {
              return newButton;
            }
            return comp;
          }),
        });
      });

      await interaction.update({ components });
    } catch (err) {
      console.error('スレッド名変更エラー:', err);
      interaction.reply({ content: 'スレッド名の変更に失敗しました。', ephemeral: true });
    }
  },
};
