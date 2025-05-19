// Utility: Get Logged-in User from sessionStorage
function getLoggedInUser() {
  return JSON.parse(sessionStorage.getItem("loggedInUser"));
}

// 🔄 Get Cart Items via API
function getCart(callback) {
  const user = getLoggedInUser();
  if (!user) return callback([]);
  
  $.ajax({
    url: `http://localhost:60565/api/cart/user/${user.UserID}`,
    method: 'GET',
    success: function (data) {
      callback(data);
    },
    error: function () {
      callback([]);
    }
  });
}

// ➕ Add Product to Cart
function addToCart(product) {
  const user = getLoggedInUser();
  if (!user) return alert("Please login to add items to cart.");

  const cartItem = {
  PerfumeID: product.PerfumeID,
  ProductName: product.PerfumeName,
  Price: product.PerfumePrice,
  Image: `/images/${product.PerfumeImg}`,
  Description: product.PerfumeDescription,
  CartQty: 1,
  TotalPrice: product.PerfumePrice,
  UserID: user.UserID
};


  $.ajax({
    url: 'http://localhost:60565/api/cart/add',
    method: 'POST',
    data: JSON.stringify(cartItem),
    contentType: 'application/json',
    success: function () {
      displayCartItems();
      updateCartIcon();
    },
    error: function () {
      alert("Failed to add item to cart.");
    }
  });
}

// 🔁 Update Quantity
function updateQuantity(cartId, newQty, unitPrice) {
  if (newQty <= 0) {
    removeProduct(cartId);
    return;
  }

  $.ajax({
    url: 'http://localhost:60565/api/cart/update',
    method: 'PUT',
    contentType: 'application/json',
    data: JSON.stringify({
      CartID: cartId,
      CartQty: newQty,
      TotalPrice: newQty * unitPrice
    }),
    success: function () {
      displayCartItems();
      updateCartIcon();
    }
  });
}

// ❌ Remove a Product
function removeProduct(cartId) {
  $.ajax({
    url: `http://localhost:60565/api/cart/delete/${cartId}`,
    method: 'DELETE',
    success: function () {
      displayCartItems();
      updateCartIcon();
    }
  });
}

// 🧹 Clear Cart for User (on logout)
function clearCartForUser(userId) {
  $.ajax({
    url: `http://localhost:60565/api/cart/clear/user/${userId}`,
    method: 'DELETE',
    success: function () {
      console.log("Cart cleared for user.");
    }
  });
}

// 🚪 Logout User
function logout() {
  const user = getLoggedInUser();
  if (user) clearCartForUser(user.UserID);

  sessionStorage.removeItem("loggedInUser");
  alert("Logged out successfully.");
  updateUserNav();
  updateCartIcon();
  window.location.href = "index.html";
}

// 🛍️ Display Cart Items
function displayCartItems() {
  const container = document.getElementById('cart-items-container');
  const emptyMsg = document.getElementById('empty-cart-message');
  const totalEl = document.getElementById('cart-total-amount');

  if (!container) return;

  container.innerHTML = '';
  let total = 0;

  getCart(cart => {
    if (emptyMsg) emptyMsg.style.display = cart.length === 0 ? 'block' : 'none';
    if (cart.length === 0 && totalEl) totalEl.innerText = `Total: ₹0`;

    cart.forEach(item => {
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <div class="cart-item-card">
          <img src="${item.Image}" alt="${item.ProductName}" class="cart-item-image">
          <div class="cart-item-details">
            <h3>${item.ProductName}</h3>
            <p>${item.Description}</p>
            <strong>Price: ₹${item.Price}</strong>
            <div class="quantity-controls">
              <button onclick="updateQuantity(${item.CartID}, ${item.CartQty - 1}, ${item.Price})">-</button>
              <span>${item.CartQty}</span>
              <button onclick="updateQuantity(${item.CartID}, ${item.CartQty + 1}, ${item.Price})">+</button>
            </div>
            <p><strong>Subtotal: ₹${item.TotalPrice}</strong></p>
          </div>
        </div>
        <button class="remove-from-cart" onclick="removeProduct(${item.CartID})">Remove All</button>
      `;
      container.appendChild(div);
      total += item.TotalPrice;
    });

    if (totalEl) totalEl.innerText = `Total: ₹${total}`;
  });
}

// 🔢 Update Cart Icon with Count
function updateCartIcon() {
  getCart(cart => {
    const count = cart.length;
    const cartCountEl = document.getElementById("cart-count");
    if (cartCountEl) {
      cartCountEl.innerText = count;
      cartCountEl.style.display = count > 0 ? 'inline-block' : 'none';
    }
  });
}
