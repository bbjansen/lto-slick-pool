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
    leases.data.forEach(lease => {

      // An extra check can never hurt :)
      if(lease.recipient === process.env.NODE_ADDRESS && lease.type === 8) {

        // Insert lease - Duplicate transaction ID is ignored by the DB
        db('leases')
        .insert({
          tid: lease.id,
          address: lease.sender,
          amount: (lease.amount / process.env.ATOMIC),
          fee: (lease.fee / process.env.ATOMIC),
          start: lease.height,
          timestamp: lease.timestamp
        })
        .then(d => {
          //Log succes
          console.log('[Lease] [' + lease.id + '] [' + lease.height + '] recorded.')
        })
        .catch(err => {

          //If duplicate
          if(err.errno === 1062) {
            console.log('[Lease] [' + lease.id + '] [' + lease.height + '] duplicate.')
          } else {
            console.log('' + err)
          }
        })
      } else {
        throw new Error('Conflicting node address or transaction type.')
      }      
    })
  }
  catch(err) {
    console.log(err)
  }
}
