const { Events, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
	name: Events.VoiceStateUpdate,

	async execute(client, oldState, newState) {
		const checkInactivity = async () => {
			setTimeout(() => {
				if (player.paused && stateChange.members.size === 0) {
					player.destroy();
					client.channels.cache.get(String(player.textChannel)).send({ embeds: [new EmbedBuilder().setDescription('👋 음성채널이 10분동안 비어있어서, 음악을 종료하고 퇴장했어요').setColor(client.config.color.normal)] });
				}
			}, 600000); // 10 minutes (600,000 ms)
		};

		// 길드와 현재 재생중인 플레이어를 가져오고
		let guildId = newState.guild.id;
		const player = client.manager.get(guildId);

		// 채널에 연결되어 있는지 체크
		if (!player || player.state !== 'CONNECTED') return;

		// 봇 강퇴당했을때
		if (oldState.channelId && !newState.channelId && newState.id === client.user.id) {
			return player.destroy();
		}

		// 봇이 재시작된 경우
		if (oldState.channelId && !newState.channelId && oldState.id === client.user.id) {
			player.destroy();
			return client.channels.cache.get(String(player.textChannel)).send({ embeds: [new EmbedBuilder().setDescription('🔄 봇이 재시작되어 음성채널에서 나갔어요').setColor(client.config.color.normal)] });
		}

		// 비교대조할 데이터 미리 준비
		const stateChange = {};
		if (oldState.channel === null && newState.channel !== null) stateChange.type = 'JOIN';
		if (oldState.channel !== null && newState.channel === null) stateChange.type = 'LEAVE';
		if (oldState.channel !== null && newState.channel !== null) stateChange.type = 'MOVE';
		if (oldState.channel === null && newState.channel === null) return; // you never know, right
		if (newState.serverMute == true && oldState.serverMute == false) return player.pause(true);
		if (newState.serverMute == false && oldState.serverMute == true) return player.pause(false);
		// 채널 이동 체크
		if (stateChange.type === 'MOVE') {
			if (oldState.channel.id === player.voiceChannel) stateChange.type = 'LEAVE';
			if (newState.channel.id === player.voiceChannel) stateChange.type = 'JOIN';
		}
		if (stateChange.type === 'JOIN') stateChange.channel = newState.channel;
		if (stateChange.type === 'LEAVE') stateChange.channel = oldState.channel;

		if (!stateChange.channel || stateChange.channel.id !== player.voiceChannel) return;

		// 봇을 기준으로 현재 사용자 필터링
		stateChange.members = stateChange.channel.members.filter((member) => !member.user.bot);

		if (newState.mute !== oldState.mute) return;
		if (newState.selfVideo !== oldState.selfVideo) return;
		if (newState.selfMute !== oldState.selfMute) return;
		if (newState.selfStream !== oldState.selfStream) return;

		switch (stateChange.type) {
			case 'JOIN':
				if (stateChange.members.size === 1 && player.paused) {
					client.channels.cache.get(String(player.textChannel)).send({ embeds: [new EmbedBuilder().setDescription('▶️ 일시정지를 해제했어요').setColor(client.config.color.normal)] });

					player.pause(false);
				}
				break;
			case 'LEAVE':
				if (stateChange.members.size === 0 && !player.paused && player.playing) {
					client.channels.cache.get(String(player.textChannel)).send({ embeds: [new EmbedBuilder().setDescription('⏸️ 음성채널이 비어있어서, 음악을 일시정지 했어요').setColor(client.config.color.normal)] });

					player.pause(true);
					checkInactivity();
				}
				break;
		}
	},
};
