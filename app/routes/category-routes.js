import express from 'express';
import passport     from 'passport';

import * as CategoryServices from '../services/category-services';

require('../middlewares/passport')(passport);

const router = module.exports = express.Router({mergeParams: true});

router.route('/')
  .get((req, res) => {
    CategoryServices.find()
      .then( categoryList => {
        res.json(categoryList);
      })
      .catch(err => res.json(err));
  })
  .post(passport.authenticate('jwt', { session: false}),
    (req, res) => {
    const {categoryName, categoryImage } = req.body;
    const categoryData = { categoryName, categoryImage };

    CategoryServices.create(categoryData)
      .then( newCategory => res.json(newCategory))
      .catch( err => res.json(err));
  });

router.route('/:categoryId')
  .get((req, res) => {
    const { categoryId } = req.params;
    CategoryServices.find({_id: categoryId})
      .then( category => res.json(category))
      .catch( err => res.json(err));
  })
  .put(passport.authenticate('jwt', { session: false}),
    (req, res) => {
    const { categoryId } = req.params;
    const { newCategoryData } = req.body;
    CategoryServices.update(categoryId, newCategoryData)
      .then(updated => res.json(updated))
      .catch(err => res.json(err));
  })
  .delete(passport.authenticate('jwt', { session: false}),
    (req, res) => {
    const { categoryId } = req.params;
    CategoryServices.del(categoryId)
      .then(deleted => res.json(deleted))
      .catch(err => res.json(err));
  });
