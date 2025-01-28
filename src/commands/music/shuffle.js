const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { checkPlayerAndVoiceChannel } = require('../../utils/music');

module.exports = {
	data: new SlashCommandBuilder().setName('shuffle').setDescription('대기열을 섞어요'),
	async execute(interaction) {
		const player = interaction.client.manager.get(interaction.guild.id);

		const errorResponse = checkPlayerAndVoiceChannel(interaction, player);
		if (errorResponse) return interaction.reply(errorResponse);

		player.queue.shuffle();

		await interaction.reply({
			embeds: [new EmbedBuilder().setColor(interaction.client.config.color.normal).setDescription(`대기열을 섞었어요`)],
		});
	},
};
