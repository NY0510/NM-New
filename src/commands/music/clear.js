const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { checkPlayerAndVoiceChannel } = require('../../utils/music');

module.exports = {
	data: new SlashCommandBuilder().setName('clear').setDescription('대기열에 있는 음악을 모두 삭제해요'),
	async execute(interaction) {
		const player = interaction.client.manager.get(interaction.guild.id);

		const errorResponse = checkPlayerAndVoiceChannel(interaction, player);
		if (errorResponse) return interaction.reply(errorResponse);

		player.queue.clear();
		await interaction.reply({
			embeds: [new EmbedBuilder().setColor(interaction.client.config.color.normal).setDescription(`대기열에 있는 모든 음악을 삭제했어요`)],
		});
	},
};
