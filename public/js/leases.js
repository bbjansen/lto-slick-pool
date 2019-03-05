// Initialize Data

getLeases()

// Get all leasers
function getLeases(address) {

  fetch('/api/leases/', {
    method: 'get'
  })
  .then((resp) => resp.json())
  .then(function(data) {

    // If data exists...
    if(data.length >= 1) {

      // Intialize Tabulator
      new Tabulator('#leasesHistory', {
        data:data,
        layout: 'fitColumns',
        responsiveLayout: 'hide',
        autoResize: true,
        pagination: 'local',
        paginationSize: 15,
        initialSort: [{ column:'blockIndex', dir:'desc' }],
        columns: [
          {
            title: 'ID', field: 'tid', width: 400, align: 'left', formatter: 'link', formatterParams: {
              url: function (row) { return 'https://explorer.lto.network/transactions/' + row._cell.value }
            }
          },
          {
            title: 'Address', field: 'address', width: 300, align: 'left', formatter: 'link', formatterParams: {
              url: function (row) { return 'https://explorer.lto.network/address/' + row._cell.value }
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
    }

  }).catch(function(err) {
    console.log(err)
  })
}