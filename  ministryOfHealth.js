const { load } = require('./scrapper')
const { writeData } = require('./write')

async function getArticles() {
	const data = []

	const getId = url => url && url.split('ID=')[1]

	const { $ } = await load('http://www.covidmaroc.ma/Pages/Communiques.aspx')

	$('td').each((i, el) => {
		const link = $(el).find('a')
		const title = link.text().trim()
		const href = link.attr('href')
		const id = getId(href)
		data[i] = {
			id,
			href,
			title
		}
	})

	return data
}

async function getStats() {
	const stats = []

	const { $, getFormatedText } = await load('http://www.covidmaroc.ma')

	$('tr').each((i, el) => {
		stats[i] = {
			region: getFormatedText(el, 'th'),
			cases: getFormatedText(el, 'td')
		}
	})

	const regions = stats
					.slice(1)
					.map(({ region, cases }) => ({ region, cases: parseInt(cases) }))
					.filter(stat => stat.region.length)
					.sort((a, b) => b.cases - a.cases)
					.reduce((acc, cur) => {
						acc[cur.region] = cur.cases
						return acc
					}, {})

	const total = Object.values(regions)
					.reduce((acc, cur) => acc + cur)

	return {
		total,
		regions
	}
}

function fillMissingArticles([ stats, articles ]) {
	const getArticleContent = async article => {
		try {
			process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0

			const { $ } = await load(article.href)

			// ! GET A BETTER SOLUTION
			article.content = $('.ExternalClass33F20E2A6C3A413F9310FC20D57CAAF3')
									.text()
									.replace(/\n\s*\n/g, '\n') ||
							$('.ExternalClass83744659CBFE49939F583D44C36F0691')
									.text()
									.replace(/\n\s*\n/g, '\n')

			writeData([ stats, articles ])
		} catch (error) {
			console.log('THERE WAS AN ERROR WITH => ', error.message)
		}
	}

	const missingArticle = article =>
		!article.hasOwnPropery('content') && article.href.includes('://')

	articles.forEach(article => {
		if (missingArticle(article)) {
			getArticleContent(article)
		}
	})
}

module.exports = {
	getStats,
	getArticles,
	fillMissingArticles,
}