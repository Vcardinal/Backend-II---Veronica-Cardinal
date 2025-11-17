const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

const User = require('../models/user');
const { isAuth, requiredRole } = require('../middlewares/auth');


const sanitizeUser = (user) => {
  if (!user) return null;
  return {
    id: user._id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    age: user.age,
    cart: user.cart,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};


router.post('/register', async (req, res, next) => {
  try {
    let { first_name, last_name, email, password, age } = req.body;

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    email = email.toLowerCase().trim();

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      age,
      role: 'user', 
    });

    res.status(201).json({
      message: 'Usuario registrado',
      user: sanitizeUser(newUser),
    });
  } catch (err) {
    next(err);
  }
});


router.get('/', isAuth, requiredRole('admin'), async (req, res, next) => {
  try {
    const users = await User.find().select('-password -__v');

    res.json({
      message: 'Listado de usuarios',
      users,
    });
  } catch (err) {
    next(err);
  }
});


router.get('/:id', isAuth, requiredRole('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password -__v');
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({
      message: 'Detalle de usuario',
      user,
    });
  } catch (err) {
    next(err);
  }
});


router.post('/', isAuth, requiredRole('admin'), async (req, res, next) => {
  try {
    let { first_name, last_name, email, password, age, role, cart } = req.body;

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    email = email.toLowerCase().trim();

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      age,
      cart: cart || null,
      role: role || 'user',
    });

    res.status(201).json({
      message: 'Usuario creado (admin)',
      user: sanitizeUser(newUser),
    });
  } catch (err) {
    next(err);
  }
});


router.put('/:id', isAuth, requiredRole('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    let { first_name, last_name, email, password, age, role, cart } = req.body;

    if (!first_name || !last_name || !email || !password || !role) {
      return res.status(400).json({
        message:
          'PUT requiere first_name, last_name, email, password y role',
      });
    }

    email = email.toLowerCase().trim();
    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        first_name,
        last_name,
        email,
        password: hashedPassword,
        age,
        cart: cart || null,
        role,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({
      message: 'Usuario reemplazado (PUT)',
      user: sanitizeUser(updatedUser),
    });
  } catch (err) {
    next(err);
  }
});


router.patch('/:id', isAuth, requiredRole('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.email) {
      updates.email = updates.email.toLowerCase().trim();
    }

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({
      message: 'Usuario actualizado (PATCH)',
      user: sanitizeUser(updatedUser),
    });
  } catch (err) {
    next(err);
  }
});


router.delete('/:id', isAuth, requiredRole('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await User.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({
      message: 'Usuario eliminado',
      user: sanitizeUser(deleted),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;



