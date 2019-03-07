// Copyright (c) 2018, Fexra
//
// Please see the included LICENSE file for more information.
'use strict'

const express = require('express')
const router = express.Router()
const db = require('../utils/utils').knex

// Balance
router.get('/balance', async function(req, res, next) {
  try {

    const getTotalUnpaid = await db('blocks')
    .sum('reward as sum')
    .where('paid', false)

    const getTotalPaid = await db('payments')
    .sum('amount as sum')
    .where('confirmed', true)

    res.json({
      totalUnpaid: getTotalUnpaid[0].sum || 0,
      totalPaid: getTotalPaid[0].sum || 0
    })

  } catch (err) {
    res.json(null)
  }
})

// Get Stats
router.get('/lease/:address', async function(req, res, next) {
  try {

    // Get leases
    const getLeases = await db('leases')
    .select('tid', 'amount', 'fee', 'start', 'timestamp', 'active')
    .where('address', req.params.address)

    getLeases.forEach(function(lease) {
      lease.timestamp = new Date(lease.timestamp)
      lease.timestamp = lease.timestamp
    })

    // Get Payments
    const getPayments = await db('payments')
    .leftJoin('leases', 'payments.lid', 'leases.tid')
    .select('payments.id', 'payments.blockIndex', 'payments.tid', 'leases.address', 'payments.amount', 'payments.fee', 'payments.confirmed', 'payments.timestamp')
    .where('leases.address', req.params.address)

    getPayments.forEach(function(payment) {
      payment.timestamp = new Date(payment.timestamp)
      payment.timestamp = payment.timestamp
    })

    // Get Payment Stats

    const getPaid = await db('rewards')
    .leftJoin('leases', 'rewards.lid', 'leases.tid')
    .sum('rewards.amount as sum')
    .where('leases.address', req.params.address)
    .where('rewards.paid', true)

    const getUnpaid = await db('rewards')
    .leftJoin('leases', 'rewards.lid', 'leases.tid')
    .sum('rewards.amount as sum')
    .where('leases.address', req.params.address)
    .where('rewards.paid', false)
    
    res.json({
      leases: getLeases,
      payments: getPayments,
      stats: {
        paid: getPaid[0].sum || 0.00,
        unpaid: getUnpaid[0].sum || 0.00
      }
    })
  } catch (err) {
    console.log(err)
    res.json(null)
  }
})

// Get Leases
router.get('/leases', async function(req, res, next) {
  try {

    const getLeases = await db('leases')
    .select('tid', 'address', 'amount', 'fee', 'start', 'active', 'timestamp')
    .orderBy('timestamp', 'desc')

    getLeases.forEach(function(lease) {
      lease.timestamp = new Date(lease.timestamp)
      lease.timestamp = lease.timestamp
    })

    res.json(getLeases)

  } catch (err) {
    res.json(null)
  }
})

// Get Blocks
router.get('/blocks', async function(req, res, next) {
  try {

    const getBlocks = await db('blocks')
    .select('blockIndex', 'fee', 'timestamp', 'verified', 'reward', 'paid')
    .orderBy('timestamp', 'desc')

    getBlocks.forEach(function(block) {
      block.timestamp = new Date(block.timestamp)
      block.timestamp = block.timestamp
    })

    res.json(getBlocks)

  } catch (err) {
    res.json(null)
  }
})


// Get Payments
router.get('/payments', async function(req, res, next) {
  try {

    const getPayments = await db('payments')
    .leftJoin('leases', 'payments.lid', 'leases.tid')
    .select('payments.id', 'payments.blockIndex', 'payments.tid', 'leases.address', 'payments.amount', 'payments.fee', 'payments.confirmed', 'payments.timestamp')
    .orderBy('payments.blockIndex', 'desc')

    getPayments.forEach(function(payment) {
      payment.timestamp = new Date(payment.timestamp)
      payment.timestamp = payment.timestamp
    })

    res.json(getPayments)
  } catch (err) {
    res.json(null)
  }
})


module.exports = router
