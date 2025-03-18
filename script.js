function calculate() {
    let numPeople = document.getElementById("num-people").value;
    
    // validate input
    let isValid = isValidNum(Number(numPeople));
    if (!isValid) {
        return;
    }

    document.getElementById("display").innerHTML = numPeople;
}

function isValidNum(numPeople) {
    let isValid = Number.isInteger(numPeople) && numPeople > 0 && numPeople < 100;
    console.log(Number.isInteger(numPeople));
    document.getElementById("validation").style.display = isValid ? "none" : "block";
    return isValid;
}