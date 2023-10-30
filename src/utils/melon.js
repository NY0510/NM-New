const cheerio = require("cheerio");
const request = require("request-promise");

const url = "http://www.melon.com/chart/";

module.exports = {
	getChart: async (rank = 10) => {
		try {
			const html = await request(url);
			const $ = cheerio.load(html);

			const titles = [];
			const artists = [];

			for (let i = 0; i < rank; i++) titles.push($(".ellipsis.rank01").eq(i).text().replaceAll("\t", "").replaceAll("\n", "")); // 곡명 파싱
			for (let i = 0; i < rank; i++) artists.push($(".ellipsis.rank02 span").eq(i).text().replaceAll("\t", "").replaceAll("\n", "")); // 아티스트명 파싱

			const upDate = $(".year").text(); // 업데이트 날짜
			const upTime = $(".hhmm > span").text(); // 업데이트 시간

			const upTimeArr = upTime.split(":");
			const newTime = `${upTimeArr[0]}:${upTimeArr[1]}`;

			const result = {
				date: upDate,
				time: newTime,
				songs: titles.map((title, i) => ({
					rank: i + 1,
					title,
					artist: artists[i],
				})),
			};

			return result;
		} catch (error) {
			throw new Error(error);
		}
	},
};
