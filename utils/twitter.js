// Copyright (c) 2018-2022, BB. Jansen
//
// Please see the included LICENSE file for more information.
'use strict'

const Twitter = require('twitter')

const twitter = module.exports = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
})

module.exports = twitter
