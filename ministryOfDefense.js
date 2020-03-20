const { load } = require('./scrapper')

async function getDefenseData() {
	const articles = []
	const url = 'http://covid19.interieur.gov.ma/actualites.aspx'

	const { $, getFormatedText } = await load(url)

	$('.mb-5.content').find('.m-3').each((i, el) => {
		articles[i] = {
			href: url,
			id: 'defense' + i,
			title: getFormatedText(el, 'h5'),
			content: getFormatedText(el, '.card-text.text-justify')
		}
	})

	return articles
}

module.exports = {
	getDefenseData
}