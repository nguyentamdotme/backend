import express  from 'express';
import passport from 'passport';
import mongoose from'mongoose';

import convertVietnamese from '../middlewares/convertVietnamese';

import upload from '../middlewares/upload';
import * as ProductServices from '../services/product-services';

require('../middlewares/passport')(passport);

const router = module.exports = express.Router({mergeParams: true});

router.route('/')
  .get((req, res) => {
    ProductServices.find()
      .then(listProduct => res.json(listProduct))
      .catch(err => res.json(err));
  })
  .post(passport.authenticate('jwt', { session: false}),
    upload,(req, res) => {
    // console.log(req.files);
    const {productName, category, description, priceIn, priceOut, owner, image} = req.body;
    const newProduct = {
      productName, productNameUnicode: convertVietnamese(productName),
      category, description, priceIn, priceOut, owner, image
    }

    ProductServices.create(newProduct)
      .then(newProduct => res.json(newProduct))
      .catch(err => res.json(err));
  });

router.route('/suggest')
  .post((req,res) => {
    const {arrCategory} = req.body;
    if(arrCategory.length != 0) {
      const key = Math.floor(Math.random() * arrCategory.length);
      ProductServices.findProductOfCategory({_id: arrCategory[key]})
        .then(listProduct => {
          // console.log(listProduct);
          if(listProduct.length == 0) {
            ProductServices.find()
              .then(listProduct => {
                res.json(listProduct);
              })
              .catch(err => res.json(err));
          } else {
            res.json(listProduct);
          }
        })
        .catch(err => res.json(err));
    } else {
      ProductServices.find()
        .then(listProduct => {
          res.json(listProduct);
        })
        .catch(err => res.json(err));
    }
  });

router.route('/:productId')
  .get((req,res) => {
    const _id = req.params.productId;
    if(_id.match(/^[0-9a-fA-F]{24}$/)) {
      ProductServices.findOneProduct({_id})
        .then(listProduct => res.json(listProduct))
        .catch(err => res.json(err));
    } else {
      res.json({"error":"404 Not found!"});
    }
  })
  .put(passport.authenticate('jwt', { session: false}),
    upload, (req, res) => {
    const { productId } = req.params;
    const {productName, category, description, price, owner, image} = req.body;
    const newProductData = {
      productName, category, description, price, owner, image
    }
    ProductServices.update(productId, newProductData)
      .then(updated => res.json(updated))
      .catch(err => res.json(err));
  })
  .delete(passport.authenticate('jwt', { session: false}),
    (req, res) => {
    const { productId } = req.params;
    ProductServices.del(productId)
      .then(deleted =>
        res.json(deleted)
      )
      .catch(err => res.json(err));
  });

router.route('/cat/:categoryId')
  .get((req,res) => {
    const _id = req.params.categoryId;
    ProductServices.findProductOfCategory({_id})
      .then(listProduct => res.json(listProduct))
      .catch(err => res.json(err));
  });

router.route('/find')
  .post((req,res) => {
    const {value} = req.body;
    ProductServices.searchProduct(value)
      .then(listProduct => res.json(listProduct))
      .catch(err => res.json(err));
  });


