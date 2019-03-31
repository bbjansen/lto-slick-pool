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

      https://explorer.lto.network/blocks/'

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
          {
            title: 'Block', field: 'blockIndex', align: 'center', formatter: function (row) {
              if(row.getData().paid === 1) {
                return '<div class="tag is-success is-medium tooltip is-tooltip-right" data-tooltip="Paid" style="width:80px;">' + row._cell.value + '</div>'
              } else {
                return '<div class="tag is-warning is-medium tooltip is-tooltip-right" data-tooltip="Unpaid" style="width:80px;">' + row._cell.value + '</div>'
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
          { title: 'Luck Ratio', align: 'left', formatter: function(cell, formatter) {
            let fee = cell.getData().fee
            let reward = cell.getData().reward
            let luck = (reward / fee).toFixed(1)

            if(isNaN(luck)) {
              luck = 0
            }
            else if(luck === 'Infinity') {
              luck = '&#8734;'
            }

            return luck
          }},
          {
            title: 'Maturity', field: 'verified', align: 'center', formatter: function (row) {
              let duration = moment.duration(moment().diff(moment(row.getData().timestamp))).asMinutes().toFixed(0)

              if(row._cell.value === 1) {
                return '90/90'
              } else {
                return duration + '/90'
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