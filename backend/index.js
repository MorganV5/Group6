const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const flat = require('./models/flat'); 
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

const verifyToken = require('./middleware/authenticate');
const redirectIfAuthenticated = require('./middleware/redirect');

const roomRoutes = require('./routes/room');
const taskRoutes = require('./routes/taskLists');
const userRoutes = require('./routes/userAccounts');
const userRoomRoutes = require('./routes/userRoom');
const flatRoutes = require('./routes/flat');
const progressRoutes = require('./routes/progressTasks');
const frequencyRoutes = require('./routes/frequency');
const areaRoutes = require('./routes/areas');

app.use('/rooms', roomRoutes);
app.use('/tasks', taskRoutes);
app.use('/users', userRoutes);
app.use('/user-room', userRoomRoutes);
app.use('/flats', flatRoutes); 
app.use('/progress', progressRoutes);
app.use('/frequencies', frequencyRoutes);
app.use('/areas', areaRoutes);


app.get('/login', redirectIfAuthenticated, (req, res) => {
  res.render('login');
});

app.get('/register', redirectIfAuthenticated, (req, res) => {
  res.render('register');
});

app.get('/register-step2', (req, res) => {
  res.render('register-step2');
});

app.get('/dashboard', verifyToken, (req, res) => {
  const userName = req.user?.userName || 'User';
  res.render('dashboard', { userName });
});

app.get('/edit_task', verifyToken, (req, res) => {
  res.render('edit_task');
});

app.get('/exchange', verifyToken, (req, res) => {
  res.render('exchange');
});

app.get('/information', verifyToken, (req, res) => {
  res.render('information');
});

app.get('/add_task', verifyToken, (req, res) => {
  res.render('add_task');
});

app.get('/myflat', verifyToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const flatInfo = await flat.getFlatCodeByUserId(userId);
    console.log(flatInfo);
    console.log(flatInfo[0].invite_code);

    let inviteCode = "";

    if (flatInfo.length > 0) {
      inviteCode = flatInfo[0].invite_code;
    }

    res.render('myflat', {
      flatCode: inviteCode
    });
  } catch (err) {
    console.error('Error rendering /myflat:', err);
    res.status(500).send('Server error');
  }
});

app.get('/flat', (req, res) => {
  res.render('flat', { users: req.flatUsers });
});

app.get('/logout', (req, res) => {
  res.clearCookie('authToken');
  res.redirect('/login');
});


app.use((req, res) => {
  res.status(404).send('404 Not Found');
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
