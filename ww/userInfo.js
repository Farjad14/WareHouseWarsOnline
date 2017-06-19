
//Login Function, validates it and sends the request
function login() {

    var username = $("#user").val().toLowerCase();
    var password = $("#password").val().toLowerCase();
    var usernameColour = document.getElementById('user');
    var pattern = new RegExp(/^[a-zA-Z0-9]{0,50}$/);

    document.getElementById("user3").value = username;
    document.getElementById("usernameDisplay").value = username;

    if (username == "" || password == "") {
        alert("Missing Required Information");
    } else {
        if (!pattern.test(username)) {
            alert("Letters & Numbers Only");
        } else {
            var request = $.ajax({
                url: "/login",
                method: "POST",
                data: JSON.stringify({
                    username: username,
                    password: password
                }),
                contentType: "application/json; charset=UTF-8",

            });

            request.done(function(msg) {
		//alert(msg);
		if(msg == "login failed"){
		        alert("Invalid Login ");
		        usernameColour.style.backgroundColor = 'red';
		        usernameColour.style.color = 'white';
		}else{
				$('.top3').show();
		        $("#loginDiv").hide();
		        $("#logout").show();
		        $("#profileDisplay").show();
			getPlayers();
		        $("#rooms").show();
                $("#newWorld").autofocus;
		        displayTopThree();



		        usernameColour.style.backgroundColor = "";
		        usernameColour.style.color = "";
		        document.getElementById("user").value = "";
		        document.getElementById("password").value = "";
		}
            });

        }
    }

}

$(document).ready(function() {

    //using jQUERY and CSS in all the functions below
    $("p").css({"font-family": "Courier New", "color": "white"});
    
    //storing the score
    $('#btnSave').click(function() {
        var scored = $("#scored").val();
        var timed = $("#timeInSec").val();
        var usernameG = document.getElementById("usernameDisplay");
        alert("GAME OVER");
        var request = $.ajax({
            url: "api/api.php",
            method: "PUT",
            data: JSON.stringify({
                usernameG: usernameG,
                scored: score,
                timed: timed
            }),
            contentType: "application/json; charset=UTF-8",

        });

        request.done(function(msg) {
            alert("score updated")
        });

        request.fail(function(jqXHR, textStatus) {
            alert("score didn't update " + textStatus);
        });
    });


    //Displays the Profile Form
    $('#profileDisplay').click(function() {
        if(inGame){
		quit();
        }
		$('#rooms').hide();
        $('#profileDiv').show();
    });

    //Displays the Register Div
    $('#register').click(function() {
        $("#hiscores").hide();
        $('#loginDiv').hide();
        $('#registerDiv').show();



    });
    //goes back to login display from signUp
    $('#goBack').click(function() {
        $('#registerDiv').hide();
        $("#hiscores").show();
        $('#loginDiv').show();
    });
    //goes back from profile to game
    $('#goBackGame').click(function() {
        $('#profileDiv').hide();
        $("#rooms").show();
        $("#newWorld").autofocus;
    });
    //logouts and redirects to login page
    $('#logout').click(function() {
        location.reload();
    });

    //Signup Function, registers a user
    $('#signUp').click(function() {
        var username = $("#username").val();
        var password = $("#password2").val();
        var name = $("#name").val();
        var email = $("#email").val();

        document.getElementById("usernameDisplay").value = username;
        document.getElementById("user3").value = username;
        document.getElementById("password3").value = password;
        document.getElementById("name2").value = name;
        document.getElementById("email2").value = email;

        var pattern = new RegExp(/^[a-zA-Z0-9]{0,50}$/);
        var emailPattern = new RegExp(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}$/);
        //var usernameColour = document.getElementById('username');

        if (username == "" || password == "" || name == "" || email == "") {
            alert("Missing Required Information");
        } else {

            if (!pattern.test(username) || !pattern.test(name)) {
                alert("Letters & Numbers Only");
            } else if (!emailPattern.test(email)) {
                alert("Please Enter a Valid Email Address");
            } else {
                var request = $.ajax({
                    url: "/register",
                    method: "PUT",
                    data: JSON.stringify({
                        username: username,
                        password: password,
                        name: name,
                        email: email
                    }),
                    contentType: "application/json; charset=UTF-8",

                });

                request.done(function(msg) {
                    var returned = msg;
                    if (returned == "User Already Exists") {
                        alert("User Already Exists");
                        usernameColour.style.backgroundColor = 'red';
                        usernameColour.style.color = 'white';
                    } else {
                        alert("Succesful Registeration");
                        //$('#loginDiv').show();

                        $('#usernameDisplay').html(username);
                        $('#registerDiv').hide();
                        $("#logout").show();
                        $("#profileDisplay").show();
                        $("#rooms").show();
                        $("#newWorld").autofocus;
                        //$("#game").show();



                    }
                });

                request.fail(function(jqXHR, textStatus) {
                    alert("User Already Exists");
                });
            }
        }
    });

    //Profile Form, Edit User's Profile
    $('#editProfile').click(function() {
        var username2 = $("#user3").val();
        var password2 = $("#password3").val();
        var name2 = $("#name2").val();
        var email2 = $("#email2").val();
        //var operation = $("#operation").val();

        var pattern = new RegExp(/^[a-zA-Z0-9]{0,50}$/);
        var emailPattern = new RegExp(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}$/);

        if (password2 == "" || name2 == "" || email2 == "") {
            alert("Missing Required Information");

        } else {
            //alert("wake up fajju");


            if (!pattern.test(name2)) {
                alert("Letters & Numbers Only");
            } else if (!emailPattern.test(email2)) {
                alert("Please Enter a Valid Email Address");
            } else {
                //$("#loginDiv").hide();
                var request = $.ajax({
                    url: "/profile",
                    method: "POST",
                    data: JSON.stringify({
                        username2: username2,
                        password2: password2,
                        email2: email2,
                        name2: name2
                    }),
                    contentType: "application/json; charset=UTF-8",

                });

                request.done(function(msg) {
                    //var returned = JSON.stringify(msg);
		    if (msg == "Profile bad edit"){
		    	alert("Invalid Profile Update");
		    }else{
		            alert("Profile Changed");
		            //document.getElementById("operation").value =returned;						
		            $("#profileDiv").hide();
		            $("#logout").show();
		            $("#rooms").show();
                    $("#newWorld").autofocus;
		            //$("#logout").show();
		            //$("#demo").show();				
		            //$('#status').html("user info is " + returned);
		     }
                });

                
            }
        }
    });

});
