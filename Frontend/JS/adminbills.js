
  const BASE_URL = "http://localhost:60565/api/bill";

  function loadBills() {
  $.ajax({
    url: BASE_URL,
    method: "GET",
    success: function (data) {
      let rows = "";
      data.forEach(bill => {
        rows += `
          <tr>
            <td>${bill.BillID}</td>
            <td>${bill.UserID}</td>
            <td>${bill.CustomerName}</td>
            <td>
              <button class="btn btn-sm btn-info" onclick="viewBill(${bill.BillID})">View</button>
            </td>
          </tr>
        `;
      });
      $("#billTable tbody").html(rows);
    },
    error: function () {
      alert("Error loading bill data.");
    }
  });
}


  function viewBill(billId) {
    $.ajax({
      url: `${BASE_URL}/details/${billId}`,
      method: "GET",
      success: function (details) {
        let rows = "";
        details.forEach(item => {
          rows += `
            <tr>
              <td>${item.PerfumeName}</td>
              <td>${item.Quantity}</td>
              <td>${item.UnitPrice}</td>
              <td>${item.TotalPrice}</td>
            </tr>
          `;
        });
        $("#billDetailBody").html(rows);
        $("#viewBillModal").modal("show");
      },
      error: function () {
        alert("Unable to fetch bill details.");
      }
    });
  }

  function deleteBill(billId) {
    if (confirm("Are you sure you want to delete this bill?")) {
      $.ajax({
        url: `${BASE_URL}/delete/${billId}`,
        method: "DELETE",
        success: function () {
          alert("Bill deleted successfully.");
          loadBills();
        },
        error: function () {
          alert("Error deleting bill.");
        }
      });
    }
  }

  function goBack() {
    window.history.back();
  }

  function logout() {
    alert("Logged out.");
    window.location.href = "login.html";
  }

  $(document).ready(() => {
    loadBills();
  });

