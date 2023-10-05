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
		const embed = new EmbedBuilder()
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
			);

		let components = [];

		if (player.queue.length > 0) {
			const queueList = player.queue.slice(0, 10).map((song, index) => ({
				title: `${index + 1}. ${song.title}`,
				duration: song.isStream ? "LIVE" : msToTime(song.duration),
				requester: song.requester,
			}));

			const selectRow = new StringSelectMenuBuilder()
				.setCustomId("queue")
				.setPlaceholder("대기열 보기")
				.addOptions(
					queueList.map((song, index) => {
						return new StringSelectMenuOptionBuilder().setLabel(song.title).setValue(`${index}`).setDescription(`${song.duration} (${song.requester.tag})`);
					})
				);

			const row = new ActionRowBuilder().addComponents(selectRow);
			components.push(row);

			embed.setFooter({ text: "▼ 아래 리스트에서 음악을 선택해 해당 음악으로 건너뛸 수 있어요" }); // 대기열이 있을 때만 추가
		}

		const replyMessage = await interaction.editReply({
			embeds: [embed],
			components: components, // 대기열이 있을 때만 추가
		});

		const collector = replyMessage.createMessageComponentCollector({
			filter: (i) => i.customId === "queue",
			time: 120 * 1000,
		});

		collector.on("collect", async (i) => {
			// 선택한 음악의 인덱스를 얻어옵니다.
			const selectedIndex = parseInt(i.values[0]);

			if (!isNaN(selectedIndex) && selectedIndex >= 0 && selectedIndex < player.queue.length) {
				// skip to selected index from search title
				player.queue.splice(0, selectedIndex);
				player.stop();

				const track = player.queue[0];

				const components = [];
				const queueList = player.queue.slice(1, 10).map((song, index) => ({
					title: `${index + 1}. ${song.title}`,
					duration: song.isStream ? "LIVE" : msToTime(song.duration),
					requester: song.requester,
				}));

				const selectRow = new StringSelectMenuBuilder()
					.setCustomId("queue")
					.setPlaceholder("대기열 보기")
					.addOptions(
						queueList.map((song, index) => {
							return new StringSelectMenuOptionBuilder().setLabel(song.title).setValue(`${index}`).setDescription(`${song.duration} (${song.requester.tag})`);
						})
					);

				const row = new ActionRowBuilder().addComponents(selectRow);
				components.push(row);

				const repeatState = player.queueRepeat ? "대기열 반복 중" : player.trackRepeat ? "곡 반복 중" : "반복 중이 아님";
				// 선택한 음악의 정보를 담은 Embed를 생성합니다.
				const embed = new EmbedBuilder()
					.setThumbnail(track.artworkUrl)
					.setTitle("🎶 현재 재생중")
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
					);

				// 선택한 음악의 정보를 담은 Embed를 수정합니다.
				await i.update({
					embeds: [embed],
					components: components, // 대기열이 있을 때만 추가
				});
			}

			collector.on("end", async () => {
				// await replyMessage.edit({
				// 	components: [],
				// });
			});
		});
	},
};
