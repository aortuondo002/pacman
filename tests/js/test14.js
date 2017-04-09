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
		// Tu código aquí
		if(this.state == Ghost.NORMAL || this.state == Ghost.VULNERABLE){
			var color;
			if(this.state == Ghost.NORMAL){
				color = ghostcolor[this.id];
			}else if (this.state == Ghost.VULNERABLE){
				if(thisGame.ghostTimer>100){
					color = ghostcolor[4];
				}else{
					if(thisGame.ghostTimer % 3 == 0){
						color = ghostcolor[5];
					}else{color = ghostcolor[4];}
				}
			}
			ctx.beginPath();
			ctx.moveTo(this.x+thisGame.TILE_WIDTH/2,this.y);
			ctx.arc(this.x,this.y,thisGame.TILE_WIDTH/2,0,Math.PI,1);
			ctx.lineTo(this.x-thisGame.TILE_WIDTH/2,this.y+thisGame.TILE_HEIGHT/2);
			ctx.lineTo(this.x+thisGame.TILE_WIDTH/2,this.y+thisGame.TILE_HEIGHT/2);
			this.ctx.fillStyle = color;
			this.ctx.strokeStyle = color;
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
			// Pintar ojos 
			// Tu código aquí
			ctx.beginPath();
			ctx.arc(this.x+thisGame.TILE_WIDTH/4,this.y-thisGame.TILE_HEIGHT/4,TILE_WIDTH/6,0,2*Math.PI,1);
			ctx.fillStyle = "white";
			this.ctx.strokeStyle = color;
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			ctx.beginPath();
			ctx.arc(this.x-thisGame.TILE_WIDTH/4,this.y-thisGame.TILE_HEIGHT/4,TILE_WIDTH/6,0,2*Math.PI,1);
			ctx.fillStyle = "white";
			this.ctx.strokeStyle = color;
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		}else{
			ctx.beginPath();
			ctx.arc(this.x+thisGame.TILE_WIDTH/4,this.y-thisGame.TILE_HEIGHT/4,TILE_WIDTH/6,0,2*Math.PI,1);
			ctx.fillStyle = "white";
			this.ctx.strokeStyle = color;
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			ctx.beginPath();
			ctx.arc(this.x-thisGame.TILE_WIDTH/4,this.y-thisGame.TILE_HEIGHT/4,TILE_WIDTH/6,0,2*Math.PI,1);
			ctx.fillStyle = "white";
			this.ctx.strokeStyle = color;
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		}

	}// draw

	    	this.move = function() {
			// Tu código aquí
			var col = Math.floor(this.x/thisGame.TILE_WIDTH);
			var row = Math.floor(this.y/thisGame.TILE_HEIGHT);
			if (this.state == Ghost.NORMAL || this.state == Ghost.VULNERABLE) {
				if((this.x/thisGame.TILE_WIDTH)-col == 0.5 && (this.y/thisGame.TILE_HEIGHT)-row == 0.5){
					var posibleMov = [[0,-1],[1,0],[0,1],[-1,0]];
					var solucion = [];
					for(var i = 0; i<posibleMov.length; i++){
						if(!thisLevel.isWall(col+posibleMov[i][0],row+posibleMov[i][1])
							&& thisLevel.getMapTile(row+posibleMov[i][1],col+posibleMov[i][0]) != 21 
							&& thisLevel.getMapTile(row+posibleMov[i][1],col+posibleMov[i][0]) != 20){
							solucion.push(posibleMov[i]);
						}
					}
					if(solucion.length>1){
						if(solucion.length>2 || (solucion[0][0] != solucion[1][0] && solucion[0][1] != solucion[1][1])){
							var direccion = Math.floor((Math.random() * solucion.length));
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
					}else{
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
			}else{ // fantasma comido
				if(this.x == this.homeX && this.y == this.homeY){ // ha llegado a casa
					this.state = Ghost.NORMAL;
					this.speed = 1;
					switch(this.id){
						case 0:
							this.velX = this.speed;
							this.velY = 0;
							break;
						case 1:
							this.velX = this.speed;
							this.velY = 0;
							break;
						case 2:
							this.velX = 0;
							this.velY = 0-this.speed;
							break;
						case 3:
							this.velX = 0-this.speed;
							this.velY = 0;
							break;
					}
				}else if((this.x/thisGame.TILE_WIDTH)-col == 0.5 && (this.y/thisGame.TILE_HEIGHT)-row == 0.5              							&& this.state != Ghost.NORMAL){ // hacia casa
					var posibleMov = [[0,-1],[1,0],[0,1],[-1,0]];
					var solucion = [];
					for(var i = 0; i<posibleMov.length; i++){
						if(!thisLevel.isWall(col+posibleMov[i][0],row+posibleMov[i][1])
							&& thisLevel.getMapTile(row+posibleMov[i][1],col+posibleMov[i][0]) != 21 
							&& thisLevel.getMapTile(row+posibleMov[i][1],col+posibleMov[i][0]) != 20){
							solucion.push(posibleMov[i]);
						}
					}
					if(solucion.length>1){
						if(solucion.length>2 || (solucion[0][0] != solucion[1][0] && solucion[0][1] != solucion[1][1])){//bifurcacion
							var distX = thisLevel.lvlWidth;
							direccionX = [];
							var distY = thisLevel.lvlHeight;
							direccionY = [];
							balX = Math.floor(this.homeX/thisGame.TILE_WIDTH);
							balY = Math.floor(this.homeY/thisGame.TILE_HEIGHT);
							distX = Math.abs(col-balX); 
							distY = Math.abs(row-balY); 
							for(var k = solucion.length-1; k>=0; k--){
								if(Math.abs(col+solucion[k][0]-balX)<distX){
									distX = Math.abs(col+solucion[k][0]-balX); 
									direccionX = solucion[k]; 
								}else if(Math.abs(row+solucion[k][1]-balY)<distY){
									distY = Math.abs(row+solucion[k][1]-balY); 
									direccionY = solucion[k]; 
								}
							}
							if(direccionX != 0 && direccionY == 0){
								direccion = direccionX;
							}else if(direccionX == 0 && direccionY != 0){
								direccion = direccionY;
							}else if(direccionX != 0 && direccionY != 0){
								if((col==10 && row==10) || ((col==6 || col==14) && row==8)){
									direccion = posibleMov[2];
								}else if((col == 7 && row == 10) || (col == 4 && row == 8)){
									direccion = posibleMov[1];
								}else if((col == 13 && row == 10) || (col == 16 && row == 8)){
									direccion = posibleMov[3];
								}else if((col==4 || col==7 || col==13 || col==16) && (row==12 || row==14 || row==16)){
									direccion = posibleMov[0];//solo funciona en este mapa
								}else{//funciona en el resto de mapas
									if((col==6 || col==9) && (row==6 || row ==18)){
										direccion = posibleMov[3];
									}else if((col==11 || col==14) && (row==6 || row==18)){
										direccion = posibleMov[1];
									}else{
										var rndm = Math.floor((Math.random() * 2));
										if(rndm == 0){
											direccion = direccionX;
										}else{
											direccion = direccionY;
										}
									}
								}
							}else{
								if(this.y >= this.homeY && !thisLevel.isWall(col,row-1)){
									direccion = solucion[0];
								}else if(this.y < this.homeY && !thisLevel.isWall(col,row+1)){
									direccion = solucion[2];
								}else{
									direccion = solucion[Math.floor((Math.random() * solucion.length))];
								}
							}
							if(direccion[0] != 0){
								this.velY = 0;
								if(direccion[0] > 0){
									this.velX = this.speed;
									this.velY = 0;
								}else{
									this.velX = 0 - this.speed;
									this.velY = 0;
								}
							}else{
								this.velX = 0;
								if(direccion[1] > 0){
									this.velY = this.speed;
									this.velX = 0;
								}else{
									this.velY = 0 - this.speed;
									this.velX = 0;
								}
							}
						}
					}else{ 
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
			}
			this.x += this.velX;
			this.y += this.velY;
			
		};

	}; // fin clase Ghost

	 // static variables
	  Ghost.NORMAL = 1;
	  Ghost.VULNERABLE = 2;
	  Ghost.SPECTACLES = 3;

	var Level = function(ctx) {
		this.ctx = ctx;
		this.lvlWidth = 0;
		this.lvlHeight = 0;
		
		this.map = [];
		
		this.pellets = 0;
		this.powerPelletBlinkTimer = 0;

	this.setMapTile = function(row, col, newValue){
		
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
					ghosts[3].homeX = i*TILE_WIDTH+TILE_WIDTH/2;
					ghosts[3].homeY = j*TILE_HEIGHT+TILE_HEIGHT/2;
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
			var x = Math.floor(possiblePlayerX/thisGame.TILE_WIDTH);
			var y = Math.floor(possiblePlayerY/thisGame.TILE_HEIGHT);
			if(possiblePlayerX/thisGame.TILE_WIDTH-x == 0 || possiblePlayerY/thisGame.TILE_HEIGHT-y == 0){
				return this.isWall(x,y);
			}else if(possiblePlayerX/thisGame.TILE_WIDTH-x != 0.5 && possiblePlayerY/thisGame.TILE_HEIGHT-y != 0.5){
				return true; //si no esta centrado no entra
			}else{
				return this.isWall(x,y);
			}
		};

		this.checkIfHit = function(playerX, playerY, x, y, holgura){
			// Tu código aquí
			if(Math.abs(playerX-x) < holgura && Math.abs(playerY-y) < holgura){
				console.log("BOO");
				return true;
			}else{
				return false;
			}	
		};


		this.checkIfHitSomething = function(playerX, playerY, row, col){
			var tileID = {
	    			'door-h' : 20,
				'door-v' : 21,
				'pellet-power' : 3,
				'pellet': 2
			};

			// Tu código aquí
			//  Gestiona la recogida de píldoras
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
			// test12 TU CÓDIGO AQUÍ
			// Gestiona la recogida de píldoras de poder
			// (cambia el estado de los fantasmas)
			if(baldosa==tileID["pellet-power"]){
				thisLevel.setMapTile(y,x,0);
				for(var i = 0; i<numGhosts; i++){
					thisGame.ghostTimer = 360;
					if (ghosts[i].state != Ghost.SPECTACLES) {
						ghosts[i].state = Ghost.VULNERABLE;
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
		for (var i=0; i< numGhosts; i++){
			if(thisLevel.checkIfHit(player.x,player.y,ghosts[i].x,ghosts[i].y,10)){
				if(ghosts[i].state == Ghost.VULNERABLE){
					ghosts[i].state = Ghost.SPECTACLES;
					ghosts[i].speed = 3;
				}
			}
		}
		// test14 Tu código aquí. 
		// Si chocamos contra un fantasma cuando éste esta en estado Ghost.NORMAL --> cambiar el modo de juego a HIT_GHOST

	};


     // Función para pintar el Pacman
      Pacman.prototype.draw = function(x, y) {
    // Pac Man
	// tu código aquí
		ctx.beginPath();
		ctx.moveTo(player.x,player.y);
		ctx.arc(player.x,player.y,player.radius,player.angle1*Math.PI,player.angle2*Math.PI,false);
		ctx.closePath();
		ctx.fillStyle = '#FFFF00';
		ctx.strokeStyle = 'black';
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
	        setMode : function(mode) {
			this.mode = mode;
			this.modeTimer = 0;
		},
		screenTileSize: [24, 21],
		TILE_WIDTH: 24, 
		TILE_HEIGHT: 24,
		ghostTimer: 0,
		NORMAL : 1,
		HIT_GHOST : 2,
		GAME_OVER : 3,
		WAIT_TO_START: 4,
		modeTimer: 0
	};

	var thisLevel = new Level(canvas.getContext("2d"));
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


     var updateTimers = function(){
	// tu código aquí (test12)
        // Actualizar thisGame.ghostTimer (y el estado de los fantasmas, tal y como se especifica en el enunciado)
	if(thisGame.ghostTimer == 0){
		for (var i=0; i< numGhosts; i++){
			if(ghosts[i].state != Ghost.SPECTACLES){
				ghosts[i].state = Ghost.NORMAL;
			}
		}
	}else{
		thisGame.ghostTimer--;
	}
	    // tu código aquí (test14)
	    // actualiza modeTimer...
    };

    var mainLoop = function(time){
        //main function, called each frame 
        measureFPS(time);
     
	// test14
	// tu código aquí

	    // sólo en modo NORMAL
		checkInputs();

		// Tu código aquí
		// Mover fantasmas
		for (var i=0; i< numGhosts; i++){
			ghosts[i].move();
		}
		player.move();

	    // en modo HIT_GHOST
	    // 	seguir el enunciado...
	    
	    //
	    // 	en modo WAIT_TO_START
	    // 	segur el enunciado...
	    //
	    //

	// Clear the canvas
        clearCanvas();
   
	thisLevel.drawMap();
	thisLevel.powerPelletBlinkTimer ++;
	if (thisLevel.powerPelletBlinkTimer == 60){thisLevel.powerPelletBlinkTimer = 0;}

	// Tu código aquí
	// Pintar fantasmas
	for (var i=0; i< numGhosts; i++){
		ghosts[i].draw();
	}

 
	player.draw();

	updateTimers();
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
			ghosts[i].state = Ghost.NORMAL;
		}
		ghosts[0].velX = ghosts[0].speed;
		ghosts[0].velY = 0;
		ghosts[1].velX = ghosts[1].speed;
		ghosts[1].velY = 0;
		ghosts[2].velX = 0;
		ghosts[2].velY = 0 - ghosts[2].speed;
		ghosts[3].velX = 0 - ghosts[3].speed;
		ghosts[3].velY = 0;
    
	    //
	    // test14
	     thisGame.setMode( thisGame.NORMAL);
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
	ghosts: ghosts,
        Ghost: Ghost
    };
};


  var game = new GF();
  game.start();

test('Congelando el tiempo', function(assert) {

	setTimeout(function() {
		game.thisGame.setMode(game.thisGame.HIT_GHOST); // modo HIT_GHOST 
  	}, 1000);

	
	// esperamos unos segundos. Se supone que en 3 segundos, debemos volver a estar en modo NORMAL
  	var done = assert.async();
  	setTimeout(function() {
			assert.ok( game.thisGame.mode == game.thisGame.NORMAL , "El juego vuelve a modo NORMAL");
	 done();

  	}, 4500);

});

