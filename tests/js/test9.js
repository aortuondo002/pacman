// Variables globales de utilidad
var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");
var w = canvas.width;
var h = canvas.height;


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
		// tu código aquí
		thisLevel.map[(row*thisLevel.lvlWidth)+col] = newValue;
	};

	this.getMapTile = function(row, col){
		// tu código aquí
		return thisLevel.map[(row*thisLevel.lvlWidth)+col];
	};

	this.printMap = function(){
		// tu código aquí
	};

	this.loadLevel = function(){
		// leer res/levels/1.txt y guardarlo en el atributo map	
		// haciendo uso de setMapTile
		$.get( "res/levels/1.txt", function( data ) {
			datos = data.split("\n");
			for (var i = 0, len = datos.length; i < len-3; i++) {
				datos[i] = datos[i].replace(/\s+$/,'');
				datos[i] = datos[i].split(" ");
			}
			thisLevel.lvlWidth = datos[0][2];
			thisLevel.lvlHeight = datos[1][2];

			for (var i = 4, len = datos.length; i < len-3; i++) {
				for (var j=0; j<datos[i].length; j++) {
					thisLevel.setMapTile(i-4,j,datos[i][j])
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
		
		var baldosa;
		var pellet = 0;
		for(var i = 0; i<thisLevel.lvlWidth; i++){
			for(var j = 0; j<thisLevel.lvlHeight; j++){
				baldosa = thisLevel.getMapTile(j,i);
				if(baldosa == 0 || baldosa == 21 || baldosa == 20){
					null;
				}
				if(baldosa == 2){
					ctx.beginPath();
					ctx.arc((i*TILE_WIDTH)+TILE_WIDTH/2,(j*TILE_HEIGHT)+TILE_HEIGHT/2,5,0,Math.PI*2,true);
					ctx.closePath();
					ctx.fillStyle = 'white';
					ctx.strokeStyle = 'white';
					ctx.fill();
					ctx.stroke();
					pellet++;
				}
				if(baldosa == 3){
					if(thisLevel.powerPelletBlinkTimer < 30){
						ctx.beginPath();
						ctx.arc((i*TILE_WIDTH)+TILE_WIDTH/2,(j*TILE_HEIGHT)+TILE_HEIGHT/2,5,0,Math.PI*2,true);
						ctx.closePath();
						ctx.fillStyle = 'red';
						ctx.strokeStyle = 'red';
						ctx.fill();
						ctx.stroke();
					}
				}
				if(baldosa == 4){
					player.x = i*TILE_WIDTH+TILE_WIDTH/2;
					player.y = j*TILE_HEIGHT+TILE_HEIGHT/2;
					player.homeX = i*TILE_WIDTH+TILE_WIDTH/2;
					player.homeY = j*TILE_HEIGHT+TILE_HEIGHT/2;
					thisLevel.setMapTile(j,i,0);
				}
				if(baldosa == 11 || baldosa == 12 || baldosa == 13){
					ctx.beginPath();
					ctx.moveTo(i*TILE_WIDTH,j*TILE_HEIGHT);
					ctx.lineTo(i*TILE_WIDTH+TILE_WIDTH,j*TILE_HEIGHT);
					ctx.lineTo(i*TILE_WIDTH+TILE_WIDTH,j*TILE_HEIGHT+TILE_HEIGHT);
					ctx.lineTo(i*TILE_WIDTH,j*TILE_HEIGHT+TILE_HEIGHT);
					ctx.closePath();
					ctx.fillStyle = 'black';
					ctx.strokeStyle = 'black';
					ctx.fill();
					ctx.stroke();
				}
				if(baldosa >= 100){
					ctx.beginPath();
					ctx.moveTo(i*TILE_WIDTH,j*TILE_HEIGHT);
					ctx.lineTo(i*TILE_WIDTH+TILE_WIDTH,j*TILE_HEIGHT);
					ctx.lineTo(i*TILE_WIDTH+TILE_WIDTH,j*TILE_HEIGHT+TILE_HEIGHT);
					ctx.lineTo(i*TILE_WIDTH,j*TILE_HEIGHT+TILE_HEIGHT);
					ctx.closePath();
					ctx.fillStyle = 'blue';
					ctx.strokeStyle = 'blue';
					ctx.fill();
					ctx.stroke();
				}
			}
		}
		thisLevel.pellets = pellet;
	};


		this.isWall = function(row, col) {
			// Tu código aquí
			var baldosa = thisLevel.getMapTile(col,row);
			if (baldosa >= 100){
				return true;
			}else{
				return false;
			}
		};


		this.checkIfHitWall = function(possiblePlayerX, possiblePlayerY, row, col){
			// Tu código aquí
			// Determinar si el jugador va a moverse a una fila,columna que tiene pared 
			// Hacer uso de isWall
			var x = Math.floor(possiblePlayerX/thisGame.TILE_WIDTH);//para saber col y row, TILE_WIDTH fuera de alcance...
			var y = Math.floor(possiblePlayerY/thisGame.TILE_HEIGHT);
			if(possiblePlayerX/thisGame.TILE_WIDTH-x == 0 || possiblePlayerY/thisGame.TILE_HEIGHT-y == 0){
				return this.isWall(x,y);
			}else if(possiblePlayerX/thisGame.TILE_WIDTH-x != 0.5 && possiblePlayerY/thisGame.TILE_HEIGHT-y != 0.5){
				return true; //si no esta centrado no entra
			}else{
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
		// tras actualizar this.x  y  this.y... 
		// check for collisions with other tiles (pellets, etc)
		thisLevel.checkIfHitSomething(this.x, this.y, this.nearestRow, this.nearestCol);
		// ....

	};


    // Función para pintar el Pacman
    Pacman.prototype.draw = function(x, y) {
		// Pac Man
		// tu código aquí	     
		ctx.beginPath();
       	ctx.arc(this.x,this.y,this.radius,this.angle1*Math.PI,this.angle2*Math.PI, false);
       	ctx.lineTo(this.x,this.y);
       	ctx.closePath();
       	ctx.fillStyle = 'yellow';
       	ctx.fill();
       	ctx.stroke();
    };

	/*var*/ player = new Pacman();
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
		// tu código aquí
		// LEE bien el enunciado, especialmente la nota de ATENCION que
		// se muestra tras el test 7
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

		thisLevel.powerPelletBlinkTimer ++;
		if (thisLevel.powerPelletBlinkTimer == 60){thisLevel.powerPelletBlinkTimer = 0;}
 
		player.draw();
        // call the animation loop every 1/60th of second
        requestAnimationFrame(mainLoop);
    };

    var addListeners = function(){
	    //add the listener to the main, window object, and update the states
	    // Tu código aquí
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
  game.start();


test('Puertas teletransportadoras (i)', function(assert) {

  	var done = assert.async();
  	setTimeout(function() {
		player.x = 459;
		player.y = 288;
		var row = 12;
		var col = 20;
		thisLevel.checkIfHitSomething(player.x, player.y, row, col); // Pacman entra por la puerta lateral derecha
		assert.ok(  player.x < 100 && player.y == 288 , "Pacman debe aparecer en la misma fila, pero en la puerta lateral izquierda" );

    		   done();
  }, 1000);

});

test('Puertas teletransportadoras (ii)', function(assert) {

  	var done = assert.async();
  	setTimeout(function() {
		player.x = 21;
		player.y = 288;
		var row = 12;
		var col = 0;
		thisLevel.checkIfHitSomething(player.x, player.y, row, col); // Pacman entra por la puerta lateral izquierda 
		assert.ok(  player.x > 400 && player.y == 288 , "Pacman debe aparecer en la misma fila, pero en la puerta lateral derecha" );

    		   done();
  }, 2000);

});



test('Puertas teletransportadoras (iii)', function(assert) {

  	var done = assert.async();
  	setTimeout(function() {
		player.x = 240;
		player.y = 21;
		var row = 0;
		var col = 10;
		thisLevel.checkIfHitSomething(player.x, player.y, row, col); // Pacman entra por la puerta superior  
		assert.ok(  player.x == 240 && player.y > 400 , "Pacman debe aparecer en la misma columna, pero en la puerta inferior" );

    		   done();
  }, 3000);

});

test('Puertas teletransportadoras (iv)', function(assert) {

  	var done = assert.async();
  	setTimeout(function() {
		player.x = 240;
		player.y = 555;
		var row = 24;
		var col = 10;
		thisLevel.checkIfHitSomething(player.x, player.y, row, col); // Pacman entra por la puerta inferior
		assert.ok(  player.x == 240 && player.y < 30 , "Pacman debe aparecer en la misma columna, pero en la puerta superior" );

    		   done();
  }, 4000);

});
