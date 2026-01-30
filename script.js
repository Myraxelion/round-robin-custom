const MAX_PLAYERS = 100;
const MAX_COURTS = 20;
const COURT_DEFAULT = 2;
const SHOW_OPTIONS = "Show Options";
const HIDE_OPTIONS = "Hide Options";

var currentRound = 0;
var courts = COURT_DEFAULT;
var players = [];
var maxPlayerId = 0;
var byeIdsLastRound = [];
var showStats = false;
var roundHistory = [];

function start() {
    const numPlayers = Number(document.getElementById("num-people").value);
    const numCourtInput = document.getElementById("num-courts").value;
    const numCourts = Number(numCourtInput);
    const isNumPlayersValid = isValidNum(numPlayers, MAX_PLAYERS);
    const isNumCourtsValid = numCourtInput === "" || isValidNum(numCourts, MAX_COURTS);
    
    if (!isNumPlayersValid || !isNumCourtsValid) {
        setInputValidation(isNumPlayersValid, document.getElementById("people-validation"), MAX_PLAYERS);
        setInputValidation(isNumCourtsValid, document.getElementById("court-validation"), MAX_COURTS);
        return;
    } else {
        document.getElementById("people-validation").style.display = "none";
        document.getElementById("court-validation").style.display = "none";
    }
   
    document.getElementById("input").style.display = "none";
    document.getElementById("display").style.display = "block";
    document.getElementById("options-toggle").innerHTML = SHOW_OPTIONS;
    
    courts = numCourtInput === "" ? COURT_DEFAULT : numCourts;
    initializePlayers(numPlayers);
    nextRound();
}

function setInputValidation(isValid, element, max) {
    if (isValid) {
        element.style.display = "none"
    } else {
        element.style.display = "block";
        element.innerHTML = `Must be a valid number between 0 and ${max}!`;
    }
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

function showPreviousRound() {
    console.log('showPreviousRound'); 

    if (currentRound === 1) {
        return;
    }
    
    const previousRound = roundHistory[currentRound - 2];
    updateCurrentRound(previousRound);
}

function showNextRound() {
    console.log('showNextRound');
    if (currentRound === roundHistory.length) {
        return;
    }

    const nextRound = roundHistory[currentRound];
    updateCurrentRound(nextRound);
}

function updateCurrentRound(roundData) {
    currentRound = roundData.round;
    players = roundData.players.slice();
    maxPlayerId = roundData.maxPlayerId;
    byeIdsLastRound = roundData.byeIdsLastRound.slice();

    displayRound();
    displayResults(roundData.playingIds, roundData.byeIds);
    showStats && populatePlayerStats();
    updateDirectionButtons();
}

function updateDirectionButtons() {
    let showPreviousButton = document.getElementById("show-previous-button");
    let showNextButton = document.getElementById("show-next-button");

    console.log('currentRound:', currentRound);
    showPreviousButton.style.visibility = currentRound === 1 ? "hidden" : "visible";
    showNextButton.style.visibility = currentRound === roundHistory.length ? "hidden" : "visible";
} 

function nextRound() {
    const maxPlayersAllowed = Math.min(courts * 4, Math.floor(players.length / 4) * 4);
    let splitPlayers = [[],[]];
    currentRound++;

    clearDisplayedMessages();
    document.getElementById("options").style.display === "block" && ShowHideOptions();
    
    if (players.length === maxPlayersAllowed) {
        pushPlayersIntoPlayingOrNot(maxPlayersAllowed, players, splitPlayers[0], splitPlayers[1]);
    } else {
        splitPlayers = pickPlayers(maxPlayersAllowed);
    }

    splitPlayers[0] = scrambleOrder(splitPlayers[0]); // randomize who's playing who
    splitPlayers[1] = splitPlayers[1].sort((a, b) => a - b); // sort bye ids

    let newHistory = roundHistory.slice(0, currentRound - 1);

    newHistory.push({
        round: currentRound,
        players: structuredClone(players),
        maxPlayerId: maxPlayerId,
        playingIds: [...splitPlayers[0]],
        byeIds: [...splitPlayers[1]],
        byeIdsLastRound: [...byeIdsLastRound]
    });

    roundHistory = newHistory;

    byeIdsLastRound = splitPlayers[1];

    displayRound();
    displayResults(splitPlayers[0], splitPlayers[1]);
    showStats && populatePlayerStats();
    updateDirectionButtons();
    console.log(players);
    console.log(roundHistory);
}

// deprioritizes the players with the largest play counts
// in theory there should never be a difference of more than 1 between play counts
// prioritizes players who were just sitting out
function pickPlayers(maxPlayersAllowed) {
    let playingThisRound = [];
    let notPlayingThisRound = [];

    players.sort((a, b) => a.playCount - b.playCount);

    const maxPlayCountCutoff = findMaxPlayCountCutoff();

    if (maxPlayCountCutoff >= maxPlayersAllowed) {
        // prioritize people with byes last round, rest is random
        let playersWithoutMaxPlayCount = players.slice(0, maxPlayCountCutoff);
        let prioritizedPlayers = prioritizePreviousByes(playersWithoutMaxPlayCount);
        
        pushPlayersIntoPlayingOrNot(maxPlayersAllowed, prioritizedPlayers, playingThisRound, notPlayingThisRound);

        let playersWithMaxPlayCount = players.slice(maxPlayCountCutoff);
        pushPlayersIntoPlayingOrNot(0, playersWithMaxPlayCount, playingThisRound, notPlayingThisRound);
    } else {
        // let everyone without max play count play, then prioritize byes, and then choose randomly from the rest
        for (let i = 0; i < maxPlayCountCutoff; i++) {
            playingThisRound.push(players[i].id);
            players[i].playCount++;
        }

        let numBlankSpots = maxPlayersAllowed - maxPlayCountCutoff;
        let playersWithMaxPlayCount = players.slice(maxPlayCountCutoff);
        let prioritizedPlayers = prioritizePreviousByes(playersWithMaxPlayCount);

        pushPlayersIntoPlayingOrNot(numBlankSpots, prioritizedPlayers, playingThisRound, notPlayingThisRound);
    }

    return [playingThisRound, notPlayingThisRound];
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
    const maxPlayCount = players[players.length-1].playCount; // assume players > 0

    for (let i = players.length - 1; i >= 0; i--) {
        if (players[i].playCount < maxPlayCount) {
            maxPlayCountCutoff = i;
            break;
        }
    }
    
    return maxPlayCountCutoff + 1; // make this exclusive, so add 1
}

// randomizes array and then prioritizes ids in byes last round
function prioritizePreviousByes(customPlayers) {
    let scrambledPlayers = scrambleOrder(customPlayers);
    let byePlayers = [];
    let otherPlayers = [];

    scrambledPlayers.forEach(player => {
        if (byeIdsLastRound.includes(player.id)) {
            byePlayers.push(player);
        } else {
            otherPlayers.push(player);
        }
    });

    return byePlayers.concat(otherPlayers);
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
    document.getElementById("display-round").innerHTML = `Round ${currentRound}`;
}

function displayResults(playersThisRound, notPlayingThisRound) {
    let currentCourt = 1;
    let resultsDisplay = document.getElementById("display-results");

    resultsDisplay.innerHTML = "";
    resultsDisplay.innerHTML += `<div id="court-container"></div>`;

    for (let i = 0; i < playersThisRound.length; i += 4) {
        document.getElementById("court-container").innerHTML += `
            <div id="court">
                <h2>Court ${currentCourt}:</h2>
                <h3>${playersThisRound[i]} - ${playersThisRound[i+1]}</h3>
                <p>vs</p>
                <h3>${playersThisRound[i+2]} - ${playersThisRound[i+3]}</h3>
            </div>
        `;
        currentCourt++;
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
    statsTable.innerHTML = "";
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

// added players mimic the smallest in existing players so they don't play every round
function addPlayer() {
    clearDisplayedMessages();

    if (players.length === MAX_PLAYERS) {
        document.getElementById("add-player-validation").innerText = `Cannot have more than ${MAX_PLAYERS} players!`;
        document.getElementById("add-player-validation").style.display = "block";
        return;
    }

    maxPlayerId++;
    let hasPlayers = players.length === 0;
    players.sort((a, b) => a.playCount - b.playCount);
    players.push({
        id: maxPlayerId,
        playCount: hasPlayers ? 0 : players[0].playCount,
        byeCount: hasPlayers ? 0 : players[0].byeCount
    });
    byeIdsLastRound.push(maxPlayerId); // prioritize new players

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
