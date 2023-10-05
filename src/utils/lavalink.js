const { Manager } = require("magmastream");

module.exports = async (client) => {
	const nodes = [
		{
			host: client.config.lavalink.host,
			identifier: "Node 1",
			password: client.config.lavalink.passwd,
			port: client.config.lavalink.port,
			retryAmount: 1000,
			retrydelay: 10000,
			resumeStatus: false,
			resumeTimeout: 1000,
			secure: false, // default: false
		},
	];

	client.manager = new Manager({
		nodes,
		defaultSearchPlatform: "youtube",
		send: (id, payload) => {
			const guild = client.guilds.cache.get(id);
			if (guild) guild.shard.send(payload);
		},
	});

	client.manager.on("nodeConnect", (node) => {
		log.info(`Lavalink 노드 "${node.options.identifier}" 연결 완료`);
	});

	client.manager.on("nodeDisconnect", (node, reason) => {
		log.warn(`Lavalink 노드 "${node.options.identifier}" 연결이 끊어졌습니다\nReason: ${JSON.stringify(reason)}`);
	});

	client.manager.on("nodeReconnect", (node) => {
		log.info(`Lavalink 노드 "${node.options.identifier}" 재연결 완료`);
	});

	client.manager.on("nodeError", (node, error) => {
		log.error(`Lavalink 노드  "${node.options.identifier}" 에 연결하는 중 오류가 발생했습니다\nError: ${error.message}`);
	});
};
