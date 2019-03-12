// Get stats

// Get unconfirmed tx and insert into table
function getStats() {

  fetch(cacheip + '/stats/', {
    method: 'get'
  })
  .then((resp) => resp.json())
    .then(function(data) {
      console.log(data)
  })
}


// Get last few blocks to populate chart and table
function getLastBlocks(blockTable, blockChart) {
  fetch(cacheip + '/block/last/10', {
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
        blockChart.data.datasets[0].data.push(block.blocks.size)
        blockChart.data.datasets[1].data.push(block.blocks.fee)
        blockChart.data.datasets[2].data.push(block.consensus.target)
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
      
      // Update Chart
      blockChart.data.labels.unshift(data.blocks.timestamp)
      blockChart.data.datasets[0].data.unshift(data.blocks.size)
      blockChart.data.datasets[1].data.unshift(data.blocks.fee)
      blockChart.data.datasets[2].data.unshift(data.consensus.target)
    
    }
    // Update Count
    document.getElementById('blockCount').innerText = data.blocks.index
    blockChart.update()

  })
}

// Get unconfirmed tx and insert into table
function getMempool(txTable, txChart) {

  fetch(cacheip + '/transaction/unconfirmed/', {
    method: 'get'
  })
  .then((resp) => resp.json())
    .then(function(data) {

      if(data.length >= 1) {
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

        document.getElementById('mempoolCount').innerText = data.length
      }
  })
}


// Get all producers
function getProducers(nodeTable, nodeChart) {

  fetch(cacheip + '/generator/all/week', {
    method: 'get'
  })
  .then((resp) => resp.json())
  .then(function(data) {

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
  }).catch(function(err) {
    console.log(err)
  })
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
      label: 'Size',
      borderWidth: '3',
      pointRadius: '3',
      color: 'rgba(142, 68, 173, 0.9)',
      backgroundColor: 'rgba(142, 68, 173, 0.5)',
      fill: true,
      data: []
    },
    {
      label: 'Fee',
      borderWidth: '3',
      pointRadius: '3',
      color: 'rgba(40, 171, 191, 0.7)',
      backgroundColor: 'rgba(40, 171, 191, 1)',
      fill: false,
      stacked: true,
      data: []
    },
    {
      label: 'Target',
      borderWidth: '3',
      pointRadius: '3',
      color: 'rgba(216, 20, 132, 0.7)',
      backgroundColor: 'rgba(216, 20, 132, 1)',
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
            return moment(data.labels[item[0].index]).format('hh:mm:ss A')
          },
          label: function(item, data) {
            if (item.datasetIndex === 0) {
              return data.datasets[item.datasetIndex].label + ': ' + item.yLabel
            } else if (item.datasetIndex === 1) {
              return data.datasets[item.datasetIndex].label + ': ' + item.yLabel.toFixed(2) + ' LTO'
            } else if (item.datasetIndex === 2) {
              return data.datasets[item.datasetIndex].label + ': ' + item.yLabel
            }
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
  paginationSize: 10,
  initialSort: [{ column: 'block', dir: 'desc' }],
  columns: [
    { title: 'ID', field: 'id', align: 'left', formatter: 'link', formatterParams: {
        url: function (row) { return 'https://explorer.lto.network/transaction/' + row._cell.value }
      }
    },
    { title: 'Block', field: 'block', align: 'left', formatter: 'link', formatterParams: {
        url: function (row) { return 'https://explorer.lto.network/block/' + row._cell.value.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        })
      },
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
        var res = '<a href="' + row.getData().url + '">' + row.getData().label + '</a>'
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
  type: 'pie',
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



// Initialize Data
setInterval(function() { 
  getLastBlock(blockTable, blockChart)
}, 7000)

setInterval(function() { 
  getMempool(txTable)
}, 5000)


setInterval(function() { 
  getProducers(nodeTable, nodeChart)
}, 60000)


//getStats()
getLastBlocks(blockTable, blockChart)
getMempool(txTable)
getProducers(nodeTable, nodeChart)

