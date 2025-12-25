const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const Ticket = require('../models/ticket');
const { isAuth, authorizeRoles } = require('../middlewares/auth');
const TicketDTO = require('../dto/ticket.dto');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ADMIN: listar todos
router.get('/', isAuth, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const tickets = await Ticket.find()
      .sort({ createdAt: -1 })
      .populate('products.product');

    res.json({
      message: 'Listado de tickets',
      tickets: tickets.map((t) => new TicketDTO(t)),
    });
  } catch (err) {
    next(err);
  }
});

// USER: mis tickets
router.get('/mine', isAuth, authorizeRoles('user'), async (req, res, next) => {
  try {
    const email = req.user?.email || req.session?.user?.email;
    if (!email) return res.status(401).json({ message: 'No autorizado' });

    const tickets = await Ticket.find({ purchaser: email })
      .sort({ createdAt: -1 })
      .populate('products.product');

    res.json({
      message: 'Mis tickets',
      tickets: tickets.map((t) => new TicketDTO(t)),
    });
  } catch (err) {
    next(err);
  }
});

// Detalle (admin)
router.get('/:tid', isAuth, async (req, res, next) => {
  try {
    const tid = (req.params.tid || '').trim();
    if (!isValidObjectId(tid)) {
      return res.status(400).json({ message: 'Ticket ID inválido' });
    }

    const ticket = await Ticket.findById(tid).populate('products.product');
    if (!ticket) return res.status(404).json({ message: 'Ticket no encontrado' });

    const role = req.user?.role || req.session?.user?.role;
    const email = req.user?.email || req.session?.user?.email;

    if (role !== 'admin' && ticket.purchaser !== email) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    res.json({
      message: 'Detalle de ticket',
      ticket: new TicketDTO(ticket),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

