
function PlayerService(callback) {
    var playersData = []
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
      console.log(getAvailablePositions(player))
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

    this.getMyTeam = function() {
      var filledPositions = myTeam.filter( pos => pos.player.filled)
      return JSON.parse(JSON.stringify(filledPositions))
    }

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

    this.getPlayers = function() {
      return JSON.parse(JSON.stringify(playersData))
    }
    
    this.loadPlayersData = function(callback) {
      
      //Lets check the localstorage for the data before making the call.
      //Ideally if a user has already used your site 
      //we can cut down on the load time by saving and pulling from localstorage 
      
      var localData = localStorage.getItem('playersData');
      if(localData) {
      	playersData = JSON.parse(localData);
      	return callback(); 
      	//return will short-circuit the loadPlayersData function
      	//this will prevent the code below from ever executing
      }
      
      var url = "https://bcw-getter.herokuapp.com/?url=";
      var endpointUri = "http://api.cbssports.com/fantasy/players/list?version=3.0&SPORT=football&response_format=json";
      var apiUrl = url + encodeURIComponent(endpointUri);
    
        $.getJSON(apiUrl, function(data){
          playersData = removeInvalidPositions(data.body.players);
          console.log('Player Data Ready')
          console.log('Writing Player Data to localStorage')
          localStorage.setItem('playersData', JSON.stringify(playersData))
          console.log('Finished Writing Player Data to localStorage')
          callback()
        });
    }

    var removeInvalidPositions = function(players) {
      var invalidPositions = ["", "TQB", "D", "ST", "DST"]
      return players.filter( player => {
        return !invalidPositions.includes(player.position)
      })
    }

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

} 