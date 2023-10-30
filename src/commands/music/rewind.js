const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { msToTime } = require("../../utils/format");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("rewind")
		.setDescription("음악의 재생시간을 이동해요")
		.addStringOption((option) => option.setName("position").setDescription("이동할 재생시간을 입력해주세요 ±(HH:MM:SS)").setRequired(true)),
	async execute(interaction) {
		const player = interaction.client.manager.get(interaction.guild.id);
		const position = interaction.options.getString("position");

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

		const time = position.split(":");
		if (time.length > 3) {
			return interaction.reply({
				embeds: [new EmbedBuilder().setColor(interaction.client.config.color.error).setDescription("올바른 시간 형식이 아니에요")],
				ephemeral: true,
			});
		}

		let seconds = 0;
		if (time.length === 3) {
			seconds += parseInt(time[0]) * 3600;
			seconds += parseInt(time[1]) * 60;
			seconds += parseInt(time[2]);
		} else if (time.length === 2) {
			seconds += parseInt(time[0]) * 60;
			seconds += parseInt(time[1]);
		} else {
			seconds += parseInt(time[0]);
		}

		if (seconds > player.queue.current.duration / 1000) {
			return interaction.reply({
				embeds: [
					new EmbedBuilder().setColor(interaction.client.config.color.error).setDescription(`음악의 재생시간인 \`${msToTime(player.queue.current.duration)}\`보다 큰 시간을 입력했어요`),
				],
				ephemeral: true,
			});
		}

		if (player.position + seconds * 1000 < 0) {
			player.seek(0);
		} else {
			player.seek(player.position + seconds * 1000);
		}

		await interaction.reply({
			embeds: [new EmbedBuilder().setColor(interaction.client.config.color.normal).setDescription(`음악의 재생시간을 **\`${seconds}초\`** 만큼 이동했어요`)],
		});
	},
};
