const BASE_URL = "http://localhost:60565/api/bill"; // Replace with your backend port

    function goBack() {
      window.history.back();
    }

    function logout() {
      alert("Logged out.");
      window.location.href = "login.html";
    }

    function loadBills() {
      $.ajax({
        url: `${BASE_URL}/get-all`,
        method: "GET",
        success: function (data) {
          let rows = "";
          data.forEach(bill => {
            rows += `
              <tr>
                <td>${bill.billId}</td>
                <td>${bill.productId}</td>
                <td>${bill.userName}</td>
                <td>
                  <button class="btn btn-sm btn-info" onclick="viewBill(${bill.billId})">View</button>
                  <button class="btn btn-sm btn-danger" onclick="deleteBill(${bill.billId})">Delete</button>
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
                <td>${item.productName}</td>
                <td>${item.quantity}</td>
                <td>${item.rate}</td>
                <td>${item.amount}</td>
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

    $(document).ready(() => {
      loadBills();
    });