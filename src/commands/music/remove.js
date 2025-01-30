const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { textLengthOverCut } = require('../../utils/format');
const { checkPlayerAndVoiceChannel } = require('../../utils/music');
const { createMusicControlButton } = require('../../utils/button');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remove')
		.setDescription('대기열에서 음악을 삭제해요')
		.addIntegerOption((option) => option.setName('index').setDescription('삭제할 음악의 인덱스를 입력해주세요').setRequired(true)),
	async execute(interaction) {
		const player = interaction.client.manager.get(interaction.guild.id);
		const index = interaction.options.getInteger('index', true) - 1;

		const errorResponse = checkPlayerAndVoiceChannel(interaction, player);
		if (errorResponse) return interaction.reply(errorResponse);

		if (player.queue.size <= index || index < 0) {
			return interaction.reply({
				embeds: [new EmbedBuilder().setColor(interaction.client.config.color.error).setDescription(`대기열에 있는 음악의 인덱스가 잘못되었어요`)],
				flags: [MessageFlags.Ephemeral],
			});
		}

		const removed = player.queue.splice(index, 1);

		// 카드 버튼 업데이트
		if (player.lastMessage) {
			const row = createMusicControlButton(player);
			player.lastMessage.edit({ components: [row] });
		}

		await interaction.reply({
			embeds: [new EmbedBuilder().setColor(interaction.client.config.color.normal).setDescription(`대기열에서 음악을 삭제했어요\n\n\`\`\`diff\n- ${textLengthOverCut(removed[0].title, 50)}\`\`\``)],
		});
	},
};
