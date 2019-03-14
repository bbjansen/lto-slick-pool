
// Initialize Eexplorer

async function queryChain(q) {
  try {

    // Clear All
    document.getElementById('blockIndex').innerText = ''
    document.getElementById('blockTxCount').innerText = ''
    document.getElementById('blockFee').innerText = ''
    document.getElementById('blockGenerator').innerText = ''
    document.getElementById('blockSize').innerText = ''
    document.getElementById('blockReference').innerText = ''
    document.getElementById('blockSignature').innerText = ''
    document.getElementById('blockTimestamp').innerText =  ''

    blockTxTable.clearData()

    document.getElementById('txId').innerText = ''
    document.getElementById('txBlock').innerText = ''
    document.getElementById('txFee').innerText = ''
    document.getElementById('txAmount').innerText = ''
    document.getElementById('txType').innerText = ''
    document.getElementById('txSender').innerText = ''
    document.getElementById('txRecipient').innerText = ''
    document.getElementById('txSenderPublicKey').innerText = ''
    document.getElementById('txSignature').innerText = ''
    document.getElementById('txTimestamp').innerText = ''


    document.getElementById('addressRegular').innerText = 0
    document.getElementById('addressGenerating').innerText = 0
    document.getElementById('addressAvailable').innerText = 0
    document.getElementById('addressEffective').innerText = 0
    
    addressTxTable.clearData()
    addressMassTable.clearData()
    addressLeasesTable.clearData()
    addressAnchorTable.clearData()


    // Hide All
    document.getElementById('blockResult').classList.add('is-hidden')
    document.getElementById('txResult').classList.add('is-hidden')
    document.getElementById('addressResult').classList.add('is-hidden')


    // if Block
    if(Number.isInteger(+q.value)) {

      // Get Data from API
      const getBlock = await fetch(cacheip + '/block/' + q.value, {
        method: 'get'
      })
      .then((resp) => resp.json())

      const getTxns = await fetch(cacheip + '/transaction/block/' + q.value, {
        method: 'get'
      })
      .then((resp) => resp.json())

      // Populate block data
      document.getElementById('blockIndex').innerText = getBlock.blocks.index
      document.getElementById('blockTxCount').innerText = getBlock.blocks.count
      document.getElementById('blockFee').innerText = getBlock.blocks.fee
      document.getElementById('blockGenerator').innerText = getBlock.blocks.generator
      document.getElementById('blockSize').innerText = getBlock.blocks.size
      document.getElementById('blockReference').innerText = getBlock.blocks.reference
      document.getElementById('blockSignature').innerText = getBlock.blocks.signature
      document.getElementById('blockTimestamp').innerText = moment(getBlock.blocks.timestamp).format('YYYY-MM-DD HH:mm:ss')
      
      // Set transactions
      let sumTx = 0
      let sumMass = 0
      let sumStartLease = 0
      let sumEndLease = 0
      let sumAnchor = 0

      getTxns.forEach(tx => {

        if(tx.type === 4) {
          blockTxTable.addData({
            id: tx.id,
            fee: tx.fee,
            amount: tx.amount,
            sender: tx.sender,
            recipient: tx.recipient,
            timestamp: tx.timestamp
          })

          sumTx += 1
        }
        else if(tx.type === 11) {
          blockMassTable.addData({
            id: tx.id,
            fee: tx.fee,
            amount: tx.amount,
            sender: tx.sender,
            recipient: tx.recipient,
            timestamp: tx.timestamp
          })

          sumMass += 1
        }
        else if(tx.type === 8) {
          blockLeasesTable.addData({
            id: tx.id,
            fee: tx.fee,
            amount: tx.amount,
            sender: tx.sender,
            recipient: tx.recipient,
            timestamp: tx.timestamp
          })

          sumStartLease += 1
        }
        else if(tx.type === 9) {
          blockLeasesTable.addData({
            id: tx.id,
            fee: tx.fee,
            amount: tx.amount,
            sender: tx.sender,
            recipient: tx.recipient,
            timestamp: tx.timestamp
          })

          sumEndLease += 1
        }
        else if(tx.type === 15) {
          blockAnchorTable.addData({
            id: tx.id,
            fee: tx.fee,
            timestamp: tx.timestamp
          })

          sumAnchor += 1
        } 
      })


      // Update Counters
      document.getElementById('blockTxCount').innerText = sumTx
      document.getElementById('blockMassCount').innerText = sumMass
      document.getElementById('blockStartLeaseCount').innerText = sumStartLease
      document.getElementById('blockCancelLeaseCount').innerText = sumEndLease
      document.getElementById('blockAnchorCount').innerText = sumAnchor
  
      // Show 
      document.getElementById('blockResult').classList.remove('is-hidden')

    } // if address
    else if(q.value.length === 44) {

      // Get Data from API
      const getTx = await fetch(cacheip + '/transaction/' + q.value, {
        method: 'get'
      })
      .then((resp) => resp.json())

      // Insert Data
      document.getElementById('txId').innerText = getTx.id
      document.getElementById('txBlock').innerText = getTx.block
      document.getElementById('txFee').innerText = getTx.fee
      document.getElementById('txAmount').innerText = getTx.amount
      document.getElementById('txType').innerText = getTx.type
      document.getElementById('txSender').innerText = getTx.sender
      document.getElementById('txRecipient').innerText = getTx.recipient
      document.getElementById('txSenderPublicKey').innerText = getTx.senderPublicKey
      document.getElementById('txSignature').innerText = getTx.signature
      document.getElementById('txTimestamp').innerText = moment(getTx.timestamp).format('YYYY-MM-DD HH:mm:ss')
      
      // Show 
      document.getElementById('txResult').classList.remove('is-hidden')

    } // If Address
    else if(q.value.length === 35) {

      // Get data from API
      const getAddress = await fetch(cacheip + '/address/' + q.value, {
        method: 'get'
      })
      .then((resp) => resp.json())
  
      const getTxns = await fetch(cacheip + '/transaction/address/' + q.value, {
        method: 'get'
      })
      .then((resp) => resp.json())
  
  
      // Set balances
      document.getElementById('addressRegular').innerText = getAddress.regular.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
      document.getElementById('addressGenerating').innerText = getAddress.generating.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
      document.getElementById('addressAvailable').innerText = getAddress.available.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
      document.getElementById('addressEffective').innerText = getAddress.effective.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })

      // Set transactions
      let sumTx = 0
      let sumMass = 0
      let sumStartLease = 0
      let sumEndLease = 0
      let sumAnchor = 0

      getTxns.forEach(tx => {

        if(tx.type === 4) {
          addressTxTable.addData({
            id: tx.id,
            fee: tx.fee,
            amount: tx.amount,
            sender: tx.sender,
            recipient: tx.recipient,
            timestamp: tx.timestamp
          })

          sumTx += 1
        }
        else if(tx.type === 11) {
          addressMassTable.addData({
            id: tx.id,
            fee: tx.fee,
            amount: tx.amount,
            sender: tx.sender,
            recipient: tx.recipient,
            timestamp: tx.timestamp
          })

          sumMass += 1
        }
        else if(tx.type === 8) {
          addressLeasesTable.addData({
            id: tx.id,
            fee: tx.fee,
            amount: tx.amount,
            sender: tx.sender,
            recipient: tx.recipient,
            timestamp: tx.timestamp
          })

          sumStartLease += 1
        }
        else if(tx.type === 9) {
          addressLeasesTable.addData({
            id: tx.id,
            fee: tx.fee,
            amount: tx.amount,
            sender: tx.sender,
            recipient: tx.recipient,
            timestamp: tx.timestamp
          })

          sumEndLease += 1
        }
        else if(tx.type === 15) {
          addressAnchorTable.addData({
            id: tx.id,
            fee: tx.fee,
            timestamp: tx.timestamp
          })

          sumAnchor += 1
        } 
      })

      // Update Counters
      document.getElementById('addressTxCount').innerText = sumTx
      document.getElementById('addressMassCount').innerText = sumMass
      document.getElementById('addressStartLeaseCount').innerText = sumStartLease
      document.getElementById('addressCancelLeaseCount').innerText = sumEndLease
      document.getElementById('addressAnchorCount').innerText = sumAnchor
      
      // Show 
      document.getElementById('addressResult').classList.remove('is-hidden')
        
    } 


  }
  catch(err) {
    console.log(err)
  }
}

// Initiate Block Tables


const blockTxTable = new Tabulator('#blockTxTable', {
  data: [],
  layout: 'fitColumns',
  autoResize: true,
  resizableColumns: true,
  pagination: 'local',
  paginationSize: 7,
  placeholder: 'no transactions',
  initialSort: [{ column: 'timestamp', dir: 'desc' }],
  columns: [
    { title: 'ID', field: 'id', align: 'left', formatter: 'link', formatterParams: {
        url: function (row) { return 'https://explorer.lto.network/transaction/' + row._cell.value }
      }
    },
    { title: 'Fee', field: 'fee', align: 'left', formatter: function(row) {
      return row._cell.value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }},
    { title: 'Amount', field: 'amount', align: 'left', formatter: function(row) {
      return row._cell.value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }},
    { title: 'Sender', field: 'sender', align: 'left', formatter: 'link', formatterParams: {
        url: function (row) { return 'https://explorer.lto.network/address/' + row._cell.value }
      }
    },
    { title: 'Recipient', field: 'recipient', align: 'left', formatter: 'link', formatterParams: {
        url: function (row) { return 'https://explorer.lto.network/address/' + row._cell.value }
      }
    },
    { title: 'Timestamp', field: 'timestamp', align: 'center', formatter: function(row) {
        return moment(row._cell.value).fromNow()
      }
    }
  ]
})


const blockMassTable = new Tabulator('#addressMassTable', {
  data: [],
  layout: 'fitColumns',
  autoResize: true,
  resizableColumns: true,
  pagination: 'local',
  paginationSize: 7,
  placeholder: 'no transfers',
  initialSort: [{ column: 'timestamp', dir: 'desc' }],
  columns: [
    { title: 'ID', field: 'id', align: 'left', formatter: 'link', formatterParams: {
        url: function (row) { return 'https://explorer.lto.network/transaction/' + row._cell.value }
      }
    },
    { title: 'Fee', field: 'fee', align: 'left', formatter: function(row) {
      return row._cell.value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }},
    { title: 'Amount', field: 'amount', align: 'left', formatter: function(row) {
      return row._cell.value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }},
    { title: 'Sender', field: 'sender', align: 'left', formatter: 'link', formatterParams: {
        url: function (row) { return 'https://explorer.lto.network/address/' + row._cell.value }
      }
    },
    { title: 'Timestamp', field: 'timestamp', align: 'center', formatter: function(row) {
        return moment(row._cell.value).fromNow()
      }
    }
  ]
})

const blockLeasesTable = new Tabulator('#blockLeasesTable', {
  data: [],
  layout: 'fitColumns',

  autoResize: true,
  resizableColumns: true,
  pagination: 'local',
  paginationSize: 7,
  placeholder: 'no leases',
  initialSort: [{ column: 'timestamp', dir: 'desc' }],
  columns: [
    { title: 'ID', field: 'id', align: 'left', formatter: 'link', formatterParams: {
        url: function (row) { return 'https://explorer.lto.network/transaction/' + row._cell.value }
      }
    },
    { title: 'Fee', field: 'fee', align: 'left', formatter: function(row) {
      return row._cell.value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }},
    { title: 'Amount', field: 'amount', align: 'left', formatter: function(row) {
      return row._cell.value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }},
    { title: 'Sender', field: 'sender', align: 'left', formatter: 'link', formatterParams: {
        url: function (row) { return 'https://explorer.lto.network/address/' + row._cell.value }
      }
    },
    { title: 'Recipient', field: 'recipient', align: 'left', formatter: 'link', formatterParams: {
        url: function (row) { return 'https://explorer.lto.network/address/' + row._cell.value }
      }
    },
    { title: 'Timestamp', field: 'timestamp', align: 'center', formatter: function(row) {
        return moment(row._cell.value).fromNow()
      }
    }
  ]
})


const blockAnchorTable = new Tabulator('#blockAnchorTable', {
  data: [],
  layout: 'fitColumns',
  autoResize: true,
  resizableColumns: true,
  pagination: 'local',
  paginationSize: 7,
  placeholder: 'no leases',
  initialSort: [{ column: 'timestamp', dir: 'desc' }],
  columns: [
    { title: 'ID', field: 'id', align: 'left', formatter: 'link', formatterParams: {
        url: function (row) { return 'https://explorer.lto.network/transaction/' + row._cell.value }
      }
    },
    { title: 'Fee', field: 'fee', align: 'left', formatter: function(row) {
      return row._cell.value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }},
    { title: 'Timestamp', field: 'timestamp', align: 'center', formatter: function(row) {
        return moment(row._cell.value).fromNow()
      }
    }
  ]
})



// Initialize Address Tables

const addressTxTable = new Tabulator('#addressTxTable', {
  data: [],
  layout: 'fitColumns',
  autoResize: true,
  resizableColumns: true,
  pagination: 'local',
  paginationSize: 7,
  placeholder: 'no transactions',
  initialSort: [{ column: 'timestamp', dir: 'desc' }],
  columns: [
    { title: 'ID', field: 'id', align: 'left', formatter: 'link', formatterParams: {
        url: function (row) { return 'https://explorer.lto.network/transaction/' + row._cell.value }
      }
    },
    { title: 'Fee', field: 'fee', align: 'left', formatter: function(row) {
      return row._cell.value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }},
    { title: 'Amount', field: 'amount', align: 'left', formatter: function(row) {
      return row._cell.value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }},
    { title: 'Sender', field: 'sender', align: 'left', formatter: 'link', formatterParams: {
        url: function (row) { return 'https://explorer.lto.network/address/' + row._cell.value }
      }
    },
    { title: 'Recipient', field: 'recipient', align: 'left', formatter: 'link', formatterParams: {
        url: function (row) { return 'https://explorer.lto.network/address/' + row._cell.value }
      }
    },
    { title: 'Timestamp', field: 'timestamp', align: 'center', formatter: function(row) {
        return moment(row._cell.value).fromNow()
      }
    }
  ]
})

const addressMassTable = new Tabulator('#addressMassTable', {
  data: [],
  layout: 'fitColumns',
  autoResize: true,
  resizableColumns: true,
  pagination: 'local',
  paginationSize: 7,
  placeholder: 'no transfers',
  initialSort: [{ column: 'timestamp', dir: 'desc' }],
  columns: [
    { title: 'ID', field: 'id', align: 'left', formatter: 'link', formatterParams: {
        url: function (row) { return 'https://explorer.lto.network/transaction/' + row._cell.value }
      }
    },
    { title: 'Fee', field: 'fee', align: 'left', formatter: function(row) {
      return row._cell.value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }},
    { title: 'Amount', field: 'amount', align: 'left', formatter: function(row) {
      return row._cell.value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }},
    { title: 'Sender', field: 'sender', align: 'left', formatter: 'link', formatterParams: {
        url: function (row) { return 'https://explorer.lto.network/address/' + row._cell.value }
      }
    },
    { title: 'Timestamp', field: 'timestamp', align: 'center', formatter: function(row) {
        return moment(row._cell.value).fromNow()
      }
    }
  ]
})

const addressLeasesTable = new Tabulator('#addressLeasesTable', {
  data: [],
  layout: 'fitColumns',
  autoResize: true,
  resizableColumns: true,
  pagination: 'local',
  paginationSize: 7,
  placeholder: 'no leases',
  initialSort: [{ column: 'timestamp', dir: 'desc' }],
  columns: [
    { title: 'ID', field: 'id', align: 'left', formatter: 'link', formatterParams: {
        url: function (row) { return 'https://explorer.lto.network/transaction/' + row._cell.value }
      }
    },
    { title: 'Fee', field: 'fee', align: 'left', formatter: function(row) {
      return row._cell.value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }},
    { title: 'Amount', field: 'amount', align: 'left', formatter: function(row) {
      return row._cell.value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }},
    { title: 'Sender', field: 'sender', align: 'left', formatter: 'link', formatterParams: {
        url: function (row) { return 'https://explorer.lto.network/address/' + row._cell.value }
      }
    },
    { title: 'Recipient', field: 'recipient', align: 'left', formatter: 'link', formatterParams: {
        url: function (row) { return 'https://explorer.lto.network/address/' + row._cell.value }
      }
    },
    { title: 'Timestamp', field: 'timestamp', align: 'center', formatter: function(row) {
        return moment(row._cell.value).fromNow()
      }
    }
  ]
})


const addressAnchorTable = new Tabulator('#addressAnchorTable', {
  data: [],
  layout: 'fitColumns',
  autoResize: true,
  resizableColumns: true,
  pagination: 'local',
  paginationSize: 7,
  placeholder: 'no leases',
  initialSort: [{ column: 'timestamp', dir: 'desc' }],
  columns: [
    { title: 'ID', field: 'id', align: 'left', formatter: 'link', formatterParams: {
        url: function (row) { return 'https://explorer.lto.network/transaction/' + row._cell.value }
      }
    },
    { title: 'Fee', field: 'fee', align: 'left', formatter: function(row) {
      return row._cell.value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }},
    { title: 'Timestamp', field: 'timestamp', align: 'center', formatter: function(row) {
        return moment(row._cell.value).fromNow()
      }
    }
  ]
})

