
var PlayerController = function() {

  var loading = true; //Start the spinner
  var playerService = new PlayerService(ready);
  
  function ready() {
    loading = false; //stop the spinner

    drawTeamDropdown()
    drawPositionDropdown()

    $('button.getRoster').on('click', (evt) => {
      evt.preventDefault()

      var filtersArr = [
        {filterBy: "pro_team", value: $('select#teamName').get(0).value},
        {filterBy: "position", value: $('select#positionName').get(0).value},
        {filterBy: "name", value: $('input#playerName').get(0).value}
      ]

      drawRoster(filtersArr)

    })
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

  var drawRoster = function(filtersArr) {
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
    
    var $rosterDiv = $("div.player-roster .card-deck")
    var template = ""

    players.forEach( player => {
      template += `
        <div class="card player-card">
          <div class="card-body p-3">
              <div class="d-inline-block border border-dark">
                  <p class="player-name">${player.fullname}</p>
                  <p class="player-position">${player.position}</p>
                  <p class="player-team">${player.pro_team}</p>
                  <button class="addToTeam btn btn-success px-3 mt-2" data-playerID="${player.id}">Add to Team</button>
              </div>
            </div>
        </div>
      `
    })

    $rosterDiv.html(template)

    $('button.addToTeam').on('click', function() {
      playerService.addToTeam($(this).attr('data-playerID'))
      drawMyTeam()
    })
  }

  var drawMyTeam = function() {
    var players = playerService.getMyTeam();
    
    var $teamDiv = $("div.my-team .card-deck")

    var template = ""

    players.forEach( player => {
      template += `
        <div class="card player-card">
          <div class="card-body p-3">
              <div class="d-inline-block border border-dark">
                  <img src="${player.photo}" alt="">
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

  playerService.loadPlayersData(ready) //call the function above every time we create a new service

}
