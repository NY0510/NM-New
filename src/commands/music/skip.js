const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { checkPlayerAndVoiceChannel } = require('../../utils/music');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('음악을 스킵해요')
		.addIntegerOption((option) => option.setName('count').setDescription('스킵할 개수를 입력해주세요').setRequired(false)),
	async execute(interaction) {
		const player = interaction.client.manager.get(interaction.guild.id);
		const count = interaction.options.getInteger('count', false) || 1;

		const errorResponse = checkPlayerAndVoiceChannel(interaction, player);
		if (errorResponse) return interaction.reply(errorResponse);

		if (player.queue.size < count) {
			return interaction.reply({
				embeds: [new EmbedBuilder().setColor(interaction.client.config.color.error).setDescription(`스킵할 음악이 없어요`)],
				flags: [MessageFlags.Ephemeral],
			});
		}

		player.stop(count);
		await interaction.reply({
			embeds: [new EmbedBuilder().setColor(interaction.client.config.color.normal).setDescription(`${count}개의 음악을 스킵했어요`)],
		});
	},
};
