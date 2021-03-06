//Variabler
var myGamePiece;
var hekker;
var myObstacles = [];
//Variabler for score
var score = 0;
var highscore = 0;
var poengMultiplier = 1;

//Variabler for tilbakemelding ved powerup
var spook = false;
var dobbel = false;
var powerMelding = "";

//Andre variabler
var paused = false; //Skjekker om spillet er satt på pause
var checkCollision = true; //Skjekker om det er en kollisjoon mellom to objekter
var gameRunning = true; // Skjekker om spillet kjører
var reset1 = true;

// Viser spillet og skjuler <body> når du trykker på knappen.
window.onload = function() {
  document.getElementById("download").style.display = "none";
  document.getElementById("startspill").onclick = () => {
    document.getElementById("canvasher").style.display = "none";
    document.getElementById("mainNav").style.backgroundColor = "black";
    document.getElementById("download").style.display = "block";
    document.getElementById("scoreInput").style.display = "block";
    startGame();
  };
};
window.onresize = function(event) {
  //Funksjon for responsivt design
  if (window.innerWidth <= 1450) {
    //Sjekker bredden på vinduet for å bestmme plasseringen til canvaset
    myGameArea.canvas.style.marginLeft = "0px";
  } else {
    myGameArea.canvas.style.marginLeft = "auto";
  }
  //Endrer egenskaper til highscore listen
  document.getElementById("scoreInput").style.marginTop =
    -myGameArea.canvas.clientHeight + "px";
  document.getElementById("scoreInput").style.height =
    myGameArea.canvas.clientHeight + "px";
};
// Starter spillet, definerer objekter
function startGame() {
  myGamePiece = new component(
    60,
    60,
    "bilder/steinbilkvadrat.png",
    40,
    500,
    "image"
  );
  myGameArea.start();
  light = true;
}
var test = true;
// Spillområdet
var myGameArea = {
  canvas: document.createElement("canvas"),
  start: function() {
    // Definerer egenskaxper til canvasen/spillområdet
    this.canvas.width = 960;
    this.canvas.height = 540;
    this.canvas.style.marginTop = "78px";
    if (window.innerWidth >= 1500) {
      this.canvas.style.marginLeft = "auto";
    } else {
      this.canvas.style.marginLeft = 0;
    }
    this.canvas.style.marginRight = "auto";
    this.canvas.style.display = "block";
    this.context = this.canvas.getContext("2d");
    document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    this.interval = setInterval(updateGameArea, 20); // Starter updateGameArea
    this.objInterval = setInterval(randomTimer, 1899); // Starter å spawne hindere
    this.powInterval = setInterval(randomPowerup, 14899); // Starter å spawne powerups
    let music = document.getElementById("music");
    music.play();
    if (mute == false) { //Sjekker om musikket er dempet eller ikke
      music.muted = false;
      muter.image.src = "bilder/speaker.png";
    } else if (mute) {
      music.muted = true;
      muter.image.src = "bilder/mute.png";
    }
    //Definerer egenskaper til highscore listen
    document.getElementById("scoreInput").style.marginTop =
      -myGameArea.canvas.clientHeight + "px";
    document.getElementById("scoreInput").style.height =
      myGameArea.canvas.clientHeight + "px";
    document.getElementById("music").volume = 0.5;
  },
  stop: function() {
    // Stopper
    powerMelding = "";
    clearInterval(this.interval); // Stopper updateGameArea
    clearInterval(this.objInterval);
    clearInterval(this.powInterval);
    gameRunning = false;
    checkCollision = true;
    poengMultiplier = 1;
    spook = false;
    dobbel = false;
    clearInterval(lightInterval);
    currentLevel = 0;
  },
  clear: function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height); // Clearer canvasen/spillomrdet
  }
};

//Array for powerups
var myPowerUps = [
  [
    //Spookelse
    function() {
      console.log("Spookelse kjører");
      checkCollision = false;
      setTimeout(function() {
        checkCollision = true;
      }, 5000);
    },
    //Poengrutsj
    function() {
      console.log("Dobbelt poeng kjører");
      poengMultiplier = 2;
      setTimeout(function() {
        poengMultiplier = 1;
      }, 10000);
    },
    //Gullmynt
    function() {
      console.log("500 poeng gis");
      score += 500;
    },
    //Tyven
    function() {
      console.log("250 poeng tas");
      score -= 250;
    }
  ],
  //Bildene til powerupsene
  ["bilder/ghost.png", "bilder/x2.png", "bilder/coin.png", "bilder/tyv.png"]
];

//Array for lagde powerups
var mySpawnedPowerUps = [];

var crouched = false; // Variabel for om spilleren dukker

//Registrerer om brukeren trykker på opp eller ned
document.addEventListener("keydown", function(event) {
  if (gameRunning || event.keyCode == 32) {
    event.preventDefault();
  }
  if (event.keyCode == 77) {
    toggleMute();
  }
  if (event.keyCode == 38) {
    //Piltast opp
    //hoppfunk
    myGamePiece.jump();
  }
  if (event.keyCode == 40) {
    //Piltast ned
    crouched = true;
    //dukkfunk
    myGamePiece.crouch(crouched);
  }
});
document.addEventListener("keyup", function(event) {
  if (event.keyCode == 40) {
    //Slipp piltast ned
    crouched = false;
    myGamePiece.crouch(crouched);
  }
  if (event.keyCode == 32) {
    //Spacebar, starter spillet på nytt, tømmer alle arrayene, reseter score
    myGameArea.stop();
    startGame();
    gameRunning = true;
    myObstacles = [];
    myTiles = [];
    tilesNr = 0;
    mySpawnedPowerUps = [];
    score = 0;
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    myGameArea.canvas.style.backgroundImage = "url(bilder/bakgrunnsbilde1.png)";
    reset1 = false;
    newHighscore();
  }
  if (event.keyCode == 80) {
    //P, setter spillet på pause
    if (paused == false) {
      myGameArea.stop();
      if (score >= 100) {
        clearInterval(randomLighting);
      }
      paused = true;
    } else {
      myGameArea.start();
      paused = false;
      if (score >= 100) {
        lightInterval = setInterval(randomLighting);
      }
    }
  }
});
//Funksjon for å lage og sette egenskaper alle objekter i spillet, både steinbilen og obstacles
function component(width, height, color, x, y, type, powerup) {
  this.type = type;
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;
  this.speedX = 0;
  this.speedY = 0;
  this.type = type;
  if (type == "image") {
    this.image = new Image();
    this.image.src = color;
    this.image.opacity = 0.5;
  }
  this.powerup = powerup;
  this.gravity = 0.25; //
  this.gravitySpeed = 0;
  this.bounce = 0;
  this.update = function() {
    //Oppdaterer plasseringen til objektene
    ctx = myGameArea.context;
    text = myGameArea.context;
    if (type == "image") {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    } else {
      ctx.fillStyle = color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  };
  //Funksjon som bestemmer hvor høyt spillfiguren skal hoppe
  this.newPos = function() {
    this.gravitySpeed += this.gravity;
    this.x += this.speedX;
    this.y += Math.floor(this.speedY + this.gravitySpeed);
    if (this.y < 400) {
      //Når spillfiguren er ved denne y-høyden skal den falle
      this.gravity = 0.75;
    }
    this.hitBottom();
  };
  //Funksjonen som bestemmer at spillfiguren skal stoppe å falle når den når bunnen
  this.hitBottom = function() {
    var rockbottom = myGameArea.canvas.height - this.height;
    if (this.y > rockbottom) {
      this.y = rockbottom;
      this.gravitySpeed = -(this.gravitySpeed * this.bounce);
    }
  };
  //Funksjonen som bestemmer at spillfiguren hopper
  this.jump = function() {
    console.log(this.y);
    if (this.type == "image") {
      this.image.src = "bilder/steinbilkvadrat.png";
    }
    if (this.y >= 480) {
      this.gravity = -2.5;
    }
    this.height = 60;
  };
  //Funksjonen som bestemmer at spillfiguren dukker
  this.crouch = function(crouched) {
    console.log(this.y);
    if (crouched) {
      if (this.y == 480) {
        if (this.type == "image") {
          this.image.src = "bilder/steinbilcrouch2.png";
        }
        this.height = 30;
        this.y = this.y + 30;
      }
    } else if (crouched == false) {
      this.height = 60;
      if (this.type == "image") {
        this.image.src = "bilder/steinbilkvadrat.png";
      }
    }
  };
  //Funksjonen som skjekker om spillfiguren krasjer med en obstacle.
  this.crashWith = function(otherobj) {
    if (checkCollision) {
      if (otherobj != "") {
        var myleft = this.x; // figur venstre
        var myright = this.x + this.width; //figur høyre
        var mytop = this.y; // figur topp
        var mybottom = this.y + this.height; // figur bunn
        var otherleft = otherobj.x; // obstacle  venstre
        var otherright = otherobj.x + otherobj.width; // obstacle høyre
        var othertop = otherobj.y + otherobj.height; // obstacle topp
        var otherbottom = otherobj.y; // obstacle bunn
        var crash = true;
        //Vi setter crash = true til default, hvis spillfiguren ikke berører en obstacle settes crash til false og spillet fortsetter
        if (
          mybottom < othertop ||
          mytop > otherbottom ||
          myright < otherleft ||
          myleft > otherright
        ) {
          crash = false;
        }
        return crash;
      }
    }
  };
  //Funksjonen som skjekker om spillfiguren krasjer med en powerup
  this.pickUp = function(otherobj) {
    //if(checkCollision) {
    var myleft = this.x; // figur venstre
    var myright = this.x + this.width; //figur høyre
    var mytop = this.y; // figur topp
    var mybottom = this.y + this.height; // figur bunn
    var otherleft = otherobj.x; // obstacle  venstre
    var otherright = otherobj.x + otherobj.width; // obstacle høyre
    var othertop = otherobj.y; // obstacle topp
    var otherbottom = otherobj.y + otherobj.height; // obstacle bunn
    var pickedup = true;
    ///Vi setter pickedup = true til default, hvis spillfiguren ikke berører en obstacle setters pickedup til false og spillet fortsetter
    if (
      mybottom < othertop ||
      mytop > otherbottom ||
      myright < otherleft ||
      myleft > otherright
    ) {
      pickedup = false;
    }
    return pickedup;
    //return crash;
    //  }
  };
}
let currentLevel = 0;
let level = "";
//Funksjonen som oppdaterer canvasen
function updateGameArea() {
  var lastTry = true;
  myGameArea.clear();
  myGamePiece.newPos();
  myGamePiece.update();
  if(currentLevel == 0) {
    level = "Level 1: Midtbyen";
    textX = 200;
    currentLevel++;
  }
  levelText(level); //Tekst som kommer når spilleren når nytt nivå
  text.font = "24px Arial";
  text.fillStyle = "#FDC949";
  text.strokeStyle = "black";
  ctx.lineWidth = 3;
  text.strokeText("Score: " + score, 680, 70);
  text.strokeText("Highscore: " + highscore, 680, 95);
  text.fillText("Score: " + score, 680, 70);
  text.fillText("Highscore: " + highscore, 680, 95);

  if ((spook == true || dobbel == true) && gameRunning == true) {
    text.font = "24px Arial";
    text.fillStyle = "#FDC949";
    text.strokeStyle = "black";
    ctx.lineWidth = 3;
    text.strokeText(powerMelding, 200, 200);
    text.fillText(powerMelding, 200, 200); //Beskjed som kommer når spillfiguren plukker opp en powerup
  }
  //Forloop som stopper objectene da de går ut av canvasen slik at de ikke fortsetter i evigheten
  for (let i = 0; i < myObstacles.length; i += 1) {
    if (myObstacles[i] != "") {
      myObstacles[i].x -= 6;
      myObstacles[i].update();
      if (myObstacles[i].x < -40) {
        myObstacles[i] = "";
      }
    }
    //Gir brukeren poeng dersom spillfiguren har passert en obstacle
    if (
      myObstacles[i].x < myGamePiece.x + 3 &&
      myObstacles[i].x > myGamePiece.x - 3
    ) {
      setTimeout(function() {
        lastTry = true;
      }, 3000);
      if (lastTry == true) {
        score += 25 * poengMultiplier;
        lastTry = false;
      }
    }
  }
  //Tegner opp flere obstacles oppå hverandre
  for (let i = 0; i < myTiles.length; i += 1) {
    for (let j = 0; j < myTiles[i].length; j++) {
      if (myTiles[i][j] != "") {
        myTiles[i][j].x -= 6;
        myTiles[i][j].update();
        if (myTiles[i][j].x < -40) {
          myTiles[i][j] = "";
        }
      }
    }
  }
  //Opretter powerups og sender dem mot spillfiguren
  for (let i = 0; i < mySpawnedPowerUps.length; i += 1) {
    if (mySpawnedPowerUps[i] != "") {
      mySpawnedPowerUps[i].x -= 2;
      mySpawnedPowerUps[i].update();
      if (mySpawnedPowerUps[i].x < -100) {
        mySpawnedPowerUps[i] = "";
      }
      //Det som skjer dersom spillfiguren plukker opp en powerup
      if (myGamePiece.pickUp(mySpawnedPowerUps[i])) {
        var currentPowerup = parseInt(mySpawnedPowerUps[i].powerup);
        myPowerUps[0][currentPowerup]();
        if (mySpawnedPowerUps[i].powerup == 0) {
          powerMelding = "Boo, du er udødelig i 5 sekunder!";
          spook = true;
        } else if (mySpawnedPowerUps[i].powerup == 1) {
          powerMelding = "x2 Poeng!";
          dobbel = true;
        } else if (mySpawnedPowerUps[i].powerup == 2) {
          powerMelding = "500 BONUS!";
          spook = true;
        } else if (mySpawnedPowerUps[i].powerup == 3) {
          powerMelding = "Å nei, tyven tok 250 poeng!";
          spook = true;
        }

        setTimeout(spooking, 5000); //Hvor lenge man får tilbakemelding dersom man har plukket opp en powerup
        function spooking() {
          spook = false;
        }
        setTimeout(dobbeling, 10000);
        function dobbeling() {
          dobbel = false;
        }
        mySpawnedPowerUps[i] = "";
      }
    }
  }
  for (let i = 0; i < myObstacles.length; i += 1) {
    if (myGamePiece.crashWith(myObstacles[i])) {
      myGameArea.stop();
      //Bestemmer highscore
      if (score > highscore) {
        highscore = score;
        newHighscore();
      }
      text.font = "24px Arial";
      text.fillStyle = "#FDC949";
      text.strokeStyle = "black";
      ctx.lineWidth = 3;
      text.strokeText("Du tapte!", 200, 200);
      text.fillText("Du tapte!", 200, 200);
      text.font = "15px Arial";
      text.strokeText("Vil du prøve på nytt? Trykk på space", 160, 240);
      text.fillText("Vil du prøve på nytt? Trykk på space", 160, 240);
      return;
    }
  }
  if (score >= 1000 && score < 2000) {
    myGameArea.canvas.style.backgroundImage = "url(bilder/level2.png)";
    level = "Level 2: Høgskoleparken";
    if(currentLevel == 1) {
      textX = 200
      currentLevel++;
    }
  } else if (score >= 2000) {
    myGameArea.canvas.style.backgroundImage = "url(bilder/NTNU.png)";
    if (light) {
      lightInterval = setInterval(randomLighting, 1000);
    }
    light = false;
    level = "Level 3: Gløshaugen";
    if(currentLevel == 2) {
      textX = 200;
      currentLevel++;
    }
  }

  muter.update();
}
let light = true;

var lightInterval;
function randomLighting() {
  // Definerer hvor ofte en powerup skal spawne
  let spawnRate =
    Math.random() < 0.8 ? Math.floor(Math.random() * (6 - 4) + 4) * 1000 : 50;
  window.setTimeout(startLight, spawnRate);
}
function startLight() {
  if (score > 2500) {
    myGameArea.context.fillStyle = "rgba(255,255,255,0.25)";
    myGameArea.context.fillRect(
     0,
     0,
     myGameArea.canvas.width,
     myGameArea.canvas.height
    );
  }
}
var muter = new component(20, 20, "bilder/speaker.png", 10, 10, "image"); //Lager bilde for  mute-knapp

myGameArea.canvas.onclick = e => {
  //Sjekker om x- og y-verdiene til musen er innenfor mute-knapper, og kjører mutefunksjonen hvis de er
  var pos = {
    x: e.clientX - myGameArea.canvas.offsetLeft,
    y: e.clientY - myGameArea.canvas.offsetTop
  };
  console.log(pos.x + ", " + pos.y);
  if (
    pos.x >= muter.x &&
    pos.x <= muter.x + muter.width &&
    (pos.y >= muter.y && pos.y <= muter.y + muter.height)
  ) {
    toggleMute();
  }
};

let spawnRateHard = 0; // Startverdi for en variabel som definerer hvor ofte obstacles skal spawne
let variabel;
var myTiles = [
  // Array som lagrer bildene for obstacles
];
var tilesNr = 0; // Hvor mange obstacles som er laget
function randomTimer() {
  spawnRateHard = Math.floor(Math.random() * (3.2 - 2.7) + 2.7) * 1000;

  let spawnRate = (Math.random() * (4.3 - 3.2) + 3.2) * 1000;
  console.log("Spawnrate: " + spawnRate);

  variabel = spawnRate;

  if (score > 2000) {
    // Obstacles spawner oftere når man kommer over 2000 poeng
    variabel = spawnRateHard;
  }

  window.setTimeout(spawnObstacle, variabel);
}
function spawnObstacle() {
  // Funksjon som oppretter og spawner obstacles

  minWidth = 20;
  maxWidth = 120;
  minHeight = 120;
  maxHeight = 160;
  var chosenValue = Math.random() < 0.5 ? 0 : 40;
  var tiles = Math.random() * maxHeight + minHeight - chosenValue;
  myObstacles.push(
    new component(
      20,
      -tiles, //-(Math.random() * maxHeight + minHeight) - chosenValue,
      "blue",
      960,
      540 - chosenValue
    )
  );
  myTiles.push([]);
  for (let i = 0; i < tiles / 20; i++) {
    // Oppretter bilder for obstacles og legger de oppå obstacles
    myTiles[tilesNr].push(
      new component(
        20,
        -20,
        "bilder/tile.png",
        960,
        540 - chosenValue - i * 20,
        "image"
      )
    );
  }
}

function randomPowerup() {
  // Definerer hvor ofte en powerup skal spawne
  let spawnRate = (Math.random() * (15 - 10) + 10) * 1000;
  window.setTimeout(spawnPowerup, spawnRate);
}

function spawnPowerup() {
  // Spawner powerups
  var powerup = parseInt(Math.floor(Math.random() * myPowerUps[0].length));
  let hoyde = Math.floor(Math.random() * (540 - 100) + 100);
  mySpawnedPowerUps.push(
    new component(60, 60, myPowerUps[1][powerup], 960, hoyde, "image", powerup)
  );
}

var textX = 200;
function levelText(level) {
  // Tekst som kommer når spillet starter
  y = 50;
  textX -= 2;
  text.font = "30px Arial";
  text.fillStyle = "#FDC949";
  text.strokeStyle = "black";
  ctx.lineWidth = 5;
  text.strokeText(level, textX, 125);
  text.fillText(level, textX, 125);
  text.fillText(
    level,
    textX,
    125
  );
}
function newHighscore() {
  // Logger score til spiller, og sjekker om denne er bedre enn gjeldende highscore. Hvis den er større vil den spørre om navnet til spilleren og logge scoren og navn til spilleren i Hall of Fame
  let highScoreField = false;
  if (score >= highscore && score >= 500 && highScoreField == false) {
    highScoreField = true;
    var input = document.createElement("input");
    var btn = document.createElement("button");
    var btntxt = document.createTextNode("Send inn");
    btn.appendChild(btntxt);
    document.getElementById("inputName").appendChild(input);
    document.getElementById("inputName").appendChild(btn);
    input.setAttribute("type", "text");
    input.setAttribute("style", "width:100px;");
    input.setAttribute("autofocus", "");
    input.setAttribute("placeholder", "Playername");
    input.setAttribute("id", "inp");
    btn.setAttribute("id", "btn");
    let pressed = false;
    btn.addEventListener("click", function() {
      pressed = true;
      saveInput(event);
    });
    document.addEventListener("keydown", saveInput);
    reset1 = true;

    function saveInput(evt) {
      if (evt.keyCode == 32 || evt.keyCode == 13 || pressed == true) {
        if (input.value.length >= 1) {
          //Validerer at skjemaet ikke er tomt, og sletter hele boksen i tilfelle spilleren ikke vil lagre sin highscore.
          let scoreTracker = {
            name: [],
            score: []
          };
          scoreTracker.name.push(input.value);
          scoreTracker.score.push(score);
          var scoreinput = document.getElementById("scoreInput");
          var text =
            scoreTracker.name + ", med score " + scoreTracker.score + "!<br />";
          document.getElementById("scoreInput").innerHTML += text;
          scoreTracker.name = "";
          scoreTracker.score = "";
          highScoreField = false;
          document.getElementById("inp").remove(0);
          document.getElementById("btn").remove(0);
          input.value = "";
        } else {
          input.remove(0);
          btn.remove(0);
        }
        pressed = false;
        input.value = "";
      }
    }
  }
}
var mute = false;
function toggleMute() {
  let music = document.getElementById("music");
  mute = !mute;
  if (mute == false) {
    music.muted = false;
    muter.image.src = "bilder/speaker.png";
  } else if (mute) {
    music.muted = true;
    muter.image.src = "bilder/mute.png";
  }
}
