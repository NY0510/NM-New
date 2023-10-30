const { Events, ActivityType } = require("discord.js");

const setPresence = (client) => {
	const { players } = client.manager;
	const { activity, status } = client.config.presence;
	const playerCount = players.size;
	client.user.setPresence({
		activities: [{ name: activity.name.replace("{playerCount}", playerCount), type: ActivityType[activity.type] }],
		status,
	});
};

module.exports = {
	name: Events.ClientReady,
	once: true,

	execute(client) {
		client.manager.init(client.user.id);
		setPresence(client);
		const userCount = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
		const guildCount = client.guilds.cache.size;
		const guildList = client.guilds.cache.map((guild) => guild.name);

		setInterval(() => setPresence(client), 1000 * 10);

		const { tag } = client.user;
		const viewServerListAtStart = client.config.viewServerListAtStart;
		log.info(`${tag} 로그인 완료!`);
		log.info(`${userCount} 명의 유저와 ${guildCount} 개의 서버에서 활동중`);
		if (viewServerListAtStart) console.log(`서버 리스트:\n- ${guildList.join("\n- ")}`);
	},
};
