$(document).ready(function () {
const loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser"));

if (!loggedInUser || !loggedInUser.UserID) {
  alert("User not logged in.");
  window.location.href = "login.html";
  return;
}

const userId = loggedInUser.UserID;
    // Autofill name and email
    $("#full-name").val(loggedInUser.name);
    $("#email").val(loggedInUser.email);

    let cartItems = [];
    let totalAmount = 0;

    // Fetch cart data
    $.ajax({
        url: `http://localhost:60565/api/cart/user/${userId}`,
        type: "GET",
        success: function (data) {
            cartItems = data;
            if (cartItems.length === 0) {
                $("#cartSummary").html("<p>Your cart is empty.</p>");
                return;
            }

            let html = "";
            totalAmount = 0;

            cartItems.forEach(item => {
                html += `
                    <div class="cart-item">
                        <img src="${item.PerfumeImg}" width="80" />
                        <div>${item.PerfumeName}</div>
                        <div>Qty: ${item.CartQty}</div>
                        <div>Price: ₹${item.TotalPrice}</div>
                    </div>
                `;
                totalAmount += item.TotalPrice;
            });

            $("#cartSummary").html(html);
            $("#totalAmount").text(`Total: ₹${totalAmount}`);
        },
        error: function () {
            alert("Failed to load cart.");
        }
    });

    // On payment button click
    $("#pay-btn").click(function () {
        if (cartItems.length === 0) {
            alert("Cart is empty.");
            return;
        }

        const billDto = {
            UserID: parseInt(userId),
            BillAmt: totalAmount,
            Details: cartItems.map(item => ({
                PerfumeID: item.PerfumeID,
                Quantity: item.CartQty,
                UnitPrice: item.PerfumePrice,
                TotalPrice: item.TotalPrice
            }))
        };

        // Call bill/add API
        $.ajax({
            url: "http://localhost:60565/api/bill/add",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(billDto),
            success: function (response) {
                // Clear cart after successful bill
                $.ajax({
                    url: `http://localhost:60565/api/cart/clear/user/${userId}`,
                    type: "DELETE",
                    success: function () {
                        alert("Payment successful! Bill ID: " + response.BillID);
                        window.location.href = "/bill.html?billId=" + response.BillID;
                    },
                    error: function () {
                        alert("Payment successful, but failed to clear cart.");
                    }
                });
            },
            error: function () {
                alert("Payment failed. Please try again.");
            }
        });
    });
});
