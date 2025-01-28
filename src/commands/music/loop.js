const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { checkPlayerAndVoiceChannel } = require('../../utils/music');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('loop')
		.setDescription('음악을 반복 재생해요')
		.addSubcommand((subcommand) => subcommand.setName('disable').setDescription('음악 반복 재생을 해제해요'))
		.addSubcommand((subcommand) => subcommand.setName('track').setDescription('한 곡 반복 재생해요'))
		.addSubcommand((subcommand) => subcommand.setName('queue').setDescription('대기열을 반복 재생해요')),
	async execute(interaction) {
		const player = interaction.client.manager.get(interaction.guild.id);
		const mode = interaction.options.getSubcommand();

		const errorResponse = checkPlayerAndVoiceChannel(interaction, player);
		if (errorResponse) return interaction.reply(errorResponse);

		if (mode === 'disable' && !player.queueRepeat && !player.trackRepeat) {
			return interaction.reply({
				embeds: [new EmbedBuilder().setColor(interaction.client.config.color.error).setDescription('음악 반복 재생이 이미 해제되어 있어요')],
				flags: [MessageFlags.Ephemeral],
			});
		} else if (mode === 'track' && player.trackRepeat) {
			return interaction.reply({
				embeds: [new EmbedBuilder().setColor(interaction.client.config.color.error).setDescription('한 곡 반복 재생이 이미 설정되어 있어요')],
				flags: [MessageFlags.Ephemeral],
			});
		} else if (mode === 'queue' && player.queueRepeat) {
			return interaction.reply({
				embeds: [new EmbedBuilder().setColor(interaction.client.config.color.error).setDescription('대기열 반복 재생이 이미 설정되어 있어요')],
				flags: [MessageFlags.Ephemeral],
			});
		}

		switch (mode) {
			case 'disable':
				player.setQueueRepeat(false);
				player.setTrackRepeat(false);
				break;
			case 'track':
				player.setQueueRepeat(false);
				player.setTrackRepeat(true);
				break;
			case 'queue':
				player.setQueueRepeat(true);
				player.setTrackRepeat(false);
				break;
		}

		await interaction.reply({
			embeds: [new EmbedBuilder().setColor(interaction.client.config.color.normal).setDescription(`음악을 ${mode === 'disable' ? '반복 재생하지 않아요' : mode === 'track' ? '한 곡 반복 재생해요' : '대기열을 반복 재생해요'}`)],
		});
	},
};
