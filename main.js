const cheerio = require('cheerio')
const axios = require('axios')
const { createWriteStream, readFile } = require('fs')
const { promisify } = require('util')
const readFileAsync = promisify(readFile)

async function getArticles() {
	const data = []
	const url = 'http://www.covidmaroc.ma/Pages/Communiques.aspx'

	const getId = url => url && url.split('ID=')[1]

	const html = await axios.get(url)
	const $ = cheerio.load(html.data)

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
	const url = 'http://www.covidmaroc.ma'
	
	const html = await axios.get(url)
	const $ = cheerio.load(html.data)
	
	$('tr').each((i, el) => {
		const region = $(el)
						.find('th')
						.text()
						.replace('\\n', '')
						.trim()
		const cases = $(el)
						.find('td')
						.text()
						.replace('\\n', '')
						.trim()
		stats[i] = { region, cases }
	})

	const regions = stats
					.slice(1)
					.map(({ region, cases }) => ({ region, cases: +cases }))
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

function writeData([ stats, articles ]) {
	createWriteStream('data.json')
		.write(
			JSON.stringify(
				{
					stats,
					articles
				},
				null,
				4
			)
		)
}

function updateData([ stats, articles ]) {
	readFileAsync('data.json', 'utf8')
		.then(JSON.parse)
		.then(({ articles: existingArticles }) => {
				const newArticles = articles.filter(newArticle =>
					!existingArticles.find(article => article.id === newArticle.id)
				)
				
				const updated = [
					stats,
					[
						...newArticles,
						...existingArticles
					]
				]

				writeData(updated)

				if (newArticles.length) {
					fillMissingArticles(updated)
				}

				console.log('Updated')
		})
		.catch(err => {
			writeData([ stats, articles ])
			fillMissingArticles([ stats, articles ])
		})
}

function fillMissingArticles([ stats, articles ]) {
	const getArticleContent = async article => {
		try {
			process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0
			const html = await axios.get(article.href)
			const $ = cheerio.load(html.data)
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

	articles.forEach((article, i) => {
		if (!article.content && article.href.includes('://')) {
			getArticleContent(article)
		}
	})
}

Promise.all([
	getStats(),
	getArticles()
]).then(updateData)