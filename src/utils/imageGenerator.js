const { dynamicCard } = require('songcard');
const path = require('path');

async function generateCardImage(track) {
	const thumbnailURL = track.thumbnail?.includes('ytimg.com') ? track.thumbnail.replace('default', 'hqdefault') : track.thumbnail || 'https://f.ny64.kr/photos/nmdefault.png';
	return await dynamicCard({
		thumbnailURL,
		songTitle: track.title,
		songArtist: track.author,
		trackRequester: track.requester.username,
		fontPath: path.join(__dirname, '..', 'assets', 'fonts', 'PretendardJP-Medium.ttf'),
	});
}

module.exports = { generateCardImage };
