// Copyright (c) 2018, Fexra
//
// Please see the included LICENSE file for more information.

'use strict'
require('dotenv').config('../')
const db = require('../utils/utils').knex
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
    blocks.data.forEach(block => {

      // An extra check can never hurt :)
      if(block.generator === process.env.NODE_ADDRESS) {

        // Insert block - Duplicate block are ignored by the DB
        db('blocks')
        .insert({
          blockIndex: block.height,
          fee: (block.fee / process.env.ATOMIC),
          timestamp: block.timestamp
        })
        .then(d => {
          console.log('[Block] [' + block.height + '] recorded.')
        })
        .catch(err => {

          //If duplicate
          if(err.errno === 1062) {
            console.log('[Block] [' + block.height + '] duplicate.')
          } else {
            console.log('' + err)
          }
        })
      } else {
        throw new Error('Conflicting node address or transaction type.')
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