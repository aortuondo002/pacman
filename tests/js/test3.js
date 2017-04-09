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
  
	var Pacman = function() {
		this.radius = 15;
		this.posX = 0;
		this.posY = 0;
		this.speed = 5;
		this.angle1 = 0.25;
		this.angle2 = 1.75;
	};
	Pacman.prototype.move = function() {
		pacman.posX+=pacman.speed;
		if(pacman.posX+2*pacman.radius>w || pacman.posX<0){
			pacman.speed=-pacman.speed;
		}
	};


     // Función para pintar el Pacman
     Pacman.prototype.draw = function(x, y) {
         
         // Pac Man
		ctx.beginPath();
		ctx.moveTo(pacman.posX+pacman.radius,pacman.posY+pacman.radius);
		ctx.arc(pacman.posX+pacman.radius, pacman.posY+pacman.radius, pacman.radius, 0.25*Math.PI, 1.75*Math.PI, false);
		ctx.closePath();
		ctx.fillStyle = "yellow";
		ctx.fill();
		ctx.stroke();
	    // Tu código aquí        
		         
    }
  
	// OJO, esto hace a pacman una variable global	
	pacman = new Pacman();



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
     }
 
    var mainLoop = function(time){
        //main function, called each frame 
        measureFPS(time);
      
        // Clear the canvas
        clearCanvas();
    
		pacman.move();   
        pacman.draw();
     
	  // desactivando mainloop para probar los tests unitarios 
        // call the animation loop every 1/60th of second
         requestAnimationFrame(mainLoop);
    };

    var start = function(){
        // adds a div for displaying the fps value
        fpsContainer = document.createElement('div');
        document.body.appendChild(fpsContainer);
        
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
   // canvas, x,y, r,g,b, a, mezua
 
//   ctx.fillStyle = 'red';
//   ctx.fillRect(pacman.posX , pacman.posY ,4,4);    

	     	assert.pixelEqual( canvas, pacman.posX+10, pacman.posY+10, 255, 255,0,255,"Passed!"); 

});
	
test('Movimiento hacia derecha OK', function(assert) {

	for(var i=0; i<10; i++){
		pacman.move();
	}
	  ctx.clearRect(0, 0, w, h);
	pacman.draw();
        assert.ok(pacman.posX == 55, "Passed!");



});

test('Rebota hacia la izquierda', function(assert) {
  var done = assert.async();
  setTimeout(function() {
	// movemos el pacman otras 40 veces . Debe rebotar hacia la izquierda
	for(var i=0; i<40; i++){
		pacman.move();
	}
	  ctx.clearRect(0, 0, w, h);
	pacman.draw();

    assert.ok(pacman.posX < 55, "Passed!");
    done();
  }, 1000);

});


