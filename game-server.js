var WebSocketServer = require('ws').Server
   ,wss = new WebSocketServer({port: PORT1});

var messages=[];
var lobbys = [];
flag = 1;

wss.on('close', function() {
    console.log('disconnected');
});

// Broadcast to all. 
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocketServer.OPEN) {
      client.send(data);
    }
  });
};

wss.on('connection', function(ws) {
    console.log("welcome new client");
    ws.lobby = -1;
	ws.playerID = -1;
	ws.actor = -1;
	var i;
	for(i=0;i<messages.length;i++){
		ws.send(messages[i]);
	}
    
    //disconnect
    wss.on('disconnect', function() {
        console.log("dc");
        stage.removeActor(ws.actor);	
				index = stage.clients.indexOf(ws);

				if (index > -1) {
				    stage.clients.splice(index, 1);
				}

				ws.lobby = -1;
				ws.playerID = -1;
				ws.actor = -1;
  });   
    
	ws.on('message', function(message) {
        json = JSON.parse(message)
        
        switch(json.lType){

			//create a new lobby
			case 'new':
				ws.lobby = -1;
				ws.playerID = -1;
				ws.actor = -1;
				ws.lName = -1;
				
				msg={lType:'new', lID:lobbys.length, lName:json.lName};
				newLobby();
				msg = JSON.stringify(msg);

				//send to clients in main menu
                wss.clients.forEach(function each(client) {
                    if(client.lobby == -1){
						client.send(msg);
					}
                });

				messages.push(msg);
				break;
			case 'entry':
				wss.clients.forEach(function each(client) {
						client.send(message);
               			 });
				break;
                

            //load existing lobby
			case 'load':
				stage = lobbys[json.lID];

				if(stage.available.length == 0){
					msg = {lType:'error', err: "lobby full. Pick another lobby."};
					msg = JSON.stringify(msg);
					ws.send(msg);
				}

				else{
					ws.lobby = json.lID;
					stage.clients.push(ws);
					ws.playerID = stage.available[0];
					stage.available.splice(0, 1);
					ws.actor = stage.addPlayer(ws.playerID);

					//repopulate Boxes and monsters
					boxes = getBoxes(ws.lobby);
					monsters = getMonsters(ws.lobby);

					msg={lType:'load', box:boxes, monster: monsters, walls:stage.walls, players: stage.players, pID:ws.playerID};
					msg = JSON.stringify(msg);
					
					ws.send(msg);
				}
				break;
                
                //exit the lobbyd
			case 'exit':
				stage.removeActor(ws.actor);	
				index = stage.clients.indexOf(ws);

				if (index > -1) {
				    stage.clients.splice(index, 1);
				}

				ws.lobby = -1;
				ws.playerID = -1;
				ws.actor = -1;
				break;

			//player takes a step
			case 'step':
				playerStep(ws.lobby, ws.playerID, json.direction);
				break;
        }
        
	});
});


//create a new lobby
function newLobby(){
	id = lobbys.length;

	stage = new Stage(20,20,id)
	lobbys.push(stage);
	stage.initialize();

	if (flag) {
		stepInterval = setInterval(step, 1000);
		flag = 0;
	}
}

//get box locations to repopulate
function getBoxes (lID) {
	stage = lobbys[lID];
	boxes = [];

	for (var i = 0; i < stage.actors.length; i++) {
		actor = stage.actors[i];
		if(actor instanceof Box){
			boxes.push([actor.x, actor.y]);
		}
	};

	return boxes;
}

//get monster locations to repopulate
function getMonsters (lID) {
	stage = lobbys[lID];
	monsters = [];

	for (var i = 0; i < stage.actors.length; i++) {
		actor = stage.actors[i];
		if(actor instanceof Monster){
			monsters.push([actor.x, actor.y]);
		}
	};

	return monsters;
}

//player takes a step
function playerStep(lID, pID, direction){
	stage = lobbys[lID];

	for(i=0;i<stage.players.length;i++){	
		if (stage.players[i][2] == pID){
			x = stage.players[i][0];
			y = stage.players[i][1];
			actor = stage.getActor(x, y);
			actor.step(direction, i)

			return;
		}
	}
}

//calls step on stage
function step(){
	for(i in lobbys){
		lobbys[i].step();
	}
}
/**********************************************************************************************/
/********************************************STAGE*********************************************/
/**********************************************************************************************/

//Actor------------------------------------------------------------------------------------

function Actor(stage, x, y){
	this.stage = stage;
	this.x = x;
	this.y = y;
};

Actor.prototype.move=function(actor, dx, dy){

	oldx = actor.x;
	oldy = actor.y;
	type = "";

	actor.x += dx;
	actor.y += dy;

	if (actor instanceof Box) {
		type = "Box";
	}

	else if (actor instanceof Monster) {
		type = "Monster";
	}

	else{
		type = "Player";
	}
	var players;
	try{
		plyrs = this.stage.players;
	}
	catch(e){
	}


	coord = {lType: 'update', plyrs: plyrs.length, oldPos: [oldx, oldy], newPos: [actor.x, actor.y], pType:type, pID: actor.ID};
	coord = JSON.stringify(coord);
    
    wss.clients.forEach(function each(client) {
                    if(client.lobby == actor.stage.stageElementID){
			client.send(coord);
		}
                });
	return;
};

Actor.prototype.step=function(){
	return;
};

//PLAYER------------------------------------------------------------------------------------
Player.prototype = new Actor();

function Player(stage, x, y, ID){
	Actor.call(this, stage, x, y);
	this.ID = ID;
}

Player.prototype.step=function(id, i){
	dx = null;
	dy = null;

	switch(id){
		case "119"://North
			dx = -1;
			dy = 0;
			break;
		case "101"://North East
			dx = -1;
			dy = 1;
			break;
		case "100"://East
			dx = 0;
			dy = 1;
			break;
		case "99"://South East
			dx = 1;
			dy = 1;
			break;
		case "120"://South
			dx = 1;
			dy = 0;
			break;
		case "122"://South West
			dx = 1;
			dy = -1;
			break;
		case "97"://West
			dx = 0;
			dy = -1;
			break;
		case "113"://North West
			dx = -1;
			dy = -1;
			break;
	}

	if ((dx != null) && (dy != null)){
		//if move, update coord
		if(this.move(dx, dy)){
			this.stage.players[i][0] += dx;
			this.stage.players[i][1] += dy;
		}
	}
};

Player.prototype.move=function(dx, dy){
	newX = this.x + dx;
	newY = this.y + dy;
	actor = this.stage.getActor(newX, newY);

	//If Monster, Player is dead
	if(actor instanceof Monster){
        var pid = this.ID;
		coord = {lType: 'exit'}
		coord = JSON.stringify(coord);
        wss.clients.forEach(function each(client) {
      if(client.playerID == pid){
				client.send(coord);
			}
        });

	}

	//if Player, do nothing
	if (actor instanceof Player) {
		return false;
	};

	//If there is an actor at (dx, dy), ask them to move
	if (actor != null){
		if (!actor.move(dx, dy)) {
			return false;
		}
	}
	Actor.prototype.move(this, dx, dy);
	return true;
};

//Wall----------------------------------------------------------------------------------------

Wall.prototype = new Actor();

function Wall(stage, x, y){
	Actor.call(this, stage, x, y);
};

Wall.prototype.move = function() {
	return false;
};

//Box--------------------------------------------------------------------------------------------

Box.prototype = new Actor();

function Box(stage, x, y){
	Actor.call(this, stage, x, y);
};

Box.prototype.move = function(dx, dy) {
	newX = this.x + dx;
	newY = this.y + dy;
	actor = this.stage.getActor(newX, newY);
	
	//can't push a player
	if (actor instanceof Player) {
		return false;
	};

	//If there is an actor at (dx, dy), ask them to move
	if (actor != null){
		if (!actor.move(dx, dy)) {
			return false;
		}
	}

	Actor.prototype.move(this, dx, dy);
	return true;
};

//Monster------------------------------------------------------------------------------------------

Monster.prototype = new Actor();

function Monster(stage, x, y){
	Actor.call(this, stage, x, y);
	this.dx = Math.round(Math.random()) * 2 - 1;
	this.dy = Math.round(Math.random()) * 2 - 1;
};

Monster.prototype.isDead = function() {
	for(x = this.x - 1; x <= this.x + 1;x++){
		for(y = this.y -1; y <= this.y + 1;y++){
			actor = this.stage.getActor(x, y);
			if ((actor == null) || (actor instanceof Player)){
				return false;
			}
		}
	}
	return true;
};

Monster.prototype.step = function(i) {
	this.move(this, this.dx, this.dy);

	if (this.isDead()) {
		this.stage.removeActor(this);
	};
};

Monster.prototype.move = function(other, dx, dy) {
	//No one can push a monster! 
	if (other != this) {
		return false;
	};

	//Init
	newX = this.x + this.dx;
	newY = this.y + this.dy;
	actor = this.stage.getActor(newX, newY);

	//Kill Player
	if(actor instanceof Player){
		coord = {lType: 'exit'}
		coord = JSON.stringify(coord);
        var aid = actor.ID;
        
        wss.clients.forEach(function each(client) {
      if(client.playerID == aid){
				client.send(coord);
			}
        });
	}

	//Reflect off object
	if((actor != null) && !(actor instanceof Player)){
		this.dx = -this.dx;
		this.dy = -this.dy;
		return false;
	}

	Actor.prototype.move.call(this, this, dx, dy);
	return true;
};

// Stage-------------------------------------------------------------------------------------

function Stage(lIDth, height, stageElementID){
	this.actors=[]; // all actors on this stage (monsters, Player, boxes, ...)
	this.walls = [];
	this.players = [];
	this.clients = [];
	this.available = [0,1,2,3,4,5,6,7,8];

	// the logical lIDth and height of the stage
	this.lIDth=lIDth;
	this.height=height;

	// Boxes and Monsters
	this.Boxes = this.height + this.lIDth
	this.Monsters = 5;
	// the element containing the visual representation of the stage
	this.stageElementID=stageElementID;
}

// initialize an instance of the game
Stage.prototype.initialize=function(){
	// Add walls around the outside of the stage, so actors can't leave the stage
	this.populateWalls();
	// Add some Boxes to the stage
	this.populateBoxes();
	// Add in some Monsters
	this.populateMonsters();
}

Stage.prototype.addPlayer = function(id) {
	x = Math.floor((Math.random() * (this.lIDth - 2)) + 1);
	y = Math.floor((Math.random() * (this.height - 2)) + 1);

	while (this.getActor(x,y) != null){
		x = Math.floor((Math.random() * (this.lIDth - 2)) + 1);
		y = Math.floor((Math.random() * (this.height - 2)) + 1);
	}

	player = new Player(this, x,y, id);
	this.addActor(player);

	this.players.push([x,y, id]);
	return player;
}

Stage.prototype.populateBoxes = function() {
	var numBoxes = 0;
	while (numBoxes < this.Boxes){
		var x = Math.floor((Math.random() * (this.lIDth - 2)) + 1);
		var y = Math.floor((Math.random() * (this.height - 2)) + 1);
		if (this.getActor(x,y) == null){
			this.addActor(new Box(this, x, y));
			numBoxes++;
		}
	}
}

Stage.prototype.populateWalls = function() {
	for (x = 0; x < this.lIDth; x++){
		this.addActor(new Wall(this, x, 0));
		this.addActor(new Wall(this, x, (this.height - 1)));
		this.walls.push([x,0]);
		this.walls.push([x,(this.height - 1)]);
	}
	for (y = 0; y < this.height; y++){
		this.addActor(new Wall(this, 0, y));
		this.addActor(new Wall(this, (this.lIDth - 1), y));
		this.walls.push([0,y]);
		this.walls.push([(this.lIDth - 1), y]);
	}
}

Stage.prototype.populateMonsters = function() {
	numMonsters = 0;
	//Populate Monsters
	while(numMonsters < this.Monsters){
		var x = Math.floor((Math.random() * (this.lIDth - 2)) + 1);
		var y = Math.floor((Math.random() * (this.height - 2)) + 1);
		if (this.getActor(x,y) == null){
			this.addActor(new Monster(this, x, y));
			numMonsters++;
		}
	}
};

Stage.prototype.addActor=function(actor){
	this.actors.push(actor);
}

Stage.prototype.removeActor=function(actor){
	// Lookup javascript array manipulation (indexOf and splice).
	index = this.actors.indexOf(actor);
	if (index > -1) {
	    this.actors.splice(index, 1);
	}

	if (actor instanceof Player) {
		this.available.push(actor.ID);
		this.available.sort();

		for (var i = 0; i < this.players.length; i++) {
			if (this.players[i][2] == actor.ID){
				this.players.splice(i, 1)
				break;
			}
		}
	}

	coord = {lType: 'remove', pos: [actor.x, actor.y]};

	if (actor instanceof Monster) {
		this.Monsters--;
		if (this.Monsters == 0) {
			// gets rid of the html button
			for (i = 0 ; i < messages.length; i++) {
				button = JSON.parse(messages[i])
				if(button.lID == this.stageElementID){
					messages.splice(i, 1);
				}
			}
			coord = {lType: 'win'};
		}
	}

	coord = JSON.stringify(coord);
    var seid = this.stageElementID;
    wss.clients.forEach(function each(client) {
        if(client.lobby == seid){
      client.send(coord);
    }
  });
}

// Take one step in the animation of the game.  
Stage.prototype.step=function(){
	for(var i=0;i<this.actors.length;i++){
		// each actor takes a single step in the game
		this.actors[i].step();
	}
}

// return the first actor at coordinates (x,y) return null if there is no such actor
// there should be only one actor at (x,y)!
Stage.prototype.getActor=function(x, y){
	for(var i=0;i<this.actors.length;i++){
		if((this.actors[i].x == x) && this.actors[i].y == y){
			return this.actors[i];
		}
	}
	return null;
}

