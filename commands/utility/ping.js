const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder().setName("ping").setDescription("퐁!"),

	async execute(interaction) {
		const startTime = Date.now();
		await interaction.deferReply();

		const botLatency = Date.now() - startTime;
		const apiLatency = interaction.client.ws.ping;
		const description = `⏱️ **봇 지연시간:** ${botLatency}ms\n⌛ **API 지연시간:** ${apiLatency}ms`;

		await interaction.editReply({
			content: "🏓 당신은 퐁입니다!",
			embeds: [new EmbedBuilder().setDescription(description).setColor(interaction.client.config.color.normal)],
		});
	},
};
