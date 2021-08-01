const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Constraint = Matter.Constraint;
var engine, world, backgroundImg, waterSound, backgroundMusic, cannonExplosion;
var canvas, angle, tower, ground, cannon, boat;
var balls = [];
var boats = [];

var boatAnimation = [];
var boatSpritedata, boatSpritesheet;

var brokenBoatAnimation = [];
var brokenBoatSpritedata, brokenBoatSpritesheet;

var waterSplash = [];
var waterSplashSpritedata,waterSplashSpritesheet;

var isGameOver=false;
var isLaughing=false;

var score=0

function preload() {
  backgroundImg = loadImage("./assets/background.gif");
  towerImage = loadImage("./assets/tower.png");
  boatSpritedata = loadJSON("assets/boat/boat.json");
  boatSpritesheet = loadImage("assets/boat/boat.png");
  brokenBoatSpritedata = loadJSON("assets/boat/broken_boat.json");
  brokenBoatSpritesheet= loadImage("assets/boat/broken_boat.png");
  waterSplashSpritedata=loadJSON("./assets/water_splash/water_splash.json");
  waterSplashSpritesheet=loadImage("./assets/water_splash/water_splash.png");

  //loading sounds
  backgroundSound = loadSound("./assets/background_music.mp3")
  cannonExplosionSound = loadSound("./assets/cannon_explosion.mp3")
  waterSplashSound = loadSound("./assets/cannon_water.mp3")
  pirateSound = loadSound("./assets/pirate_laugh.mp3")

  
}

function setup() {
  canvas = createCanvas(1200, 600);
  engine = Engine.create();
  world = engine.world;
  angle = -PI / 4;
  ground = new Ground(0, height - 1, width * 2, 1);
  tower = new Tower(150, 350, 160, 310);
  cannon = new Cannon(180, 110, 110, 50, angle);

  var boatFrames = boatSpritedata.frames;
  for (var i = 0; i < boatFrames.length; i++) {
    var pos = boatFrames[i].position;
    var img = boatSpritesheet.get(pos.x, pos.y, pos.w, pos.h);
    boatAnimation.push(img);
  }
  var brokenBoatFrames = brokenBoatSpritedata.frames;
  for (var i = 0; i < brokenBoatFrames.length; i++) {
    var pos = brokenBoatFrames[i].position;
    var img = brokenBoatSpritesheet.get(pos.x, pos.y, pos.w, pos.h);
    brokenBoatAnimation.push(img);
  }
  var waterSplashFrames = waterSplashSpritedata.frames;
  for(var i =0;i<waterSplashFrames.length;i++)
  {
    var pos = waterSplashFrames[i].position;
    var img = waterSplashSpritesheet.get(pos.x,pos.y,pos.w,pos.h)
    waterSplash.push(img)
  }

}

function draw() {
  background(189);
  image(backgroundImg, 0, 0, width, height);
  if(!backgroundSound.isPlaying())
 { 
   backgroundSound.play()
   backgroundSound.setVolume(0.1);
  }


  Engine.update(engine);
  ground.display();

  showBoats();

  for (var i = 0; i < balls.length; i++) {
    showCannonBalls(balls[i], i);
    for (var j = 0; j < boats.length; j++) {
      if (balls[i] !== undefined && boats[j] !== undefined) {
        var collision = Matter.SAT.collides(balls[i].body, boats[j].body);
        if (collision.collided) {
          if(!boats[j].isBroken && !balls[i].isSink)
         { 
           boats[j].remove(j);
          score+=5
          j--
          }
          
          Matter.World.remove(world, balls[i].body);
          balls.splice(i, 1);
          i--;
        
        }
      }
    }
  }

  cannon.display();
  tower.display();

 fill("#6d4c41")
 textSize(30)
 text ("Score: "+score,width-200,50)


}


//creating the cannon ball on key press
function keyPressed() {
  if (keyCode === DOWN_ARROW) {
    var cannonBall = new CannonBall(cannon.x, cannon.y);
    cannonBall.trajectory = [];
    Matter.Body.setAngle(cannonBall.body, cannon.angle);
    balls.push(cannonBall);
    
  }
}

// function to show the ball.
function showCannonBalls(ball, index) {
  ball.display();
  ball.animate();
  if (ball.body.position.x >= width || ball.body.position.y >= height - 50) {
    if(!ball.isSink){
      ball.remove(index)
      waterSplashSound.play();
    }
  }
}


//function to show the boat
function showBoats() {
  if (boats.length > 0) {
    if (
      boats.length < 4 &&
      boats[boats.length - 1].body.position.x < width - 300
    ) {
      var positions = [-40, -60, -70, -20];
      var position = random(positions);
      var boat = new Boat(
        width,
        height - 100,
        170,
        170,
        position,
        boatAnimation
      );

      boats.push(boat);
    }

    for (var i = 0; i < boats.length; i++) {
      Matter.Body.setVelocity(boats[i].body, {
        x: -0.9,
        y: 0
      });

      boats[i].display();
      boats[i].animate();
      var collision = Matter.SAT.collides(tower.body, boats[i].body);
      if(collision.collided && !boats[i].isBroken){
        //add isLaughing true
       if(!isLaughing && !pirateSound.isPlaying()){
         pirateSound.play();
        isLaughing=true;
       }
       isGameOver=true;
       gameOver();
      }

    }
  } else {
    var boat = new Boat(width, height - 60, 170, 170, -60, boatAnimation);
    boats.push(boat);
  }
}


//releasing the cannonball on key release
function keyReleased() {
  if (keyCode === DOWN_ARROW) {
    balls[balls.length - 1].shoot();
    cannonExplosionSound.play();

  }
}

function gameOver()
{
  swal(
    {
      title:"GameOver",
      text:"Thanks for playing",
      imageUrl: "https://raw.githubusercontent.com/whitehatjr/PiratesInvasion/main/assets/boat.png", 
      imageSize: "150x150", 
      confirmButtonText: "Play Again"
    },
    function(isConfirm){
      if(isConfirm){
        location.reload
      }
    }
  )
}