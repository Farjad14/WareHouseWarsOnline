
==================MONGO DATABASE SETUP CREDITENTIALS===================
Go to admin/install.bash
Enter your information for UTORID, DBNAME, DBPASSWORD, PORT, PORT1, two different ports, so if port is 10050 then for port1 it should be 10051, just write  you only get one chance to make the setup run, because it will change the information in the 
RUN THE SITE ON cslinux.utm.utoronto.ca!

===============MOBILE FEATURE===================
1. Accelerometer: Shake to Exit Functionality: Utilizes an event listener that detects device motion. When there's a change in device motion at a rapid rate (shake), then exits the player out of the game (if they're currently in a game).

2. Gyroscope: Tilt Move Functionality: Utilizes an event listener that detects changes in device orientation. Handles tilt in all directions (up, down, left, right, diagonals) and moves player accordingly using gamma and beta values

//Works well both on Ipad/Nexus 7

================Features===================
->  ADDED MONGO Database!!
1. Moving the header image, JQuery Shake
2. Multiple Worlds: After User Authentication, Gave an option to the User to CREATE their own Lobby, and other users can join the World!
3. added number of games played in the table
4. Customozied the charts and buttons with customized styling
5. Email: you have to add a valid email which should contain an @ sign, with the appropiate regular expression
6. Autofocus: we have added this 'autofocus' in the 'login' view page, where the user can start typing in the input field right away once it displays the page.
7. Go Back: we added another 'Go back' button in the 'register' view page, which can allow the User to go back to the login button, if the User changes his/her mind.
8. READ-ONLY & Disabled: we have added this feature in 'profile' view page, where it will display the 'Username', but the User can only view its Username once it Autofills it into the field, but unable to modify it. 
9. Added a Favicon to the site
10. We have a MongoDB set up for this game!
11. Added a timer in the game!
12: MOVING BACKGROUND added through CSS
13: Added Music, which Auto loops for approximately 17 seconds, there is a mute button to pause the song
14. Password Hashing Done! SHA Password Encryption


===============Game Mechanics===========
The scoring of the game is dependent on the duration of the game. For example, if you last for 10 seconds, the score will be 10 seconds. It will then take it to the LOBBY
*******IT WILL DISPLAY TOP 3 For the User, once played the first game!

===============User Management==========
Since I did mod_rewrite, where in this link below:
https://cslinux.utm.utoronto.ca:PORT/user/fajo/
-> "users" is the name of table in my database
-> "fajo" is the name of user in the table
-> if there is another parameter such as highscores...i.e /user/fajo/highscores/, it will display the top 3 highscores of that users, CHECK THE EXAMPLES BELOW

Example:
You may have to type in this url request
https://cslinux.utm.utoronto.ca:PORT/user/fajo/

and it may show
"Name: fajo, Email: fajo@m.com, Number of Games Played: 32, Last Login: Sat Apr 01 2017 17:41:36 GMT-0400 (EDT)"

Example2:
https://cslinux.utm.utoronto.ca/user/fajo/highscores/

may show:
"fajo's scores: 127,127,100"


