
var PlayerController = function() {

  var playerService = new PlayerService(ready);
  
  function ready() {
    cancelLoadingAnimation()
    drawTeamDropdown()
    drawPositionDropdown()

    $('button.getRoster').on('click', (evt) => {
      evt.preventDefault()

      var filtersArr = [
        {filterBy: "pro_team", value: $('select#teamName').get(0).value},
        {filterBy: "position", value: $('select#positionName').get(0).value},
        {filterBy: "name", value: $('input#playerName').get(0).value}
      ]

      var searchResults = searchPlayers(filtersArr)
      var paginatedResults = paginate(searchResults, 6)
      drawSearchResults(paginatedResults, 0)

    })
  }

  var paginate = function(players, paginationLength) {
    var paginatedPlayers = []
    for (var i = 1; i < players.length/paginationLength; i++) {
      paginatedPlayers.unshift(players.slice( ((i-1) * paginationLength), (i * paginationLength) ) )
    }
    return paginatedPlayers
  }

  var drawLoadingAnimation = function() {
    var $formDiv = $('div.get-roster')
    var newDiv = `
      <div class="loading-spinner-backdrop bg-light d-flex justify-content-center align-items-center">
        <i class="loading-spinner spinning fas fa-spinner fa-4x"></i>
      </div>
    `
    $formDiv.append(newDiv)
  }

  var cancelLoadingAnimation = function() {
    $spinnerDiv = $('div.loading-spinner-backdrop')
    $spinnerDiv.remove()
  }

  var drawTeamDropdown = function() {
    var teamAbbreviations = playerService.getTeamAbbreviations()
    var selectBox = $('select#teamName')
    var template = `<option value="">choose</option>`
    
    teamAbbreviations.forEach( abbreviation => {
      template += `<option value="${abbreviation}">${abbreviation}</option>`
    })
    selectBox.html(template)
  }

  var drawPositionDropdown = function() {
    var positionAbbreviations = playerService.getPositionAbbreviations()
    var selectBox = $('select#positionName')
    var template = `<option value="">choose</option>`
    
    positionAbbreviations.forEach( abbreviation => {
      template += `<option value="${abbreviation}">${abbreviation}</option>`
    })
    selectBox.html(template)
  }

  var searchPlayers = function(filtersArr) {
    var players = playerService.getPlayers()
    filtersArr = filtersArr.filter( filterType => filterType.value)

    filtersArr.forEach( filterType => {
      if (filterType.filterBy !== "name") {
        players = players.filter( player => {
          return player[filterType.filterBy] === filterType.value
        })
      } else {
        players = players.filter( player => {
          var match = player.fullname.toLowerCase().includes(filterType.value.toLowerCase()) ||
                      player.firstname.toLowerCase().includes(filterType.value.toLowerCase()) ||
                      player.lastname.toLowerCase().includes(filterType.value.toLowerCase());
          return match
        })
      }
    })
    return players
  }

  var drawSearchResults = function(paginatedPlayers, pageNumber) {
    var players = paginatedPlayers[pageNumber]
    
    var $rosterDiv = $('div.player-roster .list-group')
    $('div.pagination-buttons').remove()
    var template = ""

    if (!players || players.length === 0) {
      $rosterDiv.html(`<div class="bg-danger rounded py-3"><h1 class="text-center text-light">Search returned no results. Try again.</h1></div>`)
    } else {
      players.forEach( player => {
        template += `
          <li class="list-group-item d-flex flex-column flex-sm-row justify-content-between align-items-center">
            <div>
              <span class="player-name h5 mr-3" style="white-space: nowrap">${player.fullname}</span>
              <span class="player-position mr-3" style="white-space: nowrap"><small>position: </small>${player.position}</span>
              <span class="player-team" style="white-space: nowrap"><small>team: </small>${player.pro_team}</span>
            </div>
            <button class="addToTeam btn btn-primary px-3 mt-2" data-playerID="${player.id}">Add to Team</button>
          </li>
        `
      })  
      $rosterDiv.html(template)
  
      $('button.addToTeam').on('click', function() {
        playerService.addToTeam($(this).attr('data-playerID'))
        drawMyTeam()
      })
      
      var nextPageBtnDiv = `<div class="pagination-buttons text-center"></div>`
      $('div.player-roster').append(nextPageBtnDiv)

      if (paginatedPlayers[pageNumber + 1]) {
        var prevPageBtn = `<button class="get-next-page btn btn-primary my-5">Next &#9654;</button>`
        $('div.pagination-buttons').prepend(prevPageBtn)
      }
      if (paginatedPlayers[pageNumber - 1]) {
        var prevPageBtn = `<button class="get-prev-page btn btn-primary my-5 mr-4">&#9664; Back</button>`
        $('div.pagination-buttons').prepend(prevPageBtn)
      }
  
      $('button.get-next-page').on('click', function() {
        drawSearchResults(paginatedPlayers, pageNumber + 1)
      })

      $('button.get-prev-page').on('click', function() {
        drawSearchResults(paginatedPlayers, pageNumber - 1)
      })
    }
  }

  var drawMyTeam = function() {
    var teamMembers = playerService.getMyTeam();
    var $teamDiv = $("div.my-team .player-cards")
    var template = ""

    if (teamMembers.length) {
      $('div.my-team h2').removeClass('hidden')
    } else {
      $('div.my-team h2').addClass('hidden')
    }

    teamMembers.forEach( member => {
      if (member.player.photo.includes("unknown-player")) {
        member.player.photo = "http://s.nflcdn.com/static/content/public/image/fantasy/transparent/200x200/"
      }
      template += `
      <div class="card player-card col-12 col-sm-6 col-md-4 col-lg-3 text-light">
          <div class="card-body p-3">
              <div class="d-inline-block border border-light rounded">
                  <img class="card-image-top" src="${member.player.photo}" alt="">
                  <p class="player-name"><strong>${member.player.fullname}</strong></p>
                  <p class="player-position"><small>${member.player.position}</small></p>
                  <p class="player-team"><small>${member.player.pro_team}</small></p>
                  <button class="removeFromTeam btn btn-danger px-3" data-playerID="${member.player.id}">Remove</button>
              </div>
            </div>
        </div>
      `
    })
    $teamDiv.html(template)
    $('button.removeFromTeam').on('click', function() {
      playerService.removeFromTeam($(this).attr('data-playerID'))
      drawMyTeam()
    })
  }

  drawLoadingAnimation()
  playerService.setMyTeam(drawMyTeam)
  playerService.loadPlayersData(ready) //call the function above every time we create a new service

}
