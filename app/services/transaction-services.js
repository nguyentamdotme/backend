import Product from '../models/product-model';
import Transaction from '../models/transaction-model';

export function create(itemId, payBy, isAuction) {
  return new Promise((resolve, reject) => {
    const transactionData = {
      productId: itemId
    }
    const d    = new Date();
    const date = d.toISOString();
    if(isAuction) {
      payBy.date = date;
      transactionData.listAuction = [payBy];
      transactionData.listChange = [];
    } else {
      const newData = {
        productId: payBy.productId,
        payMore: parseFloat(payBy.payMore),
        date: date
      }
      transactionData.listAuction = [],
      transactionData.listChange = [newData];
    }
    // console.log(transactionData);
    const newTransaction = new Transaction(transactionData);
    newTransaction.save()
      .then(transaction => {
        resolve({status: 200, data: transaction, message: 'Thành công!'})
      })
      .catch(err => reject({status: 403, data: null, message: err}));
  });
}

export function addExchange(transaction, payBy) {
  const d    = new Date();
  const date = d.toISOString();
  return new Promise((resolve, reject) => {
    Transaction.findOne(
      {_id:transaction._id},
      {listChange: {$elemMatch: {productId: payBy.productId}}}
    )
      .then(findOut => {
        if(findOut.listChange.length != 0) {
          reject({status: 403, data: '', message: 'Yêu cầu của bạn đã tồn tại'});
        } else {
          const newData = {
            listChange: {
              productId: payBy.productId,
              product: payBy.product,
              payMore: payBy.payMore,
              date
            }
          }
        // console.log('Hello gooo');
          Transaction.findOneAndUpdate({_id: transaction._id, status:0}, { $push: newData})
          .then(updated => resolve({status: 200, data: updated, message: 'Thành công!'}))
          .catch(err => reject({status: 403, data: null, message: err}));
        }
      })
      .catch(error => reject({status: 403, data: null, message: error}));
  });
}

export function addAuction(transaction, payBy) {
  return new Promise((resolve, reject) => {
    Transaction.findOne({
      listAuction: {$elemMatch: {owner: payBy.owner}}
    })
      .then(findOut => {
        if(findOut) {
          Transaction.findOneAndUpdate(
            {_id: transaction._id, listAuction: {$elemMatch: {owner: payBy.owner}}},
            { $set: { "listAuction.$.price" : payBy.price } }
          )
          .then(updated => {
            // console.log(updated);
            resolve({status: 200, data: updated})
          })
          .catch(err => reject({status: 403, data: err}));
        } else {
          Transaction.findOneAndUpdate({_id: transaction._id}, { $push: { listAuction: payBy} })
          .then(updated => resolve({status: 200, data: updated}))
          .catch(err => reject({status: 403, data: err}));
        }
      })
      .catch(error => reject(error));
  });
}

export function find(opt) {
  return Transaction.find(opt || {}).sort({'updatedAt': -1});
}

export function findOne(opt) {
  return Transaction.findOne(opt || {});
}

export function getAll(opt) {
  return new Promise((resolve, reject) => {
    Transaction.find().populate([
      {path: 'productId'},
      {path: 'productId.owner'},
      {path: 'listChange.productId'},
    ]).sort({'updatedAt': -1})
      .then(findOut => {
        if(findOut) {
          resolve(findOut);
        } else {
          reject(findOut);
        }
      })
      .catch(error => reject(error));
  });
  return
}

export function getTransactionProduct(productId) {
  return new Promise((resolve, reject) => {
    Transaction.findOne({productId})
      .populate([
        {path:'productId'},
        {path:'listChange.productId'},
        {path:'listAuction.owner'}
      ])
      .then(findOut => {
        if(findOut) {
          resolve(findOut);
        } else {
          reject(findOut);
        }
      })
      .catch(error => reject(error));
  });
}

export function addprogress(idTransaction, payWith, isAuction) {
  return new Promise((resolve, reject) => {
    const data = {
      payWith,
      isAuction,
      status: 0
    }
    Transaction.findOneAndUpdate({_id:idTransaction}, {success: data})
      .then(updated => {
        Transaction.findOne({_id:idTransaction})
          .populate([
            {path:'productId'},
            {path:'listChange.productId'},
            {path:'listAuction.owner'}
          ])
          .then(data => {
            if(data) {
              resolve(data);
            } else {
              reject(data);
            }
          })
          .catch(error => reject(error));
      })
      .catch(error => reject(error));
  });
}

export function getTransaction(idTransaction) {
  return new Promise((resolve, reject) => {
    Transaction.findOne({_id:idTransaction})
      .populate([
        {path:'productId'},
        {path:'listChange.productId'},
        {path:'listAuction.owner'}])
      .then(findOut => {
        // console.log(findOut);
        if(findOut) {
          resolve(findOut);
        } else {
          reject(findOut);
        }
      })
      .catch(error => reject(error));
  });
}

export function getTransactionOfUser(userId) {
  return new Promise((resolve, reject) => {
    Product.find({owner:userId})
    .populate('productId')
    .then(listProduct => {
      asyncMap(listProduct, v => {
        return new Promise(_resolve => {
          Transaction.findOne({productId:v._id})
            .populate([
              {path:'productId'},
              {path:'listChange.productId'},
              {path:'listAuction.owner'}
            ])
            .then(e => {
                _resolve(e);
            });
        });
      }).then(result => {
        if(result.length == 0) {
          reject({status:401, data:"", message:'Không tìm thấy.'});
        } else {
          resolve({status:200, data:result, message:"Thành công!"});
        }
      });
    })
    .catch(err => reject({status:401, data:"", message:err}));
  });
}

function asyncMap(arr, mapper) {
  var q = Promise.resolve();
  return Promise.all(arr.map(v => q = q.then(() => mapper(v))));
}

export function updateStatus(_id, value, productStatus) {
  return new Promise((resolve, reject) => {
    Transaction.findOneAndUpdate({_id},{
      "success.status": value
    }).then(findOut => {
        if(findOut) {
          Product.findOneAndUpdate({_id: findOut.productId},{"status": productStatus})
            .then(result => {
              if(result){
                if(!findOut.success.isAuction) {
                  Product.findOneAndUpdate({_id: findOut.success.payWith.productId},{status: productStatus})
                    .then(res => {
                      resolve({status: 200, data: '', message: 'Thành Công'});
                    })
                    .catch(err => {
                      reject({status: 403, data: '', message: 'Không thể cập nhật trang thái sản phẩm trao đổi'});
                    });
                } else {
                  resolve({status: 200, data: '', message: 'Thành Công'});
                }
              }else { // end if result
                reject({status: 403, data: '', message: 'Không thể cập nhật trang thái sản phẩm'});
              }
            })
            .catch(error => {
              reject({status: 403, data: '', message: 'Không thể cập nhật trang thái sản phẩm'});
            });
        } else {
          reject({status: 403, data: '', message: 'Không tìm thấy'});
        }
      })
      .catch(error => reject(error));
  });
}

export function update(_id, value) {
  return new Promise((resolve, reject) => {
    Transaction.update({_id},value)
    .then(findOut => {
        if(findOut) {
          resolve({status: 200, data: '', message: 'Thành Công'});
        } else {
          reject({status: 403, data: '', message: 'Không tìm thấy'});
        }
      })
      .catch(error => reject(error));
  });
}
