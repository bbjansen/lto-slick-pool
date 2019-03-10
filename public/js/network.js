// Initialize Data

getProducers()

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



  }).catch(function(err) {
    console.log(err)
  })
}