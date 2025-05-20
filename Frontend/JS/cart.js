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
              <img src="/images/${item.PerfumeImg}" alt="${item.PerfumeName}" style="width:100px;height:auto;">
              <div>
                <h3>${item.PerfumeName}</h3>
                <p>Price: ₹${item.PerfumePrice}</p>
                <p>Quantity: ${item.CartQty}</p>
                <p>Total: ₹${item.TotalPrice}</p>
                <button class="remove-btn" data-id="${item.CartID}">Remove</button>
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


