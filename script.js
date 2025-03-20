var currentRound = 0;
var players = [];
var numCourts = 2;
var maxPlayerId = 0;

const MAX_PLAYERS = 100;

function start() {
    let numPlayers = Number(document.getElementById("num-people").value);
    
    if (!isValidNum(numPlayers, MAX_PLAYERS)) {
        document.getElementById("validation").style.display = isValid ? "none" : "block";
        return;
    }

    document.getElementById("input").style.display = "none";
    document.getElementById("options").style.display = "block";
    
    initializePlayers(numPlayers);
    nextRound();
}

function isValidNum(num, max) {
    return Number.isInteger(num) && num > 0 && num <= max;
}

function initializePlayers(numPlayers) {
    for (let i = 0; i < numPlayers; i++) {
        players.push({
            id: i+1,
            playCount: 0
        })
    }

    maxPlayerId = numPlayers;
}

function nextRound() {
    let maxPlayersAllowed = Math.min(numCourts * 4, Math.floor(players.length / 4) * 4);
    let splitPlayers = [[],[]];

    if (players.length == maxPlayersAllowed) {
        players.forEach(player => splitPlayers[0].push(player.id));
    } else {
        splitPlayers = pickPlayers(maxPlayersAllowed);
    }

    console.log("splitPlayers:");
    console.log(splitPlayers);

    splitPlayers[0] = scrambleOrder(splitPlayers[0])
    displayResults(splitPlayers[0], splitPlayers[1]);
}

// deprioritizes the players with the largest play counts
// in theory there should never be a difference of more than 1 between play counts
function pickPlayers(maxPlayersAllowed) {
    let playersThisRound = [];
    let notPlayingThisRound = [];

    players.sort((a, b) => a.playCount - b.playCount);

    console.log("sorted players:");
    console.log(players);
    
    let maxPlayCountCutoff = findMaxPlayCountCutoff();
    console.log("maxPlayCountCutoff: " + maxPlayCountCutoff);

    if (maxPlayCountCutoff >= maxPlayersAllowed) {
        // allow anyone without max play count to have an equal chance of being picked
        let playersWithoutMaxPlayCount = players.slice(0, maxPlayCountCutoff);
        let scrambledPlayers = scrambleOrder(playersWithoutMaxPlayCount);
        pushPlayersIntoPlayingOrNot(maxPlayersAllowed, scrambledPlayers, playersThisRound, notPlayingThisRound);

        let playersWithMaxPlayCount = players.slice(maxPlayCountCutoff);
        playersWithMaxPlayCount.forEach(p => notPlayingThisRound.push(p.id));
    } else {
        // let everyone without max play count play and then choose randomly from the rest
        for (let i = 0; i < maxPlayCountCutoff; i++) {
            playersThisRound.push(players[i].id);
            players[i].playCount++;
        }

        let numBlankSpots = maxPlayersAllowed - maxPlayCountCutoff;
        let playersWithMaxPlayCount = players.slice(maxPlayCountCutoff);
        let scrambledPlayers = scrambleOrder(playersWithMaxPlayCount);
        pushPlayersIntoPlayingOrNot(numBlankSpots, scrambledPlayers, playersThisRound, notPlayingThisRound);
    }

    return [playersThisRound, notPlayingThisRound];
}

// Using Fisher-Yates Shuffle
function scrambleOrder(arr) {
    for (let i = arr.length - 1; i > 0; i--) { 
        const j = Math.floor(Math.random() * (i + 1)); 
        [arr[i], arr[j]] = [arr[j], arr[i]]; 
      } 

    return arr; 
}

function findMaxPlayCountCutoff() {
    let maxPlayCountCutoff = players.length - 1;
    let maxPlayCount = players[players.length-1].playCount; // assume players > 0

    for (let i = players.length - 1; i > 0; i--) {
        if (players[i].playCount < maxPlayCount) {
            maxPlayCountCutoff = i;
            break;
        }
    }
    
    return maxPlayCountCutoff + 1; // make this exclusive, so add 1
}

function pushPlayersIntoPlayingOrNot(cutoff, customPlayers, playing, notPlaying) {
    for (let i = 0; i < customPlayers.length; i++) {
        if (i < cutoff) {
            playing.push(customPlayers[i].id);
            let player = players.find(p => p.id === customPlayers[i].id);
            player.playCount++;
        } else {
            notPlaying.push(customPlayers[i].id)
        }
    }
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

// added players mimic the smallest play count in existing players so they don't play every round
function addPlayer() {
    players.sort((a, b) => a.playCount - b.playCount);
    players.push({
        id: maxPlayerId+1,
        playCount: players[0].playCount
    });
    maxPlayerId++;

    document.getElementById("add-player-confirmation").innerText = `New player added! New player is number: ${maxPlayerId}`;
}

function showRemovePlayerDialog() {
    let dialog = document.getElementById("remove-player-dialog");
    dialog.showModal();
    dialog.addEventListener("click", e => {
        const dialogDimensions = dialog.getBoundingClientRect()
        if (
          e.clientX < dialogDimensions.left ||
          e.clientX > dialogDimensions.right ||
          e.clientY < dialogDimensions.top ||
          e.clientY > dialogDimensions.bottom
        ) {
          closeRemovePlayerDialog();
        }
    });
}

function closeRemovePlayerDialog() {
    document.getElementById("remove-player-id").value = "";
    document.getElementById("remove-player-dialog").close();
}

// TODO
function removePlayer() {
    let playerId = Number(document.getElementById("remove-player-id").value);

    // validate
    if (!isValidNum(playerId, maxPlayerId) || !(players.find(p => p.id == playerId))) {
        console.log("got to here!");
        document.getElementById("remove-player-validation").style.display = "block";
        return;
    }

    document.getElementById("remove-player-validation").style.display = "none";
    // remove
    players = players.filter(p => p.id !== playerId);

    closeRemovePlayerDialog();
    document.getElementById("remove-player-confirmation").innerText = `Player removed! Removed player number: ${playerId}`;
}