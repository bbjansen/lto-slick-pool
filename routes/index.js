// Copyright (c) 2018, Fexra
//
// Please see the included LICENSE file for more information.
'use strict'

const express = require('express')
const router = express.Router()

// Public view
router.get('/', async function(req, res, next) {
  try {
    res.render('public', {
      title: 'Lease LTO',
      address: req.cookies.address || null,
      payout: process.env.PAYOUT
    })
  } catch (err) {
    next(err)
  }
})

// Get Started
router.get('/get-started', async function(req, res, next) {
  try {
    res.render('public/started', {
      title: 'Get Started'
    })
  } catch (err) {
    next(err)
  }
})


// FAQ
router.get('/faq', async function(req, res, next) {
  try {
    res.render('public/faq', {
      title: 'FAQ',
      payout: process.env.PAYOUT,
      fee: process.env.FEE
    })
  } catch (err) {
    next(err)
  }
})

// Get Blocks
router.get('/blocks', async function(req, res, next) {
  try {
    res.render('public/blocks', {
      title: 'Blocks'
    })
  } catch (err) {
    next(err)
  }
})

// Get Leases
router.get('/leases', async function(req, res, next) {
  try {
    res.render('public/leases', {
      title: 'Leases'
    })
  } catch (err) {
    next(err)
  }
})

// Get Payments
router.get('/payments', async function(req, res, next) {
  try {
    res.render('public/payments', {
      title: 'Payments'
    })
  } catch (err) {
    next(err)
  }
})

// Network
router.get('/network', async function(req, res, next) {
  try {
    res.render('public/network', {
      title: 'Network'
    })
  } catch (err) {
    next(err)
  }
})

// Get Started
router.get('/status', async function(req, res, next) {
  try {
    res.render('public/status', {
      title: 'Status'
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
