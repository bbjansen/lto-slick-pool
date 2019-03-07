// Copyright (c) 2018, Fexra
//
// Please see the included LICENSE file for more information.
'use strict'

const db = require('../utils').knex

// Create 'leases' table if it does not exist
db.schema.hasTable('leases').then(function (exists) {
  if (!exists) {
    return db.schema.createTable('leases', function (table) {
      table.string('tid').unique().notNullable()
      table.string('address').notNullable()
      table.decimal('amount', [15, 9]).notNullable()
      table.decimal('fee', [15, 9]).notNullable()
      table.integer('start').notNullable()
      table.integer('end')
      table.bigInteger('timestamp').notNullable()
      table.boolean('active').defaultTo(true)
      table.datetime('created').defaultTo(db.fn.now())
    })
  }
})

// Create 'blocks' table if it does not exist
db.schema.hasTable('blocks').then(function (exists) {
  if (!exists) {
    return db.schema.createTable('blocks', function (table) {
      table.integer('blockIndex').unique().notNullable()
      table.decimal('fee', [15, 9])
      table.bigInteger('timestamp').notNullable()
      table.boolean('verified').defaultTo(false)
      table.decimal('reward', [15, 9])
      table.boolean('paid').defaultTo(false)
      table.boolean('processed').defaultTo(false)
    })
  }
})

// Create 'rewards' table if it does not exist
db.schema.hasTable('rewards').then(function (exists) {
  if (!exists) {
    return db.schema.createTable('rewards', function (table) {
      table.uuid('id').unique().notNullable()
      table.string('lid').notNullable()
      table.uuid('pid')
      table.decimal('amount', [15, 9]).notNullable()
      table.boolean('paid').defaultTo(false)
      table.integer('blockIndex').notNullable()
      table.datetime('created').defaultTo(db.fn.now())
    })
  }
})


// Create 'payments' table if it does not exist
db.schema.hasTable('payments').then(function (exists) {
  if (!exists) {
    return db.schema.createTable('payments', function (table) {
      table.uuid('id').unique().notNullable()
      table.string('lid').notNullable()
      table.string('tid')
      table.decimal('amount', [15, 9]).notNullable()
      table.decimal('fee', [15, 9]).notNullable()
      table.boolean('confirmed').defaultTo(false)
      table.integer('blockIndex')
      table.bigInteger('timestamp').notNullable()
      table.datetime('created').defaultTo(db.fn.now())
    })
  }
})

// Create 'status' table if it does not exist
db.schema.hasTable('status').then(function (exists) {
  if (!exists) {
    return db.schema.createTable('status', function (table) {
      table.integer('scanIndex').defaultTo(process.env.BLOCKINDEX)
    })
  }
})