const axios = require('axios')
const cheerio = require('cheerio')

async function load(url) {
	const html = await axios.get(url)
	const $ = cheerio.load(html.data)
	
	const getFormatedText = (parent, child) =>
		$(parent)
			.find(child)
			.text()
			.replace(/\s+/g, ' ')
			.replace('\\n', '')
			.trim()
	
	return {
		$,
		getFormatedText
	}
}

module.exports = {
	load
}