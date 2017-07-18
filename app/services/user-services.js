import md5  from 'md5';
import User from '../models/user-model';

export function create(_user) {
  return new Promise((resolve, reject) => {
    const data = {
      ..._user,
      password: md5(_user.password)
    }
    const createUser = new User(data);
    User.findOne({username: _user.username})
      .then((findOut) => {
        if(!findOut) {
          createUser.save()
            .then((newUser) => {
              resolve(newUser.toJSON());
            })
            .catch(err => reject(err));
        } else {
          reject('Username already exists!');
        }
      })
      .catch(err => reject(err));
  });
}

export function find(opt) {
  return User.find(opt || {}).select('-password');
}

export function update(_id, newData) {
  return new Promise((resolve, reject) => {
    User.findOneAndUpdate({_id}, {$set: newData})
      .then(user => {
        if(!user) {
          reject({status: 401, message:"Người dùng không tồn tại"});
        }else {
          User.find({_id: user._id})
            .then(_user => {
              resolve({status: 200, message: "Thành công!", user});
            })
            .catch(err => {
              reject({status: 401, message: err})
            });
        }
      })
      .catch(err => reject(err));
  });
}

export function del(_id) {
  return new Promise((resolve, reject) => {
    User.findOne({_id})
      .then(user => {
        if(user === 'undefined') {
          reject("Can't find this User.");
        } else {
          User.deleteOne({_id})
            .then(data => {
              resolve(user);
            })
            .catch(err => reject(err));
        }
      })
      .catch(err => {
        reject(err);
      });
  });
}

export function checkLogin(username, password) {
  password = md5(password);
  return new Promise((resolve, reject) => {
    User.findOne({username, password}).select('-password')
      .then(user => resolve(user))
      .catch(err => reject(err));
  });
}

export function updatePassword(_id, password, newpassword) {
  return new Promise((resolve, reject) => {
    const newData = {password: md5(newpassword)}
    User.findOneAndUpdate({_id, password: md5(password)}, {$set: newData})
      .then(user => {
        if(!user) {
          reject({status: 401, message:"Mật khẩu hiện tại không đúng"})
        }else {
          resolve({status: 200, message: "Thành công!", user});
        }
      })
      .catch(err => reject(err));
  });
}
