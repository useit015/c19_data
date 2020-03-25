const { load } = require('./scrapper')
const { writeData } = require('./write')
const parse = require('date-fns/parse')

async function getArticles () {
	const data = []

	const getId = url => url && url.split('ID=')[ 1 ]

	const { $ } = await load('http://www.covidmaroc.ma/Pages/Communiques.aspx')

	$('td').each((i, el) => {
		const link = $(el).find('a')
		const title = link.text().trim()
		const href = link.attr('href')
		const id = getId(href)
		data[ i ] = {
			id,
			href,
			title
		}
	})

	return data
}

function getTotals (table) {
	const bottomSection = table
		.find('tr')
		.last()

	const bottomLeftSection = bottomSection
		.find('p')
		.first()


	const infected = bottomSection
		.find('td:nth-child(2)')
		.text()
		.trim()

	const tested = bottomSection
		.find('td:nth-child(3)')
		.text()
		.trim()

	const recovred = bottomLeftSection
		.find('font')
		.first()
		.text()
		.trim()

	const deaths = bottomLeftSection
		.find('font')
		.last()
		.text()
		.trim()

	return {
		infected,
		tested,
		recovred,
		deaths
	}
}

function getLastUpdated (table) {
	const [ time ] = table
		.find('tr')
		.first()
		.text()
		.split(/\s+/)
		.filter(x => x.length > 7)

	return parse(time, 'dd-MM-yyyy', new Date())
		.toString()
		.slice(0, 15)
}

function getRegions (table, getFormatedText) {
	const stats = []

	table
		.find('tr')
		.each((i, el) => {
			stats[ i ] = {
				region: getFormatedText(el, 'th'),
				cases: getFormatedText(el, 'td')
			}
		})

	return stats
		.slice(1)
		.filter(stat => stat.region.length)
		.sort((a, b) => parseInt(b.cases) - parseInt(a.cases))
		.reduce((acc, cur) => {
			acc[ cur.region ] = cur.cases
			return acc
		}, {})
}

async function getStats () {

	const { $, getFormatedText } = await load('http://www.covidmaroc.ma')

	const tables = $('table')

	const lastUpdated = getLastUpdated(tables.first())

	const total = getTotals(tables.first())

	const regions = getRegions(tables.last(), getFormatedText)

	return {
		lastUpdated,
		total,
		regions
	}
}

function fillMissingArticles ([ stats, articles ]) {
	const getArticleContent = async article => {
		try {
			process.env[ 'NODE_TLS_REJECT_UNAUTHORIZED' ] = 0

			const { $ } = await load(article.href)

			const getText = identifier =>
				$(identifier)
					.text()
					.replace(/\n\s*\n/g, '\n')

			// ! GET A BETTER SOLUTION
			article.content = getText('.ExternalClass33F20E2A6C3A413F9310FC20D57CAAF3')
				|| getText('.ExternalClass83744659CBFE49939F583D44C36F0691')

			writeData([ stats, articles ])
		} catch (error) {
			console.log('THERE WAS AN ERROR WITH => ', error.message)
		}
	}

	const missingArticle = article =>
		!article.content && article.href.includes('://')

	articles.sante.forEach(article => {
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
