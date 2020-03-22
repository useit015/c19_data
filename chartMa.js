const { load } = require('./scrapper')

// This give the data about morocco day by day from
async function getData() {

	let chart = {
		data : [],
		dates : []
	}

	const { $ } = await load("https://github.com/CSSEGISandData/COVID-19/blob/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv")

	$('#LC170').find("td").each((i, element) => {
		const td = $(element).text().trim()
		if (i > 4)
			chart.data[i] = td
		i += 1;
	})
	chart.data.shift()
	chart.data.shift()
	chart.data.shift()
	chart.data.shift()
	chart.data.shift()

	$('#LC1').find("th").each((j, element) => {
		const date = $(element).text().trim()
		if (j > 3)
			chart.dates[j] = date
		j += 1;
	})
	chart.dates.shift()
	chart.dates.shift()
	chart.dates.shift()
	chart.dates.shift()

	return chart
}

module.exports = {
	getData,
}