const { load } = require('./scrapper')
const axios = require('axios')

function iscountry(country, table) {
	let i = 0
	for (const c of table) {
		const len = country.length
		const iscountry = c.slice(0, len)
		if (iscountry == country)
			return (i)
		i = i + 1
	}
	return -1
}

async function getDataCsv(country) {
	let chart = {
		table : [],
		dates : []
	}

	const html = await axios.get("https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv")
	chart.table = html.data.split('\n,')
	const is = await iscountry(country, chart.table)

	console.log(is)
	if (is != -1) {
		chart.dates = chart.table[0].split(',')
		chart.table = chart.table[is].split(',')
		let j = 0;
		while (j < 30){
			chart.table.shift()
			j = j + 1
		}
		j = 0
		while (j < 29){
			chart.dates.shift()
			j = j + 1
		}
	}
	else {
		chart= {}
	}
	return (chart)
}

module.exports = {
	getDataCsv,
	getData,
}