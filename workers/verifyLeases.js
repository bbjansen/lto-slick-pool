// Copyright (c) 2018-2022, BB. Jansen
//
// Please see the included LICENSE file for more information.

'use strict'
require('dotenv').config('../')
const db = require('../utils/utils').knex
const axios = require('axios')
const cron = require('node-cron')

// Run every minute
cron.schedule('* * * * *', async function () {
  verifyLeases()
})

// Scans the logged leases in the DB that scan.js registered. The script scans on a
// defined interval to verify if the lease is sitll active by using the node API to
// receive info on the tx using the transaction ID. If the lease is not active, the
// status field in the DB is updated and the payLeases.js worker handles it from there.

async function verifyLeases() {

  try {
    // Fetch logged active leases
    const leases = await db('leases')
    .select('tid')
    .where('active', true)

    // Get current height
    const blockIndex = await axios.get('https://' + process.env.NODE_IP + '/blocks/height')

    // Loop through each logged lease
    leases.map(async (lease) => {

      // Check tx info from the network
      const tx = await axios.get('https://' + process.env.NODE_IP + '/transactions/info/' + lease.tid)

      // Can't hurt to double check :)
      if(lease.tid === tx.data.id) {

        // Update status if the lease is not active anymore
        if(tx.data.status !== 'active') {

          await db('leases')
          .update({
            end: blockIndex.data.height,
            active: false
          })
          .where('tid', lease.tid)

          // Log
          console.log('[Lease] [' + lease.tid + '] [' + blockIndex.data.height + '] canceled.')
        }
      }
    })
  }
  catch(err) {
    console.log(err)
  }
}
