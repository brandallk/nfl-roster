
var PlayerController = function() {

  var loading = true; //Start the spinner

  var playerService = new PlayerService(ready);
  
  function ready() {
    loading = false; //stop the spinner
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
      var paginatedResults = paginate(searchResults, 15)
      drawSearchResults(paginatedResults, 0)
      // drawSearchResults(searchResults)

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
    var $formDiv = $('div.getRoster')
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

  // var drawSearchResults = function(players) {  
  var drawSearchResults = function(paginatedPlayers, pageNumber) {
    var players = paginatedPlayers[pageNumber]
    // figure out how to click buttons and switch to different pages of paginated results...
    
    var $rosterDiv = $('div.player-roster .list-group')
    var template = ""

    if (players.length == 0) {
      $rosterDiv.html(`<div><h1 class="text-center">Search returned no results. Try again.</h1></div>`)
    } else {
      players.forEach( player => {
        template += `
          <li class="list-group-item d-flex flex-column flex-sm-row justify-content-between align-items-center">
            <div>
              <span class="player-name h5 mr-3" style="white-space: nowrap">${player.fullname}</span>
              <span class="player-position mr-3" style="white-space: nowrap"><small>position: </small>${player.position}</span>
              <span class="player-team" style="white-space: nowrap"><small>team: </small>${player.pro_team}</span>
            </div>
            <button class="addToTeam btn btn-success px-3 mt-2" data-playerID="${player.id}">Add to Team</button>
          </li>
        `
      })
  
      $rosterDiv.html(template)

      var nextPageBtn = `<button class="get-next-page btn btn-success my-5">Next Page</button>`
      $('div.player-roster').append(nextPageBtn)
  
      $('button.addToTeam').on('click', function() {
        playerService.addToTeam($(this).attr('data-playerID'))
        drawMyTeam()
      })
    }

  }

  var drawMyTeam = function() {
    var players = playerService.getMyTeam();
    
    // var $teamDiv = $("div.my-team .card-deck")
    var $teamDiv = $("div.my-team .player-cards")

    var template = ""

    players.forEach( player => {
      if (player.photo.includes("unknown-player")) {
        player.photo = "http://s.nflcdn.com/static/content/public/image/fantasy/transparent/200x200/"
      }

      template += `
      <div class="card player-card col-12 col-sm-6 col-md-4 col-lg-3">
          <div class="card-body p-3">
              <div class="d-inline-block border border-dark">
                  <img class="card-image-top" src="${player.photo}" alt="">
                  <p class="player-name">${player.fullname}</p>
                  <p class="player-position">${player.position}</p>
                  <p class="player-team">${player.pro_team}</p>
                  <button class="removeFromTeam btn btn-danger px-3 mt-2" data-playerID="${player.id}">Remove from Team</button>
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
  playerService.loadPlayersData(ready) //call the function above every time we create a new service

}
