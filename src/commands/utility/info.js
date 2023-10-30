const { SlashCommandBuilder, EmbedBuilder, userMention, time } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder().setName("info").setDescription("봇 정보를 확인해요"),

	async execute(interaction) {
		const stats = Array.from(interaction.client.manager.nodes.values())[0].stats;
		const statsData = {
			cpu: stats.cpu ? `${Math.round(stats.cpu.systemLoad * 100)}%` : "N/A",
			ram: stats.memory ? `${Math.round((stats.memory.used / 1024 / 1024) * 100) / 100}MB` : "N/A",
			uptime: stats.uptime ? new Date(new Date().getTime() - stats.uptime) : "N/A",
		};

		const embedFields = [
			{
				name: "개발자",
				value: `👨‍💻 ${userMention("690148325604720660")} (@ny64)`,
				inline: true,
			},
			{
				name: "버전",
				value: `📦 ${interaction.client.config.version}`,
				inline: true,
			},
			{
				name: "라이브러리",
				value: `📚 [Discord.js](https://discord.js.org), [Lavalink](https://github.com/lavalink-devs/Lavalink)`,
				inline: true,
			},
			{
				name: "서버 수",
				value: `📊 ${interaction.client.guilds.cache.size}개`,
				inline: true,
			},
			{
				name: "사용자 수",
				value: `👥 ${interaction.client.guilds.cache.reduce((acc, cur) => acc + cur.memberCount, 0)}명`,
				inline: true,
			},
			{
				name: "현재 재생중인 서버 수",
				value: `🎵 ${interaction.client.manager.players.size}개`,
				inline: true,
			},
			{
				name: "음악 서버 상태",
				value: `🎛 CPU ${statsData.cpu} | 🛢️ RAM ${statsData.ram} | 🕒 업타임 ${time(statsData.uptime, "R")}`,
			},
		];

		return interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setColor(interaction.client.config.color.normal)
					.setTitle(`${interaction.client.user.username}`)
					.setThumbnail(interaction.client.user.displayAvatarURL())
					.addFields(embedFields),
			],
		});
	},
};
