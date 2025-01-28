const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { checkPlayerAndVoiceChannel } = require('../../utils/music');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('volume')
		.setDescription('볼륨을 설정해요')
		.addIntegerOption((option) => option.setName('볼륨').setDescription('설정할 볼륨').setMinValue(0).setMaxValue(100)),

	async execute(interaction) {
		const player = interaction.client.manager.get(interaction.guild.id);
		const volume = interaction.options.getInteger('볼륨', false);

		const errorResponse = checkPlayerAndVoiceChannel(interaction, player);
		if (errorResponse) return interaction.reply(errorResponse);

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
