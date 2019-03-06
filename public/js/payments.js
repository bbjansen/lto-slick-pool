// Initialize Data

getPayments()

// Get all leasers
function getPayments() {

  fetch('/api/payments/', {
    method: 'get'
  })
  .then((resp) => resp.json())
  .then(function(data) {

    // If data exists...
    if(data.length >= 1) {

      // Intialize Tabulator
      new Tabulator('#paymentHistory', {
        data:data,
        layout: 'fitColumns',
        responsiveLayout: 'hide',
        autoResize: true,
        resizableColumns: true,
        pagination: 'local',
        paginationSize: 15,
        initialSort: [{ column:'timestamp', dir: 'desc' }],
        columns: [{
            title: 'ID', field: 'tid', align: 'left', formatter: 'link', formatterParams: {
              url: function (row) {
                if(row._cell.value === null) {
                  return ''
                } else {
                  return 'https://explorer.lto.network/transactions/' + row._cell.value
                }
              },
              label: function (row) {
                if(row._cell.value === null) {
                  console.log("TESD")
                  return 'N/A'
                } else {
                  return row._cell.value
                }
              }
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
            title: 'Confirmed', field: 'confirmed', align: 'center', formatter: function (row) {
              if(row._cell.value === 1) {
                return '<div class="tag is-success is-medium" style="width:80px;">yes</div>'
              } else {
                return '<div class="tag is-warning is-medium" style="width:80px;">no</div>'
              }
            }
          },
          {
          title: 'Timestamp', field: 'timestamp', align: 'center', formatter: function(row) {
            return moment(row._cell.value).fromNow()
          }},
        ]
      })

    }

  }).catch(function(err) {
    console.log(err)
  })
}