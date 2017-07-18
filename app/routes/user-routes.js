import express from 'express';
import passport     from 'passport';

import jwt from 'jsonwebtoken';
require('../middlewares/passport')(passport);

import * as UserServices from '../services/user-services';
import * as ProductServices from '../services/product-services';

const router = module.exports = express.Router({mergeParams: true});

router.route('/')
  .get(passport.authenticate('jwt', { session: false}), (req, res) => {
      UserServices.find()
        .then(userList => {
          res.json({status: 200, data: userList});
        })
        .catch(err => res.json({status: 200, message: err}));
  });

router.route('/:userId')
  .get(passport.authenticate('jwt', { session: false}), (req, res) => {
    const _id = req.params.userId;
      UserServices.find({_id})
        .then(userList => {
          res.json(userList);
        })
        .catch(err => res.json(err));
  })
  .put(passport.authenticate('jwt', { session: false}), (req, res) => {
    const _id = req.params.userId;
    const newData = req.body;

    UserServices.update(_id, newData)
      .then(updated => res.json(updated))
      .catch(err => res.json(err));
  })
  .delete(passport.authenticate('jwt', { session: false}), (req, res) =>{
    const _id = req.params.userId;
    UserServices.del(_id)
      .then(deleted => res.json(deleted))
      .catch(err => res.json(err));

  });

router.route('/:userId/product')
  .get(
    passport.authenticate('jwt', { session: false}),
    (req, res) => {
      const userId = req.params.userId;
      ProductServices.getProductOfUser(userId)
        .then(ownerProduct => {
          // console.log(ownerProduct);
          res.json(ownerProduct)
        })
        .catch(error => res.json(error));
    }
  );

router.route('/signup')
  .post((req, res) => {
    const { username, password, name, gender, email, phone, address, avatar } = req.body;
    const newUser = {
      username,
      password,
      name,
      gender,
      email,
      phone,
      address,
      avatar
    }
    UserServices.create(newUser)
      .then(user => {
        const token = jwt.sign(user, global.secret);
        res.json({status: 200, success: true, accessToken:'JWT ' + token, user});
      })
      .catch(error => {
        res.json({status: 401, data: "Username already exists."});
      });
  });

router.route('/signin')
  .post((req, res) => {
    const {username, password} = req.body;
    UserServices.checkLogin(username, password)
      .then(user => {
        // console.log(user);
        const token = jwt.sign(user, global.secret);
        res.json({status: 200, success: true, accessToken:'JWT ' + token, user});
      })
      .catch(err => {
        res.json({status: 401, data: "Username or Password wrong!"});
      });
  });

router.route('/:userId/password')
  .post(
    passport.authenticate('jwt', { session: false}),
    (req, res) => {
      const userId = req.params.userId;
      const {password, newpassword} = req.body;
      UserServices.updatePassword(userId, password, newpassword)
        .then(data => {
          // console.log(data);
          res.json(data)
        })
        .catch(error => res.json(error));
    }
  );

router.route('/verify/accesstoken')
  .get(
    passport.authenticate('jwt', { session: false}),
    (req, res) => {
      if(req.user != undefined) {
        res.json({status: 200, data: req.user});
      } else {
        res.json({status: 401, data: 'AccessToken không hợp lệ'});
      }
    }
  );

// router.route('/all')
//   .get(
//     passport.authenticate('jwt', { session: false}),
//     (req, res) => {
//       UserServices.find()
//         .then(data => res.json(data))
//         .catch(err => res.json(err));
//     }
//   );
