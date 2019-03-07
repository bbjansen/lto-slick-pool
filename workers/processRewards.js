// Copyright (c) 2018, Fexra
//
// Please see the included LICENSE file for more information.

'use strict'
require('dotenv').config('../')
const db = require('../utils/utils').knex
const axios = require('axios')
const cron = require('node-cron')

// Run every midnight
cron.schedule('0 0 * * *', () => {
  processRewards()
})

// Scans for rewards in the DB that have no been paid out yet on a defined
// interval grouped by the lease ID and takes the sum of the total rewards.
// This data is used to create a mass transaction to payout the rewards.

async function processRewards() {
  try {
    // Fetch 100 (lto network pussy limit) unpaid payments,
    const getPayments = await db('payments')
    .leftJoin('leases', 'payments.lid', 'leases.tid')
    .select('payments.id', 'payments.blockIndex', 'leases.address', 'payments.amount')
    .where('payments.paid', false)
    .limit(100)

    // Get sum of unpaid payments

    const getPaymentTotal = await db('payments')
    .leftJoin('leases', 'payments.lid', 'leases.tid')
    .sum('payments.amount as sum')
    .where('payments.paid', false)

    .sum('payments.amount as sum')

    if(getPayments.length <= 0) {
      throw('[Payment] no payments to process')
    }
    else if(getPaymentTotal[0].sum < process.env.PAYOUT) {
      throw('[Payment] [' + getPaymentTotal[0].sum + '/' + process.env.PAYOUT + '] payout point not reached yet.')
    }
    else {

      let transfers = []
      let track = []

      // Loop through each payment
      getPayments.forEach(function (payment) {
        
        // Push each transfer data to the transfer array
        transfers.push({
          recipient: payment.address,
          amount: Math.floor(payment.amount * process.env.ATOMIC)
        })

        // Push each id to track array for later identification
        track.push({
          id: payment.id,
          block: payment.blockIndex
        })
      })

      // Calculate total unpaid 

      // Sign a mass payment for each produced block
      axios.post('https://' + process.env.NODE_IP + '/transactions/sign',
      {
        type: 11,
        version: 1,
        sender: process.env.NODE_ADDRESS,
        transfers: transfers,
        fee: Math.round((0.25 + (0.10 * payments.length)) * process.env.ATOMIC)
      },
      {
        headers: { 
          'X-API-Key': process.env.NODE_PASS
        }
      })
      .then(signed => {
        return axios.post('https://' + process.env.NODE_IP + '/transactions/broadcast',
        signed.data,
        {
          headers: { 
            'X-API-Key': process.env.NODE_PASS
          }
        })
      })
      .then(tx => {

        console.log('[Payment] [' + tx.data.id +'] broadcasted')

        track.forEach(payment => {

          db('payments').update({
            tid: tx.data.id,
            paid: true
          })
          .where('id', payment.id)
          .then(d => {
            console.log('[Payment] [' + payment.id + '] paid')
          })
          .catch(err => {
            console.log(err)
          })

          // Mark block as paid
          db('blocks')
          .update({
            paid: true
          })
          .where('blockIndex', payment.block)
          .then(d => {
            console.log('[Block] [' + payment.block+ '] paid')
          })
          .catch(err => {
            console.log('' + err)
          })

        })
      })
      .catch(err => {
        console.log('' + err)
      })
    }
  }
  catch(err) {
    console.log(err)
  }
}