// Copyright (c) 2018, Fexra
//
// Please see the included LICENSE file for more information.

'use strict'
require('dotenv').config('../')
const db = require('../utils/utils').knex
const cron = require('node-cron')
const uuid = require('uuid/v1')

// Run every hour on the hour before processPayments.js
cron.schedule('0 * * * *', () => {
  sortPayments()
})


// Scans for verified blocks in the DB that have no been paid out yet on
// a defined interval. It takes all addresses in the DB who had an active 
// lease at the time of the produced block and calculates its earned share
// based on the defined parameter in the .env

async function sortPayments() {
  try {
    // Fetch verified blocks who have not been paid yet.
    const blocks = await db('blocks')
    .select('blockIndex', 'reward')
    .where('verified', true)
    .where('paid', false)

    // Loop through each block
    blocks.forEach(function (block) {

      // Fetch all active leases during this height
      db('leases')
      .select('tid', 'amount')
      .where('active', true)
      .where('start', '<=', block.blockIndex)
      .then(leases => {

        // Calculate sum amount
        const total = leases.reduce(function (r, o) {
          (r.sum)? r.sum += o.amount : r.sum = o.amount
          return r
        }, {})

        let share
        let reward
        let id

        // Loop through each lease to calculate its earned share a reward.
        leases.forEach(function (lease) {

          // Calculate share + reward, subtract the set fee.
          share = (lease.amount / total.sum)
          reward = (share * block.reward)
          reward = (reward - Math.floor(reward * (process.env.FEE / 100)))
 
          // If reward is greater than 0, after having accounted for the fee.
          if(reward > 0) {
            
            id = uuid()

            db('payments')
            .insert({
              id: id,
              blockIndex: block.blockIndex,
              lid: lease.tid,
              amount: reward
            })
            .then(d => {
              console.log('[Payment] [' + block.blockIndex + '] [' + id + '] payment created')
            })
            .catch(err => {
              console.log('' + err)
            })
          }
        })
      })
      .catch(err => {
        console.log(err)
      }) 
      
    })
  }
  catch(err) {
    console.log(err)
  }
}
