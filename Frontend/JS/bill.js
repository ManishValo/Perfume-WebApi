$(document).ready(function () {
  const loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser"));
if (!loggedInUser || !loggedInUser.UserID) {
  alert("User not logged in.");
  window.location.href = "login.html";
  return;
}
const userId = loggedInUser.UserID;
const userName = loggedInUser.name || "";
$("#user-info").text(`Welcome, ${userName}`);


  let grandTotal = 0;

  // Fetch bill details
  $.ajax({
    url: `http://localhost:60565/api/bill/details/${billId}`,
    type: "GET",
    success: function (data) {
      if (data.length === 0) {
        $("#bill-items").html("<tr><td colspan='4'>No bill items found.</td></tr>");
        return;
      }

      let rows = "";
      data.forEach(item => {
        rows += `
          <tr>
            <td>${item.PerfumeName}</td>
            <td>₹${item.UnitPrice}</td>
            <td>${item.Quantity}</td>
            <td>₹${item.TotalPrice}</td>
          </tr>
        `;
        grandTotal += item.TotalPrice;
      });

      $("#bill-items").html(rows);
      $("#grand-total").text(`₹${grandTotal}`);
    },
    error: function () {
      $("#bill-container").html("<p>Error loading bill details.</p>");
    }
  });

  // Logout
  $("#logout-btn").click(function () {
    sessionStorage.clear();
    window.location.href = "login.html";
  });
});
