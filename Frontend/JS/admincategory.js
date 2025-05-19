const apiUrl = "http://localhost:60565/api/category"; // 🔁 Replace with actual port number

  $(document).ready(function () {
    loadCategories();

    // Add category
    $("#categoryForm").on("submit", function (e) {
      e.preventDefault();
      const name = $("#categoryName").val().trim();
      if (name === "") return;

      $.ajax({
        url: apiUrl + "/add",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({ CategoryName: name }),
        success: function (res) {
          alert(res);
          $("#categoryName").val("");
          loadCategories();
        },
        error: function (xhr) {
          alert(xhr.responseText || "Failed to add category.");
        }
      });
    });
  });

  function loadCategories() {
    $.ajax({
      url: apiUrl,
      type: "GET",
      success: function (data) {
        const tbody = $("#categoryTable tbody");
        tbody.empty();
        data.forEach(cat => {
          tbody.append(`
            <tr>
              <td>${cat.CategoryID}</td>
              <td><input type="text" class="form-control" value="${cat.CategoryName}" id="cat-${cat.CategoryID}"/></td>
              <td>
                <button class="btn btn-sm btn-primary" onclick="updateCategory(${cat.CategoryID})">Update</button>
                <button class="btn btn-sm btn-danger" onclick="deleteCategory(${cat.CategoryID})">Delete</button>
              </td>
            </tr>
          `);
        });
      },
      error: function () {
        alert("Error loading categories.");
      }
    });
  }

  function updateCategory(id) {
    const updatedName = $(`#cat-${id}`).val().trim();
    if (updatedName === "") {
      alert("Category name cannot be empty.");
      return;
    }

    $.ajax({
      url: apiUrl + "/update",
      type: "PUT",
      contentType: "application/json",
      data: JSON.stringify({ CategoryID: id, CategoryName: updatedName }),
      success: function (res) {
        alert(res);
        loadCategories();
      },
      error: function () {
        alert("Failed to update category.");
      }
    });
  }

  function deleteCategory(id) {
    if (!confirm("Are you sure you want to delete this category?")) return;

    $.ajax({
      url: apiUrl + "/delete/" + id,
      type: "DELETE",
      success: function (res) {
        alert(res);
        loadCategories();
      },
      error: function () {
        alert("Failed to delete category.");
      }
    });
  }

  function goBack() {
    window.history.back();
  }

  function logout() {
    alert("You have been logged out.");
    window.location.href = "login.html";
  }