// Copyright (c) 2018, Fexra
//
// Please see the included LICENSE file for more information.

'use strict'
require('dotenv').config('../')
const db = require('../utils/utils').knex
const cron = require('node-cron')
const uuid = require('uuid/v1')

// Run every 50 minute - 10 minutes before payout at midnight
cron.schedule('*/50 * * * *', () => {
  processBlocks()
})


// Scans for verified blocks in the DB that have no been processed yet om
// a defined interval. It takes all addresses in the DB who had an active 
// lease at the time of the produced block and calculates its earned share
// based on the defined parameter in the .env. It stores the results in 
// the rewards table which is used by processRewards worker.

async function processBlocks() {
  try {
    // Fetch all verified, unpaid blocks
    const blocks = await db('blocks')
    .select('blockIndex', 'reward')
    .where('verified', true)
    .where('processed', false)

    blocks.map(async function(block) {

      // Calculate block Reward after service fee
      block.reward = (block.reward - (block.reward * (process.env.FEE / 100))).toFixed(2)

      // Fetch all active leases during each block
      const leases = await db('leases')
      .select('tid', 'amount', 'start')
      .where('active', true)
      .where('start', '<=', block.blockIndex)


      // Calculate sum amount
      const total = leases.reduce(function (r, o) {
        (r.sum)? r.sum += o.amount : r.sum = o.amount
        return r
      }, {})

      let rewardedLeases = []

        // Loop through each lease to calculate its earned share.
      leases.forEach(function (lease) {

        // Calculate share + reward, subtract the set fee.
        let share = (lease.amount / total.sum)
        let reward = (share * block.reward).toFixed(2)

        let leaseReward = {
          tid: lease.tid,
          reward: reward
        }

        if(reward > 0) {
          rewardedLeases.push(leaseReward)
        }
      })

      // Loop through each payment
      rewardedLeases.forEach(lease => {

        let id = uuid()

        // Store calculated payments
        db('rewards')
        .insert({
          id: id,
          lid: lease.tid,
          amount: lease.reward,
          blockIndex: block.blockIndex
        })
        .then(d => {
          console.log('[Rewards] [' + id + '] rewards created')
        })
        .catch(err => {
          console.log('' + err)
        })
      })

      // Mark block as processed
      await db('blocks').update({
        processed: true
      })
      .where('blockIndex', block.blockIndex)

    })   
  }
  catch(err) {
    console.log(err)
  }
}
