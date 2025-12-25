const express = require('express');
const router = express.Router();
const Product = require('../models/product');

router.get('/products', async (_req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).lean();

    res.render('products', {
      title: 'Productos',
      products,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
