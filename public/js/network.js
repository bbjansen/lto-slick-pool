// Get last block and insert into chart/table
function getLastBlock(blockTable, blockChart) {

  fetch(cacheip + '/block/last/', {
    method: 'get'
  })
  .then((resp) => resp.json())
  .then(function(data) {

    // If data exists and is new
    if(blockChart.data && blockChart.data.labels.slice(-1)[0] !== data[0].datetime) {
      // Update Table
      blockTable.addData({
        index: data[0].index,
        generator: data[0].generator,
        size: data[0].size,
        count: data[0].count,
        datetime: data[0].datetime,
      })
      
      // Update Chart
      blockChart.data.labels.push(data[0].datetime)
      blockChart.data.datasets[0].data.push(data[0].size)
      blockChart.data.datasets[1].data.push(data[0].count)

      blockChart.update()
    }
  })
}


// Get unconfirmed tx and insert into table
function getMempool(txTable) {

  fetch(cacheip + '/transaction/unconfirmed/', {
    method: 'get'
  })
  .then((resp) => resp.json())
  .then(function(data) {

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

    document.getElementById('mempoolCount').innerText = data.length || 0
  })
}


// Get all producers
function getProducers(nodeTable, nodeChart) {

  fetch(cacheip + '/generator/all/day', {
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
        regular: producer.regular,
        blocks: producer.blocks,
        earnings: producer.earnings,
        share: producer.share
      })

      nodeChart.data.labels.push(producer.label)
      nodeChart.data.datasets[0].data.push(producer.share)

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
const blockTable = new Tabulator('#blockTable', {
  data: [],
  layout: 'fitColumns',
  responsiveLayout: 'hide',
  autoResize: true,
  resizableColumns: true,
  pagination: 'local',
  paginationSize: 5,
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
    { title: 'Txns', field: 'count', align: 'left'},
    { title: 'Datetime', field: 'datetime', align: 'left'}
  ]
})

// Initialize Block Chart
const blockChart = new Chart('blockChart', {
  type: 'line',
  data: {
    datasets: [{
      label: 'Size',
      borderWidth: '2',
      pointRadius: '1',
      color: 'rgba(142, 68, 173, 0.9)',
      backgroundColor: 'rgba(142, 68, 173, 0.6)',
      fill: true,
      data: null
    },
    {
      label: 'Tx',
      borderWidth: '2',
      pointRadius: '1',
      color: 'rgba(40, 171, 191, 0.9)',
      backgroundColor: 'rgba(40, 171, 191, 0.6)',
      fill: false,
      data: null
    }]
  },
  options: {
    //maintainAspectRatio: false,
    responsive: true,
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
      displayColors: false,
      cornerRadius: 0,
      backgroundColor: 'rgba(255,255,255,0.9)',
      mode: 'label',
      callbacks: {
          //label: function(item, data) { 
          //    data.labels[item.index] = data.labels[item.index]                      
          //    return (data.labels[item.index] || 'Unknown')  + ': ' + data.datasets[0].data[item.index] + ' %'
          //}
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
const txTable = new Tabulator('#txTable', {
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
        url: function (row) { return 'https://explorer.lto.network/block/' + row._cell.value }
      }
    },
    { title: 'Fee', field: 'fee', align: 'left'},
    { title: 'Sender', field: 'sender', align: 'left', formatter: 'link', formatterParams: {
        url: function (row) { return 'https://explorer.lto.network/address/' + row._cell.value }
      }
    }
  ]
})

// Intialize Node Table
const nodeTable = new Tabulator('#nodeTable', {
  data: [],
  layout: 'fitColumns',
  responsiveLayout: 'hide',
  autoResize: true,
  resizableColumns: true,
  pagination: 'local',
  paginationSize: 15,
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
    { title: 'Regular', field: 'regular', align: 'left', formatter: function(row) {
      return row._cell.value.toFixed(2)
    }},
    { title: 'Blocks', field: 'blocks', align: 'left'},
    { title: 'Earnings', field: 'earnings', align: 'left'},
    { title: 'Share', field: 'share', align: 'left', formatter: function(row) {
      return row._cell.value + ' %'
    }}
  ]
})


// Initialize Node Chart
const nodeChart = new Chart('nodeChart', {
  type: 'pie',
  data: {
    datasets: [{
      data: null,
      backgroundColor: ['#3366CC','#DC3912','#FF9900','#109618','#990099','#3B3EAC','#0099C6','#DD4477','#66AA00','#B82E2E','#316395','#994499','#22AA99','#AAAA11','#6633CC','#E67300','#8B0707','#329262','#5574A6','#3B3EAC'],
      label: 'Nodes'
    }],
    labels: null
  },
  options: {
    //maintainAspectRatio: false,
    responsive: true,
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


getLastBlock(blockTable, blockChart)
getMempool(txTable)
getProducers(nodeTable, nodeChart)
