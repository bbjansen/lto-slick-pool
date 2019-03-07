// Copyright (c) 2018, Fexra
//
// Please see the included LICENSE file for more information.
'use strict'

// Set Express App
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const Helmet = require('helmet')
const Compression = require('compression')
const favicon = require('serve-favicon')
const path = require('path')
const logger = require('morgan')

// Setup DB if not exist
require('./utils/db/schema')

app.use(function (req, res, next) {
  res.locals.session = req.session
  return next()
})

// Compress
app.use(Helmet())
app.use(Compression())

// Set Parsers/Path/Favicon/Templates
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(logger('dev'))

// Routes
app.use('/', require('./routes/index'))
app.use('/api/', require('./routes/api'))

// Workers
require('./workers/getBlocks')
require('./workers/verifyBlocks')
require('./workers/processBlocks')

require('./workers/getLeases')
require('./workers/verifyLeases')

//require('./workers/processRewards')

// error handler
app.use(function onError (err, req, res, next) {

  console.log(err)

  // set locals, only providing error in development
  res.locals.error = process.env.DEBUG == true ? err : {}
  res.statusCode = err.status || 500

  res.render('includes/err', {
    title: 'Error'
    })

})

module.exports = app
