const { promisify } = require('util')
const { readFile } = require('fs')
const readFileAsync = promisify(readFile)

const { writeData } = require('./write')
const { getDefenseData } = require('./ministryOfDefense')
const { getStats, getArticles, fillMissingArticles } = require('./ ministryOfHealth')

function updateData([ stats, articles, defenseArticles ]) {
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
