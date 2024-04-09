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
    // Calcule la prochaine position du serpent
    let nextI = this.i;
    let nextJ = this.j;

    switch (d) {
        case 1: // right
            nextI++;
            break;
        case 3: // left
            nextI--;
            break;
        case 0: // up
            nextJ--;
            break;
        case 2: // down
            nextJ++;
            break;
        default:
            console.log("Invalid direction code");
    }

    // regarde si le serpent est sorti du terrain ou s'il a touché un rocher
    if (nextI >= 0 && nextI < terrain.largeur  && nextJ >= 0 && nextJ < terrain.hauteur && terrain.read(nextJ, nextI) === 0) {
        // bouge le serpent
        this.i = nextI;
        this.j = nextJ;
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
        
        if (terrain.read(this.anneaux[0].j, this.anneaux[0].i) === 0) {            
            for (let i = this.anneaux.length - 1; i > 0; i--) {
                this.anneaux[i].copy(this.anneaux[i - 1]);
            }
            this.anneaux[0].move(this.direction);
        } else if (terrain.read(this.anneaux[0].j, this.anneaux[0].i) === 2 && 1) { // Si la tête est sur un mur
            stopRAF(); // Arrête l'animation
        }
    }

    animate() {
        this.move();
        this.draw();
    }

    extend() {
        let last = this.anneaux[this.anneaux.length - 1];
        let newLast = new Anneau(last.i, last.j, 'green');
        this.anneaux.push(newLast);
    }
}

class Terrain {
    constructor(l, h) {
        this.largeur = l;
        this.hauteur = h;
        this.sol = [];

        // Initialise le terrain
        for (let i = 0; i < this.hauteur; i++) {
            this.sol[i] = [];
            for (let j = 0; j < this.largeur; j++) {
                if (i === 0 || j === 0 || i === this.hauteur - 1 || j === this.largeur - 1) {
                    // Border
                    this.sol[i][j] = 2;
                } else {
                    // Empty cell
                    this.sol[i][j] = 0;
                }
            }
        }

        // ajout de rochers aleatoires
        for (let i = 0; i < 15; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * this.largeur);
                y = Math.floor(Math.random() * this.hauteur);
            } while (this.sol[y][x] !== 0);
            this.sol[y][x] = 1;
        }
    }

    draw() {
        for (let i = 0; i < this.hauteur; i++) {
            for (let j = 0; j < this.largeur; j++) {
                switch (this.sol[i][j]) {
                    case 0: // Empty cell
                        ctx.fillStyle = 'white';
                        break;
                    case 1: // Rock
                        ctx.fillStyle = 'gray';
                        break;
                    case 2: // Border
                        ctx.fillStyle = 'black';
                        break;
                }
                ctx.fillRect(j * 20, i * 20, 20, 20);
            }
        }
    }

    read(i, j) {
        return this.sol[i][j];
    }

    write(i, j, val) {
        this.sol[i][j] = val;
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

// setInterval(function () {
//     // il faut clere uniquement le dernier anneau du serpent et pas le rectangle entier
//     ctx.clearRect(serpent1.anneaux[serpent1.anneaux.length - 1].i * 20, serpent1.anneaux[serpent1.anneaux.length - 1].j * 20, 20, 20);

//     if (autoMove) {
//         serpent1.direction = direction(serpent1.direction);
//     }
//     serpent1.move();
//     serpent1.draw();
// }, 200);

// Identifiant du "timer"
let animationTimer = 0;
let starttime = 0;
// Fréquence d'affichage maximum
const maxfps = 60;
const interval = 10000 / maxfps;

// Fonction permettant de démarrer l'animation
// Fonction permettant de démarrer l'animation
function startRAF(timestamp = 0) {
    animationTimer = requestAnimationFrame(startRAF);
    if (starttime === 0) starttime = timestamp;
    let delta = timestamp - starttime;
    if (delta >= interval) {
        terrain.draw(); // Dessine le terrain à chaque frame
        serpent1.animate(); // Dessine le serpent à chaque frame
        starttime = timestamp - (delta % interval);
    }
}
// Fonction permettant d'arrêter l'animation
function stopRAF() {
    cancelAnimationFrame(animationTimer);
    animationTimer = 0;
}

let terrain = new Terrain(canvasWidth / 20, canvasHeight / 20);
terrain.draw();
startRAF();
