class TicketDTO {
  constructor(ticket) {
    this.id = ticket._id;
    this.code = ticket.code;
    this.amount = ticket.amount;
    this.purchaser = ticket.purchaser;
    this.purchase_datetime = ticket.purchase_datetime;

    this.products = (ticket.products || []).map((it) => {
      const p = it.product || {};
      return {
        product: {
          id: p._id || it.product,
          title: p.title,
          price: p.price,
          code: p.code,
          category: p.category,
        },
        quantity: it.quantity,
        price: it.price,
      };
    });
  }
}

module.exports = TicketDTO;
