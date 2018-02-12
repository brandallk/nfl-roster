
function PlayerService(callback) {

  // Stores the NFL players data retrieved from the CBS Sports API
  var playersData = []

  // Stores a copy of the user's assembled fantasy-football team roster.
  // Following guidelines from games.espn.com for a starting roster, the team can include 1 QB, 2 RB, 1 Flex
  // (which is RB, WR, or TE), 2 WR, 1 TE, 1 K, and 3 "D" positions (which are LB, DL, or DB)
  var myTeam =
  [
    {position: "QB", player: {filled: false}},
    {position: "RB", player: {filled: false}},
    {position: "RB", player: {filled: false}},
    {position: "Flex", player: {filled: false}},
    {position: "WR", player: {filled: false}},
    {position: "WR", player: {filled: false}},
    {position: "TE", player: {filled: false}},
    {position: "K", player: {filled: false}},
    {position: "D", player: {filled: false}},
    {position: "D", player: {filled: false}},
    {position: "D", player: {filled: false}}
  ]
  
  // Check for an available position (by position type, following the rules outlined above) in the myTeam array,
  // and add a player to that position if it's available. If a position is filled, return TRUE.
  function addTeamPosition(player) {
    function getAvailablePositions(player) {
      return myTeam.filter( pos => {
        if (['RB', 'WR', 'TE'].includes(player.position)) {
          return pos.position === "Flex" && !pos.player.filled ||
                 pos.position === player.position && !pos.player.filled
        }
        if (['LB', 'DL', 'DB'].includes(player.position)) {
          return pos.position === "D" && !pos.player.filled
        }
        return pos.position === player.position && !pos.player.filled
      })
    }

    function addToPosition(position) {
      var teamPosition = myTeam.find( pos => pos.position === position && !pos.player.filled )
      teamPosition.player = player
      teamPosition.player.filled = true
    }
    
    if (getAvailablePositions(player).length > 0) {
      if (['LB', 'DL', 'DB'].includes(player.position)) {
        if (getAvailablePositions(player).find( pos => pos.position === 'D' )) {
          addToPosition('D')
          return true
        }
      } else if (['RB', 'WR', 'TE'].includes(player.position) && getAvailablePositions(player).find( pos => pos.position === 'Flex' )) {
        addToPosition('Flex')
        return true
      } else if (getAvailablePositions(player).find( pos => pos.position === player.position )) {
        addToPosition(player.position)
        return true
      }
    }
  }

  // Filter empty or contrived player "positions" from player data (i.e. from the CBS Sports players data)
  function removeInvalidPositions(players) {
    var invalidPositions = ["", "TQB", "D", "ST", "DST"]
    return players.filter( player => {
      return !invalidPositions.includes(player.position)
    })
  }

  // Get a list of all team abbreviations represented in the players data
  this.getTeamAbbreviations = function() {
    var teamAbbrevs = []
    playersData.forEach( player => {
      var teamAbbrev = player.pro_team
      if (!teamAbbrevs.includes(teamAbbrev)) {
        teamAbbrevs.push(teamAbbrev)
      }
    })
    return teamAbbrevs
  }

  // Get a list of all player-position abbreviations (minus "invalid" ones) in the players data
  this.getPositionAbbreviations = function() {
    var positionAbbrevs = []
    playersData.forEach( player => {
      var positionAbbrev = player.position
      if (!positionAbbrevs.includes(positionAbbrev)) {
        positionAbbrevs.push(positionAbbrev)
      }
    })
    return positionAbbrevs
  }

  // Attempt to add a player with a given ID to the myTeam array (via the addTeamPosition function).
  // If a player is successfully added, POST a request to this app's Node/Express server to also add
  // the player to the 'team' table in the SQLite db.
  this.addToTeam = function(playerID) {
    var player = playersData.find( player => player.id === playerID )

    if (addTeamPosition(player)) {
      var playerData = {
        apiID: player.id,
        fullname: player.fullname,
        firstname: player.firstname,
        lastname: player.lastname,
        position: player.position,
        pro_team: player.pro_team,
        photo: player.photo
      }

      $.ajax({
        url: '/team', 
        type: 'POST', 
        contentType: 'application/json', 
        data: JSON.stringify(playerData),
        success: function(response) {
          console.log( 'Data loaded: ' + response )
        },
        error: function(jqXHR, textStatus, errorThrown) {
          console.log( textStatus + ', ' + errorThrown, jqXHR.responseText )
        }
      })
    }
  }

  // Find a player in the myTeam array by player ID and, if found, delete it. Also send a DELETE request
  // to this app's Node/Express server to delete the corresponding player from the SQLite 'team' table
  this.removeFromTeam = function(playerID) {
    var position = myTeam.find( pos => pos.player.id == playerID)
    if (myTeam.includes(position)) {
      $.ajax({
        url: '/team/' + position.player.id,
        type: 'DELETE',
        success: function(response) {
          console.log( 'Data deleted: ' + response )
        }
      })
      position.player = {filled: false}
    }
  }

  // Send a GET request to this app's Node/Express server to get a list of all players in the SQLite 'team'
  // table, then call the given callback function
  this.setMyTeam = function(callback) {
    $.ajax({
      url: '/team',
      type: 'GET',
      success: function(storedPlayers) {
        console.log( 'Data received: ', storedPlayers )
        storedPlayers.forEach( player => {
          player.id = player.apiID
          addTeamPosition(player)
        })
        callback()
      }
    })
  }

  // Get a copy of the myTeam array, filtered to include no empty positions
  this.getMyTeam = function() {
    var filledPositions = myTeam.filter( pos => pos.player.filled)
    return JSON.parse(JSON.stringify(filledPositions))
  }

  // Get a copy of the NFL players data retrieved from the CBS Sports API
  this.getPlayers = function() {
    return JSON.parse(JSON.stringify(playersData))
  }
  
  // Fetch the NFL players data from the CBS Sports API (via a Boise CodeWorks app on Heroku) and
  // store a copy in the browser's localStorage. If a copy is already available in localStorage, fetch
  // the data from there rather than make an AJAX request to the CBS API. Finally, call the given callback function.
  this.loadPlayersData = function(callback) {
    var localData = localStorage.getItem('playersData');

    if(localData) {
      playersData = JSON.parse(localData);
      return callback();
    }
    
    var url = "https://bcw-getter.herokuapp.com/?url=";
    var endpointUri = "http://api.cbssports.com/fantasy/players/list?version=3.0&SPORT=football&response_format=json";
    var apiUrl = url + encodeURIComponent(endpointUri);
  
    $.getJSON(apiUrl, function(data){
      playersData = removeInvalidPositions(data.body.players)
      localStorage.setItem('playersData', JSON.stringify(playersData))
      callback()
    })
  }

} 