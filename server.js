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
import * as MessageServices from './app/services/message-services';

let connection = 'mongodb://'+ db.host +'/'+ db.database;
mongoose.Promise = global.Promise;
mongoose.connect(connection);
console.log('Connected to MongoDB at ', connection);

const app = express();
app.use(cors());
app.use(morgan('dev'));

const server = new http.Server(app);
const io = require('socket.io').listen(server);
global.io = io;
let messageArray = [];

io.on('connection', socket => {
  console.log('Client connected', socket.id);
  socket.on('GET_CHATLIST', user => {
    MessageServices.getListRoomByUser(user._id)
      .then(room => {
        const dataInit = {
          chatList: room.listRoom,
          messageList: []
        }
        socket.emit('CHATLIST', dataInit);
      })
      .catch(err => console.log(err));
  });

  socket.on('GET_MESSAGE_LIST', roomId => {
    socket.join(roomId);
    socket.room = roomId;
    MessageServices.getMessage(roomId)
      .then(message => {
        messageArray = message;
        io.sockets.in(socket.room).emit('MESSAGE_LIST', messageArray);
      })
      .catch(err => console.log(err));
  });

  socket.on('REQUEST_CHAT', data => {
    console.log('REQUEST_CHAT');
    MessageServices.requestChat(data);
  });

  socket.on('user-chat', data => {
    console.log('user-chat', data);
    const createdBy= data.createdBy;
    const message = data.message;
    MessageServices.sendMessage(socket.room, createdBy, message)
      .then(newMsg => {
        MessageServices.getMessageById(newMsg._id)
          .then(msg => {
            messageArray.push(msg);
            io.sockets.in(socket.room).emit('NEW_MESSAGE', msg);
            io.sockets.in(socket.room).emit('MESSAGE_LIST', messageArray);
          })
          .catch(err => console.log(err));
      })
      .catch(err=> console.log(err));
  });
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


