

// Get all blocks
function getProducers() {

  fetch(cacheip + '/generator/all/day', {
    method: 'get'
  })
  .then((resp) => resp.json())
  .then(function(data) {

    // If data exists...
    if(data.length >= 1) {
        // Intialize Chart
        const rows = data.map((item) => item.share)
        const labels = data.map((item) => item.label)

        const config = {
          type: 'pie',
          data: {
            datasets: [{
              data: rows,
              backgroundColor: ['#3366CC','#DC3912','#FF9900','#109618','#990099','#3B3EAC','#0099C6','#DD4477','#66AA00','#B82E2E','#316395','#994499','#22AA99','#AAAA11','#6633CC','#E67300','#8B0707','#329262','#5574A6','#3B3EAC']
            }],
            labels: labels
          },
          options: {
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
              display: false
           },
           animation: {
             duration: 1000,
             easing: 'easeOutQuint'
           }
          }
        }

        var ctx = document.getElementById('chart').getContext('2d')
        window.myPie = new Chart(ctx, config)

        // Intialize Tabulator
        new Tabulator('#blockProducers', {
          data: data,
          layout: 'fitColumns',
          responsiveLayout: 'hide',
          autoResize: true,
          resizableColumns: true,
          pagination: 'local',
          paginationSize: 15,
          initialSort: [{ column: 'share', dir: 'desc' }],
          columns: [
            { title: 'Producer', field: 'generator', align: 'left', formatter: function(row) {  
              var data = row.getData()

              var res = '<a href=' + data.url + '>' + data.label + '</a>'
              data.generator = '<a href=https://explorer.lto.network/address/' + data.generator + '>' + data.generator + '</a>'

              if(data.label !== null) {
                return res
              } else {
                return data.generator
              }
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
    }

    document.getElementById('nodeCount').innerText = data.length || 0
  }).catch(function(err) {
    console.log(err)
  })
}



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
const blockChart = new Chart.Line('blockChart', {
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

// Initialize Data
setInterval(function() { 
  getLastBlock(blockTable, blockChart)
}, 5000)

// Initialize Data
setInterval(function() { 
  getMempool(txTable)
}, 5000)

getLastBlock(blockTable, blockChart)
getMempool(txTable)
getProducers()
