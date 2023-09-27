const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, hyperlink } = require("discord.js");
const { msToTime, textLengthOverCut } = require("../../utils/format");

module.exports = {
	data: new SlashCommandBuilder().setName("queue").setDescription("대기열을 확인해요"),
	async execute(interaction) {
		const player = interaction.client.manager.get(interaction.guild.id);

		if (!player) {
			return interaction.reply({
				embeds: [new EmbedBuilder().setColor(interaction.client.config.color.error).setDescription("현재 재생중인 음악이 없어요")],
				ephemeral: true,
			});
		}

		await interaction.deferReply();

		const queueList = player.queue.map((song, index) => ({
			title: `${index + 1}. ${song.title}`,
			duration: song.isStream ? "LIVE" : msToTime(song.duration),
		}));

		const itemsPerPage = 10;
		let currentPage = 0;
		const maxPage = Math.ceil(queueList.length / itemsPerPage);

		const getQueueListForPage = (page) => {
			const startIdx = page * itemsPerPage;
			const endIdx = startIdx + itemsPerPage;
			return queueList.slice(startIdx, endIdx);
		};

		const getQueueEmbed = (queueListForPage) => {
			return new EmbedBuilder()
				.setColor(interaction.client.config.color.normal)
				.setTitle("📋 현재 대기열")
				.setDescription(`💿 **${hyperlink(textLengthOverCut(player.queue.current.title, 50), player.queue.current.uri)}**`)
				.setFooter({ text: `( ${currentPage + 1} / ${maxPage} 페이지)` })
				.addFields(
					queueListForPage.map((song) => ({
						name: song.title,
						value: song.duration,
					}))
				);
		};

		const paginationRow = new ActionRowBuilder().addComponents(
			new ButtonBuilder().setCustomId("previous").setLabel("이전").setStyle(ButtonStyle.Secondary).setEmoji("⏮️"),
			new ButtonBuilder().setCustomId("next").setLabel("다음").setStyle(ButtonStyle.Secondary).setEmoji("⏭️")
		);

		const paginationBtnDisable = (row) => {
			row.components[0].setDisabled(currentPage === 0);
			row.components[1].setDisabled(currentPage === maxPage - 1);
		};

		const replyMessage = await interaction.editReply({
			embeds: [getQueueEmbed(getQueueListForPage(currentPage))],
			components: [paginationRow],
		});

		const collector = replyMessage.createMessageComponentCollector({
			filter: (i) => i.customId === "previous" || i.customId === "next",
			time: 120 * 1000,
		});

		collector.on("collect", async (i) => {
			if (i.customId === "previous") {
				currentPage = Math.max(currentPage - 1, 0);
			} else if (i.customId === "next") {
				currentPage = Math.min(currentPage + 1, maxPage - 1);
			}

			paginationBtnDisable(paginationRow);

			await i.update({
				embeds: [getQueueEmbed(getQueueListForPage(currentPage))],
				components: [paginationRow],
			});
		});

		collector.on("end", async () => {
			paginationRow.components.forEach((c) => c.setDisabled(true));
			await replyMessage.edit({ embeds: [getQueueEmbed(getQueueListForPage(currentPage)).setFooter({ text: "🔔 /queue 명령어를 다시 사용해 주세요" })], components: [paginationRow] });
		});
	},
};
