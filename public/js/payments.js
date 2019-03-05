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
        pagination: 'local',
        paginationSize: 15,
        initialSort: [{ column:'blockIndex', dir: 'desc' }],
        columns: [{
            title: 'ID', field: 'id', width: 300, align: 'left' },
          {
            title: 'ID', field: 'tid', width: 400, align: 'left', formatter: 'link', formatterParams: {
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
          { title: 'Block', field: 'blockIndex', align: 'left' },
          {
            title: 'Paid', field: 'paid', align: 'center', formatter: function (row) {
              if(row._cell.value === 1) {
                return '<div class="tag is-success is-medium" style="width:80px;">paid</div>'
              } else {
                return '<div class="tag is-warning is-medium" style="width:80px;">unpaid</div>'
              }
            }
          },
          {
          title: 'Timestamp', field: 'timestamp', align: 'right', formatter: function(row) {
            return row._cell.value.toLocaleString()
          }},
        ]
      })

    }

  }).catch(function(err) {
    console.log(err)
  })
}