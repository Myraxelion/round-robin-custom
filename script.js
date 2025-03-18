var currentRound = 0;
var players = [];

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

    document.getElementById("display").innerHTML = numPlayers;
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
    // TODO
    return;
}
