// Copyright (c) 2018, Fexra
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
    const blockIndex = await axios.get('http://' + process.env.NODE_IP + ':' + process.env.NODE_PORT + '/blocks/height')

    // Loop through each logged lease
    leases.forEach(lease => {

      // Check tx info from the network
      axios.get('http://' + process.env.NODE_IP + ':' + process.env.NODE_PORT + '/transactions/info/' + lease.tid)
      .then(tx => {

        // Can't hurt to double check :)
        if(lease.tid === tx.data.id) {

          // Update status if the lease is not active anymore
          if(tx.data.status !== 'active') {

            db('leases')
            .update({
              end: blockIndex.data.height,
              active: false
            })
            .where('tid', lease.tid)
            .then(d => {
              console.log('[Lease] [' + lease.tid + '] [' + blockIndex.data.height + '] canceled.')
            })
          } else {
            console.log('[Lease] [' + lease.tid + '] [' + blockIndex.data.height + '] active.')
          }
        } else {
          throw new Error('Conflicting transction ID.')
        }
      })
    })
  }
  catch(err) {
    console.log(err)
  }
}
