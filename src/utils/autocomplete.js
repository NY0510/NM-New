module.exports = {
	getAutocompleteSearch: async (query) => {
		const response = await fetch(`https://clients1.google.com/complete/search?client=youtube&hl=kr&q=${query}`);
		const inputString = await response.text();
		const match = inputString.match(/\[.*\]/);
		let data = [];

		if (match) {
			try {
				const jsonData = JSON.parse(match[0]);
				if (Array.isArray(jsonData) && jsonData.length >= 2) {
					data = jsonData[1].slice(0, 7).map((item) => item[0]);
				} else {
					return new Error("올바른 JSON 형식을 찾을 수 없습니다.");
				}
			} catch (error) {
				return new Error("JSON 데이터를 파싱하는 중 오류가 발생했습니다.");
			}
		} else {
			return new Error("JSON 데이터를 찾을 수 없습니다.");
		}

		return data;
	},
};
