// utils/buttons.js
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export function getThreadButtons({ ended, hasVC }) {
  return [ new ActionRowBuilder().addComponents(
    // 募集終了 ⇔ 募集再開
    new ButtonBuilder()
      .setCustomId(ended ? 'reopen' : 'end')
      .setLabel(ended   ? '募集再開' : '募集終了')
      .setStyle(ended   ? ButtonStyle.Success : ButtonStyle.Danger),

    // VC作成 ⇔ VC終了
    new ButtonBuilder()
      .setCustomId(hasVC  ? 'delete_vc' : 'create_vc')
      .setLabel(hasVC     ? 'VC終了'     : 'VC作成')
      .setStyle(hasVC     ? ButtonStyle.Danger : ButtonStyle.Primary)
  )];
}
