import express from 'express';
import passport     from 'passport';

import * as TransactionServices from '../services/transaction-services';

require('../middlewares/passport')(passport);

const router = module.exports = express.Router({mergeParams: true});

router.route('/')
  .get(passport.authenticate('jwt', { session: false}),
    (req, res) => {
      TransactionServices.getAll()
        .then(result => {
          const data = {
            status: 200,
            data: result,
            message:'Thành Công!'
          };
          res.json(data);
        })
        .catch(error => res.json({status: 500, data:'', message:'error'}));
  })
  .post(passport.authenticate('jwt', { session: false}),
    (req, res) => {
      const {auctionItem, payBy, isAuction} = req.body;
      TransactionServices.findOne({productId: auctionItem._id})
        .then(transaction => {
          if(transaction) {
            if(isAuction) {
              TransactionServices.addAuction(transaction, payBy)
                .then(result => res.json(result))
                .catch(error => res.json(error));
            } else {
              TransactionServices.addExchange(transaction, payBy)
                .then(result => res.json(result))
                .catch(error => res.json(error));
            }
          } else {
            // console.log('Create');
            TransactionServices.create(auctionItem._id, payBy, isAuction)
              .then(newTransaction => res.json(newTransaction))
              .catch(error => res.json(error));
          }
        })
        .catch(error => res.json(error));
  });

router.route('/product/:productId')
  .get(passport.authenticate('jwt', { session: false}),
    (req, res) => {
      const productId = req.params.productId;
      TransactionServices.getTransactionProduct(productId)
        .then(result => res.json(result))
        .catch(error => res.json(error));
  });

router.route('/addprogress')
  .post(passport.authenticate('jwt', { session: false}),
    (req, res) => {
      const {idTransaction, payWith, isAuction} = req.body;
      TransactionServices.addprogress(idTransaction, payWith, isAuction)
        .then(result => res.json(result))
        .catch(error => res.json(error));
  });

router.route('/id/:idTransaction')
  .get(passport.authenticate('jwt', { session: false}),
    (req, res) => {
      const idTransaction = req.params.idTransaction;
      TransactionServices.getTransaction(idTransaction)
        .then(result => res.json(result))
        .catch(error => res.json(error));
  })
  .post(passport.authenticate('jwt', { session: false}),
    (req, res) => {
      const idTransaction = req.params.idTransaction;
      TransactionServices.update(idTransaction, req.body)
        .then(result => res.json(result))
        .catch(error => res.json(error));
  });

router.route('/id/updatestatus/:idTransaction')
  .post(passport.authenticate('jwt', { session: false}),
    (req, res) => {
      const {value, productStatus} = req.body;
      const idTransaction = req.params.idTransaction;
      TransactionServices.updateStatus(idTransaction, value, productStatus)
        .then(result => res.json(result))
        .catch(error => res.json(error));
  });

router.route('/user/:userId')
  .get(passport.authenticate('jwt', { session: false}),
    (req, res) => {
      const userId = req.params.userId;
      TransactionServices.getTransactionOfUser(userId)
        .then(result => res.json(result))
        .catch(error => res.json(error));
  });

router.route('/change/user/:userId')
  .get(passport.authenticate('jwt', { session: false}),
    (req, res) => {
      const userId = req.params.userId;
      TransactionServices.getChangeRequestByUser(userId)
        .then(result => res.json(result))
        .catch(error => res.json(error));
  });

router.route('/auction/user/:userId')
  .get(passport.authenticate('jwt', { session: false}),
    (req, res) => {
      const userId = req.params.userId;
      TransactionServices.getAuctionRequestByUser(userId)
        .then(result =>
          res.json({status:200, data: result, message: 'Thành công'})
        )
        .catch(error =>
          res.json({status:500, data: [], message: error})
        );
  });

router.route('/auction/remove/')
  .post(passport.authenticate('jwt', { session: false}),
    (req, res) => {
      const {_id, index, userId} = req.body;
      TransactionServices.removeAuction(_id, index, userId)
        .then(result =>
          res.json({status:200, data: result, message: 'Thành công'})
        )
        .catch(error =>
          res.json({status:500, data: [], message: error})
        );
  });


