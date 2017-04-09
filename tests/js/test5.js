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
		newValue=parseInt(newValue);
		var tile = {row,col,newValue}
		thisLevel.map.push(tile);
		console.log(tile);
		/*var nombreValue=newValue;*/
		
	};
	

	this.getMapTile = function(row, col){
		// tu código aquí
			for(i=0;i<thisLevel.map.length;i++){
				var fila=thisLevel.map[i].row;
				var columna=thisLevel.map[i].col;
				if(fila==row && columna==col){
					return thisLevel.map[i].newValue;
				}
				
				
				
			}
	};

	this.printMap = function(){
		// tu código aquí
	};

	this.loadLevel = function(){
		// leer res/levels/1.txt y guardarlo en el atributo map			
	// haciendo uso de setMapTile		 
		var datos;
        $.ajax({
            url: "./res/levels/1.txt",
            async: false,
            success: function (data){
				//console.log(data);
                datos=data;
            }
		});
		//datos es el txt
		var numberOfLineBreaks = (datos.match(/\n/g)||[]).length;
		//console.log("LINEAS: "+numberOfLineBreaks);
		//monton es todo el txt separado en lineas
		var monton=datos.split("\n");
		var filaActual=0;
		for( i=0 ; i<monton.length; i++){
			//linea es la linea del txt actual que se esta cambiando
			var linea = monton[i];
			//console.log(linea);
				if(linea.includes("lvlwidth")){
					Level.width=linea.slice(linea.length-2,linea.length);
					console.log("width is:--"+Level.width+"--");
				}else if(linea.includes("lvlheight")){
					Level.height=linea.slice(linea.length-2,linea.length);
					console.log("width is:--"+Level.height+"--");
				}else if(!linea.trim().includes("#")&& linea!=""){
					//fila de texto es la linea, convertida en array que se va a examinar
					var filaDeTexto=linea.split(" ");
					var columnaActual=0;
					for(j=0;j<filaDeTexto.length-1;j++){	
						var valor=filaDeTexto[j].trim();
						thisLevel.setMapTile(filaActual,columnaActual,valor);
						columnaActual++;
					}
						filaActual++;
					
				}
				
				
		}
		
		
        

	};

	}; // end Level 

	var Pacman = function() {
		this.radius = 15;
		this.x = 0;
		this.y = 0;
		this.speed = 5;
		this.angle1 = 0.25;
		this.angle2 = 1.75;
	};
	Pacman.prototype.move = function() {
		player.x+=player.velX;
		player.y+=player.velY;
		if(player.x+2*player.radius>w || player.x<0){
			player.velX=-player.velX;
		}
		if(player.y+2*player.radius>h || player.y<0){
			player.velY=-player.velY;
		}
		// tu código aquí
	};


     // Función para pintar el Pacman
     Pacman.prototype.draw = function(x, y) {
         
         // Pac Man
	    
		ctx.beginPath();
		ctx.moveTo(player.x+player.radius,player.y+player.radius);
		ctx.arc(player.x+player.radius,player.y+player.radius, player.radius, 0.25*Math.PI, 1.75*Math.PI, false);
		ctx.closePath();
		ctx.fillStyle = "yellow";
		ctx.fill();
		ctx.stroke(); 	     
    };

	var player = new Pacman();

	var thisGame = {
		getLevelNum : function(){
			return 0;
		},
		TILE_WIDTH: 24, 
		TILE_HEIGHT: 24
	};

	// thisLevel global para poder realizar las pruebas unitarias
	thisLevel = new Level(canvas.getContext("2d"));
	thisLevel.loadLevel( thisGame.getLevelNum() );
	thisLevel.printMap(); 



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
		//mirar si los inputs son true, si lo son, moverlos.
		if (inputStates.left == true) {
     			if (player.x > 0) {
     				player.velY = 0;
					player.velX = -player.speed;
     			}
     		} 
		else if (inputStates.right == true) {
     			if (player.x+2*player.radius < w) {
					player.velY = 0;
     				player.velX = player.speed;
     			}
     		}
		else if (inputStates.up == true) {
     			if (player.y > 0) {
					player.velX = 0;
     				player.velY = -player.speed;
     			}
     		}
		else if (inputStates.down == true) {
     			if (player.y+2*player.radius < h) {
					player.velX = 0;
     				player.velY = player.speed;
     			}
     		}
	};


 
    var mainLoop = function(time){
        //main function, called each frame 
        measureFPS(time);
     
	checkInputs();
 
        // Clear the canvas
        clearCanvas();
    
	player.move();
 
	player.draw();
        // call the animation loop every 1/60th of second
        requestAnimationFrame(mainLoop);
    };

    var addListeners = function(){
		//add the listener to the main, window object, and update the states
		window.onkeydown = function (e) {
          		var code = e.keyCode ? e.keyCode : e.which;
              	if (code === 37) { //left key
              		inputStates.left = true;
              	} else if (code === 38) { //up key
              		inputStates.up = true;
              	} else if (code === 39) { //right key
              		inputStates.right = true;
              	} else if (code === 40) { //down key
              		inputStates.down = true;
              };
		};
		window.onkeyup = function (e) {
              	var code = e.keyCode ? e.keyCode : e.which;
              	if (code === 37) { //left key
              		inputStates.left = false;
              	} else if (code === 38) { //up key
              		inputStates.up = false;
              	} else if (code === 39) { //right key
              		inputStates.right = false;
              	} else if (code === 40) { //down key
              		inputStates.down = false;
              };

  };
	};


    var start = function(){
        // adds a div for displaying the fps value
        fpsContainer = document.createElement('div');
        document.body.appendChild(fpsContainer);
       
	addListeners();

	player.x = 0;
	player.y = 0; 
	player.velY = 0;
	player.velX = player.speed;
 
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


test('Mapa correctamente cargado', function(assert) {

  	var done = assert.async();
  	setTimeout(function() {
			// console.log(player.x);
 		   assert.ok( thisLevel.getMapTile(0,9) == 113, "Line 0, Column 9: wall");
 		   assert.ok( thisLevel.getMapTile(24,20) == 106, "Line 24, Column 21: wall");
 		   assert.ok( thisLevel.getMapTile(23,1) == 2, "Line 23, Column 1 : pellet");
 		   assert.ok( thisLevel.getMapTile(22,1) == 3, "Line 22, Column 1: power pellet");

    		   done();
  }, 1000);

});

