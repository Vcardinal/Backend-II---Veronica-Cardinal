// src/routes/carts.routes.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const Cart = require('../models/cart');
const Product = require('../models/product');
const Ticket = require('../models/ticket');

const { isAuth, authorizeRoles } = require('../middlewares/auth');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const genTicketCode = () =>
  `TCK-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase()}`;

// Crear carrito (solo user)
router.post('/', isAuth, authorizeRoles('user'), async (req, res, next) => {
  try {
    const userId = req.user?._id || req.session?.user?.id || null;

    const cart = await Cart.create({
      user: userId,
      products: [],
    });

    res.status(201).json({
      message: 'Carrito creado',
      cart: { id: cart._id, user: cart.user, products: cart.products },
    });
  } catch (err) {
    next(err);
  }
});

// Ver carrito (solo user)
router.get('/:cid', isAuth, authorizeRoles('user'), async (req, res, next) => {
  try {
    const cid = (req.params.cid || '').trim();

    if (!isValidObjectId(cid)) {
      return res.status(400).json({ message: 'Cart ID inválido' });
    }

    const cart = await Cart.findById(cid).populate('products.product');
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });

    res.json({ message: 'Carrito', cart });
  } catch (err) {
    next(err);
  }
});

// Agregar producto al carrito (solo user)
router.post('/:cid/product/:pid', isAuth, authorizeRoles('user'), async (req, res, next) => {
  try {
    const cid = (req.params.cid || '').trim();
    const pid = (req.params.pid || '').trim();

    if (!isValidObjectId(cid)) {
      return res.status(400).json({ message: 'Cart ID inválido' });
    }
    if (!isValidObjectId(pid)) {
      return res.status(400).json({ message: 'Product ID inválido' });
    }

    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });

    const productExists = await Product.exists({ _id: pid });
    if (!productExists) return res.status(404).json({ message: 'Producto no encontrado' });

    const item = cart.products.find((p) => p.product.toString() === pid);
    if (item) item.quantity += 1;
    else cart.products.push({ product: pid, quantity: 1 });

    await cart.save();

    res.json({
      message: 'Producto agregado al carrito',
      cart: { id: cart._id, products: cart.products },
    });
  } catch (err) {
    next(err);
  }
});

// Purchase (solo user)
router.post('/:cid/purchase', isAuth, authorizeRoles('user'), async (req, res, next) => {
  try {
    const cid = (req.params.cid || '').trim();

    if (!isValidObjectId(cid)) {
      return res.status(400).json({ message: 'Cart ID inválido' });
    }

    const cart = await Cart.findById(cid).populate('products.product');
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });

    if (!cart.products.length) {
      return res.status(400).json({ message: 'El carrito está vacío' });
    }

    const purchaser =
      req.user?.email ||
      req.session?.user?.email ||
      'unknown';

    const purchasable = [];
    const notProcessed = [];

    for (const item of cart.products) {
      const prod = item.product;

      if (!prod || !prod._id) {
        notProcessed.push({
          product: item.product,
          quantity: item.quantity,
          reason: 'Producto inexistente',
        });
        continue;
      }

      if (prod.stock >= item.quantity) {
        purchasable.push({ prod, quantity: item.quantity });
      } else {
        notProcessed.push({
          product: prod._id,
          title: prod.title,
          requested: item.quantity,
          available: prod.stock,
          reason: 'Sin stock suficiente',
        });
      }
    }

    if (!purchasable.length) {
      return res.status(409).json({
        message: 'No se pudo procesar la compra (sin stock)',
        notProcessed,
      });
    }

    // descontar stock
    for (const p of purchasable) {
      p.prod.stock -= p.quantity;
      await p.prod.save();
    }

    const productsForTicket = purchasable.map((p) => ({
      product: p.prod._id,
      quantity: p.quantity,
      price: p.prod.price,
    }));

    const amount = productsForTicket.reduce((acc, it) => acc + it.price * it.quantity, 0);

    const ticket = await Ticket.create({
      code: genTicketCode(),
      amount,
      purchaser,
      products: productsForTicket,
    });

    // dejar en el carrito SOLO los no comprados (consigna)
    const notProcessedIds = new Set(
      notProcessed
        .map((x) => x.product?.toString?.())
        .filter(Boolean)
    );

    cart.products = cart.products.filter((item) => {
      const prodId = item.product?._id?.toString?.() || item.product?.toString?.();
      return prodId && notProcessedIds.has(prodId);
    });

    await cart.save();

    return res.json({
      message: notProcessed.length
        ? 'Compra realizada parcialmente (algunos productos sin stock)'
        : 'Compra realizada',
      ticket,
      notProcessed,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;


