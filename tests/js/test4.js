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
    inputStates={};

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
	   		         
    }
  
	// OJO, esto hace a pacman una variable global	
	player = new Pacman();



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
		else if (inputStates.space == true) {
     			window.alert("sometext");
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
              }else if (code === 32) { //space key
              		inputStates.space = true;
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
              }else if (code === 32) { //space key
              		inputStates.space = false;
              };

  };
   }


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

 test('Testeando pos. inicial', function(assert) {  

	     	assert.pixelEqual( canvas, player.x+10, player.y+10, 255, 255,0,255,"Passed!"); 
});

	
test('Movimiento hacia derecha OK', function(assert) {

  	var done = assert.async();
	inputStates.right = true;
  	setTimeout(function() {
			// console.log(player.x);
 		   assert.ok(player.x > 110 && player.x < w, "Passed!");

			inputStates.right = false;
			inputStates.down = true;
    		   done();
			test2();
  }, 1000);

});


var test2 = function(){
test('Movimiento hacia abajo OK', function(assert) {

  	var done = assert.async();
  	setTimeout(function() {
			// console.log(player.y);
   		        assert.ok(player.y > 110 && player.y < h, "Passed!");
			inputStates.down = false;
			inputStates.left = true;
    		   done();
			test3();
  }, 1000);

});
};

var test3 = function(){
test('Movimiento hacia izquierda OK', function(assert) {

  	var done = assert.async();
  	setTimeout(function() {
			// console.log(player.x);
   		        assert.ok(player.x == 0 , "Passed!");
			inputStates.left = false;
			inputStates.up = true;
    		   done();
		test4();
  }, 1000);

}); };



var test4 = function(){
test('Movimiento hacia arriba OK', function(assert) {

  	var done = assert.async();
  	setTimeout(function() {
			// console.log(player.y);
   		        assert.ok(player.y < 10 , "Passed!");
			inputStates.up = false;
    		   done();
  }, 1000);

}); };


