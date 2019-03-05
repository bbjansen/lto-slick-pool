// Initialize Data
if(address) {
  getStats(address)
} else {
  document.getElementById('stats').classList.add('is-hidden')
}

// Get Homepage Stats
function getStats(address) {
  document.getElementById('stats').classList.add('is-hidden')

  fetch('/api/lease/' + address, {
    method: 'get'
  })
  .then((resp) => resp.json())
  .then(function(data) {

    // Set payment stats
    document.getElementById('totalPaid').innerText = data.stats.paid.toFixed(2) + ' LTO'
    document.getElementById('totalUnpaid').innerText = data.stats.unpaid.toFixed(2) + ' LTO'

    // If table data exists...
    if(data.leases.length >= 1 || data.payments.length >= 1) {
      
      document.getElementById('stats').classList.remove('is-hidden')

      // Intialize Tabulator
      new Tabulator('#statsLeases', {
        data:data.leases,
        layout: 'fitColumns',
        responsiveLayout: 'hide',
        autoResize: true,
        pagination: 'local',
        paginationSize: 10,
        initialSort: [{ column:'timestamp', dir:'desc' }],
        columns: [{
            title: 'ID', field: 'tid', width: 400, align: 'left', formatter: 'link', formatterParams: {
              url: function (row) { return 'https://explorer.lto.network/transactions/' + row._cell.value }
            }
          },
          { title: 'Amount', field: 'amount', align: 'left', formatter: function(row) {
            return row._cell.value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })
          }},
          { title: 'Fee', field: 'fee', align: 'left', formatter: function(row) {
            return row._cell.value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })
          }},
          { title: 'Block', field: 'start', align: 'left' },
          {
            title: 'Status', field: 'active', align: 'center', formatter: function (row) {
              if(row._cell.value === 1) {
                return '<div class="tag is-success is-medium" style="width:80px;">active</div>'
              } else {
                return '<div class="tag is-warning is-medium" style="width:80px;">canceled</div>'
              }
            }
          },
          { title: 'Timestamp', field: 'timestamp', align: 'right', formatter: function(row) {
            return row._cell.value.toLocaleString()
          }},
        ]
      })

      new Tabulator('#statsPayments', {
        data:data.payments,
        layout: 'fitColumns',
        responsiveLayout: 'hide',
        autoResize: true,
        pagination: 'local',
        paginationSize: 10,
        initialSort: [{ column:'id', dir: 'desc' }],
        columns: [{
            title: 'ID', field: 'id', width: 350, align: 'left' },
          {
            title: 'ID', field: 'tid', width: 400, align: 'left', formatter: 'link', formatterParams: {
              url: function (row) { return 'https://explorer.lto.network/transactions/' + row._cell.value }
            }
          },
          { title: 'Amount', field: 'amount', align: 'left', formatter: function(row) {
            return row._cell.value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })
          }},
          { title: 'Block', field: 'blockIndex', align: 'left' },
          { title: 'Timestamp', field: 'timestamp', align: 'right', formatter: function(row) {
            return row._cell.value.toLocaleString()
          }},
        ]
      })
    }

    //Set Cookie
    document.cookie = 'address=' + address

  }).catch(function(err) {
    document.getElementById('stats').classList.add('is-hidden')
  })
}