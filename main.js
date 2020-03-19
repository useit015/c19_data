const cheerio = require('cheerio')
const axios = require('axios')
// const request = require('request')

async function getArticles() {
	const data = []
	const base = '://www.sante.gov.ma'
	const url = 'http://www.covidmaroc.ma/Pages/Communiques.aspx'

	const formatUrl = url =>
		'http' + base + url
			.replace('http' + base, '')
			.replace('https' + base, '')

	const html = await axios.get(url)
	const $ = cheerio.load(html.data)

	$('td').each((i, el) => {
		const link = $(el).find('a')
		data[i] = {
			text: link.text(),
			href: formatUrl(link.attr('href'))
		}
	})

	return data
}

async function init () {
	display(await getArticles())
	// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0
	// const url = 'http://www.sante.gov.ma/Pages/communiqu%C3%A9s.aspx?communiqueID=361'
	// request(url, (err, res, html) => {
	// 	const articles = []
	// 	// const html = await axios.get(url)
	// 	// const $ = cheerio.load(html)
	// 	console.log({html, err})
	// })
}

function display(arr) {
	const data = arr
		.map(item => JSON.stringify(item, null, 4))
		.join('\n\n---------------\n\n')
	console.log(data)
}

init()