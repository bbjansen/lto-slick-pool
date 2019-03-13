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
        resizableColumns: true,
        pagination: 'local',
        paginationSize: 15,
        initialSort: [{ column:'blockIndex', dir:'desc' }],
        columns: [
          {
            title: 'ID', field: 'tid', align: 'left', formatter: 'link', formatterParams: {
              url: function (row) { return 'https://explorer.lto.network/transactions/' + row._cell.value }
            }
          },
          {
            title: 'Address', field: 'address', align: 'left', formatter: 'link', formatterParams: {
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
          {
            title: 'Block', field: 'start', align: 'left', formatter: 'link', formatterParams: {
              url: function (row) { return 'https://explorer.lto.network/block/' + row._cell.value }
            }
          },
          {
            title: 'Status', field: 'active', align: 'center', formatter: function (row) {
              if(row._cell.value === 1) {
                return '<div class="tag is-success is-medium" style="width:80px;">active</div>'
              } else {
                return '<div class="tag is-warning is-medium" style="width:80px;">canceled</div>'
              }
            }
          },
          { title: 'Timestamp', field: 'timestamp', align: 'center', formatter: function(row) {
            return moment(row._cell.value).fromNow()
          }},
        ]
      })
    }

  }).catch(function(err) {
    console.log(err)
  })
}