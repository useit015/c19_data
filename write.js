const { createWriteStream } = require('fs')

function writeData([ stats, articles ]) {
	createWriteStream('data.json')
		.write(
			JSON.stringify(
				{
					stats,
					articles,
					contact: {
						'Allô SAMU': '141',
						'Numéro économique': '080 100 47 47'
					}
				},
				null,
				4
			)
		)
}

module.exports = {
	writeData
}