const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("loop")
		.setDescription("음악을 반복 재생해요")
		.addSubcommand((subcommand) => subcommand.setName("disable").setDescription("음악 반복 재생을 해제해요"))
		.addSubcommand((subcommand) => subcommand.setName("track").setDescription("한 곡 반복 재생해요"))
		.addSubcommand((subcommand) => subcommand.setName("queue").setDescription("대기열을 반복 재생해요")),
	async execute(interaction) {
		const player = interaction.client.manager.get(interaction.guild.id);
		const mode = interaction.options.getSubcommand();

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

		if (mode === "disable" && !player.queueRepeat && !player.trackRepeat) {
			return interaction.reply({
				embeds: [new EmbedBuilder().setColor(interaction.client.config.color.error).setDescription("음악 반복 재생이 이미 해제되어 있어요")],
				ephemeral: true,
			});
		} else if (mode === "track" && player.trackRepeat) {
			return interaction.reply({
				embeds: [new EmbedBuilder().setColor(interaction.client.config.color.error).setDescription("한 곡 반복 재생이 이미 설정되어 있어요")],
				ephemeral: true,
			});
		} else if (mode === "queue" && player.queueRepeat) {
			return interaction.reply({
				embeds: [new EmbedBuilder().setColor(interaction.client.config.color.error).setDescription("대기열 반복 재생이 이미 설정되어 있어요")],
				ephemeral: true,
			});
		}

		switch (mode) {
			case "disable":
				player.setQueueRepeat(false);
				player.setTrackRepeat(false);
				break;
			case "track":
				player.setQueueRepeat(false);
				player.setTrackRepeat(true);
				break;
			case "queue":
				player.setQueueRepeat(true);
				player.setTrackRepeat(false);
				break;
		}

		await interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setColor(interaction.client.config.color.normal)
					.setDescription(`음악을 ${mode === "disable" ? "반복 재생하지 않아요" : mode === "track" ? "한 곡 반복 재생해요" : "대기열을 반복 재생해요"}`),
			],
		});
	},
};
