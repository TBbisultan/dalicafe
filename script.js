const WA_NUMBER = '77770000000'; // номер клиента без +

let cart = {};

const params = new URLSearchParams(window.location.search);
const tableNumber = params.get('table');

function openMenu() {
  document.body.classList.add('menu-open');

  document.getElementById('home').classList.remove('active');
  document.getElementById('menu-page').classList.add('active');
  document.getElementById('stickyWa').style.display = 'block';

  window.scrollTo(0, 0);
}

function closeMenu() {
  document.body.classList.remove('menu-open');

  document.getElementById('menu-page').classList.remove('active');
  document.getElementById('home').classList.add('active');
  document.getElementById('stickyWa').style.display = 'none';

  window.scrollTo(0, 0);
}

function switchCat(cat, btn) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');

  document.querySelectorAll('.cat-section').forEach(s => s.classList.remove('active'));
  document.getElementById('cat-' + cat).classList.add('active');
}

function orderWA(item) {
  addToCart(item);
}

function addToCart(item) {
  cart[item] = (cart[item] || 0) + 1;
  updateAllButtons();
  updateCartButton();
}

function removeFromCart(item) {
  if (!cart[item]) return;

  cart[item]--;

  if (cart[item] <= 0) {
    delete cart[item];
  }

  updateAllButtons();
  updateCartButton();
}

function updateAllButtons() {
  document.querySelectorAll('.order-btn').forEach(btn => {
    const onclick = btn.getAttribute('onclick');
    const match = onclick.match(/orderWA\('(.+)'\)/);
    if (!match) return;

    const item = match[1];
    const qty = cart[item] || 0;

    if (qty > 0) {
      btn.outerHTML = `
        <div class="qty-control">
          <button onclick="removeFromCart('${item}')">−</button>
          <span>${qty}</span>
          <button onclick="addToCart('${item}')">+</button>
        </div>
      `;
    } else {
      btn.outerHTML = `<button class="order-btn" onclick="orderWA('${item}')">+</button>`;
    }
  });

  document.querySelectorAll('.qty-control').forEach(control => {
    const plusBtn = control.querySelector('button:last-child');
    const onclick = plusBtn.getAttribute('onclick');
    const match = onclick.match(/addToCart\('(.+)'\)/);
    if (!match) return;

    const item = match[1];
    const qty = cart[item] || 0;

    if (qty === 0) {
      control.outerHTML = `<button class="order-btn" onclick="orderWA('${item}')">+</button>`;
    } else {
      control.querySelector('span').textContent = qty;
    }
  });
}

function getCartCount() {
  return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
}

function updateCartButton() {
  const count = getCartCount();
  const waBtn = document.querySelector('.wa-btn');

  if (count > 0) {
    waBtn.innerHTML = `🛒 Корзина — ${count} шт · Заказать`;
  } else {
    waBtn.innerHTML = `🛒 Корзина пуста`;
  }
}

function openWA() {
  const items = Object.entries(cart);

  if (items.length === 0) {
    alert('Сначала добавьте еду в корзину');
    return;
  }

  let msg = 'Здравствуйте! Хочу сделать заказ:\n\n';

  if (tableNumber) {
    msg += `Стол №${tableNumber}\n\n`;
  }

  items.forEach(([name, qty]) => {
    msg += `• ${name} — ${qty} шт\n`;
  });

  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.order-btn').forEach(btn => {
    btn.textContent = '+';
  });

  updateCartButton();
});
