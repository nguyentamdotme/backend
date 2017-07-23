import Message from '../models/message-model';
import Room from '../models/rooms-model';
import RoomMember from '../models/roomMember-model';



export function create(userId, chatWithId, roomId) {
  return new Promise((resolve, reject) => {
    // resolve('hello');
    // console.log('create room');
    createRoom(userId, chatWithId, roomId)
      .then(data => {
        createRoom(chatWithId, userId, roomId)
          .then(data => {
            resolve({status: 200, data, message: 'Thành công!'});
          })
          .catch(err => {
            reject({status: 500, data: '', message:err});
          });
      })
      .catch(err => {
        reject({status: 500, data: '', message:err});
      });
  });
}

export function createRoom(userId, withUser, roomId) {
  return new Promise((resolve, reject) => {
    Room.findOne({userId})
      .then(room => {
        if(!room) {
          const dataRoom = {
            userId,
            listRoom: [{
              roomId,
              withUser
            }]
          }
          const newRoom = new Room(dataRoom);
          resolve(newRoom.save());
        } else {
          Room.findOne({userId})
            .then(room => {
              const arr = room.listRoom;
              if(arr.findIndex(x => x.roomId==roomId) >= 0) {
                resolve(null);
              }else {
                const data = {roomId, withUser};
                const updated = Room.update(
                    {userId: userId},
                    {$push: {listRoom: data}}
                  )
                resolve(updated);
              }
            })
            .catch(err => reject(err));
        }
      })
      .catch(err => reject(null));
  });
}

export function find(opt) {
  return Room.find(opt || {})
}

export function getRoomId(userId, chatWithId) {
  return new Promise((resolve, reject) => {
    Room.findOne({
      userId,
      listRoom: {$elemMatch: {withUser: chatWithId}}
    })
      .then(room => {
        if(!room) {
          resolve(room);
        } else {
          const roomId = userId + '-' + chatWithId;
          const roomId2 = chatWithId + '-' + userId;
          const listRoom = room.listRoom;
          if(listRoom.findIndex(x => x.roomId==roomId) >= 0) {
            resolve(roomId);
          }
          if(listRoom.findIndex(x => x.roomId==roomId2) >= 0) {
            resolve(roomId2);
          }
        }
      })
      .catch(err => reject(err));
  });
}

export function getMessage(roomId) {
  return new Promise((resolve, reject) => {
    Message.find({roomId}).populate('createdBy').sort({updatedAt: 1})
      .then(message => {
        if(message.length == 0) {
          resolve([]);
        } else {
          resolve(message);
        }
      })
      .catch(err => reject({status: 500, data: '', message:err}));
  });
}

export function getMessageById(_id) {
  return new Promise((resolve, reject) => {
    Message.findOne({_id}).populate('createdBy')
      .then(message => {
        resolve(message);
      })
      .catch(err => reject({status: 500, data: '', message:err}));
  });
}

export function getListRoomByUser(userId) {
  return new Promise((resolve, reject) => {
    Room.findOne({userId}).populate('listRoom.withUser')
      .then(room => {
        if(room){
          resolve(room);
        } else {
          resolve([]);
        }
      })
      .catch(err => reject(err));
  });
}

export function sendMessage(roomId, createdBy, content) {
  return new Promise((resolve, reject) => {
    // console.log('roomId sendMessage', roomId);
    const newMessage = new Message({
            roomId, createdBy, content
          });
    newMessage.save()
      .then(newMessage => {
        resolve(newMessage);
      })
      .catch(err => reject(err));
  });
}

//check user exist

export function updateChatList(userId, withUser, roomId) {
  return new Promise((resolve, reject) => {
    const data = {roomId, withUser};
    Room.update(
        {userId},
        {$push: {listRoom: data}}
      )
      .then(room => {
        const data2 = {roomId, userId};
        Room.update({userId: withUser},
            {$push: {listRoom: data2}})
          .then(result => {
            resolve(result);
          })
          .catch(err => reject(err));
      })
      .catch(err => reject(err));
  });
}

export function requestChat(data) {
  const {roomId, userId, chatWithId, product} = data;
  return new Promise((resolve, reject) => {
    create(userId, chatWithId, roomId)
      .then(result => {
        const msg = 'Hỏi đáp về sản phẩm '+product.productName;
        sendMessage(roomId, userId, msg);
      });
  });
}
