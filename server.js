import express    from 'express';
import http       from 'http';
import flash      from 'connect-flash';
import bodyParser from 'body-parser';
import morgan     from 'morgan';
import mongoose   from 'mongoose';
import passport   from 'passport';
import session    from 'express-session';
import cors       from 'cors';
import SocketIo   from 'socket.io';

import db from './config/database';
import config  from './config/config';
import Routes from './app/routes/';


let connection = 'mongodb://'+ db.host +'/'+ db.database;
mongoose.Promise = global.Promise;
mongoose.connect(connection);
console.log('Connected to MongoDB at ', connection);

const app = express();
app.use(cors());

const server = new http.Server(app);
const io = require('socket.io').listen(server);
// io.path('/socket.io');
// io.set('origins', 'http://localhost:3001');
// io.set('origins', '*:*');
// global.io = io;

io.on('connection', socket => {
  socket._emit = (action, data) => {
    return socket.emit('action', { type: action, data });
  };
  console.log('Client connected', socket.id);

});

app.use('/uploads', express.static(__dirname + '/uploads'));
app.use('/public', express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(session({
  secret : "secret",
  saveUninitialized: true,
  resave: true
}))
app.set('secret', 'tamdeptrai');
global.secret = 'tamdeptrai';
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

const optionCors = {
  origin: 'http://localhost:3001'
}

import headers from './config/headers.js';
app.use('/', require('./app/routes/index'));

server.listen(config.port, () => {
  console.log('Server listening on ' + config.host + ':' + config.port);
});


