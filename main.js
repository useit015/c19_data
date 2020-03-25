const { promisify } = require('util')
const { readFile } = require('fs')
const readFileAsync = promisify(readFile)

const { writeData } = require('./write')
const { getAllNews } = require('./map')
const { getStats, getArticles, fillMissingArticles } = require('./ministryOfHealth')

function parseOptions () {
	return process.argv.reduce((acc, arg) => {
		switch (arg) {
			case '-d':
			case '--display':
				acc.display = true
				break
		}
		return acc
	}, {})
}

function updateData ([ stats, articles, mapArticles ], display) {
	if (display) {
		console.log(
			JSON.stringify(stats, null, 4)
		)
	}

	readFileAsync('data.json', 'utf8')
		.then(JSON.parse)
		.then(({ articles: existingArticles }) => {
			const newArticles = articles.filter(newArticle =>
				!existingArticles.find(article =>
					article.id === newArticle.id
				)
			)

			const updated = [
				stats,
				{
					map: mapArticles,
					sante: [
						...newArticles,
						...existingArticles
					]
				}
			]

			writeData(updated)

			if (newArticles.length) {
				fillMissingArticles(updated)
			}
		})
		.catch(() => {
			const data = [
				stats,
				{
					sante: articles,
					map: mapArticles
				}
			]
			writeData(data)
			fillMissingArticles(data)
		})
}


function main () {

	const { display } = parseOptions()

	Promise.all(
		[
			getStats(),
			getArticles(),
			getAllNews()
		]
	).then(res =>
		updateData(res, display)
	)
}

main()
