const { promisify } = require('util')
const { readFile } = require('fs')
const readFileAsync = promisify(readFile)

const { writeData } = require('./write')
const { getDefenseData } = require('./ministryOfDefense')
const { getStats, getArticles, fillMissingArticles } = require('./ ministryOfHealth')

const { display } = parseOptions()

function parseOptions() {
	return process.argv.reduce((acc, arg) => {
		switch (arg) {
			case '-d':
			case '--display':
				acc.display = true
				break;
		}
		return acc
	}, {})
}

function updateData([ stats, articles, defenseArticles ]) {
	if (display) {
		console.table({
			...stats.regions,
			total: stats.total
		})
	}

	readFileAsync('data.json', 'utf8')
		.then(JSON.parse)
		.then(({ articles: existingArticles }) => {
				existingArticles = existingArticles.filter(article => !article.id.includes('defense'))

				const newArticles = articles.filter(newArticle =>
					!existingArticles.find(article => article.id === newArticle.id)
				)
				
				const updated = [
					stats,
					[
						...defenseArticles,
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
			const data = [
				stats,
				[
					...defenseArticles,
					...articles
				]
			]

			writeData(data)
			fillMissingArticles(data)
		})
}

Promise.all(
	[
		getStats(),
		getArticles(),
		getDefenseData()
	]
).then(updateData)
