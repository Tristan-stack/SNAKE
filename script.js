let canvas = document.getElementById('terrain');
let ctx = canvas.getContext('2d');
let canvasWidth = canvas.width;
let canvasHeight = canvas.height;
let autoMove = false;

class Anneau {
    constructor(i, j, color) {
        this.i = i;
        this.j = j;
        this.color = color;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.i * 20, this.j * 20, 20, 20);
    }

    move(d) {
        switch (d) {
            case 1: // right
                this.i++;
                break;
            case 3: // left
                this.i--;
                break;
            case 0: // up
                this.j--;
                break;
            case 2: // down
                this.j++;
                break;
            default:
                console.log("Invalid direction code");
        }

        if (this.i < 0) {
            this.i = canvasWidth / 20 - 1;
        } else if (this.i >= canvasWidth / 20) {
            this.i = 0;
        }

        if (this.j < 0) {
            this.j = canvasHeight / 20 - 1;
        } else if (this.j >= canvasHeight / 20) {
            this.j = 0;
        }
    }

    copy(a) {
        this.i = a.i;
        this.j = a.j;
    }
}

class Serpent {
    constructor(longueur, i, j, direction) {
        this.anneaux = [];
        this.direction = direction;

        let tete = new Anneau(i, j, 'red');
        this.anneaux.push(tete);

        for (let k = 1; k < longueur; k++) {
            let anneau = new Anneau(i, j, 'blue');
            this.anneaux.push(anneau);
        }

        this.anneaux[this.anneaux.length - 1].color = 'green';
    }

    draw() {
        for (let i = 0; i < this.anneaux.length; i++) {
            this.anneaux[i].draw();
        }
    }

    move() {
        for (let i = this.anneaux.length - 1; i > 0; i--) {
            this.anneaux[i].copy(this.anneaux[i - 1]);
        }
        this.anneaux[0].move(this.direction);
    }

    extend() {
        let last = this.anneaux[this.anneaux.length - 1];
        let newLast = new Anneau(last.i, last.j, 'green');
        this.anneaux.push(newLast);
    }
}

let serpent1 = new Serpent(5, 5, 5, 1);
serpent1.draw();

function direction(currentDirection) {
    let randomNumber = Math.floor(Math.random() * 10);

    if (randomNumber < 2) {
        let newDirection;
        do {
            newDirection = Math.floor(Math.random() * 4);
        } while (newDirection === (currentDirection + 2) % 4);
        return newDirection;
    } else {
        return currentDirection;
    }
}

// par defaut, le serpent est en mode "jeu" avec les fleches directionnelles

document.getElementById('start').addEventListener('click', function () {
    autoMove = true;
});

document.getElementById('stop').addEventListener('click', function () {
    autoMove = false;
});

window.addEventListener('keydown', function (event) {
    autoMove = false;
    switch (event.key) {
        case 'ArrowUp':
            if (serpent1.direction !== 2) {
                serpent1.direction = 0;
            }
            break;
        case 'ArrowRight':
            if (serpent1.direction !== 3) {
                serpent1.direction = 1;
            }
            break;
        case 'ArrowDown':
            if (serpent1.direction !== 0) {
                serpent1.direction = 2;
            }
            break;
        case 'ArrowLeft':
            if (serpent1.direction !== 1) {
                serpent1.direction = 3;
            }
            break;
    }
});

setInterval(function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (autoMove) {
        serpent1.direction = direction(serpent1.direction);
    }
    serpent1.move();
    serpent1.draw();
}, 200);