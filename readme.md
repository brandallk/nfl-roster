#### Randy K.'s "NFL Roster" Checkpoint Project

Demo: [https://radiant-spire-51553.herokuapp.com/](https://radiant-spire-51553.herokuapp.com/)

Features:
* Animated loading 'spinner' while loading the NFL API data
* Can search for player(s) by any combination of team name, player position, and/or player name
* Player name search is case-insensitive and can accept first name, last name, full name, or word fragments
* If a search returns no results, a message is displayed to user
* Search results are paginated, with "next" and "back" buttons at page-bottom to page through the results
* User's "team" selections must conform to the basic conditions I found on ESPN's fantasy-football how-to guide: Starter positions include maximum of 1 QB, 2 RB, 1 'Flex' (RB, WR, or TE), 2 WR, 1 TE, 1 K, 1 'Team Defense' (3 of LB, DL, or DB). I.e. 11 selections in total. I don't know football well at all, so hopefully this is basically correct.
* If a player has no photo, a generic picture is supplied when he is added to the user's team roster
* Very simple Node/Express backend with SQLite db, deployed on Heroku: I wanted to experiment with this to see if I could get it working.
* player-service.js includes AJAX calls to GET, POST, & DELETE routes in the backend for basic db management that mirrors changes to the "team" data on the frontend
* When the app loads in browser, player-controller.js displays any "team"-members that have been saved to the SQLite db.
* (No user login/logout, because I didn't get that far... but that would be the logical next step.)