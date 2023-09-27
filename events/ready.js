const { Events } = require("discord.js");

module.exports = {
	name: Events.ClientReady,
	once: true,

	execute(client) {
		client.manager.init(client.user.id);
		const userCount = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
		const guildCount = client.guilds.cache.size;
		const guildList = client.guilds.cache.map((guild) => guild.name);

		log.info(`${client.user.tag} 로그인 완료!`);
		log.info(`${userCount} 명의 유저와 ${guildCount} 개의 서버에서 활동중`);
		if (client.config.viewServerListAtStart) log.info(`서버 리스트:\n- ${guildList.join("\n- ")}`);
	},
};
