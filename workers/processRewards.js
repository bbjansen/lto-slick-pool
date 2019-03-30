// Copyright (c) 2018, Fexra
//
// Please see the included LICENSE file for more information.

'use strict'
require('dotenv').config('../')
const db = require('../utils/utils').knex
const cron = require('node-cron')
const uuid = require('uuid/v1')
const axios = require('axios')
const twitter = require('../utils/utils').twitter

// Run every midnight
cron.schedule('0 0 * * *', () => {
  processRewards()
})

// Scans for rewards in the DB that have no been paid out yet on a defined
// interval grouped by the lease ID and calcs the sum of the total rewards.
// This data is used to create a mass transaction to payout the rewards.

async function processRewards() {
  try {

    // Get rewards
    const getRewards = await db('rewards')
    .leftJoin('leases', 'rewards.lid', 'leases.tid')
    .select('rewards.id', 'rewards.amount', 'rewards.blockIndex', 'leases.address')
    .where('rewards.paid', false)

    // Get all calculated reward ids
    const calcRewards = await db('rewards')
    .leftJoin('leases', 'rewards.lid', 'leases.tid')
    .select('leases.address')
    .sum('rewards.amount as sum')
    .where('rewards.paid', false)
    .groupBy('leases.address')


    // Calculate total sum
    const totalSum = calcRewards.reduce(function (r, o) {
      (r.sum)? r.sum += o.sum : r.sum = o.sum
      return r
    }, {})

    // If payout limit is reached
    if(totalSum.sum >= process.env.PAYOUT) {

      // Split in batches of 100 due to network restraints on mass transfer
      let batch = []

      while (calcRewards.length) {
        batch.push(calcRewards.splice(0, 100))
      }

      // Map baches -> process, sign and payout by set interval (see splice above)
      batch.map(async (rewards) => {

        // Get Height
        const getIndex = await axios.get('https://' + process.env.NODE_IP + '/blocks/height')

        // Prepare the transfer array
        let transfers = []

        rewards.map(r => {
          transfers.push({
            recipient: r.address,
            amount: Math.round(r.sum * process.env.ATOMIC),
          })
        })

        // Sign the mass payment
        const signed = await axios.post('https://' + process.env.NODE_IP + '/transactions/sign',
        {
          type: 11,
          version: 1,
          sender: process.env.NODE_ADDRESS,
          transfers: transfers,
          fee: Math.round((0.25 + (0.10 * transfers.length)) * process.env.ATOMIC)
        },
        {
          headers: { 
            'X-API-Key': process.env.NODE_PASS
          }
        })

        //Broadcast payment
        await axios.post('https://' + process.env.NODE_IP + '/transactions/broadcast',
        signed.data,
        {
          headers: { 
            'X-API-Key': process.env.NODE_PASS
          }
        })

        // Store payment
        let id = uuid()

        await db('payments').insert({
          id: id,
          tid: broadcast.data.id,
          amount: (signed.data.totalAmount / process.env.ATOMIC),
          fee: (signed.data.fee / process.env.ATOMIC),
          blockIndex: getIndex.data.height,
          timestamp: signed.data.timestamp
        })
        
        // update rewards with pid uuid (detect using address)
        rewards.map(async r => {
          await db('rewards')
          .leftJoin('leases', 'rewards.lid', 'leases.tid')
          .update({
            pid: id,
            paid: true
          })
          .where('leases.address', r.address)
        })

        // Tweet Payout
        if(+process.env.PRODUCTION === 1) {
          await twitter.post('statuses/update', { 
            status: 'Payout ' + broadcast.data.id + ' has been broadcasted with a total of ' + totalSum.sum.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })  + ' $LTO! https://lto.services/payments'
          })
        }

        console.log('[Payment] [' + broadcast.data.id +'] broadcasted')
      })

      // Get all blocks
      let blocks = []

      getRewards.map(async (i) => {
        blocks.push(i.blockIndex)
      })

      // Filter duplicates
      blocks = blocks.filter((v, i, a) => a.indexOf(v) === i)

      // Mark all processed blocks as paid
      blocks.map(async (block) => {
        await db('blocks')
        .update({
          paid: true
        })
        .where('blockIndex', block)
      })
    }
    else {
      console.log('[Payment] limit of ' + process.env.PAYOUT + ' has not been reached')
    }
  }
  catch(err) {
    console.log(err)
  }
}
