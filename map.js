const { load } = require('./scrapper')



async function getMapNews(url) {
	let news = [];

	const { $ } = await load(url)

	$('.col-md-8 h5').each(async (i, element) => {

		const h5 = $(element).find('a')
		const title = h5.text().trim()
		const link = h5.attr('href')
		const article =  "";
		const time = ""

		news[i] = {
			title,
			link,
			article,
			time
		}

	})
	news = await addArticles(news)
	// console.log(news)
	return news
}

// addArticles and getNewsSubject are only used by getMapNews
async function addArticles(news) {
	for (let i = 0; i < news.length; i++) {
		const data = await getNewsSubject(news[i].link)
		news[i].article = data['article']
		news[i].time = data['time']
	}
	return news
}

async function getNewsSubject(link){
	let article = {}
	article['article'] = ""
	const url = "http://mapanticorona.map.ma"
	const { $ } = await load(url.concat(link))
	$('.clearfix').find('p').each((i, element) => {
		const p = $(element).text().trim()

		article['article'] = article['article'].concat("\n", p)
		article['time'] = $('time').text().trim()
	})

	return article
}

async function iselement($, el) {
	if ($(el).length > 0)
		return true
	return false
}

// This fonction returns an array with Articles titles, its link,
// its content and the time it was puplished in.
async function getAllNews(){
	let news = [];

	let url = "http://mapanticorona.map.ma/"
	let i = 0;
	let page = `ar?page=${i}`

	
	do {
		news = news.concat(await getMapNews(url.concat(page)))
		console.log(i)
		i = i + 1;
	} while (i < 15)

	return news
}

module.exports = {
	getAllNews,
}

