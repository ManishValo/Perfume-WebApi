let allFetchedProducts = []; // Global array for search

// --------------------- INITIAL PAGE LOAD ---------------------
window.addEventListener('DOMContentLoaded', () => {
  const userJson = sessionStorage.getItem("loggedInUser");
  const user = userJson ? JSON.parse(userJson) : null;

  updateUserNav(user);
  updateCartIconFromServer();
  fetchAndRenderCategories(); // Fetch and build dropdown
});

// --------------------- FETCH AND RENDER CATEGORIES ---------------------
function fetchAndRenderCategories() {
  $.ajax({
    url: "http://localhost:60565/api/category",
    method: "GET",
    success: function (categories) {
      const dropdown = document.getElementById("category-dropdown");
      dropdown.innerHTML = "";

      categories.forEach((cat, index) => {
        const anchor = document.createElement("a");
        anchor.href = "#";
        anchor.textContent = cat.CategoryName;
        anchor.onclick = () => showCategory(cat.CategoryID);
        dropdown.appendChild(anchor);

        if (index === 0) showCategory(cat.CategoryID); // Default load
      });

    },
    error: function (xhr, status, error) {
      console.error("Error fetching categories:", error);
      document.getElementById("category-dropdown").innerHTML = "<a href='#'>Failed to load categories</a>";
    }
  });
}
function showCategory(categoryId) {
  if (!categoryId || isNaN(categoryId)) {
    console.error("Invalid category ID:", categoryId);
    return;
  }

  $.ajax({
    url: `http://localhost:60565/api/perfume/category/${categoryId}`,
    method: "GET",
    success: function (products) {
      allFetchedProducts = products;
      displayProducts(products);
    },
    error: function (xhr, status, error) {
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

  // Attach event handler for Add to Cart
  container.off('click', '.add-to-cart-btn');
  container.on('click', '.add-to-cart-btn', function () {
    const productId = parseInt($(this).data('id'));
    const product = products.find(p => p.PerfumeID === productId);
    addToCart(product);
  });
}

// --------------------- ADD TO CART ---------------------
function getLoggedInUser() {
  const userJson = sessionStorage.getItem("loggedInUser");
  return userJson ? JSON.parse(userJson) : null;
}

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
      updateCartIconFromServer();
    },
    error: function () {
      alert("Failed to add item to cart.");
    }
  });
}

// --------------------- UPDATE CART BADGE ---------------------
function updateCartIconFromServer() {
  const userJson = sessionStorage.getItem("loggedInUser");
  const user = userJson ? JSON.parse(userJson) : null;

  const cartIcon = document.querySelector('.fa-cart-plus');
  if (!cartIcon) return;

  let countBadge = document.getElementById('cart-count');

  if (!user) {
    cartIcon.style.display = 'none';
    if (countBadge) countBadge.style.display = 'none';
    return;
  }

  $.ajax({
    url: `http://localhost:60565/api/cart/user/${user.UserID}`,
    method: 'GET',
    success: function (cartItems) {
      const count = cartItems.reduce((total, item) => total + item.CartQty, 0);
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
      countBadge.innerText = count;
    }
  });
}


// --------------------- NAVBAR USER STATE ---------------------
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

  if (!query.trim()) {
    displayProducts(allFetchedProducts); // Show current category products
    return;
  }

  const filtered = allFetchedProducts.filter(product =>
    product.PerfumeName.toLowerCase().includes(query) ||
    product.PerfumeDescription.toLowerCase().includes(query)
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

  $.ajax({
    url: `http://localhost:60565/api/cart/user/${user.UserID}`,
    method: 'GET',
    success: function (cartItems) {
      if (cartItems.length === 0) {
        alert("🛒 Your cart is empty. Please add some products before checking out.");
        return;
      }

      window.location.href = "./checkout.html";
    },
    error: function () {
      alert("Failed to validate cart.");
    }
  });
});
