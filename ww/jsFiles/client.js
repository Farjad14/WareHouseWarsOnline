inGame = false;
blankImage = "icons/blank.gif";
boxImage = "icons/emblem-package-2-24.png";
wallImage = "icons/wall.jpeg";
monsterImage = "icons/face-devil-grin-24.png";

width = 20;
height = 20;
var r = null;
stage = null;
// SOME GLUE CODE CONNECTING THIS PAGE TO THE STAGE
var score = 0;
var time = 0;
var music = true;

function muteUnMute(){
    if(music){
        document.getElementById('rolly').pause();
        music = false;
    }
    else{
        document.getElementById('rolly').play();
        music = true;
    }
    
}

setInterval(function() {
    $('#score').html("Score: " + score);
    score++;
    time++;
    var date = new Date(null);
    date.setSeconds(time);
    document.getElementById("timeInSec").value = date.setSeconds(time);
    var utc = date.toUTCString();
    document.getElementById("time").innerHTML = "Time: " + utc.substr(utc.indexOf(':') - 2, 8);
}, 1000);

function displayTopThree() {
    $("#hiscores").hide();
    var request = $.ajax({
        url: "/topthree",
        method: "POST",
        data: JSON.stringify({
            usernameG: $("#usernameDisplay").val()
        }),
        contentType: "application/json; charset=UTF-8",

    });

    request.done(function(msg) {
        var returned = msg;
        if (msg == "top-3 failed") {
            alert("top 3 aint showin up bud!");
        } else {
            for (var x = 1; x <= 3; x++) {
                var id = "s" + x;
                document.getElementById(id).value = returned[x - 1].score;
            }
        }
    });

}


function worldEntry(id) {

    var request = $.ajax({
        url: "/worldEntry",
        method: "POST",
        data: JSON.stringify({
            usernameG: $("#usernameDisplay").val(),
            lid: parseInt(id)
        }),
        contentType: "application/json; charset=UTF-8",

    });
    message = {
        lType: 'entry'
    };
    message = JSON.stringify(message);
    socket.send(message);

}

function checkKey(e) {

            e = e || window.event;
            //north
            if (inGame) {
                    if (e.keyCode == '87') {
                        move('119');
                    } else if (e.keyCode == '69') {
                        move('101');
                    } else if (e.keyCode == '81') {
                        // north_west
                        move('113');
                    } else if (e.keyCode == '88') {
                        // south
                        move('120');
                    } else if (e.keyCode == '67') {
                        // south east
                        move('99');
                    } else if (e.keyCode == '90') {
                        // south west
                        move('122');
                    } else if (e.keyCode == '65') {
                        // west
                        move('97');
                    } else if (e.keyCode == '68') {
                        // east
                        move('100');
                    }
            }

            if (e.keyCode == '13') {
                // enter
                if ($("#loginDiv").is(":visible")) {
                    login();
                }
                if ($("#rooms").is(":visible")) {
                    sendNew();
                }
            }


        }

function displayTopTen() {
    var request = $.ajax({
        url: "/topten",
        method: "POST",
        contentType: "application/json; charset=UTF-8",

    });
    request.done(function(msg) {
        for (var x = 1; x <= msg.length; x++) {
            var id = "t" + x;
            document.getElementById(id).value = msg[x - 1].user + ": " + msg[x - 1].score;
        }

    });
}

function getAllPlayers(id) {
    var request = $.ajax({
        url: "/getPlayers",
        method: "POST",
        data: JSON.stringify({
            lid: parseInt(id)
        }),
        contentType: "application/json; charset=UTF-8",

    });
    request.done(function(msg) {


        $('#lobby' + id).empty();
        for (var x = 0; x < msg.length; x++) {
            console.log(msg[x].user);
            $('#lobby' + msg[x].lid).append(msg[x].user + " ");
        }

    });

}

function getPlayers() {
    $('input', $('#messages')).each(function() {
        getAllPlayers($(this).attr("id"));
    });

}

function worldExit() {

    var request = $.ajax({
        url: "/worldExit",
        method: "DELETE",
        data: JSON.stringify({
            usernameG: $("#usernameDisplay").val()
        }),
        contentType: "application/json; charset=UTF-8",

    });
    message = {
        lType: 'entry'
    };
    message = JSON.stringify(message);
    socket.send(message);
}


function numGameUpdate() {
    var request = $.ajax({
        url: "/gameUpdate",
        method: "POST",
        data: JSON.stringify({
            userNumG: $("#usernameDisplay").val(),
            type: "updateNumG"
        }),
        contentType: "application/json; charset=UTF-8",

    });
    request.done(function(msg) {
        var returned = JSON.parse(msg);
        console.log(returned);

    });
}

function saveScore(score) {

    var request = $.ajax({
        url: "/saveScore",
        method: "PUT",
        data: JSON.stringify({
            usernameG: $("#usernameDisplay").val(),
            scored: score
        }),
        contentType: "application/json; charset=UTF-8",

    });

    request.done(function(msg) {
        console.log("score updated ");
        displayTopThree();
    });

    request.fail(function(jqXHR, textStatus) {
        console.log("score didn't update " + textStatus);
    });

}
// YOUR CODE GOES HERE

function deviceOrientationHandler(gamma, beta) {
    if (inGame) {
        if (beta > 10 && gamma < -10) {
            move("122");
        } else if (beta > 10 && gamma > 10) {
            move("99");
        } else if (beta < -10 && gamma < -10) {
            move("113");
        } else if (beta < -10 && gamma > 10) {
            move("101");
        } else if (gamma > 10) {
            move("100");
        } else if (gamma < -10) {
            move("97");
        } else if (beta < -10) {
            move("119");
        } else if (beta > 10) {
            move("120");
        }
    }
}

function sendNew() {

    if ($('#newWorld').val() == '') {
        error = 'Please specify game room name';
        document.getElementById('errors').innerHTML = error;
        return
    }
    document.getElementById('errors').innerHTML = '';
    message = {
        lType: 'new',
        lName: $('#newWorld').val()
    }
    message = JSON.stringify(message);
    socket.send(message);
    console.log(message);
    $('#newWorld').val("");
}

//load existing world
function sendExisting(id) {
    score = 0;
    time = 0;
    worldEntry(id);
    document.getElementById('errors').innerHTML = '';
    worldID = id;
    message = {
        lType: 'load',
        lID: id
    }
    message = JSON.stringify(message);
    socket.send(message);
}

//move the player
function move(direction) {
    message = {
        lType: 'step',
        direction: direction
    };
    message = JSON.stringify(message);
    socket.send(message);
}

//populate all players
function populatePlayers(players) {
    for (var i = 0; i < players.length; i++) {
        id = players[i][0] + "," + players[i][1]
        pID = 'p' + String(players[i][2]);
        document.getElementById(id).src = document.getElementById(pID).src;
    }
}

function populateLegend(plyrs) {
    console.log("length: " + plyrs);
    for (var i = 0; i < plyrs; i++) {
        $('#' + pID).show();
    }
}

//populate all boxes
function populateBoxes(boxes) {
    for (var i = 0; i < boxes.length; i++) {
        id = boxes[i][0] + "," + boxes[i][1]
        document.getElementById(id).src = boxImage;
    }
}

//populate all walls
function populateWalls(walls) {
    for (var i = 0; i < walls.length; i++) {
        id = walls[i][0] + "," + walls[i][1]
        document.getElementById(id).src = wallImage;
    }
}

//populate all monsters
function populateMonsters(monsters) {
    for (var i = 0; i < monsters.length; i++) {
        id = monsters[i][0] + "," + monsters[i][1]
        document.getElementById(id).src = monsterImage;
    }
}

//update the images on move
function update(oldPos, newPos, type, pID) {
    oldID = oldPos[0] + "," + oldPos[1];
    newID = newPos[0] + "," + newPos[1];
    document.getElementById(oldID).src = blankImage;
    switch (type) {
        case 'Box':
            document.getElementById(newID).src = boxImage;
            break;
        case 'Monster':
            document.getElementById(newID).src = monsterImage;
            break;
        case 'Player':
            playerID = 'p' + String(pID)
            document.getElementById(newID).src = document.getElementById(playerID).src;
            break;
    }
}

function quit() {
    
    $('#gameDisplay').hide();
    $('#rooms').show();
    $('#head').show();
    worldExit();
    console.log("dead");
    getPlayers();
    displayTopThree();
    console.log("SCORE: " + score);
    saveScore(score);
    score = 0;
    time = 0;
    inGame = false;
    message = {
        lType: 'exit'
    };
    message = JSON.stringify(message);
    socket.send(message);
}



$(function() {
    document.onkeydown = checkKey;
    displayTopTen();
    socket = new WebSocket("ws://cslinux.utm.utoronto.ca:PORT1");
    socket.onopen = function(event) {
        //$('#rooms').show();
        //$('#gameDisplay').hide();
        $('#sendButton').removeAttr('disabled');
        console.log("connected");
    };
    socket.onclose = function(event) {
        alert("closed code:" + event.code + " reason:" + event.reason + " wasClean:" + event.wasClean);
    };
    //Tilt move functionality
    if (window.DeviceOrientationEvent) {

        window.addEventListener('deviceorientation', function(eventData) {
            tiltLR = eventData.gamma;
            tiltFB = eventData.beta;
            deviceOrientationHandler(tiltLR, tiltFB);
        }, false);
    }
    
    //if the user shakes the device, they will exit the world
				if (typeof window.DeviceMotionEvent != 'undefined') {
			
					sensitivity = 20;
					var x1 = 0, y1 = 0, z1 = 0, x2 = 0, y2 = 0, z2 = 0;

					window.addEventListener('devicemotion', function (e) {
						x1 = e.accelerationIncludingGravity.x;
					    y1 = e.accelerationIncludingGravity.y;
					    z1 = e.accelerationIncludingGravity.z;
					}, false);

					setInterval(function () {
					    var changePosition = Math.abs(x1-x2+y1-y2+z1-z2);

					    if ((changePosition > sensitivity) && inGame) {	
					        quit();
					    }

					    x2 = x1;
					    y2 = y1;
					    z2 = z1;
					}, 150);
				}


    socket.onmessage = function(event) {
        json = JSON.parse(event.data);

        //Game Engine
        switch (json.lType) {

            case 'new':
                console.log("on message new")
                button = '<input type="button" class="btn" id="' + json.lID + '"value ="' + json.lName + '" onclick="sendExisting(id);" />';
                $('#messages').append("<br/></br>" + button);
                $('#messages').append("<div id='lobby" + json.lID + "' </div>");
                //$('#rooms').show();
                $('#gameDisplay').hide();
                break;

            case 'load':

                $("#time").html("Time: 00:00:00");
                score = 0;
                time = 0;
                $('#score').html("Score: " + score);
                window.scrollTo(0, document.body.scrollHeight);
                $('#head').hide();
                console.log("on message load")
                inGame = true;
                $('#rooms').hide();
                table = '<table border=1>';

                for (i = 0; i < width; i++) {
                    table += '<tr">';
                    for (j = 0; j < height; j++) {
                        table += '<td> <img src=icons/blank.gif id="' + i + ',' + j + '" height = 24, width = 24/> </td>';
                    }
                    table += '</tr>';
                }
                table += '</table>';
                document.getElementById('stage').innerHTML = table;
                playerID = json.pID;

                populatePlayers(json.players);
                populateBoxes(json.box);
                populateWalls(json.walls);
                populateMonsters(json.monster);
                console.log("LOAD");
                $('#gameDisplay').show();
                break;

            case 'update':
                console.log("on message update");
                populateLegend(json.plyrs);
                update(json.oldPos, json.newPos, json.pType, json.pID);
                break;
            case 'remove':
                id = json.pos[0] + ',' + json.pos[1];
                document.getElementById(id).src = blankImage;
                break;
                
            case 'exit':
                quit();
                /*if($('#gameDisplay').is(":visible")){
                    console.log("gameDisplay");
                    $('#gameDisplay').hide();
                }
                if($('#rooms').is(':hidden')){
                    console.log("rooms");
                    $('#rooms').show();
                }
                if($('#head').is(':hidden')){
                    console.log("head");
                    $('#head').show();
                }*/
                alert("You died");
                break;

            case 'win':
                $('#messages').val("");
                $('#game').hide();
                $('#rooms').show();
                quit();
                location.reload();
                alert("You win");
                break;

            case 'error':
                document.getElementById('errors').innerHTML = json.err;
                break;
            case 'entry':
                console.log('player update');
                getPlayers();
                break;
        }
    }
});
