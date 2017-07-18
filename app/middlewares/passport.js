import { Strategy } from 'passport-jwt';
import { ExtractJwt } from'passport-jwt';

import config from '../../config/config';

import User from '../models/user-model';

module.exports = function(passport) {
  const opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
  opts.secretOrKey = config.secret;
  passport.use(new Strategy(opts, function(jwt_payload, done) {
    User.findOne({username: jwt_payload._doc.username})
      .then(user => {
      if (user) {
          done(null, user);
      } else {
          done(null, false);
      }
    })
    .catch(err => {
      done(err, false);
    });
  }));
};
