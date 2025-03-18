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

    // hide initial input form
    // document.getElementById("input").style.display = "none";

    initializePlayers(numPlayers);

    // go to next (first) round
    nextRound();

    // document.getElementById("display").innerHTML = numPlayers;
    console.log(players);
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
    let maxPlayersAllowed = numCourts * 4;
    let playersThisRound = [];

    // TODO: add check for if there are an uneven num of players for the courts (ex. 5)

    // if number of players is less than allowed, all of them can play
    // if more, only max number can play (for now, pick randomly)
    if (players.length <= maxPlayersAllowed) {
        players.forEach(player => playersThisRound.push(player.id));
    } else {
        playersThisRound = pickPlayers(maxPlayersAllowed);
    }

    console.log("playersThisRound:");
    console.log(playersThisRound);

    // scramble the ids randomly
    playersThisRound = scramblePlayerOrder(playersThisRound)

    // display the results
    displayResults(playersThisRound);

    return;
}

// TODO: more sophisticated way to randomize players?
function pickPlayers(maxPlayersAllowed) {
    let playersThisRound = [];
    // TODO: this just picks the first few players. Change.
    for (let i = 0; i < maxPlayersAllowed; i++) {
        playersThisRound.push(players[i].id);
    }

    return playersThisRound;
}

// TODO
function scramblePlayerOrder(playersThisRound) {
    return playersThisRound; 
}

// TODO
function displayResults(playersThisRound) {
    document.getElementById("display").innerHTML = playersThisRound;
}
