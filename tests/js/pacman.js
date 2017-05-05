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
    var oldTime;
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
		
		
		
		this.colors = [
						new Sprite('res/img/sprites.png', [456, 16*this.id + 64], [16,16], 0.005, [0,1]),	//normal
						new Sprite('res/img/sprites.png', [584, 64], [16,16], 0.005, [0,1]),				//vulnerable
						new Sprite('res/img/sprites.png', [584, 64], [16,16], 0.02, [0,1,2,3]),				//blinking
						new Sprite('res/img/sprites.png', [585, 81], [16,16], 0.005, [0,1])					//spetacles
						];
		this.sprite = this.colors[0];

		this.draw = function(){
			// Pintar cuerpo de fantasma
			if (this.state == Ghost.NORMAL) {
				this.sprite = this.colors[0];
			} else if (this.state == Ghost.VULNERABLE) {
				if (thisGame.ghostTimer>100) {
					this.sprite = this.colors[1];
				} else {
					this.sprite = this.colors[2];
				}
			} else {
				this.sprite = this.colors[3];
			}
			ctx.save();
			ctx.translate(this.x-thisGame.TILE_WIDTH/2,this.y-thisGame.TILE_HEIGHT/2);
			this.sprite.render(ctx);
			ctx.restore();

		}; // draw

	    this.move = function() {
			this.sprite.update(delta);
			var col = Math.floor(this.x/thisGame.TILE_WIDTH);
			var row = Math.floor(this.y/thisGame.TILE_HEIGHT);
			if (this.state == Ghost.NORMAL || this.state == Ghost.VULNERABLE) {
				if((this.x/thisGame.TILE_WIDTH)-col == 0.5 && (this.y/thisGame.TILE_HEIGHT)-row == 0.5){
					var posibleMov;
					var solucion = [];
					if (col == 10 && row == 10) {
						posibleMov = [[1,0],[-1,0]];
						var rndm = Math.floor((Math.random() * solucion.length));
						solucion.push(posibleMov[rndm]);
					} else {
						posibleMov = [[0,-1],[1,0],[0,1],[-1,0]];
					}
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
					ghost_eaten.play();
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
				}else if((this.x/thisGame.TILE_WIDTH)-col == 0.5 && (this.y/thisGame.TILE_HEIGHT)-row == 0.5 && this.state != Ghost.NORMAL){ // hacia casa
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
							distX = Math.abs(col-balX); // distancia de x al inicio
							distY = Math.abs(row-balY); // distancia de y al inicio
							for(var k = solucion.length-1; k>=0; k--){
								if(Math.abs(col+solucion[k][0]-balX)<distX){
									distX = Math.abs(col+solucion[k][0]-balX); //distancia minima
									direccionX = solucion[k]; //direccion con distancia minima
								}else if(Math.abs(row+solucion[k][1]-balY)<distY){
									distY = Math.abs(row+solucion[k][1]-balY); //distancia minima
									direccionY = solucion[k]; //direccion con distancia minima
								}
							}
							if(direccionX != 0 && direccionY == 0){
								direccion = direccionX;
							}else if(direccionX == 0 && direccionY != 0){
								direccion = direccionY;
							}else if(direccionX != 0 && direccionY != 0){// solo funciona en este mapa
								if((col==10 && row==10) || ((col==6 || col==14) && row==8)){
									direccion = posibleMov[2];
								}else if((col == 7 && row == 10) || (col == 4 && row == 8)){
									direccion = posibleMov[1];
								}else if((col == 13 && row == 10) || (col == 16 && row == 8)){
									direccion = posibleMov[3];
								}else if((col==4 || col==7 || col==13 || col==16) && (row==12 || row==14 || row==16)){
									direccion = posibleMov[0];
								}else{//solo funciona en este mapa
									if((col==6 || col==9) && (row==6 || row ==18)){
										direccion = posibleMov[3];
									}else if((col==11 || col==14) && (row==6 || row==18)){
										direccion = posibleMov[1];
									}else{//funciona en todos los mapas
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

	}; 

	
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
			return thisLevel.map[(row*thisLevel.lvlWidth)+col];
		};

		this.printMap = function(){
		};

		this.loadLevel = function(){
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
						ctx.arc((i*TILE_WIDTH)+TILE_WIDTH/2,(j*TILE_HEIGHT)+TILE_HEIGHT/2,2,0,Math.PI*2,true);
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
							ctx.arc((i*TILE_WIDTH)+TILE_WIDTH/2,(j*TILE_HEIGHT)+TILE_HEIGHT/2,2,0,Math.PI*2,true);
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
			var baldosa = thisLevel.getMapTile(col,row);
			if (baldosa >= 100){
				return true;
			}else{
				return false;
			}
		};

		this.checkIfHitWall = function(possiblePlayerX, possiblePlayerY, row, col){
			var x = Math.floor(possiblePlayerX/thisGame.TILE_WIDTH);
			var y = Math.floor(possiblePlayerY/thisGame.TILE_HEIGHT);
			if(possiblePlayerX/thisGame.TILE_WIDTH-x == 0 || possiblePlayerY/thisGame.TILE_HEIGHT-y == 0){
				return this.isWall(x,y);
			}else if(possiblePlayerX/thisGame.TILE_WIDTH-x != 0.5 && possiblePlayerY/thisGame.TILE_HEIGHT-y != 0.5){
				return true; 
			}else{
				return this.isWall(x,y);
			}
		};

		this.checkIfHit = function(playerX, playerY, x, y, holgura){
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
				thisGame.points += 2;
				eating.play();
				if(thisLevel.pellets==0){
					console.log("Siguiente nivel");
					//thisGame.setMode(thisGame.HALL_OF_FAME);
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
			if(baldosa==tileID["pellet-power"]){
				thisLevel.setMapTile(y,x,0);
				siren.stop();
				eat_pill.play();
				waza.play();
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
		this.colors = [
				new Sprite('res/img/sprites.png', [455, 0], [16,16], 0.005, [0,1]),	//derecha
				new Sprite('res/img/sprites.png', [455, 16], [16,16], 0.005, [0,1]),	//izquierda
				new Sprite('res/img/sprites.png', [455, 32], [16,16], 0.005, [0,1]),	//arriba
				new Sprite('res/img/sprites.png', [455, 48], [16,16], 0.005, [0,1]),	//abajo
				new Sprite('res/img/sprites.png', [488, 0], [16,16], 0.004, [0,1,2,3,4,5,6,7,8,9,10,11,12])
				];
		this.sprite = this.colors[0];
	};
	Pacman.prototype.move = function() {
		player.sprite.update(delta);
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
		for (var i=0; i< numGhosts; i++){
			if(thisLevel.checkIfHit(player.x,player.y,ghosts[i].x,ghosts[i].y,10)){
				if(ghosts[i].state == Ghost.VULNERABLE){
					ghosts[i].state = Ghost.SPECTACLES;
					ghosts[i].speed = 3;
					thisGame.points += 20;
					eat_ghost.play();
				}else if(ghosts[i].state == Ghost.NORMAL){
					siren.stop();
					die.play();
					thisGame.setMode(thisGame.HIT_GHOST);
				}
			}
		}
	};

    Pacman.prototype.draw = function(x, y) {
	if(thisGame.mode == thisGame.HIT_GHOST){
		this.sprite = this.colors[4];
	}else if(player.velX>0){
		this.sprite = this.colors[0];
	}else if(player.velX<0){
		this.sprite = this.colors[1];
	}else if(player.velY>0){
		this.sprite = this.colors[3];
	}else if(player.velY<0){
		this.sprite = this.colors[2];
	}
	ctx.save();
	ctx.translate(player.x-thisGame.TILE_WIDTH/2,player.y-thisGame.TILE_HEIGHT/2);
	player.sprite.render(ctx);
	ctx.restore();
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
		modeTimer: 0,
		lifes: 3,
		points:0,
		highScore:0
	};

	var thisLevel = new Level(canvas.getContext("2d"));
	thisLevel.loadLevel( thisGame.getLevelNum() );
	
	var timer = function(currentTime) {
		if (oldTime === undefined) {
			oldTime = currentTime;
		}
		var aux = currentTime - oldTime;
		oldTime = currentTime;
		return aux;
	};

	var measureFPS = function(newTime){
		if(lastTime === undefined) {
			lastTime = newTime; 
			return;
		}

		var diffTime = newTime - lastTime; 

		if (diffTime >= 1000) {
			fps = frameCount;    
			frameCount = 0;
			lastTime = newTime;
		}
		fpsContainer.innerHTML = 'FPS: ' + fps; 
		frameCount++;
	};

	/
	var clearCanvas = function() {
		ctx.clearRect(0, 0, w, h);
	};

	var checkInputs = function(){
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
		if(thisGame.ghostTimer == 0){
			for (var i=0; i< numGhosts; i++){
				if(ghosts[i].state != Ghost.SPECTACLES){
					ghosts[i].state = Ghost.NORMAL;
				}
			}
		}else{
			thisGame.ghostTimer--;
			if(thisGame.ghostTimer == 0){
				waza.stop();
				siren.play();
			}
		}
		if(thisGame.mode == thisGame.HIT_GHOST){
			thisGame.modeTimer ++;
			player.sprite.update(delta);
			if(thisGame.modeTimer == 150){
				thisGame.setMode(thisGame.WAIT_TO_START);
				reset();
				thisGame.lifes --;
				if(thisGame.lifes == 0){
					thisGame.setMode(thisGame.GAME_OVER);
					if(thisGame.points > thisGame.highScore){
						thisGame.highScore = thisGame.points;
					}
					thisGame.points = 0;
				} else {siren.play();}
			}
		}else if(thisGame.mode == thisGame.WAIT_TO_START){
			thisGame.modeTimer ++;
			if(thisGame.modeTimer == 30){
				thisGame.setMode(thisGame.NORMAL);
			}
		}
    };

    var displayScore = function(){
        ctx.beginPath();
        ctx.fillStyle="red"; 
        ctx.font="bold 20px arial"; 
        ctx.fillText("1UP",30,18); 
        ctx.fillStyle="white";
        ctx.fillText(thisGame.points,100,18);
        ctx.fillStyle="red"; 
        ctx.font="bold 20px arial"; 
        ctx.fillText("HIGH SCORE",300,18); 
        ctx.fillStyle="white";
        ctx.fillText(thisGame.highScore,470,18);
        ctx.fillStyle="white"; 
        ctx.font="bold 20px arial"; 
        ctx.fillText("Lifes:",140,600);
        ctx.fillStyle="white";
		var lifes = thisGame.lifes;
		for (var i=1; i<lifes+1 ;i++ ){
			ctx.beginPath();
			ctx.moveTo(288+(i*24),588);
			ctx.arc(288+(i*24),588,player.radius,player.angle1*Math.PI,player.angle2*Math.PI,false);
			ctx.closePath();
			ctx.fillStyle = '#FFFF00';
			ctx.strokeStyle = 'black';
			ctx.fill();
			ctx.stroke();
		}
		if(thisGame.mode == thisGame.GAME_OVER){
			ctx.fillStyle="red"; 
        	ctx.font="bold 60px arial"; 
        	ctx.fillText("GAME OVER",68,360); 
		}
    };

    var mainLoop = function(time){
        //main function, called each frame 
        measureFPS(time);
        
        delta = timer(time);
	
	if(thisGame.mode == thisGame.NORMAL){
		checkInputs();
		// Mover fantasmas
		for (var i=0; i< numGhosts; i++){
			ghosts[i].move();
		}
		player.move();
	}else if(thisGame.mode == thisGame.HIT_GHOST){// en modo HIT_GHOST
  		updateTimers();
	}else if(thisGame.mode == thisGame.GAME_OVER){//se para todo, fin del juego
	
	}

	// Clear the canvas
        clearCanvas();
	thisLevel.drawMap();

	thisLevel.powerPelletBlinkTimer ++;
	if (thisLevel.powerPelletBlinkTimer == 60) {
		thisLevel.powerPelletBlinkTimer = 0;
	}

	// Pintar fantasmas
	for (var i=0; i< numGhosts; i++){
		ghosts[i].draw();
	}
 
	displayScore();
	player.draw();
	updateTimers();

        // call the animation loop every 1/60th of second
        requestAnimationFrame(mainLoop);
    };

    var addListeners = function(){
	    //add the listener to the main, window object, and update the states
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
				console.log("Se ha pulsado espacio");
				if(thisGame.mode == thisGame.GAME_OVER){
					thisGame.setMode(thisGame.NORMAL);
					if(thisGame.lifes == 0){
						thisLevel.loadLevel();
						thisGame.lifes = 3;
						start();
					}
				}
			}
		});
    };

    var reset = function(){
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
		thisGame.setMode( thisGame.NORMAL);
    };
    
    function loadAssets(){
        eat_pill = new Howl({
	    src: ['res/sounds/eat-pill.mp3'],
	    volume: 1,
	    onload: function() {
		eating = new Howl ({
		    src:['res/sounds/eating.mp3'],
		    volume:1,
		    onload: function() {
			ready = new Howl({
			    src:['res/sounds/ready.mp3'],
			    volume:1,
			    onload: function () {
				die = new Howl ({
				    src:['res/sounds/die.mp3'],
				    volume:1,
				    onend: function() {
					//ready.play();
				    },
		        	    onload: function() {
				        eat_ghost = new Howl({
				            src:['res/sounds/eat-ghost.mp3'],
				            volume:1,
				            onload: function() {
						ghost_eaten = new Howl({
						    src:['res/sounds/ghost-eaten.mp3'],
						    volume:1,
						    onload: function() {
							waza = new Howl({
							    src:['res/sounds/waza.mp3'],
							    volume:1,
							    loop:true,
							    onload: function() {
								siren = new Howl({
				                    	   	    src:['res/sounds/siren.mp3'],
				                    	    	    volume:1,
				                    	    	    loop:true,
				                    	    	    onload: function() {
									//ready.play();
									siren.play();
					                		requestAnimationFrame(mainLoop);
				                    	    	    }
		 		                		});
							    }
							});
						    }
						});
		        	            }
		        	        });
	        	            }
	        	        });
			    }
		        });
		    }
	        });
	    }
	});
    }

    function init(){
		loadAssets();
	}

    var start = function(){
        // adds a div for displaying the fps value
        fpsContainer = document.createElement('div');
        document.body.appendChild(fpsContainer);
       
	addListeners();

	reset();
    resources.load(['res/img/sprites.png']);
    resources.onReady(init);
    };
    return {
        start: start,
		thisGame: thisGame
    };
};

var game = new GF();
game.start();
