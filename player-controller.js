
var PlayerController = function() {

  var loading = true; //Start the spinner
  var playerService = new PlayerService(ready);
  
  function ready() {
      loading = false; //stop the spinner
  
      //Now that all of our player data is back we can safely setup our bindings for the rest of the view.

      $('button.getRosterByTeam').on('click', (evt) => {
        evt.preventDefault()
        var $teamNameInput = $('input#teamName').get(0)
        drawRoster("team", $teamNameInput.value)
      })
  }

  var getPlayersByTeam = function(teamName) {
    return playerService.getPlayersByTeam(teamName)
  }

  var getPlayersByPosition = function(position) {
    return playerService.getPlayersByPosition(position)
  }

  var drawRoster = function(byType, itemName) {
    var players = byType == "team" ? getPlayersByTeam(itemName) : getPlayersByPosition(itemName)
    
    var $rosterDiv = $("div.player-roster .card-deck")

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
