import Category from '../models/category-model';

export function create(_category) {
  return new Promise((resolve, reject) => {
    const createCategory = new Category(_category);
    Category
      .findOne({categoryName: _category.categoryName}, (err, cat) => {
        if(!cat) {
          createCategory.save()
            .then((newCategory) => {
              resolve(newCategory.toJSON());
            })
            .catch(err => reject(err));
        } else {
          reject('Category already exists!');
        }
      });
  });
}

export function find(opt) {
  return Category.find(opt || {});
}

export function update(_categoryId, data) {
  return new Promise((resolve, reject) => {
    Category.findOneAndUpdate({_id: _categoryId}, data)
      .then(updated => resolve(updated))
      .catch(err => reject(err));
  });
}

export function del(_id) {
  return new Promise((resolve, reject) => {
    Category.findOne({_id})
      .then(category => {
        if(category === 'undefined') {
          reject("Can't find this Category.");
        } else {
          Category.deleteOne({_id})
            .then(data => {
              resolve(category);
            })
            .catch(err => reject(err));
        }
      })
      .catch(err => {
        reject(err);
      });
  });
}
