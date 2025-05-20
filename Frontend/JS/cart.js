$(document).ready(function () {
  const userJson = sessionStorage.getItem("loggedInUser");
  const user = userJson ? JSON.parse(userJson) : null;

  if (!user) {
    alert("Please login to view your cart.");
    window.location.href = "login.html";
    return;
  }

  const userId = user.UserID;
  const apiUrl = `http://localhost:60565/api/cart/user/${userId}`;

  function loadCart() {
    $.ajax({
      url: apiUrl,
      method: "GET",
      success: function (cartItems) {
        const container = $("#cart-items-container");
        container.empty();

        if (!cartItems || cartItems.length === 0) {
          $(".empty-cart-message").show();
          $("#cart-total").hide();
        } else {
          $(".empty-cart-message").hide();
          $("#cart-total").show();
        }


        $(".empty-cart-message").addClass("hidden");
        $("#cart-total").show();

        let totalAmount = 0;

        cartItems.forEach(item => {
          totalAmount += item.TotalPrice;

              const card = `
      <div class="cart-card" style="display:flex;gap:1rem;border:1px solid #ccc;padding:1rem;margin-bottom:1rem;">
        <img src="/images/${item.PerfumeImg}" alt="${item.PerfumeName}" style="width:100px;height:100px; object-fit: contain;">
        <div>
          <h3>${item.PerfumeName}</h3>
          <p>Price: ₹${item.PerfumePrice}</p>
          <div>
            Quantity:
            <button class="qty-btn decrease" data-id="${item.CartID}" data-qty="${item.CartQty}" data-price="${item.PerfumePrice}">−</button>
            <span class="cart-qty">${item.CartQty}</span>
            <button class="qty-btn increase" data-id="${item.CartID}" data-qty="${item.CartQty}" data-price="${item.PerfumePrice}">+</button>
          </div>
          <p>Total: ₹${item.TotalPrice}</p>
          <button class="remove-btn" data-id="${item.CartID}" style="background-color: #ff4d4d; color: white; border: none; padding: 8px 15px; cursor: pointer; border-radius: 5px;">Remove</button>
        </div>
      </div>
    `;


          container.append(card);
        });

        $("#cart-total-amount").text(`Total: ₹${totalAmount}`);
      },
      error: function (xhr) {
        const container = $("#cart-items-container");
        container.empty();
        $(".empty-cart-message").removeClass("hidden");
        $("#cart-total").hide();
        $(".cart-count").text(0); // Also reset cart icon
      }

    });
  }

  // Quantity +/− buttons
  $(document).on("click", ".qty-btn", function () {
    const cartId = $(this).data("id");
    let qty = parseInt($(this).data("qty"));
    const unitPrice = parseFloat($(this).data("price"));
    const isIncrease = $(this).hasClass("increase");

    if (isIncrease) {
      qty += 1;
    } else {
      if (qty <= 1) {
        alert("Minimum quantity is 1.");
        return;
      }
      qty -= 1;
    }

    const updatedCart = {
      CartID: cartId,
      CartQty: qty,
      TotalPrice: qty * unitPrice
    };

    $.ajax({
      url: "http://localhost:60565/api/cart/update",
      method: "PUT",
      contentType: "application/json",
      data: JSON.stringify(updatedCart),
      success: function () {
        loadCart(); // Refresh cart UI
        updateCartIconFromServer(); // Refresh cart count
      },
      error: function () {
        alert("Failed to update cart quantity.");
      }
    });
  });


  $(document).on("click", ".remove-btn", function () {
    const cartId = $(this).data("id");

    $.ajax({
      url: `http://localhost:60565/api/cart/delete/${cartId}`,
      method: "DELETE",
      success: function () {
        loadCart();
        updateCartIconFromServer();
      },
      error: function () {
        alert("Failed to remove item.");
      }
    });
  });

  function updateCartIconFromServer() {
    $.ajax({
      url: `http://localhost:60565/api/cart/user/${userId}`,
      method: "GET",
      success: function (cartItems) {
        const totalCount = cartItems.reduce((sum, item) => sum + item.CartQty, 0);
        $(".cart-count").text(totalCount);
      },
      error: function () {
        $(".cart-count").text(0); // Safely handle no items or 404
      }
    });
  }


  loadCart();


  $("#checkout-btn").on("click", function () {
    $.ajax({
      url: `http://localhost:60565/api/cart/user/${userId}`,
      method: "GET",
      success: function (cartItems) {
        if (cartItems.length === 0) {
          alert("Your cart is empty. Please add items before proceeding.");
          return;
        }
        window.location.href = "paymentgateway.html";
      },
      error: function () {
        alert("Could not validate cart before checkout.");
      }
    });
  });
});


