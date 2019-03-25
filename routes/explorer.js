// Copyright (c) 2018, Fexra
//
// Please see the included LICENSE file for more information.
'use strict'

const express = require('express')
const router = express.Router()

// Public view
router.get('/', async function(req, res, next) {
  try {
    res.render('explorer', {
      title: 'Explorer'
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
