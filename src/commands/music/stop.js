const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { checkPlayerAndVoiceChannel } = require('../../utils/music');

module.exports = {
	data: new SlashCommandBuilder().setName('stop').setDescription('음악을 정지해요'),
	async execute(interaction) {
		const player = interaction.client.manager.get(interaction.guild.id);

		const errorResponse = checkPlayerAndVoiceChannel(interaction, player);
		if (errorResponse) return interaction.reply(errorResponse);

		player.destroy();
		await interaction.reply({
			embeds: [new EmbedBuilder().setColor(interaction.client.config.color.normal).setDescription('음악을 정지했어요')],
		});
	},
};
