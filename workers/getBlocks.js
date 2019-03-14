// Copyright (c) 2018, Fexra
//
// Please see the included LICENSE file for more information.

'use strict'
require('dotenv').config('../')
const db = require('../utils/utils').knex
const twitter = require('../utils/utils').twitter
const axios = require('axios')
const cron = require('node-cron')

// Run every minute
cron.schedule('* * * * *', () => {
  getBlocks()
})

// Sends a request to the node with a defined block index range to scan for block
// produced by this node. These blocks get stored and are  used to calculate the
// rewards in the payLeasers.js script.

async function getBlocks() {
  try {
    let blockIndex
    let blockCount = 0
    let lastIndex = 0

    // Grab the network height and last scanned height
    blockIndex = await axios.get('https://' + process.env.NODE_IP + '/blocks/height')
    lastIndex = await db('status').select('scanIndex').limit(1)

    //Calculate heightDiff
    const heightDiff = blockIndex.data.height - lastIndex[0].scanIndex

    if (lastIndex[0].scanIndex >= blockIndex.data.height) {
      throw('[Blocks] [' + blockIndex.data.height + '] reached top')
    }

    // Calculate # of blocks to scan
    if(heightDiff > 99) {
      blockCount = 99
    } else if (heightDiff > 50) {
      blockCount = 50
    } else if (heightDiff > 25) {
      blockCount = 25
    } else if (heightDiff > 10) {
      blockCount = 10
    } else if (heightDiff > 5) {
      blockCount = 5
    } else {
      blockCount = 1
    }

    // Adjust for overspill 
    if ((lastIndex[0].scanIndex + blockCount) > blockIndex.data.height) {
      blockCount = (blockIndex.data.height - lastIndex[0].scanIndex - 1)
    }

    // Calculate end range / new scanIndex
    const newScanIndex = (lastIndex[0].scanIndex + blockCount)
    
    // Scan for new blocks starting at the last recorded block index (scanIndex)
    const blocks = await axios.get('https://' + process.env.NODE_IP + '/blocks/address/' + process.env.NODE_ADDRESS + '/' + lastIndex[0].scanIndex + '/' + newScanIndex)

    // Loop through each detected block
    blocks.data.map(async (block) => {

      // An extra check can never hurt :)
      if(block.generator === process.env.NODE_ADDRESS) {
        
        // To calculate the earned staking reward for the produced block you have to take
        // 40% of the fee of the produced block and 60% of the fee of block whose reference
        // corresponds with the signature of the produced block. Use the node API to find this
        
        const reward = await axios.get('https://' + process.env.NODE_IP + '/blocks/at/' + (+block.height - 1))
        const prevBlockFee = (reward.data.fee / process.env.ATOMIC)
        const adjustedReward = (block.fee * 0.4) + (prevBlockFee * 0.6)

        // Insert block - Duplicate block are ignored by the DB
        await db('blocks')
        .insert({
          blockIndex: block.height,
          fee: (block.fee / process.env.ATOMIC),
          reward: adjustedReward,
          timestamp: block.timestamp
        })

        // Tweet Maturity
        if(process.env.PRODUCTION === 1) {
          await twitter.post('statuses/update', { 
            status: 'Block #' + block.height + ' has been forged with a reward of ' + adjustedReward.toFixed(2)  + ' $LTO! https://lto.services/blocks'
          })
        }

        // Log
        console.log('[Block] [' + block.height + '] recorded.')
      }
    })

    // Set new scanIndex
    await db('status')
    .update({
      scanIndex: newScanIndex
    })
  }
  catch(err) {
    console.log(err)
  }
}