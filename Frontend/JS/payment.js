$(document).ready(function () {
    const loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser"));

    if (!loggedInUser || !loggedInUser.UserID) {
        alert("User not logged in.");
        window.location.href = "login.html";
        return;
    }

    const userId = loggedInUser.UserID;
    $("#full-name").val(loggedInUser.name);
    $("#email").val(loggedInUser.email);

    let cartItems = [];
    let totalAmount = 0;

    // Load cart data
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

    // Payment handler
    $("#pay-btn").click(function () {
        if (cartItems.length === 0) {
            alert("Cart is empty.");
            return;
        }

        // Collect user detail updates
        const updatedUser = {
            UserID: userId,
            Address: $("#address").val().trim(),
            City: $("#city").val().trim(),
            Pincode: $("#pincode").val().trim(),
            MobileNo: $("#contact").val().trim()
        };

        // Simple validation
        if (!updatedUser.Address || !updatedUser.City || !updatedUser.Pincode || !updatedUser.MobileNo) {
            alert("Please fill in all address and contact details.");
            return;
        }

        // Update user info first
        $.ajax({
            url: `http://localhost:60565/api/user/update-contact/${userId}`,
            type: "PUT",
            contentType: "application/json",
            data: JSON.stringify(updatedUser),
            success: function () {
                // Proceed to create bill
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

                $.ajax({
                    url: "http://localhost:60565/api/bill/add",
                    type: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(billDto),
                    success: function (response) {
                        // Clear cart
                        $.ajax({
                            url: `http://localhost:60565/api/cart/clear/user/${userId}`,
                            type: "DELETE",
                            success: function () {
                                alert("Payment successful! Bill ID: " + response.BillID);
                                sessionStorage.setItem("billId", response.BillID);
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
            },
            error: function () {
                alert("Failed to update user information.");
            }
        });
    });
});
