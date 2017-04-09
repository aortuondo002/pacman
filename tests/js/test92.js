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
	};

	this.getMapTile = function(row, col){
		// tu código aquí	
	};

	this.printMap = function(){
		// tu código aquí
	};

	this.loadLevel = function(){
		// leer res/levels/1.txt y guardarlo en el atributo map	
		// haciendo uso de setMapTile
	};

         this.drawMap = function(){

	    	var TILE_WIDTH = thisGame.TILE_WIDTH;
	    	var TILE_HEIGHT = thisGame.TILE_HEIGHT;

    		var tileID = {
	    		'door-h' : 20,
			'door-v' : 21,
			'pellet-power' : 3
		};

		 // Tu código aquí
	};


		this.isWall = function(row, col) {
			// Tu código aquí
		};


		this.checkIfHitWall = function(possiblePlayerX, possiblePlayerY, row, col){
				// Tu código aquí
				// Determinar si el jugador va a moverse a una fila,columna que tiene pared 
				// Hacer uso de isWall
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

			// Tu código aquí (test9)
			//  Gestiona las puertas teletransportadoras
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
		//
		// tras actualizar this.x  y  this.y... 
		 // check for collisions with other tiles (pellets, etc)
		    thisLevel.checkIfHitSomething(this.x, this.y, this.nearestRow, this.nearestCol);
		// ....

	};


     // Función para pintar el Pacman
     Pacman.prototype.draw = function(x, y) {
         
         // Pac Man
	    
	// tu código aquí	     
    };

	// player variable global para el test
	player = new Pacman();

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
	};


 
    var mainLoop = function(time){
        //main function, called each frame 
        measureFPS(time);
     
	checkInputs();
 
	player.move();
        // Clear the canvas
        clearCanvas();
   
	thisLevel.drawMap();

 
	player.draw();
        // call the animation loop every 1/60th of second
        requestAnimationFrame(mainLoop);
    };

    var addListeners = function(){
	    //add the listener to the main, window object, and update the states
	    // Tu código aquí
    };

    var reset = function(){
	// Tu código aquí
	// Inicialmente Pacman debe empezar a moverse en horizontal hacia la derecha, con una velocidad igual a su atributo speed
	// inicializa la posición inicial de Pacman tal y como indica el enunciado
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
		var col = 19;
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
		var col = 1;
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
		var row = 1;
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
		var row = 23;
		var col = 10;
		thisLevel.checkIfHitSomething(player.x, player.y, row, col); // Pacman entra por la puerta inferior
		assert.ok(  player.x == 240 && player.y < 30 , "Pacman debe aparecer en la misma columna, pero en la puerta superior" );

    		   done();
  }, 4000);

});
