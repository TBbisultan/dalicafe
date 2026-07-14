const WA_NUMBER = '77086814299';

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
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });

  btn.classList.add('active');

  document.querySelectorAll('.cat-section').forEach(section => {
    section.classList.remove('active');
  });

  const category = document.getElementById('cat-' + cat);

  if (category) {
    category.classList.add('active');
  }
}

/*
Берёт цену прямо из карточки товара.

Сначала ищет элемент с классом .price.
Если такого класса нет, ищет любой текст вида:
1 500 ₸
2500 ₸
*/
function getItemPrice(item) {
  const cards = document.querySelectorAll('.card');

  for (const card of cards) {
    const button = card.querySelector('.order-btn, .qty-control');

    if (!button) continue;

    const buttons = button.matches('button')
      ? [button]
      : button.querySelectorAll('button');

    let cardItem = null;

    buttons.forEach(btn => {
      const click = btn.getAttribute('onclick') || '';

      const match = click.match(
        /(?:orderWA|addToCart|removeFromCart)\(['"](.+?)['"]\)/
      );

      if (match) {
        cardItem = match[1];
      }
    });

    if (cardItem !== item) continue;

    const priceElement = card.querySelector('.price');
    const priceText = priceElement
      ? priceElement.textContent
      : card.textContent;

    const priceMatch = priceText.match(/(\d[\d\s]*)\s*₸/);

    if (!priceMatch) {
      console.warn(`Цена для товара "${item}" не найдена`);
      return 0;
    }

    return Number(priceMatch[1].replace(/\s/g, ''));
  }

  return 0;
}

function orderWA(item) {
  addToCart(item);
}

function addToCart(item) {
  if (!cart[item]) {
    cart[item] = {
      qty: 0,
      price: getItemPrice(item)
    };
  }

  cart[item].qty++;

  updateAllButtons();
  updateCartButton();
}

function removeFromCart(item) {
  if (!cart[item]) return;

  cart[item].qty--;

  if (cart[item].qty <= 0) {
    delete cart[item];
  }

  updateAllButtons();
  updateCartButton();
}

function updateAllButtons() {
  document.querySelectorAll('.card').forEach(card => {
    const control = card.querySelector('.order-btn, .qty-control');

    if (!control) return;

    const clickableElements = control.matches('button')
      ? [control]
      : control.querySelectorAll('button');

    let item = null;

    clickableElements.forEach(btn => {
      const click = btn.getAttribute('onclick') || '';

      const match = click.match(
        /(?:orderWA|addToCart|removeFromCart)\(['"](.+?)['"]\)/
      );

      if (match) {
        item = match[1];
      }
    });

    if (!item) return;

    const qty = cart[item]?.qty || 0;

    if (qty > 0) {
      control.outerHTML = `
        <div class="qty-control">
          <button onclick="removeFromCart('${item}')">−</button>
          <span>${qty}</span>
          <button onclick="addToCart('${item}')">+</button>
        </div>
      `;
    } else {
      control.outerHTML = `
        <button class="order-btn" onclick="orderWA('${item}')">+</button>
      `;
    }
  });
}

function getCartCount() {
  return Object.values(cart).reduce((sum, product) => {
    return sum + product.qty;
  }, 0);
}

function getCartTotal() {
  return Object.values(cart).reduce((sum, product) => {
    return sum + product.price * product.qty;
  }, 0);
}

function formatPrice(price) {
  return price.toLocaleString('ru-RU') + ' ₸';
}

function updateCartButton() {
  const count = getCartCount();
  const total = getCartTotal();
  const waBtn = document.querySelector('.wa-btn');

  if (!waBtn) return;

  if (count > 0) {
    waBtn.innerHTML = `
      🛒 Корзина — ${count} шт · ${formatPrice(total)} · Заказать
    `;
  } else {
    waBtn.innerHTML = '🛒 Корзина пуста';
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

  items.forEach(([name, product]) => {
    const itemTotal = product.price * product.qty;

    msg += `• ${name}\n`;
    msg += `${product.qty} шт × ${formatPrice(product.price)} = ${formatPrice(itemTotal)}\n\n`;
  });

  msg += `Итого: ${formatPrice(getCartTotal())}`;

  window.open(
    `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`,
    '_blank'
  );
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.order-btn').forEach(btn => {
    btn.textContent = '+';
  });

  const stickyWa = document.getElementById('stickyWa');

  if (stickyWa) {
    stickyWa.style.display = 'none';
  }

  updateCartButton();
});
