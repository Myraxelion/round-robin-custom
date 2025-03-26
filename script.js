var currentRound = 0;
var players = [];
var numCourts = 2;
var maxPlayerId = 0;
var showStats = false;

const MAX_PLAYERS = 100;
const SHOW_OPTIONS = "Show Options";
const HIDE_OPTIONS = "Hide Options";

function start() {
    let numPlayers = Number(document.getElementById("num-people").value);
    
    if (!isValidNum(numPlayers, MAX_PLAYERS)) {
        document.getElementById("validation").style.display = "block";
        document.getElementById("validation").innerHTML = `Must be a valid number between 0 and ${MAX_PLAYERS}!`;
        return;
    }
    document.getElementById("validation").style.display = "none";
    document.getElementById("validation").innerHTML = "";

    document.getElementById("input").style.display = "none";
    document.getElementById("display").style.display = "block";
    document.getElementById("options-toggle").innerHTML = SHOW_OPTIONS;
    
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
            playCount: 0,
            byeCount: 0
        })
    }

    maxPlayerId = numPlayers;
}

function nextRound() {
    let maxPlayersAllowed = Math.min(numCourts * 4, Math.floor(players.length / 4) * 4);
    let splitPlayers = [[],[]];

    clearDisplayedMessages();
    document.getElementById("options").style.display === "block" && ShowHideOptions();
    
    if (players.length == maxPlayersAllowed) {
        players.forEach(player => splitPlayers[0].push(player.id));
    } else {
        splitPlayers = pickPlayers(maxPlayersAllowed);
    }

    splitPlayers[0] = scrambleOrder(splitPlayers[0]); // randomize who's playing who
    splitPlayers[1] = splitPlayers[1].sort((a, b) => a - b); // sort bye ids

    displayRound();
    displayResults(splitPlayers[0], splitPlayers[1]);
    showStats && populatePlayerStats();

    // printStatus(splitPlayers);
    console.log("Round: " + currentRound);
    console.log(JSON.parse(JSON.stringify(players)))
}

// deprioritizes the players with the largest play counts
// in theory there should never be a difference of more than 1 between play counts
function pickPlayers(maxPlayersAllowed) {
    let playersThisRound = [];
    let notPlayingThisRound = [];

    players.sort((a, b) => a.playCount - b.playCount);

    let maxPlayCountCutoff = findMaxPlayCountCutoff();
    console.log("maxPlayCountCutoff: " + maxPlayCountCutoff);

    if (maxPlayCountCutoff >= maxPlayersAllowed) {
        // allow anyone without max play count to have an equal chance of being picked
        let playersWithoutMaxPlayCount = players.slice(0, maxPlayCountCutoff);
        let scrambledPlayers = scrambleOrder(playersWithoutMaxPlayCount);
        pushPlayersIntoPlayingOrNot(maxPlayersAllowed, scrambledPlayers, playersThisRound, notPlayingThisRound);

        let playersWithMaxPlayCount = players.slice(maxPlayCountCutoff);
        pushPlayersIntoPlayingOrNot(0, playersWithMaxPlayCount, playersThisRound, notPlayingThisRound);
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

    for (let i = players.length - 1; i >= 0; i--) {
        if (players[i].playCount < maxPlayCount) {
            maxPlayCountCutoff = i;
            break;
        }
    }
    
    return maxPlayCountCutoff + 1; // make this exclusive, so add 1
}

function pushPlayersIntoPlayingOrNot(cutoff, customPlayers, playing, notPlaying) {
    for (let i = 0; i < customPlayers.length; i++) {
        let player = players.find(p => p.id === customPlayers[i].id);
        if (i < cutoff) {
            playing.push(customPlayers[i].id);
            player.playCount++;
        } else {
            notPlaying.push(customPlayers[i].id);
            player.byeCount++;
        }
    }
}

function displayRound() {
    currentRound++;
    document.getElementById("display-round").innerHTML = `Round ${currentRound}`;
}

function displayResults(playersThisRound, notPlayingThisRound) {
    let court = 1;
    let resultsDisplay = document.getElementById("display-results");

    resultsDisplay.innerHTML = "";
    resultsDisplay.innerHTML += `<div id="court-container"></div>`;

    for (let i = 0; i < playersThisRound.length; i += 4) {
        document.getElementById("court-container").innerHTML += `
            <div id="court">
                <h2>Court ${court}:</h2>
                <h3>${playersThisRound[i]} - ${playersThisRound[i+1]}</h3>
                <p>vs</p>
                <h3>${playersThisRound[i+2]} - ${playersThisRound[i+3]}</h3>
            </div>
        `;
        court++;
    }

    resultsDisplay.innerHTML += `
        <div id="bye">
            <h4>Byes:</h4>
            <p id="bye-ids">${notPlayingThisRound.join(", ")}</p>
        </div>
    `;
    resultsDisplay.innerHTML += `<button type="button" class="action-button" onclick="nextRound()">Next Round!</button>`;
}

function populatePlayerStats() {
    let statsTable = document.getElementById("player-stats");
    statsTable.innerHTML = `
        <tr>
            <th>Player Id</th>
            <th>Play Count</th>
            <th>Bye Count</th>
        </tr>
    `;

    players.sort((a, b) => a.id - b.id);
    players.forEach(player => statsTable.innerHTML += `
        <tr>
            <td>${player.id}</td>
            <td>${player.playCount}</td>
            <td>${player.byeCount}</td>
        </tr>
        `);
}

// added players mimic the smallest play count in existing players so they don't play every round
function addPlayer() {
    clearDisplayedMessages();

    if (players.length === MAX_PLAYERS) {
        document.getElementById("add-player-validation").innerText = `Cannot have more than ${MAX_PLAYERS} players!`;
        document.getElementById("add-player-validation").style.display = "block";
        return;
    }

    players.sort((a, b) => a.playCount - b.playCount);
    players.push({
        id: maxPlayerId+1,
        playCount: players.length === 0 ? 0 : players[0].playCount
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
    document.getElementById("remove-player-validation").style.display = "none";
    document.getElementById("remove-player-form").style.display = "flex";
    document.getElementById("remove-player-message").style.display = "none";
    document.getElementById("remove-player-dialog").close();
}

function removePlayer() {
    let playerId = Number(document.getElementById("remove-player-id").value);

    clearDisplayedMessages();

    if (!isValidNum(playerId, maxPlayerId) || !(players.find(p => p.id == playerId))) {
        document.getElementById("remove-player-validation").style.display = "block";
        return;
    }
    document.getElementById("remove-player-validation").style.display = "none";

    players = players.filter(p => p.id !== playerId);
    document.getElementById("remove-player-form").style.display = "none";
    document.getElementById("remove-player-message").style.display = "flex";
    document.getElementById("remove-player-confirmation").innerText = `Player removed! Removed player number: ${playerId}`;
}

function clearDisplayedMessages() {
    document.getElementById("add-player-confirmation").innerText = "";
    document.getElementById("add-player-validation").style.display = "none";
}

function ShowHideOptions() {
    let optionsToggle = document.getElementById("options-toggle");
    let options = document.getElementById("options");

    clearDisplayedMessages();
    optionsToggle.innerHTML = optionsToggle.innerHTML === SHOW_OPTIONS ? HIDE_OPTIONS : SHOW_OPTIONS;
    options.style.display = (!options.style.display || options.style.display === "none") ? "block" : "none";
}

function togglePlayerStats(){
    let stats = document.getElementsByClassName("table-container")[0].style;
    stats.display = (!stats.display || stats.display === "none") ? "block" : "none";
    showStats = !showStats;
    
    showStats && populatePlayerStats();
}
