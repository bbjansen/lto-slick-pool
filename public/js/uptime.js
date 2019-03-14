
// Generate tx chart
function getNodes(nodesTable) {


  fetch(cacheip + '/peer/all', {
    method: 'get'
  })
  .then((resp) => resp.json())
  .then(function(peers) {

    // Clear
    nodesTable.clearData()

    // Populate chart


    const mapArray = []
    peers.forEach(p => {
      
      let count = 0

      console.log(count)

      peers.forEach(pp => {
        if(p.country === pp.country) {
          count += 1
        }
      })

  
      mapArray.push([p.country, count])

    })
  

    mapArray.unshift(['Country', 'Nodes'])
    console.log(mapArray)

    google.charts.load('current', {
      'packages':['geochart'],
      'mapsApiKey': gMapsAPI
    });
    google.charts.setOnLoadCallback(drawRegionsMap)

    function drawRegionsMap() {
      var data = google.visualization.arrayToDataTable(mapArray)

      var options = {
        colorAxis: {colors: ['#8e44ad', '#7a1160', '#2a118e']},
        backgroundColor: '#f5f5f5',
        datalessRegionColor: '#fff',
        defaultColor: '#fff',
      }

      var chart = new google.visualization.GeoChart(document.getElementById('nodesChart'))

      chart.draw(data, options)
    }

    // Populate Table
    peers.forEach(p => {
      nodesTable.addData({
        node: p.peerName,
        address: p.address,
        generator: p.generator,
        country: p.country,
        version: p.version,
        public: p.public,
        uptime: p.uptime,
        updated: p.updated
      })
    })

    // Update Nodes Count
    document.getElementById('nodesCount').innerText = peers.length
  })
}

//Initialize Node Table
var nodesTable = new Tabulator('#nodesTable', {
  data: [],
  layout: 'fitColumns',
  responsiveLayout: 'hide',
  autoResize: true,
  resizableColumns: true,
  pagination: 'local',
  paginationSize: 50,
  placeholder: 'no peers available',
  initialSort: [{ column: 'uptime', dir: 'desc' }],
  columns: [
    { title: 'Node', field: 'node', align: 'left' },
    { title: 'Address', field: 'address', align: 'left' },
    { title: 'Generator', field: 'generator', align: 'left', formatter: 'link', formatter: function (row) {
        if(!row._cell.value) {
          return 'N/A'
        } else {
          return '<a href="https://explorer.lto.network/address/' + row._cell.value + '">' + row._cell.value + '</a>'
        }
      }
    },
    { title: 'Country', field: 'country', align: 'left' },
    { title: 'Version', field: 'version', align: 'left' },
    { title: 'Public', field: 'public', align: 'left', formatter: function(row) {
      if(row._cell.value === 1) {
        return 'Open'
      } else {
        return 'Closed'
      }
    }},
    { title: 'Uptime', field: 'uptime', align: 'left', formatter: function(row) {
      let res
      for (var i = 0; i < row._cell.value.length; i++) {
        if(row._cell.value[i] === '|') {
          res += '<span class="has-text-success">|</span>'
        } else {
          res += '<span class="has-text-danger">|</span>'
        }
      }
      return res.substring(9)
    }},
    { title: 'Updated', field: 'updated', align: 'left', formatter: function(row) {
      return moment(row._cell.value).fromNow()
    }}

  ]
})




// Initiate Node Chart
getNodes(nodesTable)

setInterval(function() { 
  getNodes(nodesTable)
}, 60000)


