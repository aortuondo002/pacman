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

    const TILE_WIDTH=24, TILE_HEIGHT=24;
    var numGhosts = 4;
	var ghostcolor = {};
	ghostcolor[0] = "rgba(255, 0, 0, 255)";
	ghostcolor[1] = "rgba(255, 128, 255, 255)";
	ghostcolor[2] = "rgba(128, 255, 255, 255)";
	ghostcolor[3] = "rgba(255, 128, 0,   255)";

	ghostcolor[4] = "rgba(50, 50, 255,   255)"; // blue, vulnerable ghost
	ghostcolor[5] = "rgba(255, 255, 255, 255)"; // white, flashing ghost


	// hold ghost objects
	var ghosts = {};

    var Ghost = function(id, ctx){

		this.x = 0;
		this.y = 0;
		this.velX = 0;
		this.velY = 0;
		this.speed = 1;
		
		this.nearestRow = 0;
		this.nearestCol = 0;
	
		this.ctx = ctx;
	
		this.id = id;
		this.homeX = 0;
		this.homeY = 0;

		this.draw = function(){
			// Pintar cuerpo de fantasma
			ctx.beginPath();
			ctx.moveTo(this.x+thisGame.TILE_WIDTH/2,this.y);
			ctx.arc(this.x,this.y,thisGame.TILE_WIDTH/2,0,Math.PI,1);
			ctx.lineTo(this.x-thisGame.TILE_WIDTH/2,this.y+thisGame.TILE_HEIGHT/2);
			ctx.lineTo(this.x+thisGame.TILE_WIDTH/2,this.y+thisGame.TILE_HEIGHT/2);
			this.ctx.fillStyle = ghostcolor[this.id];
			this.ctx.strokeStyle = ghostcolor[this.id];
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			// Pintar ojos 
			ctx.beginPath();
			ctx.arc(this.x+thisGame.TILE_WIDTH/4,this.y-thisGame.TILE_HEIGHT/4,TILE_WIDTH/6,0,2*Math.PI,1);
			ctx.fillStyle = "white";
			this.ctx.strokeStyle = ghostcolor[this.id];
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			ctx.beginPath();
			ctx.arc(this.x-thisGame.TILE_WIDTH/4,this.y-thisGame.TILE_HEIGHT/4,TILE_WIDTH/6,0,2*Math.PI,1);
			ctx.fillStyle = "white";
			this.ctx.strokeStyle = ghostcolor[this.id];
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		}; // draw

	    this.move = function() {
			var col = Math.floor(this.x/thisGame.TILE_WIDTH);
			var row = Math.floor(this.y/thisGame.TILE_HEIGHT);
			if((this.x/thisGame.TILE_WIDTH)-col == 0.5 && (this.y/thisGame.TILE_HEIGHT)-row == 0.5){
				var posibleMov = [[0,-1],[1,0],[0,1],[-1,0]];
				var solucion = [];
				for(var i = 0; i<posibleMov.length; i++){
					if(!thisLevel.isWall(col+posibleMov[i][0],row+posibleMov[i][1])  //isWall 
						&& thisLevel.getMapTile(row+posibleMov[i][1],col+posibleMov[i][0]) != 21 
						&& thisLevel.getMapTile(row+posibleMov[i][1],col+posibleMov[i][0]) != 20){
						solucion.push(posibleMov[i]);
					}//else if()//salir de la caja
				}
				if(solucion.length>1){
					if(solucion.length>2 || (solucion[0][0] != solucion[1][0] && solucion[0][1] != solucion[1][1])){
						var direccion = Math.floor((Math.random() * solucion.length) + 0);
						direccion = solucion[direccion];
						if(direccion[0] != 0){
							this.velY = 0;
							if(direccion[0] > 0){
								this.velX = this.speed;
							}else{
								this.velX = 0 - this.speed;
							}
						}else{
							this.velX = 0;
							if(direccion[1] > 0){
								this.velY = this.speed;
							}else{
								this.velY = 0 - this.speed;
							}
						}
					}
				}
				else{
					if(solucion[0][0] != 0){
						this.velY = 0;
						if(solucion[0][0] > 0){
							this.velX = this.speed;
						}else{
							this.velX = 0 - this.speed;
						}
					}else{
						this.velX = 0;
						if(solucion[0][1] > 0){
							this.velY = this.speed;
						}else{
							this.velY = 0 - this.speed;
						}
					}
				}
			}
			this.x += this.velX;
			this.y += this.velY;
			//}
		};

	};

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
					if(baldosa == 10){
						ghosts[0].x = i*TILE_WIDTH+TILE_WIDTH/2;
						ghosts[0].y = j*TILE_HEIGHT+TILE_HEIGHT/2;
						ghosts[0].homeX = i*TILE_WIDTH+TILE_WIDTH/2;
						ghosts[0].homeY = j*TILE_HEIGHT+TILE_HEIGHT/2;
						thisLevel.setMapTile(j,i,0);
					}
					if(baldosa == 11){
						ghosts[1].x = i*TILE_WIDTH+TILE_WIDTH/2;
						ghosts[1].y = j*TILE_HEIGHT+TILE_HEIGHT/2;
						ghosts[1].homeX =i*TILE_WIDTH+TILE_WIDTH/2;
						ghosts[1].homeY = j*TILE_HEIGHT+TILE_HEIGHT/2;
						thisLevel.setMapTile(j,i,0);
					}
					if(baldosa == 12){
						ghosts[2].x = i*TILE_WIDTH+TILE_WIDTH/2;
						ghosts[2].y = j*TILE_HEIGHT+TILE_HEIGHT/2;
						ghosts[2].homeX = i*TILE_WIDTH+TILE_WIDTH/2;
						ghosts[2].homeY = j*TILE_HEIGHT+TILE_HEIGHT/2;
						thisLevel.setMapTile(j,i,0);
					}
					if(baldosa == 13){
						ghosts[3].x = i*TILE_WIDTH+TILE_WIDTH/2;
						ghosts[3].y = j*TILE_HEIGHT+TILE_HEIGHT/2;
						ghosts[2].homeX = i*TILE_WIDTH+TILE_WIDTH/2;
						ghosts[2].homeY = j*TILE_HEIGHT+TILE_HEIGHT/2;
						thisLevel.setMapTile(j,i,0);
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
			var baldosa = thisLevel.getMapTile(col,row);
			if (baldosa >= 100){
				return true;
			}else{
				return false;
			}
		};


		this.checkIfHitWall = function(possiblePlayerX, possiblePlayerY, row, col){
			
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

			if(row == null && col == null){
				var x = Math.floor(playerX/thisGame.TILE_WIDTH);
				var y = Math.floor(playerY/thisGame.TILE_HEIGHT);
			}else{
				x = col;
				y = row;
			}
			var baldosa = thisLevel.getMapTile(y,x);
			if(baldosa==tileID["pellet"]){
				thisLevel.setMapTile(y,x,0);
				thisLevel.pellets --;
				if(thisLevel.pellets==0){
					console.log("Siguiente nivel!!");
				}
			}
			if(baldosa==tileID["door-h"]){
				for(var i = 0; i<thisLevel.lvlWidth; i++){
					if(thisLevel.getMapTile(y,i)==tileID["door-h"] && x != i){
						if(x>i){
							player.x = (i+1)*thisGame.TILE_WIDTH+thisGame.TILE_WIDTH/2;
						}else{
							player.x = (i-1)*thisGame.TILE_WIDTH+thisGame.TILE_WIDTH/2;
						}
					}
				}
			}
			if(baldosa==tileID["door-v"]){
				for(var j = 0; j<thisLevel.lvlHeight; j++){
					if(thisLevel.getMapTile(j,x) == tileID["door-v"] && y != j){
						if(y>j){
							player.y = (j+1)*thisGame.TILE_HEIGHT+thisGame.TILE_HEIGHT/2;
						}else{
							player.y = (j-1)*thisGame.TILE_HEIGHT+thisGame.TILE_HEIGHT/2;
						}
					}
				}
			}
		};
	};

	this.checkIfHit = function(playerX, playerY, x, y, holgura){
		

	}

	var Pacman = function() {
		this.radius = 10;
		this.x = 0;
		this.y = 0;
		this.speed = 3;
		this.angle1 = 0.25;
		this.angle2 = 1.75;
	};
	Pacman.prototype.move = function() {

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


    Pacman.prototype.draw = function(x, y) {
		ctx.beginPath();
       	ctx.arc(this.x,this.y,this.radius,this.angle1*Math.PI,this.angle2*Math.PI, false);
       	ctx.lineTo(this.x,this.y);
       	ctx.closePath();
       	ctx.fillStyle = 'yellow';
       	ctx.fill();
       	ctx.stroke();	     
    };

	var player = new Pacman();
	for (var i=0; i< numGhosts; i++){
		ghosts[i] = new Ghost(i, canvas.getContext("2d"));
	}


	var thisGame = {
		getLevelNum : function(){
			return 0;
		},
		screenTileSize: [24, 21],
		TILE_WIDTH: 24, 
		TILE_HEIGHT: 24
	};

	var thisLevel = new Level(canvas.getContext("2d"));
	thisLevel.loadLevel( thisGame.getLevelNum() );



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
		if(inputStates.right && !thisLevel.checkIfHitWall(player.x+player.radius+player.speed,player.y)){
			var x = Math.floor((player.x+player.radius+player.speed)/thisGame.TILE_WIDTH)
			var y = Math.floor((player.y)/thisGame.TILE_HEIGHT)
			if(player.x+player.radius+player.speed/thisGame.TILE_WIDTH-x == 0.5 || player.y/thisGame.TILE_HEIGHT-y == 0.5){
				player.velY = 0;
				player.velX = player.speed;
			}
		}
		if(inputStates.down && !thisLevel.checkIfHitWall(player.x,player.y+player.radius+player.speed)){
			var x = Math.floor((player.x)/thisGame.TILE_WIDTH)
			var y = Math.floor((player.y+player.radius+player.speed)/thisGame.TILE_HEIGHT)
			if(player.x/thisGame.TILE_WIDTH-x == 0.5 || player.y+player.radius+player.speed/thisGame.TILE_HEIGHT-y == 0.5){
				player.velX = 0;
				player.velY = player.speed;
			}
		}
		if(inputStates.left && !thisLevel.checkIfHitWall(player.x-player.radius-player.speed,player.y)){
			var x = Math.floor((player.x-player.radius-player.speed)/thisGame.TILE_WIDTH)
			var y = Math.floor((player.y)/thisGame.TILE_HEIGHT)
			if(player.x-player.radius-player.speed/thisGame.TILE_WIDTH-x == 0.5 || player.y/thisGame.TILE_HEIGHT-y == 0.5){
				player.velY = 0;
				player.velX = 0-player.speed;
			}
		}
		if(inputStates.up && !thisLevel.checkIfHitWall(player.x,player.y-player.radius-player.speed)){
			var x = Math.floor((player.x)/thisGame.TILE_WIDTH)
			var y = Math.floor((player.y-player.radius-player.speed)/thisGame.TILE_HEIGHT)
			if(player.x/thisGame.TILE_WIDTH-x == 0.5 || player.y-player.radius-player.speed/thisGame.TILE_HEIGHT-y == 0.5){
				player.velX = 0;
				player.velY = 0-player.speed;
			}
		}else{
			player.velX = player.velX;
			player.velY = player.velY;
		}
	};


 
    var mainLoop = function(time){
        //main function, called each frame 
        measureFPS(time);
     
		checkInputs();

		
		for (var i=0; i< numGhosts; i++){
			ghosts[i].move();
		}

		player.move();

        clearCanvas();
   
		thisLevel.drawMap();

		thisLevel.powerPelletBlinkTimer ++;
		if (thisLevel.powerPelletBlinkTimer == 60){
			thisLevel.powerPelletBlinkTimer = 0;
		}

		for (var i=0; i< numGhosts; i++){
			ghosts[i].draw();
		}
 
		player.draw();
        
        requestAnimationFrame(mainLoop);
    };

    var addListeners = function(){
	    //add the listener to the main, window object, and update the states
	    // Tu código aquí
		window.addEventListener("keydown", function(e){
			var key = e.which;
			if(key == 37){
				inputStates.right = false;
				inputStates.up = false;
				inputStates.down = false;
				inputStates.left = true;
			}
			if(key == 38){
				inputStates.right = false;
				inputStates.down = false;
				inputStates.left = false;
				inputStates.up = true;
			}
			if(key == 39){
				inputStates.up = false;
				inputStates.down = false;
				inputStates.left = false;
				inputStates.right = true;
			}
			if(key == 40){
				inputStates.right = false;
				inputStates.up = false;
				inputStates.left = false;
				inputStates.down = true;
			}
			if(key == 32){
				console.log("has pulsado espacio ^^");
			}
		});
    };

    var reset = function(){
	// Tu código aquí
	// Inicialmente Pacman debe empezar a moverse en horizontal hacia la derecha, con una velocidad igual a su atributo speed
	// inicializa la posición inicial de Pacman tal y como indica el enunciado
	// Tu código aquí (test10)
	// Inicializa los atributos x,y, velX, velY, speed de la clase Ghost de forma conveniente
		player.x = player.homeX;
		player.y = player.homeY;
		inputStates.up = false;
		inputStates.down = false;
		inputStates.left = false;
		inputStates.right = true;
		player.velX = 0;
		player.velY = 0;

		for (var i=0; i< numGhosts; i++){
			ghosts[i].x = ghosts[i].homeX;
			ghosts[i].y = ghosts[i].homeY;
		}
		ghosts[0].velX = ghosts[0].speed;
		ghosts[0].velY = 0;
		ghosts[1].velX = ghosts[1].speed;
		ghosts[1].velY = 0;
		ghosts[2].velX = 0;
		ghosts[2].velY = 0 - ghosts[2].speed;
		ghosts[3].velX = 0 - ghosts[3].speed;
		ghosts[3].velY = 0;
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
        start: start,
	ghost: Ghost // exportando Ghost para poder probarla
    };
};



  var game = new GF();
  game.start();


test('Clase Ghost bien implementada', function(assert) {

  	var done = assert.async();
  	setTimeout(function() {
		var ghost = new game.ghost(4, canvas.getContext("2d"));
		assert.ok( typeof(ghost)!= "undefined" , "El fantasma existe" );

		ghost.x = 250;
		ghost.y = 240;
		ghost.velX = 3;
		ghost.velY = 0;
		ghost.draw(); // no se va a ver, porque no está en el mainloop, pero queremos verificar que no da errores
		ghost.move();
		assert.ok( ghost.x > 250 , "El fantasma se mueve hacia la derecha cuando es posible" );

    		ghost.x = 240;
		ghost.y = 242;
		ghost.velX = 0;
		ghost.velY = 3;
		ghost.draw(); // no se va a ver, porque no está en el mainloop....
		ghost.move();
		assert.ok( ghost.y > 240 , "El fantasma se mueve hacia abajo cuando es posible" );
    	
		ghost.x = 240;
		ghost.y = 240;
		ghost.draw(); // no se va a ver, porque no está en el mainloop....
		ghost.move(); // lo movemos dos veces
		ghost.move();
		ghost.velX = 3;
		ghost.velY = 3;
		assert.ok( (ghost.x != 240 && ghost.y == 240) || (ghost.x == 240 && ghost.y != 240) , "El fantasma elige una direccio'n al azar cuando encuentra una bifurcacio'n " );
    	
		done();
  }, 1000);

});


