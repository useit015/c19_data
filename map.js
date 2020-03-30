const { load } = require('./load')



async function getMapNews(url) {
	let news = [];

	const { $ } = await load(url)

	$('.col-md-8 h5').each((i, element) => {

		const h5 = $(element).find('a')
		const title = h5.text().trim()
		const href = h5.attr('href')
		const id = href.split('/').pop()
		const content =  "";
		const time = ""

		news[i] = {
			id,
			title,
			href,
			content,
			time
		}

	})
	 news = await addArticles(news)
	return news
}

// addArticles and getNewsSubject are only used by getMapNews
async function addArticles(news) {
	for (let i = 0; i < news.length; i++) {
		const data = await getNewsSubject(news[i].href)
		news[i].content = data['content']
		news[i].time = data['time']
	}
	return news
}

async function getNewsSubject(href){
	let content = {}
	content['content'] = ""
	const url = "http://mapanticorona.map.ma"
	const { $ } = await load(url.concat(href))
	$('.clearfix').find('p').each((i, element) => {
		const p = $(element).text().trim()

		content['content'] = content['content'].concat("\n", p)
		content['time'] = $('time').text().trim()
	})

	return content
}

// This fonction returns an array with Articles titles, its href,
// its content and the time it was puplished in.
async function getAllNews(){
	let news = [];

	let url = "http://mapanticorona.map.ma/"
	
	for (let i = 0; i < 15; i++) {
		let page = `?page=${i}`
		news = news.concat(await getMapNews(url.concat(page)))
	}

	return news
}

async function getMapUpNews(url, inititle) {
	let val = {
		news : [],
		continu : true
	}

	const { $ } = await load(url)

	$('.col-md-8 h5').each((i, element) => {

		const h5 = $(element).find('a')
		const title = h5.text().trim()
		const href = h5.attr('href')
		const id = href.split('/').pop()
		const content =  "";
		const time = ""

		val.news[i] = {
			id,
			title,
			href,
			content,
			time
		}
		
		if (inititle == title){
			val.continu = false
			return false
		}
		
	})
	val.news = await addArticles(val.news)
	return val
}

// This function returns an array with all the news that are not
// already saved -- It gets as parameter the title of the latest 
// news in the db
async function updateNews(title) {
	let news = [];
	let value = {}
	let url = "http://mapanticorona.map.ma/"
	let i = 0;
	let page = `ar?page=${i}`

	
	do {
		value = await getMapUpNews(url.concat(page), title)
		news = news.concat(value.news)
		i = i + 1;
	} while (value.continu)

	news.pop()
	return news	
}

module.exports = {
	getAllNews,
	addArticles,
}

