// Copyright (c) 2018, Fexra
//
// Please see the included LICENSE file for more information.

'use strict'
require('dotenv').config('../')
const db = require('../utils/utils').knex
const cron = require('node-cron')
const uuid = require('uuid/v1')
const axios = require('axios')

// Run every midnight
cron.schedule('0 0 * * *', () => {
  processRewards()
})

processRewards()

// Scans for rewards in the DB that have no been paid out yet on a defined
// interval grouped by the lease ID and calcs the sum of the total rewards.
// This data is used to create a mass transaction to payout the rewards.

async function processRewards() {
  try {

    // Get all calculated reward ids
    const getRewards = await db('rewards')
    .leftJoin('leases', 'rewards.lid', 'leases.tid')
    .select('rewards.id', 'rewards.blockIndex', 'leases.address', 'rewards.amount')
    .where('rewards.paid', false)


    console.log(getRewards)
    // Push id, block to track array for later use
    let track = []

    getRewards.map(async (r) => {
      track.push({
        id: r.id,
        block: r.blockIndex
      })
    })

    // Group by address and get sums
    const calcRewards = getRewards.reduce(function (r, o) {
      (r[o.address])? r[o.address] += o.amount : r[o.address] = o.amount;
      return r
    }, {})

    // Format calculated rewards to two decimal points
    for(var r in calcRewards) {
      calcRewards[r] = calcRewards[r].toFixed(2)
     }

    // Split in batches of 100 due to network restraints on mass transfer
    let batch = []
    let toArray = Object.entries(calcRewards)

    while (toArray.length) {
      batch.push(toArray.splice(0, 100))
    }

    // Map baches -> process, sign and payout by set interval (see splice above)
    let store = []

    batch.map(async (rewards) => {

      // Get Height
      const getIndex = await axios.get('https://' + process.env.NODE_IP + '/blocks/height')

      // Prepare the transfer array
      let transfers = []

      rewards.map(r => {
        transfers.push({
          recipient: r[0],
          amount: Math.round((r[1] * process.env.ATOMIC))
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
      
      // Store payment
      const id = uuid()
      store.push(id)

      await db('payments').insert({
        id: id,
        //tid: broadcast.data.id,
        tid: 2,
        amount: (signed.data.totalAmount / process.env.ATOMIC),
        fee: (signed.data.fee / process.env.ATOMIC),
        blockIndex: getIndex.data.height,
        timestamp: signed.data.timestamp
      })


    })

    // Cheap trick 
    setTimeout(function(){
      
      console.log(store)
      
     }, 10000)
    

    // Mark all processed rewards as paid and get blocks
    let blocks = []

    track.map(async (i) => {
      //await db('rewards')
      //.update({
      //  paid: true
      //  pid: store[0]
      //})
      //.where('id', i.id)

      blocks.push(i.block)
    })

    // Filter duplicates
    blocks = blocks.filter((v, i, a) => a.indexOf(v) === i)

    // Mark all processed blocks as paid
    blocks.map(async (i) => {
      //await db('blocks')
      //.update({
      //  paid: true
      //})
      //.where('blockIndex', i)
    })
  }
  catch(err) {
    console.log(err)
  }
}
