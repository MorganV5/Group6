# Group6
to run backend
cd backend
npm install 
download mysql for local testing https://dev.mysql.com/downloads/mysql/

after installing mysql:
open settings
go to bottom and click mysql
click start server 
open terminal
sudo /usr/local/mysql/support-files/mysql.server start

if this doesnt work:
export PATH="/usr/local/mysql/bin:$PATH"
sudo /usr/local/mysql/support-files/mysql.server start

then:
/usr/local/mysql/bin/mysql -u root -p
type in the passwort you made when installing mysql

make database using the createTables.sql file
default mysql port 3306
run node app.js

4 apis:
post
http://localhost:3000/api/users/login
post
http://localhost:3000/api/users/register
post
http://localhost:3000/api/tasks/createTask
get
http://localhost:3000/api/tasks/getTasks