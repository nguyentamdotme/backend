import express from 'express';
import jwt from 'jsonwebtoken';


const router = express.Router({mergeParams: true});
const version = 'v1';

router.use('/api/'+ version +'/user', require('./user-routes'));

router.use('/api/'+ version +'/category',
  require('./category-routes')
);

router.use('/api/'+ version +'/product',
  require('./product-routes')
);

router.use('/api/'+ version +'/upload',
  require('./upload-routes')
);

router.use('/api/'+ version +'/transaction',
  require('./transaction-routes')
);

module.exports = router;
