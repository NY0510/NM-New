const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("volume")
		.setDescription("볼륨을 설정해요")
		.addIntegerOption((option) => option.setName("볼륨").setDescription("설정할 볼륨").setMinValue(0).setMaxValue(100)),
	async execute(interaction) {
		const player = interaction.client.manager.get(interaction.guild.id);
		const volume = interaction.options.getInteger("볼륨", false);

		if (!player) {
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

		if (!volume) {
			return interaction.reply({
				embeds: [new EmbedBuilder().setColor(interaction.client.config.color.normal).setDescription(`현재 볼륨은 **\`${player.volume}%\`** 에요`)],
			});
		}

		player.setVolume(volume);
		await interaction.reply({
			embeds: [new EmbedBuilder().setColor(interaction.client.config.color.normal).setDescription(`볼륨을 **\`${volume}%\`** (으)로 설정했어요`)],
		});
	},
};
