import express from 'express';
import passport     from 'passport';
require('../middlewares/passport')(passport);

import upload from '../middlewares/upload';

const router = module.exports = express.Router({mergeParams: true});

router.route('/')
  .post(upload,(req, res) => {
    const image = req.files;
    if(image[0] != undefined) {
      res.json(image[0]);
    } else {
      res.json({filename: 'avatarNone.jpg'});
    }
  });

router.route('/multiple')
  .post(
    passport.authenticate('jwt', { session: false}),
    upload,(req, res) => {
    const image = req.files;
    res.json(image);
  });
