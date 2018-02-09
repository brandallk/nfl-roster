
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
    
    this.getPlayersByTeam = function(teamName) {
        return playersData.filter(function(player) {
          return player.pro_team == teamName
        });
      }
    
    this.getPlayersByPosition = function(position) {
      return playersData.filter(function(player) {
        return player.position == position
      });
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

} 