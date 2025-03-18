var currentRound = 0;
var players = [];
var numCourts = 2;

function start() {
    let numPlayers = Number(document.getElementById("num-people").value);
    
    // validate input
    let isValid = isValidNum(numPlayers);
    if (!isValid) {
        return;
    }

    document.getElementById("input").style.display = "none";
    initializePlayers(numPlayers);
    console.log(players);

    // go to next (first) round
    nextRound();
}

function isValidNum(num) {
    let isValid = Number.isInteger(num) && num > 0 && num < 100;
    document.getElementById("validation").style.display = isValid ? "none" : "block";

    return isValid;
}

function initializePlayers(numPlayers) {
    for (let i = 0; i < numPlayers; i++) {
        players.push({
            id: i+1,
            playCount: 0
        })
    }
}

function nextRound() {
    let maxPlayersAllowed = Math.min(numCourts * 4, Math.floor(players.length / 4) * 4);
    let splitPlayers = [[],[]];

    // if number of players is less than allowed, all of them can play
    // if more, only max number can play (for now, pick randomly)
    if (players.length <= maxPlayersAllowed) {
        players.forEach(player => splitPlayers[0].push(player.id));
    } else {
        splitPlayers = pickPlayers(maxPlayersAllowed);
    }

    console.log("splitPlayers:");
    console.log(splitPlayers);

    // scramble the ids randomly
    splitPlayers[0] = scramblePlayerOrder(splitPlayers[0])

    // display the results
    displayResults(splitPlayers[0], splitPlayers[1]);
}

// TODO: more sophisticated way to randomize players?
function pickPlayers(maxPlayersAllowed) {
    let playersThisRound = [];
    let notPlayingThisRound = [];
    // TODO: this just picks the first few players. Change.
    for (let i = 0; i < players.length; i++) {
        if (i < maxPlayersAllowed) {
            playersThisRound.push(players[i].id);
        } else {
            notPlayingThisRound.push(players[i].id)
        }
    }

    return [playersThisRound, notPlayingThisRound];
}

// Using Fisher-Yates Shuffle
function scramblePlayerOrder(playersThisRound) {
    for (let i = playersThisRound.length - 1; i > 0; i--) { 
        const j = Math.floor(Math.random() * (i + 1)); 
        [playersThisRound[i], playersThisRound[j]] = [playersThisRound[j], playersThisRound[i]]; 
      } 

    return playersThisRound; 
}

function displayResults(playersThisRound, notPlayingThisRound) {
    let court = 1;

    document.getElementById("display").innerHTML = "";

    for (let i = 0; i < playersThisRound.length; i += 4) {
        document.getElementById("display").innerHTML += `
            <div id="court">
                <h2>Court ${court}:</h2>
                <h3>${playersThisRound[i]} - ${playersThisRound[i+1]}</h3>
                <p>vs</p>
                <h3>${playersThisRound[i+2]} - ${playersThisRound[i+3]}</h3>
            </div>
        `;
        court++;
    }

    document.getElementById("display").innerHTML += `
        <div id="bye">
            <h4>Byes:</h4>
            <p>${notPlayingThisRound}</p>
        </div>
    `;
    document.getElementById("display").innerHTML += `<button type="button" onclick="nextRound()">Next Round!</button>`;
}
