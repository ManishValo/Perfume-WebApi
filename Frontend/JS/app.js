// --------------------- INITIAL PAGE LOAD ---------------------
window.addEventListener('DOMContentLoaded', () => {
  const userJson = sessionStorage.getItem("loggedInUser");
  const user = userJson ? JSON.parse(userJson) : null;

  updateUserNav(user);
  updateCartIcon();
  showCategory('everyday'); // Default category
});


// --------------------- CATEGORY SWITCHING ---------------------
function showCategory(category) {
  const categoryMap = {
    everyday: 1,
    luxury: 2,
    nightScents: 3,
    bodyMists: 4
  };

  const catId = categoryMap[category];
  if (!catId) {
    console.error("Invalid category:", category);
    return;
  }

  $.ajax({
    url: `http://localhost:60565/api/perfume/category/${catId}`,
    method: "GET",
    success: function(products) {
      console.log(products);
      displayProducts(products);
    },
    error: function(xhr, status, error) {
      console.error("Error loading category:", error);
      $("#product-container").html("<p>Failed to load products.</p>");
    }
  });
}


// --------------------- RENDER PRODUCTS ---------------------
function displayProducts(products) {
  const container = $('#product-container');

  if (!products || products.length === 0) {
    container.html("<p>No products found in this category.</p>");
    return;
  }

  container.html(products.map(product => `
    <div class="product-card">
      <img src="/images/${product.PerfumeImg}" alt="${product.PerfumeName}" class="product-img">
      <h3>${product.PerfumeName}</h3>
      <p>${product.PerfumeDescription}</p>
      <p><strong>₹${product.PerfumePrice}</strong></p>
      <button class="add-to-cart-btn" data-id="${product.PerfumeID}">Add to Cart</button>
    </div>
  `).join(""));

  // Attach click handler using event delegation
  container.off('click', '.add-to-cart-btn');
  container.on('click', '.add-to-cart-btn', function() {
    const productId = parseInt($(this).data('id'));
    const product = products.find(p => p.PerfumeID === productId);
    addToCart(product);
  });
}


// --------------------- ADD TO CART ---------------------

// Utility: Get Logged-in User from sessionStorage
function getLoggedInUser() {
  const userJson = sessionStorage.getItem("loggedInUser");
//   console.log(userJson)
  return userJson ? JSON.parse(userJson) : null;
}

function addToCart(product) {
    // console.log(product)
  const user = getLoggedInUser();
//   console.log(user)
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

//   console.log("Adding to cart:", cartItem);

  $.ajax({
    url: 'http://localhost:60565/api/cart/add',
    method: 'POST',
    data: JSON.stringify(cartItem),
    contentType: 'application/json',
    success: function () {
      // Give a short delay to ensure DB operation is completed
        updateCartIcon();
    },
    error: function () {
      alert("Failed to add item to cart.");
    }
  });
}


// --------------------- UPDATE CART BADGE ---------------------
function updateCartIcon() {
  const userJson = sessionStorage.getItem("loggedInUser");
  const user = userJson ? JSON.parse(userJson) : null;
  const cartKey = user ? `cart_${user.email}` : null;
  const cart = cartKey ? JSON.parse(localStorage.getItem(cartKey)) || [] : [];

  const cartIcon = document.querySelector('.fa-cart-plus');
  if (!cartIcon) return;

  let countBadge = document.getElementById('cart-count');

  if (!user || cart.length === 0) {
    cartIcon.style.display = 'none';
    if (countBadge) countBadge.style.display = 'none';
    return;
  }

  cartIcon.style.display = 'inline-block';

  if (!countBadge) {
    countBadge = document.createElement('span');
    countBadge.id = 'cart-count';
    countBadge.style.cssText = `
      background: red;
      color: white;
      border-radius: 50%;
      padding: 2px 6px;
      font-size: 12px;
      position: absolute;
      top: -8px;
      right: -8px;
    `;
    cartIcon.style.position = 'relative';
    cartIcon.appendChild(countBadge);
  }

  countBadge.style.display = 'inline-block';
  countBadge.innerText = cart.length;
}


// --------------------- UPDATE NAVBAR ---------------------
function updateUserNav(user) {
  const userSection = document.getElementById("user-section");

  if (user && user.name) {
    userSection.innerHTML = `
      <span style="margin-right: 10px;">Welcome, ${user.name}!</span>
      <button onclick="logout()">Logout</button>
    `;
    window.loggedInUser = user;
  } else {
    userSection.innerHTML = `
      <a href="./signup.html"><button>Sign up</button></a>
      <a href="./login.html"><button>Login</button></a>
    `;
  }
}


// --------------------- LOGOUT ---------------------
function logout() {
  const user = JSON.parse(sessionStorage.getItem("loggedInUser"));
  if (user) {
    $.ajax({
      url: `http://localhost:5198/api/cart/clear/user/${user.UserID}`,
      method: 'DELETE',
      complete: function () {
        sessionStorage.removeItem("loggedInUser");
        window.location.href = "login.html";
      }
    });
  } else {
    window.location.href = "login.html";
  }
}


// --------------------- SEARCH PRODUCTS ---------------------
function searchProducts(event) {
  const query = event.target.value.toLowerCase();
  const allProducts = [...everydayPerfumes, ...luxuryPerfumes, ...bodyMists, ...nightScents];
  const filtered = allProducts.filter(product =>
    product.name.toLowerCase().includes(query) ||
    product.description.toLowerCase().includes(query)
  );

  displayProducts(filtered);
}

document.getElementById('search-input')?.addEventListener('input', searchProducts);


// --------------------- CHECKOUT VALIDATION ---------------------
document.getElementById("checkout-btn")?.addEventListener("click", () => {
  const userJson = sessionStorage.getItem("loggedInUser");
  const user = userJson ? JSON.parse(userJson) : null;

  if (!user) {
    alert("Please log in first.");
    window.location.href = "./login.html";
    return;
  }

  const cartKey = `cart_${user.email}`;
  const cart = JSON.parse(localStorage.getItem(cartKey)) || [];

  if (cart.length === 0) {
    alert("🛒 Your cart is empty. Please add some products before checking out.");
    return;
  }

  window.location.href = "./checkout.html";
});
