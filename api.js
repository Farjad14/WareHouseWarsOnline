
/* What about serving up static content, kind of like apache? */

var express = require('express');
var bodyParser = require('body-parser');
var passwordHash = require('password-hash');


var app = express();
var Mongo = require('mongodb');
var url = 'mongodb://UTORID:DBPASSWORD@mcsdb.utm.utoronto.ca:27017/DBNAME';
var err;
var db;
Mongo.connect(url, function(errr, mdb) {
    err = errr;
    db = mdb;
    
    //clear worlds table
    var collection = db.collection('worlds');
    collection.remove({});
	console.log("connected");});

//var jsonParser = bodyParser.json()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//var urlencodedParser = bodyParser.urlencoded({ extended: false })



// static_files has all of statically returned content
// https://expressjs.com/en/starter/static-files.html
app.use('/',express.static('ww')); // this directory has files to be returned


//RETREIVE USER's Creditentials && with proper AUTHENTICATION on GET REQUEST
app.get('/user/:id', function (req, res) {
		
		var collection = db.collection('users');
		
		//AUTHENTICATION
		var query = {'username':req.params.id};
		    collection.findOne(query,{ name:1, email:2, numGamesPlayed:3, lastLogin:4 }, function(err,data){
			if(err || !data)
			{

			   res.status(404).send("Get Request for User Failed!");

			}
			else
			{
			       //AUTHORIZATION
				res.status(200).send("Name: "+data.name +",   Email: "+data.email+", Number of Games Played: "+data.numGamesPlayed+", Last Login: "+data.lastLogin);

			 }

		});

});

//RETRIEVE USER's HIGHSCORE ON GET REQUEST
app.get('/user/:id/highScores', function (req, res){
		
		
		var collection = db.collection('highscores');
        //AUTHENTICATION
		collection.find({'user':req.params.id}).sort({'score': -1}).limit(3).toArray(function(error, documents) {

		   
			if (!error && documents.length > 0)
			{
				var scoreCheck=[];
		        for (var x = 0; x < documents.length; x++) {
		                scoreCheck.push(documents[x].score);
			        
		            }
                    //AUTHORIZATION
		            res.status(200).send(req.params.id +"'s "+ "scores: " + scoreCheck);

			 }else{
			   res.status(404).send("Get Request for Userscores Failed! && User Doesn't Exist");
                

			}

		    
		});
	
});


//SAVING PLAYER's SCORE && UPDATE//CREATE QUERIES
app.put('/saveScore', function (req, res){
		
		
		var collection = db.collection('highscores');
		
		//AUTHENTICATION
		var query = {'score':parseInt(req.body.scored), 'user':req.body.usernameG};
		    collection.insert(query);
        //AUTHENTICATION to UPDATE the number of Games Played
		var numGames = db.collection('users');
		numGames.update({"username" : req.body.usernameG}, { $inc: {
							"numGamesPlayed": 1
						    }}, function (err, doc) {
						    //AUTHORIZATION
							if (err) {
							    res.status(404);
							}
							else {
							    res.status(200);
							}
						    });
	
});


//RETRIEVE TOP 3 HIGHSCORES FOR THE USER
app.post('/topthree', function (req, res){
		
		console.log("connected to db for top3!");
		
		var collection = db.collection('highscores');
        //AUTHENTICATION
		collection.find({'user':req.body.usernameG}).sort({'score': -1}).limit(3).toArray(function(error, documents) {
        
        //AUTHORIZATION
        if (err) {
		      res.status(404);
		}else{
            res.status(200).send(documents);
        }
});
	
});


//RETRIEVE TOP 10 HIGHSCORES ON THE HOME SCREEN
app.post('/topten', function (req, res){
		
		
		console.log("connected to db for top 10!");
		
		//AUTHENTICATION
		var collection = db.collection('highscores');

		
		collection.find({}).sort({'score': -1}).limit(10).toArray(function(error, documents) {
        res.send(documents);
        //AUTHORIZATION
        /*if (err) {
            res.status(404);
            throw error;
         }else{
            
           res.status(200).send(documents);
         }
         */
         });
	
});

app.post('/worldEntry', function (req, res){
		
		console.log("connected to db for worldEntry!");
		
		var collection = db.collection('worlds');

		//AUTHENTICATION
		var query = {'user':req.body.usernameG, 'lid':req.body.lid};
		       //AUTHORIZATION
		    collection.insert(query);
	
});

app.delete('/worldExit', function (req, res){
		
		console.log("connected to db for worldExit!");
		
		var collection = db.collection('worlds');

		//AUTHENTICATION
		var query = {'user':req.body.usernameG};
		    //AUTHORIZATION
		    collection.remove(query);
	
});

app.post('/getPlayers', function (req, res){
		
		console.log("connected to db for getPlayers!");
		
		var collection = db.collection('worlds');
		//AUTHENTICATION
		var query = {'lid':req.body.lid};
		    collection.find(query).toArray(function(error, documents) {
		    //AUTHORIZATION
		if (err) {
            res.status(404);
            //throw error;
         }else{
            
           res.status(200).send(documents);
         }
        console.log(documents);
});
});





app.post('/login', function (req, res){
		
		console.log("connected to db for login!");
		
		var collection = db.collection('users');
		//AUTHENTICATION
		//passwordHash.verify(req.body.password, b);
		var query = {'username':req.body.username};
		    collection.findOne(query,{ username:1, password: 2}, function(err,data){
			if(err || !data)
			{
			   console.log(err);
			   res.send("login failed");
			}
			else
			{
			  var a = data.username;	
			  var b = data.password;
			  //AUTHORIZATION
			  if (a == req.body.username ){
			        if(passwordHash.verify(req.body.password, b)){
					    res.send('Returned user:'+req.body.username);
					    console.log(req.body.username + " is logged in!");

					    collection.update({"username" : req.body.username}, { $set: {
							    "lastLogin": new Date()
						        }}, function (err, doc) {
							    if (err) {
							        console.log("NumGamesPlayed didnt work for shit!");
							    }
							    else {
							        console.log("NumGamesPlayed works!");
							    }
						        });


			
                }
                else{
					res.send("login failed");
					res.status(400);
					//res.send("login failed");
					console.log("Invalid Login");
			   }
			  }else{
					res.send("login failed");
					res.status(400);
					//res.send("login failed");
					console.log("Invalid Login");
			   }
			 }
		    });
	
});



app.put('/register', function (req, res){
		
		console.log("connected to db for register!");
		
		var collection = db.collection('users');
		//AUTHENTICATION
		var query = {'username':req.body.username};
		    collection.findOne(query,{ username:1}, function(err,data){
			if(err || !data)
			{
			   console.log(err);
			   console.log('Username Available!');
			   var hashedPassword = passwordHash.generate(req.body.password);
			   console.log(hashedPassword);
			   collection.insert({
							"username" : req.body.username,
							"password" : hashedPassword,
							"name" : req.body.name,
							"email" : req.body.email,
						    }, function (err, doc) {
						    //AUTHORIZATION   
							if (err) {
							     res.status(404).send("User Already Exists");
							     console.log("Account NOT Created");
							}
							else {
							    console.log("Account Created");
							    res.status(200).send("Account Created");
							}
						    });
			   //return next(err);
			}
			else
			{
			        //AUTHORIZATION
				  res.send('User Already Exists');
				  console.log(req.body.username + " User Already Exists");
						
			 }
		    });
});

app.post('/profile', function (req, res){
		
		
		var collection = db.collection('users');
		//AUTHENTICATION
		var query = {'username':req.body.username2};
		    collection.findOne(query,{ username:1}, function(err,data){
			if(err || !data)
			{
					
				  res.send("Profile bad edit");
						//res.send("login failed");
						//res.status(400);
						//res.send("login failed");
						//console.log("Invalid Login");
			   //return next(err);
			}
			else
			{
			   console.log(err);
			   var hashedPassword = passwordHash.generate(req.body.password2);
			   collection.update({"username" : req.body.username2}, { $set: {
							"password" : hashedPassword,
							"name" : req.body.name2,
							"email" : req.body.email2,
						    }}, function (err, doc) {
						       //AUTHORIZATION
							if (err) {
							    // If it failed, return error
							     res.send("Acount Didn't Update");
							}
							else {
							    // And forward to success page
							    res.send("Account Edited");
							}
						    });


				   
			 }
		    });
	
});



app.listen(PORT, function () {
  console.log('Example app listening on port PORT!');
});


