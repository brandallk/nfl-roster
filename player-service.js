
function PlayerService(callback) {
    var playersData = []
    var myTeam = []

    this.addToTeam = function(playerID) {
      var player = myTeam.find( player => player.id === playerID )
      if (!myTeam.includes(player)) {
        myTeam.push(playersData.find( player => player.id === playerID ))
      }
    }

    this.removeFromTeam = function(playerID) {    
      var player = myTeam.find( player => player.id === playerID )  
      if (myTeam.includes(player)) {
        var playerIndex = myTeam.indexOf(player)
        myTeam.splice(playerIndex, 1)
      }
    }

    this.getMyTeam = function() {
      return JSON.parse(JSON.stringify(myTeam))
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
          playersData = data.body.players;
          console.log('Player Data Ready')
          console.log('Writing Player Data to localStorage')
          localStorage.setItem('playersData', JSON.stringify(playersData))
          console.log('Finished Writing Player Data to localStorage')
          callback()
        });
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
        if (!positionAbbrevs.includes(positionAbbrev) && positionAbbrev !== "") {
          positionAbbrevs.push(positionAbbrev)
        }
      })
      return positionAbbrevs
    }


} 