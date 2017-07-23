import express  from 'express';
import passport from 'passport';
import mongoose from'mongoose';

import * as MessageServices from '../services/message-services';

require('../middlewares/passport')(passport);

const router = module.exports = express.Router({mergeParams: true});

router.route('/user')
  .post(passport.authenticate('jwt', { session: false}),
    (req, res) => {
      const {user, chatWith} = req.body;
      const userId = user._id;
      const chatWithId = chatWith._id;
      const roomId = userId+'-'+chatWithId;
      MessageServices.getListRoomByUser(userId)
        .then(room => {
          if(!room) {
            //user don't have data in Room collection
            MessageServices.create(userId, chatWithId, roomId)
              .then(result => {
                res.json({
                  status: 200,
                  data: null,
                  roomId: roomId,
                  message:'nothing'
                });
              })
              .catch(err => res.json({status: 500, data:'', message: err}));
          } else {
            //user have data in Room collection
            const listRoom = room.listRoom;
            const roomId2 = chatWithId + '-' + userId;
            if(listRoom.findIndex(x => x.roomId==roomId) < 0 &&
              listRoom.findIndex(x => x.roomId==roomId2) < 0) {
              //roomId don't have in Room collection
                MessageServices.create(userId, chatWithId ,roomId)
                  .then(result => {
                    res.json({
                      status: 200,
                      data: null,
                      roomId: roomId,
                      message:'nothing'
                    });
                  })
                  .catch(err => res.json({status: 403, data:'', message: err}));
            } else {
              //roomId have in Room collection
              if(listRoom.findIndex(x => x.roomId==roomId) >= 0) {
                MessageServices.getMessageByRoom(roomId)
                  .then(message => {
                    console.log('RoomID 1');
                    // global.io.sockets.in(roomId).emit('server-chat', message);
                    res.json({
                      status: 200,
                      data: message,
                      roomId: roomId,
                      message: 'load message succes'
                    });
                  })
                  .catch(err =>
                    res.json({status: 500, data:'', message: err})
                  );
              }
              if(listRoom.findIndex(x => x.roomId==roomId2) >= 0) {
                MessageServices.getMessageByRoom(roomId)
                  .then(message => {
                    console.log('RoomID 2');
                    // global.io.sockets.in(roomId2).emit('server-chat', message);
                    res.json({
                      status: 200,
                      data: message,
                      roomId: roomId2,
                      message: 'load message succes'
                    });
                  })
                  .catch(err =>
                    res.json({status: 500, data:'', message: err})
                  );
              }
            }
          }
        })
        .catch(err => {
          res.json({error: err})
        });
  });

router.route('/chatlist')
  .post(//passport.authenticate('jwt', { session: false}),
    (req, res) => {
      const userId = req.body.userId;
      MessageServices.getListRoomByUser(userId)
        .then(list => {
          if(!list) {
            res.json({
              status: 200,
              data: [],
              message: 'Load chatlist Success'
            });
          } else {
            res.json({
              status: 200,
              data: list.listRoom,
              message: 'Load chatlist Success'
            });
          }
        })
        .catch(err =>
          res.json({
            status: 403,
            data: [],
            message: err
          })
        );
  });

router.route('/send')
  .post(//passport.authenticate('jwt', { session: false}),
    (req, res) => {
      const {userId, chatWithId, roomId, content} = req.body;
      console.log('roomID', roomId);
      if(roomId == null) {
        const newRoomId = userId  + '-' + chatWithId;
        MessageServices.create(userId, chatWithId, newRoomId)
          .then(result => {
            if(result.status == 200) {
              MessageServices.sendMessage(roomId, userId, content)
                .then(result => {
                  if(!result) {
                    res.json({
                      status: 403,
                      data: [],
                      message: 'Send failed'
                    });
                  } else {
                    getMessageByRoom(roomId)
                      .then(message => {
                        console.log('getMessage', message);
                        global.io.sockets.in('tam').emit('server-chat', message);
                      })
                      .catch(err => res.json(err));
                      res.json({
                        status: 200,
                        data: result,
                        message: 'sent'
                      });
                  }
                })
                .catch(err =>
                  res.json({
                    status: 403,
                    data: [],
                    message: err
                  })
                );
            } else {
              res.json({status: 403, data:'', message: 'can\'t create Room'});
            }
          })
          .catch(err => res.json({status: 403, data:'', message: err}));
      } else {
        // console.log('chat in room exist');
        MessageServices.sendMessage(roomId, userId, content)
          .then(newMessage => {
            getMessageByRoom(roomId)
              .then(result => {
                  global.io.sockets.in('tam').emit('server-chat', result);
                // console.log('result', result);
                if(!result) {
                  res.json({
                    status: 403,
                    data: [],
                    message: 'Send failed'
                  });
                } else {
                  res.json({
                    status: 200,
                    data: result,
                    message: 'sent'
                  });
                }
              })
              .catch();
          })
          .catch(err =>
            res.json({
              status: 403,
              data: [],
              message: err
            })
          );
      }
  });

router.route('/room/message')
  .post(//passport.authenticate('jwt', { session: false}),
    (req, res) => {
      const {userId, chatWithId} = req.body;
      // console.log(userId);
      // console.log(chatWithId);
      MessageServices.getRoomId(userId, chatWithId)
        .then(roomId => {
          if(!roomId) {
            res.json({
              status: 200,
              data: [],
              message: 'Room Not exist',
              roomId: null
            });
          }else {
            MessageServices.getMessage(roomId)
              .then(message => {
                res.json({
                  status: 200,
                  data: message,
                  message: 'get message success',
                  roomId
                })
              })
              .catch(err =>
                res.json({
                  status: 403,
                  data: [],
                  message: err,
                  roomId
                })
              );
          }
        })
        .catch(err =>
          res.json({
            status: 403,
            data: [],
            message: err,
            roomId: null
          })
        );
  });
