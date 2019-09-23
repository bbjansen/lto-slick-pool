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
  getLeases()
})

// Sends a request to the node for all current leases. Logs the transaction ID,
// address, amount, fee, starting height and timestamp. The verifyLeases.js worker scans 
// the recorded transaction ID every minute to verify that the lease is still active.
// When canceled, the active field is in the DB updated and the payLeasers.js worker
// handles it from there.

 async function getLeases() {

  try {
    // Fetch active leases
    const leases = await axios.get('https://' + process.env.NODE_IP + '/leasing/active/' + process.env.NODE_ADDRESS)

    // Loop through each detected lease
    leases.data.map(async (lease) => {

      // An extra check can never hurt :)
      if(lease.recipient === process.env.NODE_ADDRESS && lease.type === 8) {

        const checkLease = await db('leases')
        .count('* as count')
        .where('tid', lease.id)

        if(checkLease[0].count === 0) {
          // Insert lease - Duplicate transaction ID is ignored by the DB
          await db('leases')
          .insert({
            tid: lease.id,
            address: lease.sender,
            amount: (lease.amount / process.env.ATOMIC),
            fee: (lease.fee / process.env.ATOMIC),
            start: lease.height,
            timestamp: lease.timestamp
          })

          // Tweet Lease
          if(+process.env.APP_PRODUCTION === 1) {
            await twitter.post('statuses/update', { 
              status: 'Lease ' + lease.id + ' signed by ' + lease.sender + ' with an amount of ' + (lease.amount / process.env.ATOMIC).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })+ ' $LTO! https://lto.services/leases'
            })
          }

          // Log success
          console.log('[Lease] [' + lease.id + '] [' + lease.height + '] recorded.')
        }
      }
    })
  }
  catch(err) {
    console.log(err)
  }
}
