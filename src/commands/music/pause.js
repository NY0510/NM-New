const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { checkPlayerAndVoiceChannel } = require('../../utils/music');

module.exports = {
	data: new SlashCommandBuilder().setName('pause').setDescription('음악을 일시 정지해요'),
	async execute(interaction) {
		const player = interaction.client.manager.get(interaction.guild.id);

		const errorResponse = checkPlayerAndVoiceChannel(interaction, player);
		if (errorResponse) return interaction.reply(errorResponse);

		if (player.paused) {
			return interaction.reply({
				embeds: [new EmbedBuilder().setColor(interaction.client.config.color.error).setDescription('이미 일시정지 상태에요')],
				flags: [MessageFlags.Ephemeral],
			});
		}

		player.pause(true);
		await interaction.reply({
			embeds: [new EmbedBuilder().setColor(interaction.client.config.color.normal).setDescription('음악을 일시정지했어요')],
		});
	},
};
