// Copyright (c) 2018, Fexra
//
// Please see the included LICENSE file for more information.

'use strict'
require('dotenv').config('../')
const db = require('../utils/utils').knex
const twitter = require('../utils/utils').twitter
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
    blocks.map(async (block) => {

      // Calculate if 90 minutes have passed. This is the 'timeout' for a tx in
      // the LTO networks mempool so why not base it on this

      let duration = moment.duration(moment().diff(moment(block.timestamp))).asMinutes()

      if(duration >= 90) {
      
        // update block status
        await db('blocks')
        .update({
          verified: true,
        })
        .where('blockIndex', block.blockIndex)

        const getTotalUnpaid = await db('blocks')
        .sum('reward as sum')
        .where('paid', false)

        // Tweet Maturity
        if(+process.env.PRODUCTION === 1) {
          await twitter.post('statuses/update', { 
            status: 'Block #' + block.blockIndex + ' has matured. Total unpaid amount is now ' + +getTotalUnpaid[0].sum.toFixed(2)  + ' $LTO. https://lto.services/blocks'
          })
        }
        
        // Log
        consle.log('[Block] [' + block.blockIndex + '] verified.')
 
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
