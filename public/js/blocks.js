// Initialize Data

getBlocks()

// Get all blocks
function getBlocks() {

  fetch('/api/blocks/', {
    method: 'get'
  })
  .then((resp) => resp.json())
  .then(function(data) {

    // If data exists...
    if(data.length >= 1) {

      // Intialize Tabulator
      new Tabulator('#producedBlocks', {
        data:data,
        layout: 'fitColumns',
        responsiveLayout: 'hide',
        autoResize: true,
        resizableColumns:true,
        pagination: 'local',
        paginationSize: 15,
        initialSort: [{ column:'blockIndex', dir:'desc' }],
        columns: [
          { title: 'Block', field: 'blockIndex', align: 'left', formatter: 'link', formatterParams: {
                url: function (row) { return 'https://explorer.lto.network/blocks/' + row._cell.value
              }
            }
          },
          { title: 'Fee', field: 'fee', align: 'left', formatter: function(row) {
            return row._cell.value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })
          }},
          { title: 'Reward', field: 'reward', align: 'left', formatter: function(row) {
              return row._cell.value.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })
          }},
          {
            title: 'Verified', field: 'verified', align: 'center', formatter: function (row) {
              if(row._cell.value === 1) {
                return '<div class="tag is-success is-medium" style="width:80px;">verified</div>'
              } else {
                return '<div class="tag is-warning is-medium" style="width:80px;">unverified</div>'
              }
            }
          },
          {
            title: 'Paid', field: 'paid', align: 'center', formatter: function (row) {
              if(row._cell.value === 1) {
                return '<div class="tag is-success is-medium" style="width:80px;">paid</div>'
              } else {
                return '<div class="tag is-warning is-medium" style="width:80px;">unpaid</div>'
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