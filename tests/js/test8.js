// Variables globales de utilidad
var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");
var w = canvas.width;
var h = canvas.height;

//variables para colocar a PACMAN en el centro de la pantalla
var homeX = 0;
var homeY = 0;
var tile_w = 0;
var tile_h = 0;

// GAME FRAMEWORK 
var GF = function(){

 // variables para contar frames/s, usadas por measureFPS
    var frameCount = 0;
    var lastTime;
    var fpsContainer;
    var fps; 
 
    //  variable global temporalmente para poder testear el ejercicio
    inputStates = {};


	var Level = function(ctx) {
		this.ctx = ctx;
		this.lvlWidth = 0;
		this.lvlHeight = 0;
		
		this.map = [];
		
		this.pellets = 0;
		this.powerPelletBlinkTimer = 0;

		this.setMapTile = function(row, col, newValue){
			thisLevel.map[(row*21)+col] = newValue;
		};

		this.getMapTile = function(row, col){
			return thisLevel.map[(row*21)+col]; 	
		};

		this.printMap = function(){
			// tu código aquí
		};

		this.loadLevel = function(){
			var file = "res/levels/1.txt";
    		$.get(file, function(data) {
        		var a = {};
        		var index = 0;
        		var linea;
          		var lines = data.split("\n");
          		for (var i = 4; i < lines.length-1; i++) {
	            	linea = lines[i].trim();
            		var num = linea.split(" ");
            		for (var j = 0; j < num.length; j++) {
              			thisLevel.map[index] = num[j];
              			index++;
						var casilla = num[j];
						if (casilla == 4){
							player.homeX = j*thisGame.TILE_WIDTH;
							player.homeY = (i-4)*thisGame.TILE_HEIGHT;
						}
					}
        		}
    		});
		};

        this.drawMap = function(){

	    	var TILE_WIDTH = thisGame.TILE_WIDTH;
	    	var TILE_HEIGHT = thisGame.TILE_HEIGHT;

    		var tileID = {
	    		'door-h' : 20,
				'door-v' : 21,
				'pellet-power' : 3
			};

		 	var casilla = 0;
			ctx.fillStyle="black";
			ctx.fill();
			for (var i = 0; i<thisGame.screenTileSize[1]; i++){
				for (var j = 0; j<=thisGame.screenTileSize[0]; j++){
					casilla = thisLevel.getMapTile(j, i);
					if (casilla == 2){
						ctx.beginPath();
						ctx.arc(i*TILE_HEIGHT+12, j*TILE_WIDTH+12, 5, 0, (Math.PI*360)/180, false);
						ctx.fillStyle="white";
						ctx.fill();
					}
					else if (casilla == 3){
						ctx.beginPath();
						ctx.arc(i*TILE_HEIGHT+12, j*TILE_WIDTH+12, 5, 0, (Math.PI*360)/180, false);
						ctx.fillStyle="red";
						ctx.fill();
					}
					else if (casilla >= 10 && casilla < 14){
						//console.log("FANTASMA");
					}
					else if (casilla >= 100 && casilla < 200){
						ctx.beginPath();
						ctx.rect(i*TILE_HEIGHT, j*TILE_WIDTH, TILE_HEIGHT, TILE_WIDTH);
						ctx.fillStyle="blue";
						ctx.fill();
					}
					ctx.fillStyle="black";
					ctx.fillRect(252,300,1,1);
					ctx.closePath();
				}
			}
		};


		this.isWall = function(row, col) {
			var casilla = thisLevel.getMapTile(col, row);
			if(casilla >= 100 && casilla < 200){
				return true;
			}
			else{
				return false;
			}
		};


		this.checkIfHitWall = function(possiblePlayerX, possiblePlayerY, row, col){
			var x = Math.floor(possiblePlayerX/24);//para saber col y row, TILE_WIDTH fuera de alcance...
			var y = Math.floor(possiblePlayerY/24);
			if(possiblePlayerX/24-x == 0 || possiblePlayerY/24-y == 0){
				return this.isWall(x,y);
			}
			else if(possiblePlayerX/24-x != 0.5 && possiblePlayerY/24-y != 0.5){
				return true; //si no esta centrado no entra
			}
			else{
				return this.isWall(x,y);
			}

		};

		this.checkIfHitSomething = function(playerX, playerY, row, col){
			var tileID = {
	    		'door-h' : 20,
				'door-v' : 21,
				'pellet-power' : 3,
				'pellet': 2
			};

			//  Gestiona la recogida de píldoras

			if(row == null && col == null){
				var x = Math.floor(playerX/thisGame.TILE_WIDTH);
				var y = Math.floor(playerY/thisGame.TILE_HEIGHT);
			}
			else{
				x = col;
				y = row;
			}

			var casilla = thisLevel.getMapTile(y, x);
			if(casilla == tileID["pellet"]){
				thisLevel.setMapTile(y,x,0);
				thisLevel.pellets --;
				if(thisLevel.pellets==0){
					console.log("Next level!");
				}
			}

			if(casilla == 20){
				for(var i = 0; i<thisLevel.lvlWidth; i++){
					if(thisLevel.getMapTile(y,i) == 20 && x != i){
						if(x>i){
							player.x = (i-1)*thisGame.TILE_WIDTH+thisGame.TILE_WIDTH/2;
						}else{
							player.x = (i+1)*thisGame.TILE_WIDTH+thisGame.TILE_WIDTH/2;
						}
					}
				}
			}

			if(casilla == 21){
				for(var j = 0; j<thisLevel.lvlHeight; j++){
					if(thisLevel.getMapTile(j,x) == 21 && y != j){
						if(y>j){
							player.y = (j-1)*thisGame.TILE_HEIGHT+thisGame.TILE_HEIGHT/2;
						}else{
							player.y = (j+1)*thisGame.TILE_HEIGHT+thisGame.TILE_HEIGHT/2;
						}
					}
				}
			}

			
		};

	}; // end Level 

	var Pacman = function() {
		this.radius = 10;
		this.x = 0;
		this.y = 0;
		this.speed = 3;
		this.angle1 = 0.25;
		this.angle2 = 1.75;
	};
	Pacman.prototype.move = function() {

		var x = Math.floor(player.x/24);//para saber col y row, TILE_WIDTH fuera de alcance...
        var y = Math.floor(player.y/24);
		// Tu código aquí
		if(player.velX>0 && !thisLevel.checkIfHitWall(player.x+player.radius+player.velX,player.y)){
			player.x += player.velX;
		}
		if(player.velX<0 && !thisLevel.checkIfHitWall(player.x-player.radius+player.velX,player.y)){
			player.x += player.velX;
		}
		if(player.velY>0 && player.y < w-player.radius && !thisLevel.checkIfHitWall(player.x,player.y+player.radius+player.velY)){
			player.y += player.velY;
		}
		if(player.velY<0 && player.y-player.radius > 0 && !thisLevel.checkIfHitWall(player.x,player.y-player.radius+player.velY)){
			player.y += player.velY;
		}
		
		thisLevel.checkIfHitSomething(this.x, this.y, this.nearestRow, this.nearestCol);

	};


     // Función para pintar el Pacman
     Pacman.prototype.draw = function(x, y) {
         
       ctx.beginPath();
       ctx.arc(this.x,this.y,this.radius,this.angle1*Math.PI,this.angle2*Math.PI, false);
       ctx.lineTo(this.x,this.y);
       ctx.closePath();
       ctx.fillStyle = 'yellow';
       ctx.fill();
	   ctx.strokeStyle="black"; 	
       ctx.stroke();	     
    };

	var player = new Pacman();

	var thisGame = {
		getLevelNum : function(){
			return 0;
		},
		screenTileSize: [24, 21],
		TILE_WIDTH: 24, 
		TILE_HEIGHT: 24
	};

	// thisLevel global para poder realizar las pruebas unitarias
	thisLevel = new Level(canvas.getContext("2d"));
	thisLevel.loadLevel( thisGame.getLevelNum() );
	// thisLevel.printMap(); 



	var measureFPS = function(newTime){
		// la primera ejecución tiene una condición especial

		if(lastTime === undefined) {
			lastTime = newTime; 
			return;
		}

		// calcular el delta entre el frame actual y el anterior
		var diffTime = newTime - lastTime; 

		if (diffTime >= 1000) {

			fps = frameCount;    
			frameCount = 0;
			lastTime = newTime;
		}

		// mostrar los FPS en una capa del documento
		// que hemos construído en la función start()
		fpsContainer.innerHTML = 'FPS: ' + fps; 
		frameCount++;
	};

	// clears the canvas content
	var clearCanvas = function() {
		ctx.clearRect(0, 0, w, h);
	};

	var checkInputs = function(){
		if (inputStates.left == true && !thisLevel.checkIfHitWall(player.x-player.radius-player.speed,player.y)) {
     	var x=Math.floor((player.x-player.radius-player.speed)/thisGame.TILE_WIDTH)
		var y=Math.floor((player.y)/thisGame.TILE_HEIGHT);
		if(player.x-player.radius-player.speed/thisGame.TILE_WIDTH-x==0.5 || player.y/thisGame.TILE_HEIGHT-y==0.5){
			player.velY=0;
			player.velX=-player.speed;
		}
    	}else if (inputStates.right == true && !thisLevel.checkIfHitWall(player.x+player.radius+player.speed,player.y)) {
    		var x=Math.floor((player.x+player.radius+player.speed)/thisGame.TILE_WIDTH)
			var y=Math.floor((player.y)/thisGame.TILE_HEIGHT);
			if(player.x+player.radius+player.speed/thisGame.TILE_WIDTH-x==0.5 || player.y/thisGame.TILE_HEIGHT-y==0.5){
				player.velY=0;
				player.velX=player.speed;
			}
    	}else if (inputStates.up == true && !thisLevel.checkIfHitWall(player.x,player.y-player.radius-player.speed)) {
    		var x=Math.floor((player.x)/thisGame.TILE_WIDTH)
			var y=Math.floor((player.y-player.radius-player.speed)/thisGame.TILE_HEIGHT);
			if(player.x/thisGame.TILE_WIDTH-x==0.5 || player.y-player.radius-player.speed/thisGame.TILE_HEIGHT-y==0.5){
				player.velY=-player.speed;
				player.velX=0;
			}
    	}else if (inputStates.down == true && !thisLevel.checkIfHitWall(player.x,player.y+player.radius+player.speed)) {
    		var x=Math.floor((player.x)/thisGame.TILE_WIDTH)
			var y=Math.floor((player.y+player.radius+player.speed)/thisGame.TILE_HEIGHT);
			if(player.x/thisGame.TILE_WIDTH-x==0.5 || player.y+player.radius+player.speed/thisGame.TILE_HEIGHT-y==0.5){
				player.velY=player.speed;
				player.velX=0;
			}
    	}
	};


 
    var mainLoop = function(time){
        //main function, called each frame 
        measureFPS(time);
     
		checkInputs();
 
		player.move();
        // Clear the canvas
        clearCanvas();
   
		thisLevel.drawMap();

 		player.homeX = homeX*tile_w;
 		player.homeY = homeY*tile_h;
		player.draw();
        // call the animation loop every 1/60th of second
        requestAnimationFrame(mainLoop);
    };

    var addListeners = function(){
		window.onkeydown = function(e){
	    	var code = e.keyCode ? e.keyCode : e.which;
	    	if(code === 37){
	    		inputStates.left = true;
	    	}
	    	else if(code === 38){
	    		inputStates.up = true;
	    	}
	    	else if(code === 39){
	    		inputStates.right = true;
	    	}
	    	else if(code === 40){
	    		inputStates.down = true;
	    	};
	    };

	    window.onkeyup = function(e){
	    	var code = e.keyCode ? e.keyCode : e.which;
	    	if(code === 37){
	    		inputStates.left = false;
	    	}
	    	else if(code === 38){
	    		inputStates.up = false;
	    	}
	    	else if(code === 39){
	    		inputStates.right = false;
	    	}
	    	else if(code === 40){
	    		inputStates.down = false;
	    	};
	    };
    };

    var reset = function(){
	// Tu código aquí
	// Inicialmente Pacman debe empezar a moverse en horizontal hacia la derecha, con una velocidad igual a su atributo speed
	// inicializa la posición inicial de Pacman tal y como indica el enunciado
    	player.velX = player.speed;
		player.velY = 0;
		player.x = player.homeX+12;
		player.y = player.homeY+12;
    };

    var start = function(){
        // adds a div for displaying the fps value
        fpsContainer = document.createElement('div');
        document.body.appendChild(fpsContainer);
       
		addListeners();

		reset();

        // start the animation
        requestAnimationFrame(mainLoop);
    };

    //our GameFramework returns a public API visible from outside its scope
    return {
        start: start
    };
};



  var game = new GF();
  setTimeout(function(){  
  	game.start();
  }, 1000);


  var numPellets;

test('Comiendo pi`ldoras', function(assert) {
	numPellets = thisLevel.pellets;
  	var done = assert.async();
  	setTimeout(function() {
		assert.ok( numPellets - 2 == thisLevel.pellets  , "Pacman comienza movi'endose hacia el este. Al parar, habra' comido dos pi'ldoras" );
    		   done();
  }, 1500);

});

