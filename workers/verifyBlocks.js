// Copyright (c) 2018, Fexra
//
// Please see the included LICENSE file for more information.

'use strict'
require('dotenv').config('../')
const db = require('../utils/utils').knex
const moment = require('moment')
const axios = require('axios')
const cron = require('node-cron')

// Run every 10 minutes
cron.schedule('*/10 * * * *', () => {
  verifyBlocks()
})

// Take all unverfied recorded blocks by getBlocks.js and calculates if enough time has
// passed with a configurable parameter to unlock the block for payment by payLeasers.js

async function verifyBlocks() {
  try {

    // Grab all unverified recorded blocks
    const blocks = await db('blocks')
    .select('blockIndex', 'fee', 'timestamp')
    .where('verified', false)

    // Loop through each block
    blocks.forEach(block => {

      // Calculate if 90 minutes have passed. This is the 'timeout' for a tx in
      // the LTO networks mempool so why not base it on this

      var duration = moment.duration(moment().diff(moment(block.timestamp))).asMinutes()

      if(duration >= 90) {

        // To calculate the earned staking reward for the produced block you have to take
        // 40% of the fee of the produced block and 60% of the fee of block whose reference
        // corresponds with the signature of the produced block. Use the node API to find this
        
        axios.get('https://' + process.env.NODE_IP + '/blocks/at/' + (+block.blockIndex - 1))
        .then(res => {
          const prevBlockFee = (res.data.fee / process.env.ATOMIC)
          const reward = (block.fee * 0.4) + (prevBlockFee * 0.6)
          return reward
        })
        .then(reward => {
          // update block status
          return db('blocks')
          .update({
            verified: true,
            reward: reward
          })
          .where('blockIndex', block.blockIndex)
        })
        .then(d => {
          console.log('[Block] [' + block.blockIndex + '] verified.')
        })
        .catch(err => {
          console.log('' + err)
        })
      }
      else {
        console.log('[Block] [' + block.blockIndex + '] not matured.')
      }
    })
  }
  catch(err) {
    console.log(err)
  }
}
