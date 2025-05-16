// events/interactionCreate.js
import { ChannelType } from 'discord.js';
import { loadConfig, saveConfig } from '../utils/configManager.js';
import { sanitizeThreadTitle } from '../utils/sanitize.js';
import { getThreadButtons } from '../utils/buttons.js';

export default {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) return;
    if (!interaction.isButton()) return;

    console.log('🔘 Button pressed:', interaction.customId);
    console.log('🔘 Channel ID:', interaction.channel?.id);

    // ---- 設定一覧削除ボタン ----
    if (/^delete_\d+$/.test(interaction.customId)) {
      const channelId = interaction.customId.replace('delete_', '');
      const config = await loadConfig();
      const deleteSettings = config[channelId];
      if (!deleteSettings) {
        return interaction.reply({ content: '⚠️ 設定が見つかりませんでした。', flags: 64 });
      }
      delete config[channelId];
      await saveConfig(config);
      return interaction.reply({ content: `✅ <#${channelId}> の設定を削除しました。`, flags: 64 });
    }

    // ---- 以下はスレッド内ボタン専用処理 ----
    const thread = interaction.channel;
    if (!thread?.isThread()) {
      return interaction.reply({ content: '❌ スレッド内で操作してください。', flags: 64 });
    }

    // deferUpdate() で「あとで編集する」ことを宣言（これが唯一の応答）
    await interaction.deferUpdate();

    const baseTitle = sanitizeThreadTitle(thread.name);
    const vcName = `🥝${baseTitle}`;

    // 設定読み込み
    const config = await loadConfig();
    const settings = config[thread.id] || config[thread.parentId];
    console.log('⚙️ Retrieved settings:', settings);

    const vcCategoryId = settings?.vcCategoryId;
    if (!vcCategoryId) {
      await interaction.followUp({ content: '❌ VCカテゴリが設定されていません。', flags: 64 });
      return;
    }

    // 状態取得
    const ended = thread.name.startsWith('🟣【終了】');
    const hasVC = interaction.guild.channels.cache
      .some(ch => ch.type === ChannelType.GuildVoice && ch.name === vcName);

    // 状態変更用のフラグ
    let newEnded = ended;
    let newHasVC = hasVC;
    let updateMessage = null;

    switch (interaction.customId) {
      case 'end':
        if (!ended) {
          await thread.setName(`🟣【終了】${baseTitle}`);
          newEnded = true;
          updateMessage = '✅ 募集を終了しました。';
        }
        break;

      case 'reopen':
        if (ended) {
          await thread.setName(`🟢${baseTitle}`);
          newEnded = false;
          updateMessage = '✅ 募集を再開しました。';
        }
        break;

      case 'create_vc':
  if (!hasVC) {
    const categoryChannel = interaction.guild.channels.cache.get(vcCategoryId);
    const botMember = interaction.guild.members.me;
    if (!categoryChannel?.permissionsFor(botMember)?.has('ManageChannels')) {
      await interaction.followUp({
        content: '❌ VCカテゴリに「チャンネルの管理」権限がありません。', flags: 64
      });
      break;
    }

    // VCを作成し、そのインスタンスを newVC に保存
    const newVC = await interaction.guild.channels.create({
      name: vcName,
      type: ChannelType.GuildVoice,
      parent: vcCategoryId,
    });

    newHasVC = true;

    // メッセージを更新してVCメンションを埋め込む
    updateMessage = `✅ VCを作成しました: <#${newVC.id}>`;
  }
  break;

      case 'delete_vc':
        if (hasVC) {
          const vcToDelete = interaction.guild.channels.cache.find(
            ch => ch.type === ChannelType.GuildVoice && ch.name === vcName
          );
          if (vcToDelete) {
            await vcToDelete.delete();
            newHasVC = false;
            updateMessage = '🗑️ VCを削除しました。';
          }
        }
        break;
    }

    // ボタン更新（インタラクションに対して interaction.update() ではなく message.edit）
    const [row] = getThreadButtons({ ended: newEnded, hasVC: newHasVC });
    await interaction.message.edit({
      content: updateMessage ?? interaction.message.content, // 更新メッセージ or 元の内容
      components: [row],
    });
  }
};
