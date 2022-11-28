const { check } = require('express-validator')
const models = require('../../models')
const FileValidationHelper = require('./FileValidationHelper')

const Product = models.Product
const Restaurant= models.Restaurant

const maxFileSize = 10000000 // around 10Mb


const checkSum = (fats,carbo,proteins)=>{
  fats = parseFloat(fats)
  proteins = parseFloat(proteins)
  carbo = parseFloat(carbo)
  if ((fats<0||carbo<0||proteins<0)||(fats+carbo+proteins)!==100){
    return false
  }else{
    return true
  }
}

const checkCalories=(fats,carbo,proteins)=>{
  fats = parseFloat(fats)
  proteins = parseFloat(proteins)
  carbo = parseFloat(carbo)
  if(fats*9+carbo*4+proteins*4<=1000){
    return true
  }else{
    return false
  }
}

module.exports = {
  create: () => {
    return [
      check('image')
        .custom((value, { req }) => {
          return FileValidationHelper.checkFileIsImage(req.file)
        })
        .withMessage('Please only submit image files (jpeg, png).'),
      check('image')
        .custom((value, { req }) => {
          return FileValidationHelper.checkFileMaxSize(req.file, maxFileSize)
        })
        .withMessage('Maximum file size of ' + maxFileSize / 1000000 + 'MB'),
        check('fats').custom((values,{req})=>{
          const {fats, proteins, carbo}=req.body
          return checkSum(fats, proteins, carbo)
        }).withMessage('The amount of carbo, proteins or fats are wrong'),
        check('calories').custom((values,{req})=>{
          const {fats,proteins,carbo}=req.body
          return checkCalories(fats, proteins, carbo)
        }).withMessage('Too much calories'),
        check('promoted').custom(async(value,{req})=>{
          if (value==true || value=='true'){
            const listaDePromocionados= await Product.count({
              where:{
                restaurantId: req.body.restaurantId,
                promoted: true
              }
            })
            if(listaDePromocionados!==0){
              return Promise.reject(new Error('Ya hay un producto promocionado'))
            }
          }
          return Promise.resolve('ok')
        }).withMessage('Ya hay un producto promocionado')
    ]
  },

  update: () => {
    return [
      check('image')
        .custom((value, { req }) => {
          return FileValidationHelper.checkFileIsImage(req.file)
        })
        .withMessage('Please only submit image files (jpeg, png).'),
      check('image')
        .custom((value, { req }) => {
          return FileValidationHelper.checkFileMaxSize(req.file, maxFileSize)
        })
        .withMessage('Maximum file size of ' + maxFileSize / 1000000 + 'MB'),
      check('restaurantId')
        .custom(async (value, { req }) => {
          try {
            const product = await Product.findByPk(req.params.productId,
              {
                attributes: ['restaurantId']
              })
            // eslint-disable-next-line eqeqeq
            if (product.restaurantId != value) {
              return Promise.reject(new Error('The restaurantId cannot be modified'))
            } else { return Promise.resolve() }
          } catch (err) {
            return Promise.reject(new Error(err))
          }
        }),
        check('fats').custom((values,{req})=>{
          const {fats, proteins, carbo}=req.body
          return checkSum(fats, proteins, carbo)
        }).withMessage('The amount of carbo, proteins or fats are wrong'),
        check('calories').custom((values,{req})=>{
          const {fats,proteins,carbo}=req.body
          return checkCalories(fats, proteins, carbo)
        }).withMessage('Too much calories'),
        check('promoted').custom(async(value,{req})=>{
          if (value==true || value=='true'){
            const listaDePromocionados= await Product.count({
              where:{
                restaurantId: req.body.restaurantId,
                promoted: true
              }
            })
            if(listaDePromocionados!==0){
              return Promise.reject(new Error('Ya hay un producto promocionado'))
            }
          }
          return Promise.resolve('ok')
        }).withMessage('Ya hay un producto promocionado')
    ]
  }
}
