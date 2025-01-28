const { EmbedBuilder, MessageFlags } = require('discord.js');

const checkPlayerAndVoiceChannel = (interaction, player) => {
	if (!player || !player?.queue?.current) {
		return {
			embeds: [new EmbedBuilder().setColor(interaction.client.config.color.error).setDescription('재생중인 음악이 없어요')],
			flags: [MessageFlags.Ephemeral],
		};
	}

	if (!interaction.member.voice.channel) {
		return {
			embeds: [new EmbedBuilder().setColor(interaction.client.config.color.error).setDescription('먼저 음성 채널에 접속한 다음에 사용해주세요')],
			flags: [MessageFlags.Ephemeral],
		};
	}

	if (interaction.member.voice.channel?.id !== player.voiceChannel) {
		return {
			embeds: [new EmbedBuilder().setColor(interaction.client.config.color.error).setDescription(`저와 같은 음성채널에 접속해 있지 않은 것 같아요`)],
			flags: [MessageFlags.Ephemeral],
		};
	}

	return null;
};

module.exports = { checkPlayerAndVoiceChannel };
