const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder().setName("clear").setDescription("대기열에 있는 음악을 모두 삭제해요"),
	async execute(interaction) {
		const player = interaction.client.manager.get(interaction.guild.id);

		if (!player || !player?.queue?.current) {
			return interaction.reply({
				embeds: [new EmbedBuilder().setColor(interaction.client.config.color.error).setDescription("재생중인 음악이 없어요")],
				ephemeral: true,
			});
		}

		if (!interaction.member.voice.channel) {
			return interaction.reply({
				embeds: [new EmbedBuilder().setColor(interaction.client.config.color.error).setDescription("먼저 음성 채널에 접속한 다음에 사용해주세요")],
				ephemeral: true,
			});
		}

		if (interaction.member.voice.channel?.id !== player.voiceChannel) {
			return interaction.reply({
				embeds: [new EmbedBuilder().setColor(interaction.client.config.color.error).setDescription(`저와 같은 음성채널에 접속해 있지 않은 것 같아요`)],
				ephemeral: true,
			});
		}

		player.queue.clear();
		await interaction.reply({
			embeds: [new EmbedBuilder().setColor(interaction.client.config.color.normal).setDescription(`대기열에 있는 모든 음악을 삭제했어요`)],
		});
	},
};
