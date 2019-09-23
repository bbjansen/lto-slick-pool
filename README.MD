# LTO Services
Automated, trustless PoS pool for the LTO Network built on top of the LTO Chain Cache API.

## Requirements
- Node.js v8+
- [knex.js](http://knexjs.org) supported database (pg, sqlite3, mysql, mysql2, oracle, mssql)

- [LTO Chain Cache API](https://github.com/fexra/lto-chain-cache-api)

## .env example

```
APP_PORT=8011
APP_PRODUCTION=1

DB_HOST=localhost
DB_PORT=3306
DB_USER=
DB_PASS=
DB_NAME=

NODE_IP=node.lto.cloud
NODE_ADDRESS=
NODE_PASS=

CACHE_IP=api.lto.cloud

FEE=3
PAYOUT=100.00
TRANSFER_FEE=1
ATOMIC=100000000
BLOCKINDEX=48280

TWITTER_CONSUMER_KEY=
TWITTER_CONSUMER_SECRET=
TWITTER_ACCESS_TOKEN_KEY=
TWITTER_ACCESS_TOKEN_SECRET=

SEGMENT_KEY

```
