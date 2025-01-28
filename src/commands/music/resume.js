const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { checkPlayerAndVoiceChannel } = require('../../utils/music');

module.exports = {
	data: new SlashCommandBuilder().setName('resume').setDescription('음악 일시정지를 해제해요'),
	async execute(interaction) {
		const player = interaction.client.manager.get(interaction.guild.id);

		const errorResponse = checkPlayerAndVoiceChannel(interaction, player);
		if (errorResponse) return interaction.reply(errorResponse);

		if (!player.paused) {
			return interaction.reply({
				embeds: [new EmbedBuilder().setColor(interaction.client.config.color.error).setDescription('일시정지 상태가 아니에요')],
				flags: [MessageFlags.Ephemeral],
			});
		}

		player.pause(false);
		await interaction.reply({
			embeds: [new EmbedBuilder().setColor(interaction.client.config.color.normal).setDescription('음악을 다시 재생할게요')],
		});
	},
};
