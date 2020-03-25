const { getDataCsv } = require('./chartMa')

const express = require('express')
const path = require('path') 

const app = express()



let userToken = getDataCsv('Morocco')
let dat = []

userToken.then(function(result) {
	dat = result.dates
	cases = result.table
	app.set('views', path.join(__dirname, 'views'))

	app.set('view engine', 'pug')
	app.get('/', function (req, res){
		res.render('index', {'dat' : dat , 'cases' : cases})
	})

	app.listen('1337', () => {
		console.log('hello')
	})

})