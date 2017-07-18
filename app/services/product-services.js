import Product from '../models/product-model';

export function create(_newProduct) {
  // console.log('create Product');
  // console.log(_newProduct);
  return new Promise((resolve, reject) => {
    const newProduct = new Product(_newProduct);
    Product
      .findOne({productName: _newProduct.productName}, (err, product) => {
        if(!product) {
          newProduct.save()
            .then((newProduct) => {
              // console.log(newProduct);
              resolve(newProduct.toJSON());
            })
            .catch(err => reject(err));
        } else {
          reject('Product already exists!');
        }
      });
  });
}

export function find(opt) {
  return Product.find(opt || {})
          .populate([{path:'owner'},{path:'category'}])
          .sort({createdAt: -1});
}

export function findOneProduct(opt) {
  return Product.findOne(opt).populate('owner', '-password');
}

export function update(_id, data) {
  return new Promise((resolve, reject) => {
    Product.findOne({productName: data.productName})
    .then(product => {
      if(!product) {
        Product.findOneAndUpdate({_id}, data)
          .then(updated => resolve(updated))
          .catch(err => reject(err));
      } else {
        reject("Product Name already exists!");
      }
    })
    .catch(err => err);
  });
}

export function del(_id) {
  return new Promise((resolve, reject) => {
    Product.findOne({_id})
      .then(product => {
        if(product === 'undefined') {
          reject("Can't find this product.");
        } else {
          Product.deleteOne({_id})
            .then(data => {
              resolve(product);
            })
            .catch(err => reject(err));
        }
      })
      .catch(err => {
        reject(err);
      });
  });
}

export function getProductOfUser(_id) {
  return new Promise((resolve, reject) => {
    Product.find({owner: _id}).sort({updateAt: 1})
      .then(ownerProduct => {
        resolve(ownerProduct);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function findProductOfCategory(category) {
  return new Promise((resolve, reject) => {
    Product.find({category}).sort({updateAt: 1}).populate('category')
      .then(products => {
        resolve(products)
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function searchProduct(value) {
  return new Promise((resolve, reject) => {
    Product
      .find({productNameUnicode: {$regex: '^.*'+value+'.*$'}})
      .sort({updateAt: 1})
      .then(products => {
        resolve(products)
      })
      .catch(error => {
        reject(error);
      });
  });
}
