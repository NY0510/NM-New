const { SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuOptionBuilder } = require("discord.js");
const { msToTime, textLengthOverCut, hyperlink } = require("../../utils/format");

module.exports = {
	data: new SlashCommandBuilder().setName("now").setDescription("현재 재생중인 음악을 보여줘요"),
	async execute(interaction) {
		const player = interaction.client.manager.get(interaction.guild.id);

		if (!player || !player?.queue?.current) {
			return interaction.reply({
				embeds: [new EmbedBuilder().setColor(interaction.client.config.color.error).setDescription("현재 재생중인 음악이 없어요")],
				ephemeral: true,
			});
		}

		const track = player.queue.current;
		await interaction.deferReply();

		const repeatState = player.queueRepeat ? "대기열 반복 중" : player.trackRepeat ? "곡 반복 중" : "반복 중이 아님";
		interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setTitle("🎶 현재 재생중")
					.setThumbnail(track.artworkUrl)
					.setDescription(`**${hyperlink(textLengthOverCut(track.title, 50), track.uri)}**`)
					.setColor(interaction.client.config.color.normal)
					.addFields(
						{
							name: "곡 길이",
							value: `┕** \`${track.isStream ? "LIVE" : msToTime(track.duration)}\`**`,
							inline: true,
						},
						{
							name: "남은 대기열",
							value: `┕** \`${player.queue.length}곡\`**`,
							inline: true,
						},
						{
							name: "볼륨",
							value: `┕** \`${player.volume}%\`**`,
							inline: true,
						},
						{
							name: "반복",
							value: `┕** \`${repeatState}\`**`,
							inline: true,
						},
						{
							name: "요청자",
							value: `┕** ${track.requester}**`,
							inline: true,
						},
						{
							name: "채널명",
							value: `┕** \`${track.author}\`**`,
							inline: true,
						}
					),
			],
		});
	},
};
