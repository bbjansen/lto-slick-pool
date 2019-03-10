document.addEventListener('DOMContentLoaded', () => {

  // Navbar
  const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0)

  if ($navbarBurgers.length > 0) {
    $navbarBurgers.forEach(el => {
      el.addEventListener('click', () => {
        const target = el.dataset.target
        const $target = document.getElementById(target)

        el.classList.toggle('is-active')
        $target.classList.toggle('is-active')
      })
    })
  }

  // Dropdowns
  var $dropdowns = getAll('.dropdown:not(.is-hoverable)')

  if ($dropdowns.length > 0) {
    $dropdowns.forEach(function ($el) {
      $el.addEventListener('click', function (event) {
        event.stopPropagation()
        $el.classList.toggle('is-active')
      })
    })

    document.addEventListener('click', function (event) {
      closeDropdowns()
    })
  }

  function closeDropdowns() {
    $dropdowns.forEach(function ($el) {
      $el.classList.remove('is-active')
    })
  }

  // Modals
  var rootEl = document.documentElement
  var $modals = getAll('.modal')
  var $modalButtons = getAll('.modal-button')
  var $modalCloses = getAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button')

  if ($modalButtons.length > 0) {
    $modalButtons.forEach(function($el) {
      $el.addEventListener('click', function() {
        var target = $el.dataset.target
        var $target = document.getElementById(target)

        rootEl.classList.add('is-clipped')
        $target.classList.add('is-active')
      })
    })
  }

  if ($modalCloses.length > 0) {
    $modalCloses.forEach(function($el) {
      $el.addEventListener('click', function() {
        closeModals()
      })
    })
  }

  document.addEventListener('keydown', function(event) {
    var e = event || window.event
    if (e.keyCode === 27) {
      closeModals()
    }
  })

  function closeModals() {
    rootEl.classList.remove('is-clipped')
    $modals.forEach(function($el) {
      $el.classList.remove('is-active')
    })
  }

  document.addEventListener('keydown', function (event) {
    var e = event || window.event
    if (e.keyCode === 27) {
      closeModals()
      closeDropdowns()
    }
  })

  // Functions

  function getAll(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector), 0)
  }

  function show(id) {
    document.getElementById(id).style.visibility = 'visible'
  }

  function hide(id) {
    document.getElementById(id).style.visibility = 'hidden'
  }

  function dismiss(d) {
    d.parentNode.style.display = 'none'
  }
})

const ip = 'https://lto.cloud/'
const address = document.cookie.split('=')[1]
const nodeAddress = '3JexCgRXGFUiuNoJTkkWucSumteRWdb8kKU'
const atomicNumber = 100000000

// Fetch Node Details

const balance = fetch('/api/balance').then(function(resp) { 
  return resp.json()
})

const leaser = fetch(ip + 'leasing/active/' + nodeAddress).then(function(resp) { 
  return resp.json()
})

const blocks = fetch('/api/blocks').then(function(resp) { 
  return resp.json()
})


Promise.all([balance, leaser, blocks]).then(function(data) {

  var totalUnpaid = data[0].totalUnpaid
  var totalPaid =  data[0].totalPaid

  var totalLease = data[1].length
  var totalBlocks = data[2].length

  var totalAmount = 0
  var totalAmountArray = data[1].map(function(i) {
    return i.amount / atomicNumber
  })

  for(var i in totalAmountArray) {
    totalAmount += totalAmountArray[i]
  }

  document.getElementById('totalAmountUnpaid').innerText = totalUnpaid.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  document.getElementById('totalAmountPaid').innerText = totalPaid.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  document.getElementById('totalAmount').innerText = totalAmount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  document.getElementById('totalLease').innerText = totalLease
  document.getElementById('totalBlocks').innerText = totalBlocks
  document.getElementById('blockIndex').innerText = blockIndex
})
.catch(function(err) {
  console.log(err)
})