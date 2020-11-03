// Copyright (c) 2018-2022, BB. Jansen
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
