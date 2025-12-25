console.log('public/app.js cargado ✅');

const out = document.getElementById('out');

const adminCard = document.getElementById('adminCard');
const userCard = document.getElementById('userCard');
const statusPill = document.getElementById('statusPill');

const email = document.getElementById('email');
const password = document.getElementById('password');
const jwtToken = document.getElementById('jwtToken');

const productsList = document.getElementById('productsList');
const cartIdInput = document.getElementById('cartId');

function show(res, data) {
  // ✅ Evita el error "Cannot set properties of null"
  if (!out) return;
  out.textContent = `Status: ${res?.status ?? '-'}\n` + JSON.stringify(data ?? {}, null, 2);
}

function setRoleUI(role) {
  if (adminCard) adminCard.classList.toggle('hidden', role !== 'admin');
  if (userCard) userCard.classList.toggle('hidden', role !== 'user');
}

function isValidObjectId(id) {
  return /^[a-f\d]{24}$/i.test((id || '').trim());
}

function getCartId() {
  const fromInput = (cartIdInput?.value || '').trim();
  const fromLS = (localStorage.getItem('cartId') || '').trim();
  return fromInput || fromLS || '';
}

function setCartId(id) {
  if (cartIdInput) cartIdInput.value = id;
  if (id) localStorage.setItem('cartId', id);
}

async function api(url, options = {}) {
  const res = await fetch(url, {
    credentials: 'include',
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

async function refreshCurrent() {
  const { res, data } = await api('/api/session/current', { method: 'GET' });
  show(res, data);

  const user = data?.user;

  if (res.ok && user?.role) {
    if (statusPill) {
      statusPill.textContent = `Estado: logueada (${user.email}) [${user.role}]`;
      statusPill.className = 'pill ok';
    }
    setRoleUI(user.role);
  } else {
    if (statusPill) {
      statusPill.textContent = 'Estado: no logueada';
      statusPill.className = 'pill bad';
    }
    setRoleUI(null);
  }
}

async function login() {
  const body = {
    email: (email?.value || '').trim(),
    password: password?.value || '',
  };

  if (!body.email || !body.password) {
    show({ status: 400 }, { message: 'Faltan credenciales (email/password).' });
    return;
  }

  const { res, data } = await api('/api/session/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  show(res, data);

  if (res.ok && data?.token && jwtToken) {
    jwtToken.value = data.token;
  }

  await refreshCurrent();
}

async function logout() {
  const { res, data } = await api('/api/session/logout', { method: 'POST' });
  show(res, data);

  if (jwtToken) jwtToken.value = '';
  // opcional: mantener el carrito o limpiarlo
  // localStorage.removeItem('cartId'); setCartId('');

  await refreshCurrent();
}

async function jwtPing() {
  const token = (jwtToken?.value || '').trim();

  const res = await fetch('/api/private/jwt-ping', {
    method: 'GET',
    headers: token ? { Authorization: 'Bearer ' + token } : {},
  });

  const data = await res.json().catch(() => ({}));
  show(res, data);
}

async function loadProducts() {
  const { res, data } = await api('/api/products', { method: 'GET' });
  show(res, data);

  const products = data?.products || [];
  if (productsList) productsList.innerHTML = '';

  if (!products.length) {
    if (productsList) productsList.innerHTML = '<p class="small">No hay productos.</p>';
    return;
  }

  const ul = document.createElement('ul');

  products.forEach((p) => {
    const id = p.id || p._id;

    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${p.title}</strong> — $${p.price} — stock ${p.stock ?? 0}<br/>
      <span class="small">code: ${p.code ?? '-'} | id: ${id}</span>
      <div class="row" style="margin-top:8px;">
        <button data-del="${id}" class="btnDel">🗑 Eliminar (admin)</button>
        <button data-add="${id}" class="btnAdd">+ Agregar al carrito (user)</button>
      </div>
    `;
    ul.appendChild(li);
  });

  if (productsList) productsList.appendChild(ul);

  // Rol actual para ocultar botones
  const { data: currentData } = await api('/api/session/current', { method: 'GET' });
  const role = currentData?.user?.role || null;

  document.querySelectorAll('.btnDel').forEach((btn) => {
    btn.style.display = role === 'admin' ? 'inline-block' : 'none';
    btn.onclick = () => deleteProduct(btn.getAttribute('data-del'));
  });

  document.querySelectorAll('.btnAdd').forEach((btn) => {
    btn.style.display = role === 'user' ? 'inline-block' : 'none';
    btn.onclick = () => {
      const cid = getCartId();
      if (!isValidObjectId(cid)) {
        show({ status: 400 }, { message: 'Cart ID inválido. Primero creá un carrito.' });
        return;
      }
      addToCart(cid, btn.getAttribute('data-add'));
    };
  });
}

async function createProduct() {
  const body = {
    title: (document.getElementById('pTitle')?.value || '').trim(),
    code: (document.getElementById('pCode')?.value || '').trim(),
    price: Number(document.getElementById('pPrice')?.value),
    stock: Number(document.getElementById('pStock')?.value),
    description: (document.getElementById('pDesc')?.value || '').trim(),
    category: (document.getElementById('pCat')?.value || '').trim(),
  };

  const { res, data } = await api('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  show(res, data);
  if (res.ok) await loadProducts();
}

async function deleteProduct(pid) {
  const { res, data } = await api(`/api/products/${pid}`, { method: 'DELETE' });
  show(res, data);
  if (res.ok) await loadProducts();
}

async function addToCart(cid, pid) {
  const { res, data } = await api(`/api/carts/${cid}/product/${pid}`, {
    method: 'POST',
  });
  show(res, data);
}

async function viewCart() {
  const cid = getCartId();
  if (!isValidObjectId(cid)) {
    show({ status: 400 }, { message: 'Cart ID inválido. Primero creá un carrito.' });
    return;
  }

  const { res, data } = await api(`/api/carts/${cid}`, { method: 'GET' });
  show(res, data);
}

async function purchase() {
  const cid = getCartId();
  if (!isValidObjectId(cid)) {
    show({ status: 400 }, { message: 'Cart ID inválido. Primero creá un carrito.' });
    return;
  }

  const { res, data } = await api(`/api/carts/${cid}/purchase`, { method: 'POST' });
  show(res, data);
}

async function createCart() {
  const { res, data } = await api('/api/carts', { method: 'POST' });
  show(res, data);

  const id = data?.cart?.id || data?.cart?._id;
  if (res.ok && id && isValidObjectId(id)) {
    setCartId(id);
  }
}

// Wire buttons (con checks por si falta algún id en el HTML)
document.getElementById('btnLogin')?.addEventListener('click', login);
document.getElementById('btnLogout')?.addEventListener('click', logout);
document.getElementById('btnCurrent')?.addEventListener('click', refreshCurrent);
document.getElementById('btnJwtPing')?.addEventListener('click', jwtPing);

document.getElementById('btnLoadProducts')?.addEventListener('click', loadProducts);
document.getElementById('btnCreateProduct')?.addEventListener('click', createProduct);

document.getElementById('btnViewCart')?.addEventListener('click', viewCart);
document.getElementById('btnPurchase')?.addEventListener('click', purchase);
document.getElementById('btnCreateCart')?.addEventListener('click', createCart);

// Init
// Cargar cartId guardado si existe
const savedCartId = (localStorage.getItem('cartId') || '').trim();
if (savedCartId && isValidObjectId(savedCartId)) {
  setCartId(savedCartId);
}

refreshCurrent();
