const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { textLengthOverCut } = require("../../utils/format");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("remove")
		.setDescription("대기열에서 음악을 삭제해요")
		.addIntegerOption((option) => option.setName("count").setDescription("삭제할 개수를 입력해주세요").setRequired(false)),
	async execute(interaction) {
		const player = interaction.client.manager.get(interaction.guild.id);
		const count = interaction.options.getInteger("count", false) || 1;

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

		if (player.queue.size < count) {
			return interaction.reply({
				embeds: [new EmbedBuilder().setColor(interaction.client.config.color.error).setDescription(`대기열에 있는 음악이 ${count}개보다 적어요`)],
				ephemeral: true,
			});
		}

		player.queue.remove(0, count);
		const removed = player.queue.splice(0, count);

		await interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setColor(interaction.client.config.color.normal)
					.setDescription(`대기열에서 ${count}개의 음악을 삭제했어요\n\n\`\`\`diff\n${removed.map((track) => `- ${textLengthOverCut(track.title, 50)}`).join("\n")}\`\`\``),
			],
		});
	},
};
