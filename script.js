let count = 0;

function addOne() {
    count++;
    document.getElementById("counter").innerHTML = count;
}

function minusOne() {
    count--;
    document.getElementById("counter").innerHTML = count;
}