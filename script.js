let canvas = document.getElementById('terrain');
let ctx = canvas.getContext('2d');
let canvasWidth = canvas.width;
let canvasHeight = canvas.height;
let autoMove = false;
let currentLevel = 1;

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
    } else if (currentLevel === 1 && (nextI < 0 || nextI >= terrain.largeur || nextJ < 0 || nextJ >= terrain.hauteur)) {
        // If level is easy, allow the snake to cross the border
        this.i = (nextI + terrain.largeur) % terrain.largeur;
        this.j = (nextJ + terrain.hauteur) % terrain.hauteur;
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
        this.score = 0;

        let tete = new Anneau(i, j, '#FF6600'); // Set head color to #FF6600
        this.anneaux.push(tete);

        for (let k = 1; k < longueur; k++) {
            let anneau = new Anneau(i, j, '#FFEA00'); // Set body color to #FFEA00
            this.anneaux.push(anneau);
        }

        this.anneaux[this.anneaux.length - 1].color = '#FFEA00'; // Set tail color to #FFEA00
    }

    draw() {
        for (let i = 0; i < this.anneaux.length; i++) {
            let size = 20 - (i * (15 / this.anneaux.length)); // Calculate size based on position
            this.anneaux[i].size = size;
            this.anneaux[i].draw();
        }
    }

    move() {
        let nextI = this.anneaux[0].i;
        let nextJ = this.anneaux[0].j;
    
        switch (this.direction) {
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
    
        if (currentLevel === 3) { // If level is hard, check if the snake touches itself
            for (let i = 1; i < this.anneaux.length; i++) {
                if (this.anneaux[i].i === nextI && this.anneaux[i].j === nextJ) {
                    stopRAF(); // Stop the animation
                    return;
                }
            }
        }
    
        if (nextI >= 0 && nextI < terrain.largeur  && nextJ >= 0 && nextJ < terrain.hauteur && terrain.read(nextJ, nextI) === 0) {             
            for (let i = this.anneaux.length - 1; i > 0; i--) {
                this.anneaux[i].copy(this.anneaux[i - 1]);
            }
            this.anneaux[0].move(this.direction);
            // If the head is on an apple
            if (this.anneaux[0].i === terrain.pomme.i && this.anneaux[0].j === terrain.pomme.j) {
                this.extend();
                terrain.addRockAndApple();
            }
        } else if (terrain.read(nextJ, nextI) !== 0) { // If the head is on a wall or a rock
            if (currentLevel > 1) { // If level is intermediate or hard, stop the game
                stopRAF(); // Stop the animation
            }
        } else if (currentLevel === 1 && (nextI < 0 || nextI >= terrain.largeur || nextJ < 0 || nextJ >= terrain.hauteur)) {
            // If level is easy, allow the snake to cross the border
            nextI = (nextI + terrain.largeur) % terrain.largeur;
            nextJ = (nextJ + terrain.hauteur) % terrain.hauteur;
        }
    }

    animate() {
        this.move();
        this.draw();
    }

    extend() {
        let last = this.anneaux[this.anneaux.length - 1];
        let size = 20 - (this.anneaux.length * (15 / this.anneaux.length)); // Calculate size for new segment
        let newLast = new Anneau(last.i, last.j, '#FFEA00', size); // Set new tail color to #FFEA00
        this.score++;
        document.getElementById('score').innerText = "Votre score : " + this.score;
        this.anneaux.push(newLast);
    }
}

class Pomme {
    constructor(i, j) {
        this.i = i;
        this.j = j;
        this.color = 'red';
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.i * 20, this.j * 20, 20, 20);
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
        let x, y;
        do {
            x = Math.floor(Math.random() * this.largeur);
            y = Math.floor(Math.random() * this.hauteur);
        } while (this.sol[y][x] !== 0);
        this.sol[y][x] = 1;
        // ajout d'une pomme aléatoire
        this.addRockAndApple();
    }

    addRockAndApple() {
        // ajout d'un rocher aléatoire
        let x, y;
        do {
            x = Math.floor(Math.random() * this.largeur);
            y = Math.floor(Math.random() * this.hauteur);
        } while (this.sol[y][x] !== 0);
        this.sol[y][x] = 1; // rocher
        // ajout d'une pomme aléatoire
        do {
            x = Math.floor(Math.random() * this.largeur);
            y = Math.floor(Math.random() * this.hauteur);
        } while (this.sol[y][x] !== 0);
        this.pomme = new Pomme(x, y); // pomme
    }
    draw() {
        for (let i = 0; i < this.hauteur; i++) {
            for (let j = 0; j < this.largeur; j++) {
                switch (this.sol[i][j]) {
                    case 0: // Empty cell
                        if ((i + j) % 2 === 0) {
                            ctx.fillStyle = '#347412';
                        } else {
                            ctx.fillStyle = '#2B6812';
                        }
                        break;
                    case 1: // Rock
                        ctx.fillStyle = '#663908';
                        break;
                    case 2: // Border
                        ctx.fillStyle = '#281501';
                        break;
                }
                ctx.fillRect(j * 20, i * 20, 20, 20);
            }
        }
        // Dessine la pomme
        if (this.pomme) {
            this.pomme.draw();
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



let niveau = prompt("Veuillez choisir un niveau: 1, 2 ou 3");

if (niveau == 1 || niveau == 2 || niveau == 3) {
    currentLevel = parseInt(niveau); // Assign the user input to currentLevel
    // Lancez le jeu ici
} else {
    alert("Veuillez choisir un niveau valide");
}

// Suppose que currentLevel est la variable qui contient le niveau actuel
document.getElementById("level").textContent = "Niveau : " + currentLevel;

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
    alert("Perdu !");
    location.reload();
}

let terrain = new Terrain(canvasWidth / 20, canvasHeight / 20);
terrain.draw();
startRAF();
