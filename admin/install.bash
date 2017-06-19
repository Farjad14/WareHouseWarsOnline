dbname="ENTER YOUR DATABASE NAME" *STRING MUST BE IN QUOTES*
utorid="ENTER YOUR UTORID" *STRING MUST BE IN QUOTES*
password=ENTER YOUR DB PASSWORD
port=ENTER YOUR PORT
port1=ENTER YOUR PORT + 1


sed -i 's/UTORID/'$utorid'/g' ../api.js
sed -i 's/DBPASSWORD/'$password'/g' ../api.js
sed -i 's/DBNAME/'$dbname'/g' ../api.js

sed -i 's/PORT/'$port'/g' ../api.js

sed -i 's/PORT1/'$port1'/g' ../game-server.js
sed -i 's/PORT1/'$port1'/g' ../ww/jsFiles/client.js



