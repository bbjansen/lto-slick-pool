// Get last few blocks to populate chart and table
function getLastBlocks(blockTable, blockChart) {
  fetch(cacheip + '/block/last/50', {
    method: 'get'
  })
  .then((resp) => resp.json())
  .then(function(data) {

      // Update Table
      data.forEach(block => {
        blockTable.addData({
          index: block.blocks.index,
          generator: block.blocks.generator,
          size: block.blocks.size,
          count: block.blocks.count,
          timestamp: block.blocks.timestamp
        })

        // Update Chart
        blockChart.data.labels.push(block.blocks.timestamp)
        blockChart.data.datasets[0].data.push(block.blocks.index)
        blockChart.data.datasets[1].data.push(block.blocks.size)
        blockChart.data.datasets[2].data.push(block.blocks.fee)
        blockChart.data.datasets[3].data.push(block.consensus.target)

      })

      blockChart.update()
      document.getElementById('blockCount').innerText = data[0].blocks.index
    
  })
}

// Get last block and insert into chart/table
function getLastBlock(blockTable, blockChart) {
  fetch(cacheip + '/block/last/', {
    method: 'get'
  })
  .then((resp) => resp.json())
  .then(function(data) {

    lastInsert = blockTable.rowManager.activeRows[0].data.timestamp

    // If data exists and is new
    if(blockChart.data && lastInsert !== data.blocks.timestamp) {
      // Update Table
      blockTable.addData({
        index: data.blocks.index,
        generator: data.blocks.generator,
        size: data.blocks.size,
        count: data.blocks.count,
        timestamp: data.blocks.timestamp
      })
      
      // Remove one data point
      blockChart.data.labels.pop()
      blockChart.data.datasets[0].data.pop()
      blockChart.data.datasets[1].data.pop()
      blockChart.data.datasets[2].data.pop()
      blockChart.data.datasets[3].data.pop()

      // Add new data point
      blockChart.data.labels.unshift(data.blocks.timestamp)
      blockChart.data.datasets[0].data.unshift(data.blocks.index)
      blockChart.data.datasets[1].data.unshift(data.blocks.size)
      blockChart.data.datasets[2].data.unshift(data.blocks.fee)
      blockChart.data.datasets[3].data.unshift(data.consensus.target)
    
    }
    // Update Count
    document.getElementById('blockCount').innerText = data.blocks.index
    blockChart.update()

  })
}

// Get unconfirmed tx and insert into table
function getMempool(txTable) {

  fetch(cacheip + '/transaction/unconfirmed/', {
    method: 'get'
  })
  .then((resp) => resp.json())
    .then(function(data) {

      // Put a max on it to avoid browser crash
      if(data.length >= 1 && data.length <= 1000) {
        // Clear & Update Table
        txTable.clearData()

        data.forEach(tx => {
          txTable.addData({
            id: tx.id,
            block: tx.block,
            fee: tx.fee,
            sender: tx.sender
          })
        })

        // Update Chart
        txChart.data.datasets[0].data.push(block.blocks.size)
        txChart.update()

        // Update Count
        document.getElementById('mempoolCount').innerText = data.length
      }
  })
}

// Generate tx chart
function getTxStats(txChart, range, scale) {


  fetch(cacheip + '/stats/transaction/' + range, {
    method: 'get'
  })
  .then((resp) => resp.json())
  .then(function(d) {

    // Populate Stats
    document.getElementById('txStat').innerText = d.stats.standard
    document.getElementById('massStat').innerText = d.stats.massTransactions
    document.getElementById('anchorStat').innerText = d.stats.anchor
    document.getElementById('startLeaseStat').innerText = d.stats.startLease
    document.getElementById('cancelLeaseStat').innerText = d.stats.cancelLease

    // Clear Chart
    txChart.data.datasets[0].data = null
    txChart.data.datasets[1].data = null
    txChart.data.datasets[2].data = null
    txChart.data.datasets[3].data = null
    txChart.data.datasets[4].data = null

    txChart.data.labels = []
  
    txChart.update()

    // Populate chart
    d.data.forEach(t => {
      Object.entries(t.types).forEach(tx => {
        if(+tx[0] === 4) {
          txChart.data.datasets[0].data.push(tx[1])
        }
        if(+tx[0] === 11) {
          txChart.data.datasets[1].data.push(tx[1])
        }
        else if(+tx[0] === 15) {
          txChart.data.datasets[2].data.push(tx[1])
        }
        else if(+tx[0] === 8) {
          txChart.data.datasets[3].data.push(tx[1])
        }
        else if(+tx[0] === 9) {
          txChart.data.datasets[4].data.push(tx[1])
        }
      })

      // Update Label
      txChart.data.labels.push(moment(t.period).format('YYYY-MM-DD'))
      txChart.update()
    })

    // Update Scale
    txChart.options.scales.yAxes[0].type = scale
    txChart.update()

  })
}

// Tx Chart Filter
function chartTxFilter() {

  let period = document.getElementById('txChartDateFilter').value
  let scale = document.getElementById('txChartScaleFilter').checked

  if(scale === true) {
    scale = 'logarithmic'
    document.getElementById('txChartScaleTooltip').setAttribute('data-tooltip', 'Linear')
  } else {
    scale = 'linear'
    document.getElementById('txChartScaleTooltip').setAttribute('data-tooltip', 'Log')
  }

  getTxStats(txChart, period, scale)
}

// Get all producers
function getProducers(nodeTable, nodeChart, period) {

  fetch(cacheip + '/generator/all/' + period, {
    method: 'get'
  })
  .then((resp) => resp.json())
  .then(function(data) {

    if(data.length >= 1) {
      // Clear Table and Chart
      nodeTable.clearData()
      nodeChart.data.datasets[0].data = null
      nodeChart.update()

      // Populate Table and Chart
      data.forEach(producer => {

        nodeTable.addData({
          generator: producer.generator,
          label: producer.label,
          url: producer.url,
          pool: producer.pool,
          blocks: producer.blocks,
          earnings: producer.earnings,
          share: producer.share
        })

        nodeChart.data.labels.push(producer.label)
        nodeChart.data.datasets[0].data.push(producer.share)

        //Push color
        var r = Math.random()
        var s = 180
        
        var color = 'rgba(126, 12,' +  Math.round(r*s) + ',' + r.toFixed(1) + ')'
        nodeChart.data.datasets[0].backgroundColor.push(color)
      })

      // Update Chart
      nodeChart.update()

      //Set Total Count
      document.getElementById('nodeCount').innerText = data.length || 0
    } else {
      document.getElementById('nodeCount').innerText = data.length || 0
    }
  }).catch(function(err) {
  })
}

// Producers Chart Filter
function chartProducersFilter() {
  let period = document.getElementById('producersChartDateFilter').value
  getProducers(nodeTable, nodeChart, period)
}
//Initialize Block Table
var blockTable = new Tabulator('#blockTable', {
  data: [],
  layout: 'fitColumns',
  responsiveLayout: 'hide',
  autoResize: true,
  resizableColumns: true,
  pagination: 'local',
  paginationSize: 7,
  initialSort: [{ column: 'index', dir: 'desc' }],
  columns: [
    { title: 'Block', field: 'index', align: 'left', formatter: 'link', formatterParams: {
        url: function (row) { return 'https://explorer.lto.network/block/' + row._cell.value }
      }
    },
    { title: 'Generator', field: 'generator', align: 'left', formatter: 'link', formatterParams: {
        url: function (row) { return 'https://explorer.lto.network/address/' + row._cell.value }
      }
    },
    { title: 'Size', field: 'size', align: 'left'},
    { title: 'Txns', field: 'count', align: 'left', formatter: function(row) {
      return row._cell.value.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      })
    }},
    { title: 'Timestamp', field: 'timestamp', align: 'left', formatter: function(row) {
      return moment(row._cell.value).fromNow()
    }}
  ]
})

// Initialize Block Chart
var blockChart = new Chart('blockChart', {
  type: 'bar',
  data: {
    datasets: [{
      type: 'line',
      label: 'Index',
      borderWidth: '0',
      pointRadius: '0',
      color: 'rgba(0, 0, 0, 0)',
      backgroundColor: 'rgba(0, 0, 0, 0)',
      data: null,
      hidden: true
    },{
      type: 'line',
      label: 'Size',
      borderWidth: '1',
      pointRadius: '1',
      color: 'rgba(142, 68, 173, 0.9)',
      backgroundColor: 'rgba(142, 68, 173, 0.5)',
      fill: true,
      data: []
    },
    {
      label: 'Fee',
      borderWidth: '1',
      pointRadius: '1',
      color: 'rgba(40, 171, 191, 0.7)',
      backgroundColor: 'rgba(40, 171, 191, 0.8)',
      fill: false,
      stacked: true,
      data: []
    },
    {
      label: 'Target',
      borderWidth: '1',
      pointRadius: '1',
      color: 'rgba(216, 20, 132, 0.7)',
      backgroundColor: 'rgba(216, 20, 132, 0.8)',
      fill: false,
      stacked: true,
      data: []
    }
  ]
  },
  options: {
    maintainAspectRatio: true,
    responsive: true,
    scales: {
      xAxes: [{
        id: 'x-axis',
        type: 'time',
        ticks: {
          autoSkip: true,
          display: false,
          maxRotation: 0
        },
        time: {
          unit: 'minute'
        },
        callback: function (value, chart) {
          return value
        },
        distribution: 'series',
        gridLines: {
          display: false
        }
      }],
      yAxes: [{
        id: 'y-axis-1',
        type: 'logarithmic',
        position: 'right',
        ticks: {
          display: false,
        },
        gridLines: {
          display: false,
          drawBorder: false
        }
      },
      {
        id: 'y-axis-2',
        type: 'logarithmic',
        position: 'left',
        ticks: {
          display: false,
        },
        gridLines: {
          display: false,
          drawBorder: false
        }
      }
    ]
    },
    tooltips: {
      titleFontColor: '#1f1f1f',
      titleSpacing: 5,
      titleFontSize: 17,
      titleMarginBottom: 10,
      titleFontStyle: 'bold',
      bodyFontColor: '#1f1f1f',
      bodySpacing: 7,
      bodyFontSize: 13,
      bodyFontStyle: 'normal',
      footerFontColor: '#1f1f1f',
      footerSpacing: 13,
      footerFontSize: 17,
      footerFontStyle: 'bold',
      footerMarginTop: 10,
      footerMarginBottom: 5,
      xPadding: 15,
      yPadding: 15,
      intersect: false,
      displayColors: true,
      cornerRadius: 0,
      backgroundColor: 'rgba(255,255,255,0.9)',
      mode: 'label',
      callbacks: {
          title: function(item, data) {
            return '     ' + data.datasets[0].data[item[0].index]
          },
          label: function(item, data) {
            if (item.datasetIndex === 1) {
              return data.datasets[item.datasetIndex].label + ': ' + item.yLabel
            } else if (item.datasetIndex === 2) {
              return data.datasets[item.datasetIndex].label + ': ' + item.yLabel.toFixed(2) + ' LTO'
            } else if (item.datasetIndex === 3) {
              return data.datasets[item.datasetIndex].label + ': ' + item.yLabel
            }
          },
          footer: function(item, data) {
          //  return moment(data.labels[item[0].index]).format('hh:mm:ss A')
          }
      }
    },
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        filter: function(item, chart) {
            return !item.text.includes('Index')
        }
    }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuint'
    },
    title: {
      display: true,
      text: 'LTO Network Blocks'
    }
  }
})

//Initialize Mempool Table
var txTable = new Tabulator('#txTable', {
  data: [],
  layout: 'fitColumns',
  responsiveLayout: 'hide',
  autoResize: true,
  resizableColumns: true,
  pagination: 'local',
  paginationSize: 7,
  placeholder: 'no transactions to validate',
  initialSort: [{ column: 'block', dir: 'desc' }],
  columns: [
    { title: 'ID', field: 'id', align: 'left', formatter: 'link', formatterParams: {
        url: function (row) { return 'https://explorer.lto.network/transaction/' + row._cell.value }
      }
    },
    { title: 'Block', field: 'block', align: 'left', formatter: 'link', formatterParams: {
        url: function (row) { return 'https://explorer.lto.network/block/' + row._cell.value },
      }
    },
    { title: 'Fee', field: 'fee', align: 'left', formatter: function(row) {
      return row._cell.value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }},
    { title: 'Sender', field: 'sender', align: 'left', formatter: 'link', formatterParams: {
        url: function (row) { return 'https://explorer.lto.network/address/' + row._cell.value }
      }
    }
  ]
})

// Initialize Tx Chart
var txChart = new Chart('txChart', {
  type: 'line',
  data: {
    datasets: [{
      type: 'line',
      label: 'Standard',
      borderWidth: '1',
      pointRadius: '1',
      color: 'rgba(40, 171, 191, 0.7)',
      backgroundColor: 'rgba(40, 171, 191, 0.5)',
      spanGaps: true,
      fill: true,
      data: []
    },
    {
      label: 'Mass',
      borderWidth: '1',
      pointRadius: '1',
      color: 'rgba(1, 20, 132, 0.7)',
      backgroundColor: 'rgba(1, 20, 132, 0.5)',
      spanGaps: true,
      fill: true,
      data: []
    },
    {
      label: 'Anchor',
      borderWidth: '1',
      pointRadius: '1',
      color: 'rgba(142, 68, 173, 0.7)',
      backgroundColor: 'rgba(142, 68, 173, 0.5)',
      spanGaps: true,
      fill: true,
      data: []
    },
    {
      label: 'Start Lease',
      borderWidth: '1',
      pointRadius: '1',
      color: 'rgba(116, 20, 12, 0.7)',
      backgroundColor: 'rgba(116, 20, 12, 0.5)',
      spanGaps: true,
      fill: true,
      data: []
    },
    {
      label: 'Cancel Lease',
      borderWidth: '1',
      pointRadius: '1',
      color: 'rgba(216, 20, 132, 0.7)',
      backgroundColor: 'rgba(216, 20, 132, 0.5)',
      spanGaps: true,
      fill: true,
      data: []
    } 
  ]
  },
  options: {
    spanGaps: true,
    maintainAspectRatio: true,
    responsive: true,
    scales: {
      xAxes: [{
        id: 'x-axis',
        type: 'time',
        ticks: {
          autoSkip: true,
          maxRotation: 0
        },
        time: {
          unit: 'day'
        },
        callback: function (value, chart) {
          return value
        },
        distribution: 'series',
        gridLines: {
          display: false
        }
      }],
      yAxes: [{
        id: 'y-axis',
        type: 'logarithmic',
        position: 'right',
        ticks: {
          display: false,
        },
        gridLines: {
          display: false,
          drawBorder: false
        }
      }
    ]
    },
    tooltips: {
      bodyFontColor: '#1f1f1f',
      bodySpacing: 5,
      bodyFontSize: 13,
      bodyFontStyle: 'normal',
      titleFontColor: '#1f1f1f',
      titleSpacing: 5,
      titleFontSize: 17,
      titleMarginBottom: 10,
      titleFontStyle: 'bold',
      xPadding: 15,
      yPadding: 15,
      intersect: false,
      displayColors: true,
      cornerRadius: 0,
      backgroundColor: 'rgba(255,255,255,0.9)',
      mode: 'label',
      callbacks: {
          title: function(item, data) {
            return '   ' + data.labels[item[0].index]
          }
      }
    },
    legend: {
      display: true,
      position: 'bottom'
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuint'
    },
    title: {
      display: true,
      text: 'LTO Network Transactions'
    }
  }
})



// Intialize Node Table
var nodeTable = new Tabulator('#nodeTable', {
  data: [],
  layout: 'fitColumns',
  responsiveLayout: 'hide',
  autoResize: true,
  resizableColumns: true,
  pagination: 'local',
  paginationSize: 10,
  initialSort: [{ column: 'blocks', dir: 'desc' }],
  columns: [
    { title: 'Producer', field: 'generator', align: 'left', formatter: function(row, formatterParams) {
      if(row.getData().label) {
        var res = '<a href="https://explorer.lto.network/address/' + row.getValue() + '">' + row.getData().label + '</a>'
      } else {
        var res = '<a href="https://explorer.lto.network/address/' + row.getValue() + '">' + row.getValue() + '</a>'
      }

      return res || row.getValue()
    }},
    { title: 'Pool Amount', field: 'pool', align: 'left', formatter: function(row) {
      return row._cell.value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }},
    { title: 'Blocks', field: 'blocks', align: 'left', formatter: function(row) {
      return row._cell.value.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      })
    }},
    { title: 'Earnings', field: 'earnings', align: 'left', formatter: function(row) {
      return row._cell.value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }},
    { title: 'Share', field: 'share', align: 'left', formatter: function(row) {
      return row._cell.value + '%'
    }}
  ]
})

var nodeChart = new Chart('nodeChart', {
  type: 'doughnut',
  data: {
    datasets: [{
      data: [],
      backgroundColor: [],
      label: 'Nodes'
    }],
    labels: []
  },
  options: {
    maintainAspectRatio: true,
    responsive: true,
    tooltips: {
      bodyFontColor: '#1f1f1f',
      bodySpacing: 5,
      bodyFontSize: 15,
      bodyFontStyle: 'normal',
      titleFontColor: '#1f1f1f',
      titleSpacing: 5,
      titleFontSize: 17,
      titleMarginBottom: 10,
      titleFontStyle: 'bold',
      xPadding: 15,
      yPadding: 15,
      intersect: false,
      displayColors: false,
      cornerRadius: 0,
      backgroundColor: 'rgba(255,255,255,0.9)',
      mode: 'label',
      callbacks: {
        label: function(item, data) { 
            data.labels[item.index] = data.labels[item.index]                      
            return (data.labels[item.index] || 'Unknown')  + ': ' + data.datasets[0].data[item.index] + ' %'
        }
      }
    },
    legend: {
      display: false,
      position: 'bottom'
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuint'
    }
  }
})



// Initiate Blocks
getLastBlocks(blockTable, blockChart)

setInterval(function() { 
  getLastBlock(blockTable, blockChart)
}, 7000)


// Initiate Mempool
getMempool(txTable)

setInterval(function() { 
  getMempool(txTable)
}, 5000)


// Initiate TX Chart
getTxStats(txChart, 'week', 'logarithmic')

setInterval(function() { 
  chartTxFilter()
}, 60000)




// Initiate Producers
getProducers(nodeTable, nodeChart, 'week')

setInterval(function() { 
  chartProducersFilter()
}, 60000)


// FullScreen
  function fullScreen(elem) {  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) { 
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { 
    elem.msRequestFullscreen();
  }
} 
