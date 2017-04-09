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
		// leer res/levels/1.txt y guardarlo en el atributo map	
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
              			//mirar si el valor del mapa es 4 (Pacman)
              			if(num[j]==4){
              				homeX=j*thisGame.TILE_WIDTH;
              				homeY=(i-4)*thisGame.TILE_HEIGHT;
              				console.log("Es pacman "+homeX+" "+homeY);
              			}
   						
   					}
   			}
		});

		


	};

         this.drawMap = function(){

	    	var TILE_WIDTH = thisGame.TILE_WIDTH;
	    	var TILE_HEIGHT = thisGame.TILE_HEIGHT;
	    	tile_w = TILE_WIDTH;
	    	tile_h = TILE_HEIGHT;

    		var tileID = {
	    		'door-h' : 20,
			'door-v' : 21,
			'pellet-power' : 3
		};

		  var current = 0;
		 
		for (var i = 0; i < thisGame.screenTileSize[1]; i++) {
		 	for (var j = 0; j < thisGame.screenTileSize[0]; j++) {
		 		current = thisLevel.getMapTile(j,i);
		 		if(current == 0){
		 			//baldosa vacia
		 			ctx.beginPath();
		 			ctx.rect((i*TILE_WIDTH),(j*TILE_HEIGHT),10,10);
		 			ctx.fillStyle = "black";
		 			ctx.strokeStyle = "black";
		 			//ctx.stroke();
		 			ctx.fill();
		 			

		 		}else if(current == 2){
		 			//píldora
		 			ctx.fillStyle = "white";
		 			ctx.beginPath();
		 			ctx.arc((i*TILE_WIDTH)+10,(j*TILE_HEIGHT)+10,5,0,Math.PI, true);
					ctx.arc((i*TILE_WIDTH)+10,(j*TILE_HEIGHT)+10,5,Math.PI,0, true);
					ctx.strokeStyle = "white";
					ctx.fill();

		 		}else if(current == 3){
		 			//super píldora
		 			ctx.fillStyle = "red";
		 			ctx.beginPath();
		 			ctx.arc((i*TILE_WIDTH)+10,(j*TILE_HEIGHT)+10,5,0,Math.PI, true);
					ctx.arc((i*TILE_WIDTH)+10,(j*TILE_HEIGHT)+10,5,Math.PI,0, true);
					ctx.strokeStyle = "red";
					ctx.fill();
		 		}else if(10<=current && current<14){
		 			//fantasmas
		 			//console.log("FANTASMAS");
		 			ctx.beginPath();
		 			ctx.rect((i*TILE_WIDTH),(j*TILE_HEIGHT),TILE_WIDTH,TILE_WIDTH);
		 			ctx.fillStyle = "black";
		 			ctx.strokeStyle = "black";
		 			ctx.fill();

		 		}else if(100<= current && current<200){
		 			//pared
		 			ctx.beginPath();
		 			ctx.rect((i*TILE_WIDTH),(j*TILE_HEIGHT),TILE_WIDTH,TILE_HEIGHT);
		 			ctx.fillStyle = "blue";
		 			ctx.strokeStyle = "blue";
		 			ctx.fill();

		 		}
		 	}
		}
	
	};


		this.isWall = function(row, col) {
			var pos = thisLevel.getMapTile(col,row);
			var esPared = false;
			if(100<= pos && pos<200){
				esPared = true;
			}
			return esPared;
		};


		this.checkIfHitWall = function(possiblePlayerX, possiblePlayerY, row, col){
				// Tu código aquí
				// Determinar si el jugador va a moverse a una fila,columna que tiene pared 
				// Hacer uso de isWall
				
			var x = Math.floor(possiblePlayerX/24);
			var y = Math.floor(possiblePlayerY/24);
			
			
			if(possiblePlayerX/24-x == 0 || possiblePlayerY/24-y == 0){
				return this.isWall(x,y);
			}else if(possiblePlayerX/24-x != 0.5 && possiblePlayerY/24-y != 0.5){
				return true; //si no esta centrado no entra
			}else{
				return this.isWall(x,y);
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
  };


     // Función para pintar el Pacman
       Pacman.prototype.draw = function(x, y) {
         
         // Pac Man
	    
		ctx.beginPath();
		ctx.moveTo(player.x,player.y);
		ctx.arc(player.x,player.y, player.radius, 0.25*Math.PI, 1.75*Math.PI, false);
		ctx.closePath();
		ctx.fillStyle = "yellow";
		ctx.fill();
		ctx.strokeStyle="black";
		ctx.stroke(); 	 	     
    };

	var player = new Pacman();

	var thisGame = {
		getLevelNum : function(){
			return 0;
		},
		screenTileSize: [30, 21],
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
	player.x = homeX+12;
	player.y = homeY+12;

	player.velX = player.speed;
	player.velY = 0;
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
  },1000);
  


test('checkIfHitWall bien implementado', function(assert) {

  	var done = assert.async();
  	setTimeout(function() {
		var x = 315, y = 384, speed = 5, nearestRow = 16, nearestCol = 13;
		assert.ok( thisLevel.checkIfHitWall( x, y - speed, nearestRow, nearestCol ) == true , "entrar demasiado pronto por la primera salida hacia arriba de la pos. original" );
		x = 312; 
		assert.ok( thisLevel.checkIfHitWall( x, y - speed, nearestRow, nearestCol ) == false , "entrar OK por la primera salida hacia arriba de la pos. original" );	
		x = 240, y = 144, nearestRow = 6, nearestCol = 10;
		assert.ok( thisLevel.checkIfHitWall( x - speed, y , nearestRow, nearestCol ) == false , "apertura horizontal superior izquierda, entrando correctamente hacia la izquierda, no hay pared");
		y = 147;			
		assert.ok( thisLevel.checkIfHitWall( x - speed, y , nearestRow, nearestCol ) == true , "apertura horizontal superior izquierda, entrando demasiado tarde hacia la izquierda, hay pared");
    		   done();
  }, 1000);

});