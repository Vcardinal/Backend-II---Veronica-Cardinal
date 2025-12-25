const express = require('express');
const router = express.Router();

const Product = require('../models/product');
const { isAuth, authorizeRoles } = require('../middlewares/auth');

/* Helper */
const sanitize = (p) => ({
  id: p._id,
  title: p.title,
  description: p.description,
  price: p.price,
  stock: p.stock,
  code: p.code,
  category: p.category,
  status: p.status,
  thumbnails: p.thumbnails,
  createdAt: p.createdAt,
  updatedAt: p.updatedAt,
});


router.get('/', async (_req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({
      message: 'Listado de productos',
      products: products.map(sanitize),
    });
  } catch (err) {
    next(err);
  }
});


router.get('/:pid', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.pid);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json({
      message: 'Detalle de producto',
      product: sanitize(product),
    });
  } catch (err) {
    next(err);
  }
});


router.post('/', isAuth, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const { title, description, price, stock, code, category, status, thumbnails } = req.body;

    if (!title || price == null || !code) {
      return res.status(400).json({
        message: 'Faltan campos obligatorios: title, price, code',
      });
    }

    const created = await Product.create({
      title,
      description,
      price,
      stock,
      code,
      category,
      status,
      thumbnails,
    });

    res.status(201).json({
      message: 'Producto creado',
      product: sanitize(created),
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: 'El code ya existe (debe ser único)',
      });
    }
    next(err);
  }
});

router.put('/:pid', isAuth, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const { title, description, price, stock, code, category, status, thumbnails } = req.body;

    if (!title || price == null || !code) {
      return res.status(400).json({
        message: 'PUT requiere: title, price, code',
      });
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.pid,
      { title, description, price, stock, code, category, status, thumbnails },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json({
      message: 'Producto actualizado (PUT)',
      product: sanitize(updated),
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: 'El code ya existe (debe ser único)',
      });
    }
    next(err);
  }
});

router.patch('/:pid', isAuth, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.pid,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json({
      message: 'Producto actualizado (PATCH)',
      product: sanitize(updated),
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: 'El code ya existe (debe ser único)',
      });
    }
    next(err);
  }
});

router.delete('/:pid', isAuth, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.pid);

    if (!deleted) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json({
      message: 'Producto eliminado',
      product: sanitize(deleted),
    });
  } catch (err) {
    next(err);
  }
});


router.post('/seed', isAuth, authorizeRoles('admin'), async (_req, res, next) => {
  try {
    const created = await Product.insertMany([
      {
        title: 'Torta Chocolate',
        description: 'Chocolate intenso',
        price: 1200,
        stock: 1,
        code: 'CHOCO-001',
        category: 'tortas',
      },
      {
        title: 'Cheesecake',
        description: 'Clásico',
        price: 1500,
        stock: 8,
        code: 'CHEESE-001',
        category: 'tortas',
      },
      {
        title: 'Cupcakes x6',
        description: 'Vainilla',
        price: 900,
        stock: 15,
        code: 'CUP-006',
        category: 'cupcakes',
      },
    ]);

    res.status(201).json({
      message: 'Seed de productos creado',
      created: created.length,
      products: created.map(sanitize),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;


