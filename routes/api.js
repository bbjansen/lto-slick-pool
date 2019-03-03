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

    const getTotalUnpaid = await db('payments')
    .sum('amount as sum')
    .where('paid', false)

    const getTotalPaid = await db('payments')
    .sum('amount as sum')
    .where('paid', true)

    res.json({
      totalUnpaid: getTotalUnpaid[0].sum.toFixed(2),
      totalPaid: getTotalPaid[0].sum.toFixed(2)
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
      lease.amount = lease.amount.toFixed(2)
      lease.fee = lease.fee.toFixed(2)
      lease.timestamp = new Date(lease.timestamp)
      lease.timestamp = lease.timestamp.toLocaleString()
    })

    // Get Payments
    const getPayments = await db('payments')
    .leftJoin('leases', 'payments.lid', 'leases.tid')
    .select('payments.id', 'payments.tid', 'payments.amount', 'payments.blockIndex', 'payments.paid', 'payments.timestamp')
    .where('leases.address', req.params.address)
    .where('paid', true)

    getPayments.forEach(function(payment) {
      payment.amount = payment.amount.toFixed(2)
      payment.timestamp = new Date(payment.timestamp)
      payment.timestamp = payment.timestamp.toLocaleString()
    })


    // Get Payment Stats

    const getPaid = await db('payments')
    .leftJoin('leases', 'payments.lid', 'leases.tid')
    .sum('payments.amount as sum')
    .where('leases.address', req.params.address)
    .where('paid', true)

    const getUnpaid = await db('payments')
    .leftJoin('leases', 'payments.lid', 'leases.tid')
    .sum('payments.amount as sum')
    .where('leases.address', req.params.address)
    .where('paid', false)

    res.json({
      leases: getLeases,
      payments: getPayments,
      stats: {
        paid: getPaid[0].sum,
        unpaid: getUnpaid[0].sum
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
      lease.amount = lease.amount.toFixed(2)
      lease.fee = lease.fee.toFixed(2)
      lease.timestamp = new Date(lease.timestamp)
      lease.timestamp = lease.timestamp.toLocaleString()
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
      block.fee = block.fee.toFixed(2)
      if(block.reward) {
        block.reward = block.reward.toFixed(2)
      } else {
        block.reward = '.........'
      }
      block.timestamp = new Date(block.timestamp)
      block.timestamp = block.timestamp.toLocaleString()
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
    .select('payments.id', 'payments.blockIndex', 'payments.tid', 'leases.address', 'payments.amount', 'payments.timestamp', 'payments.paid')
    .orderBy('payments.blockIndex', 'desc')

    getPayments.forEach(function(payment) {
      payment.amount = payment.amount.toFixed(2)
      payment.timestamp = new Date(payment.timestamp)
      payment.timestamp = payment.timestamp.toLocaleString()
    })

    res.json(getPayments)
  } catch (err) {
    res.json(null)
  }
})


module.exports = router
