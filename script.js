const WA_NUMBER = '77789256878'; // ← заменить на реальный номер без +

let cart = {};

const params = new URLSearchParams(window.location.search);
const tableNumber = params.get('table');

function openMenu() {
  document.getElementById('home').classList.remove('active');
  document.getElementById('menu-page').classList.add('active');
  document.getElementById('stickyWa').style.display = 'block';
  
   const firstTab = document.querySelector('.tab');
  if (firstTab) {
    switchCat('dishes', firstTab);
  }

  window.scrollTo(0, 0);
}

function closeMenu() {
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
  document.querySelectorAll('.card').forEach(card => {
    const btn = card.querySelector('.order-btn, .qty-control');
    if (!btn) return;

    const oldClick = btn.getAttribute('onclick') || btn.querySelector('button:last-child')?.getAttribute('onclick');
    if (!oldClick) return;

    const match = oldClick.match(/(?:orderWA|addToCart)\('(.+?)'\)/);
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
}

function getCartCount() {
  return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
}

function updateCartButton() {
  const count = getCartCount();
  const waBtn = document.querySelector('.wa-btn');

  if (!waBtn) return;

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

  document.getElementById('stickyWa').style.display = 'none';
  updateCartButton();
});
