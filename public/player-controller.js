
var PlayerController = function() {

  // Instantiate the PlayerService module
  var playerService = new PlayerService(ready);

  
  // A callback function that is called once NFL players data from the CBS Sports API is available
  function ready() {
    // Stop the 'loading spinner' animation
    cancelLoadingAnimation()

    // Fill player search-form 'dropdown' <select> elements with options from the loaded players data
    // and draw them in the DOM
    drawTeamDropdown()
    drawPositionDropdown()

    // Assign a click-event listener to the search-form submit button
    $('button.getRoster').on('click', (evt) => {
      evt.preventDefault() // prevent form submission from re-loading the HTML page

      // Get a list of the search terms a user has entered into the search-form's input fields
      var filtersArr = [
        {filterBy: "pro_team", value: $('select#teamName').get(0).value},
        {filterBy: "position", value: $('select#positionName').get(0).value},
        {filterBy: "name", value: $('input#playerName').get(0).value}
      ]

      // Search the players data for players matching the form's input search terms
      var searchResults = searchPlayers(filtersArr)

      // Split up the raw results into a nested array with elements containing no more than 6 players each
      var paginatedResults = paginate(searchResults, 6)

      // Display the paginated search results in the DOM
      drawSearchResults(paginatedResults, 0)

    })
  }


  // Display a 'loading spinner' that can hide the search form until NFL players data is available
  function drawLoadingAnimation() {
    var $formDiv = $('div.get-roster')
    var newDiv = `
      <div class="loading-spinner-backdrop bg-light d-flex justify-content-center align-items-center">
        <i class="loading-spinner spinning fas fa-spinner fa-4x"></i>
      </div>
    `
    $formDiv.append(newDiv)
  }


  // Stop the 'loading spinner' animation
  function cancelLoadingAnimation() {
    $spinnerDiv = $('div.loading-spinner-backdrop')
    $spinnerDiv.remove()
  }


  // Fill search-form team 'dropdown' <select> element with options from the loaded players data
  // and draw it in the DOM
  function drawTeamDropdown() {
    var teamAbbreviations = playerService.getTeamAbbreviations()
    var selectBox = $('select#teamName')
    var template = `<option value="">choose</option>`
    
    teamAbbreviations.forEach( abbreviation => {
      template += `<option value="${abbreviation}">${abbreviation}</option>`
    })
    selectBox.html(template)
  }


  // Fill search-form position 'dropdown' <select> element with options from the loaded players data
  // and draw it in the DOM
  function drawPositionDropdown() {
    var positionAbbreviations = playerService.getPositionAbbreviations()
    var selectBox = $('select#positionName')
    var template = `<option value="">choose</option>`
    
    positionAbbreviations.forEach( abbreviation => {
      template += `<option value="${abbreviation}">${abbreviation}</option>`
    })
    selectBox.html(template)
  }


  // Split up a players array into a nested array with elements containing no more than a given number of players each
  function paginate(players, paginationLength) {
    var paginatedPlayers = []
    var numberOfPages = Math.ceil(players.length/paginationLength)
    for (var i = 1; i <= numberOfPages; i++) {
      paginatedPlayers.unshift(players.slice( ((i-1) * paginationLength), (i * paginationLength) ) )
    }
    return paginatedPlayers
  }


  // Search the players data for players matching the form's input search terms
  function searchPlayers(filtersArr) {
    var players = playerService.getPlayers()
    filtersArr = filtersArr.filter( filterType => filterType.value)

    // Progressively filter through the data by each seach term provided
    filtersArr.forEach( filterType => {
      if (filterType.filterBy !== "name") {
        players = players.filter( player => {
          return player[filterType.filterBy] === filterType.value
        })
      } else {
        players = players.filter( player => {
          // Allow player-name searches to be case-insensitive by fullnam, firstname, lastname, or word fragment
          var match = player.fullname.toLowerCase().includes(filterType.value.toLowerCase()) ||
                      player.firstname.toLowerCase().includes(filterType.value.toLowerCase()) ||
                      player.lastname.toLowerCase().includes(filterType.value.toLowerCase());
          return match
        })
      }
    })
    return players
  }


  // Display paginated search results in the DOM: Display only the given "page" of paginated results
  function drawSearchResults(paginatedPlayers, pageNumber) {
    var players = paginatedPlayers[pageNumber]
    
    // The parent DOM element in which results are displayed
    var $rosterDiv = $('div.player-roster .list-group')

    // Erase any "back" or "next" pagination buttons that were drawn the last time this function was called
    $('div.pagination-buttons').remove()

    var template = ""

    if (!players || players.length === 0) {
      // If the search returned no results, display a message to the user
      $rosterDiv.html(`<div class="bg-danger rounded py-3"><h1 class="text-center text-light">Search returned no results. Try again.</h1></div>`)
    } else {
      // Otherwise, create a list group that displays players, each with an "Add to Team" button
      players.forEach( player => {
        template += `
          <li class="list-group-item d-flex flex-column flex-sm-row justify-content-between align-items-center">
            <div>
              <span class="player-name h5 mr-3" style="white-space: nowrap">${player.fullname}</span>
              <span class="player-position mr-3" style="white-space: nowrap"><small>position: </small>${player.position}</span>
              <span class="player-team" style="white-space: nowrap"><small>team: </small>${player.pro_team}</span>
            </div>
            <button class="addToTeam btn btn-info px-3 mt-2" data-playerID="${player.id}">Add to Team</button>
          </li>
        `
      })  
      $rosterDiv.html(template)
  
      // Add an event listener to each player's "Add to Team" button that calls the appropriate playerService function
      $('button.addToTeam').on('click', function() {
        playerService.addToTeam($(this).attr('data-playerID'))
        drawMyTeam()
      })
      
      // Create a new <div> at the bottom of the search results to contain "back" and "next" buttons for paging through paginated results
      var nextPageBtnDiv = `<div class="pagination-buttons text-center"></div>`
      $('div.player-roster').append(nextPageBtnDiv)

      // If there are more paginated results to display, draw a "next" button at the bottom of the search results
      if (paginatedPlayers[pageNumber + 1]) {
        var prevPageBtn = `<button class="get-next-page btn btn-primary my-5">Next &#9654;</button>`
        $('div.pagination-buttons').prepend(prevPageBtn)
      }
      // If there are previous paginated results to display, draw a "back" button at the bottom of the search results
      if (paginatedPlayers[pageNumber - 1]) {
        var prevPageBtn = `<button class="get-prev-page btn btn-primary my-5 mr-4">&#9664; Back</button>`
        $('div.pagination-buttons').prepend(prevPageBtn)
      }
      
      // Assign a click-event listener for the "next" button
      $('button.get-next-page').on('click', function() {
        drawSearchResults(paginatedPlayers, pageNumber + 1)
      })

      // Assign a click-event listener for the "back" button
      $('button.get-prev-page').on('click', function() {
        drawSearchResults(paginatedPlayers, pageNumber - 1)
      })
    }
  }


  // Display cards in the DOM for each player selected by the user
  function drawMyTeam() {
    var teamMembers = playerService.getMyTeam();
    var $teamDiv = $("div.my-team .player-cards")
    var template = ""

    // Add a heading if there are player cards to display
    if (teamMembers.length) {
      $('div.my-team h2').removeClass('hidden')
    } else {
      $('div.my-team h2').addClass('hidden')
    }

    teamMembers.forEach( member => {
      // Replace the unappealing generic image for no-photo players with a better generic image
      if (member.player.photo.includes("unknown-player")) {
        member.player.photo = "http://s.nflcdn.com/static/content/public/image/fantasy/transparent/200x200/"
      }
      // Create a player card that includes a "Remove from team" button that stores the player's API ID in a data-attribute
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

    // Add a click-event listener for the player's "Remove from team" button
    $('button.removeFromTeam').on('click', function() {
      playerService.removeFromTeam($(this).attr('data-playerID'))
      drawMyTeam()
    })
  }
  

  // Actions to be performed whenever the page first loads or reloads
  drawLoadingAnimation()
  playerService.setMyTeam(drawMyTeam)
  playerService.loadPlayersData(ready)

}
