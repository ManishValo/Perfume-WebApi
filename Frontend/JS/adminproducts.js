const apiBase = "http://localhost:60565/api";

    function logout() {
      alert("You have been logged out.");
      window.location.href = "login.html";
    }

    function loadPerfumes() {
      $.get(`${apiBase}/perfume`, function(data) {
        let rows = "";
        data.forEach(p => {
          rows += `<tr>
            <td>${p.PerfumeID}</td>
            <td>${p.PerfumeName}</td>
            <td><img src="Images/${p.PerfumeImg}" class="thumb"/></td>
            <td>${p.PerfumePrice}</td>
            <td>${p.PerfumeQuantity}</td>
            <td>${p.PerfumeDescription}</td>
            <td>${p.PerfumeCatID}</td>
            <td>
              <button class="btn btn-warning btn-sm" onclick='showEditForm(${JSON.stringify(p)})'>Edit</button>
              <button class="btn btn-danger btn-sm" onclick="deletePerfume(${p.PerfumeID})">Delete</button>
            </td>
          </tr>`;
        });
        $("#perfumeTable tbody").html(rows);
      }).fail(() => alert("Error loading perfumes."));
    }

    function loadCategories() {
      $.get(`${apiBase}/category`, function(data) {
        let options = "<option value=''>Select Category</option>";
        data.forEach(c => {
          options += `<option value='${c.CategoryID}'>${c.CategoryName}</option>`;
        });
        $("#categorySelect").html(options);
        $("#editCategorySelect").html(options); // for edit modal too
      });
    }

   function addPerfume() {
  const perfumeName = $("#perfumeName").val().trim();

  // Extract filename from file input (handles Windows and Unix paths)
  let perfumeImg = $("#perfumeImg").val();

  perfumeImg = perfumeImg.split('\\').pop().split('/').pop();
//   console.log(perfumeImg);
  const perfumePrice = $("#perfumePrice").val().trim();
  const perfumeQty = $("#perfumeQty").val().trim();
  const perfumeDesc = $("#perfumeDesc").val().trim();
  const categoryID = $("#categorySelect").val();

  // Validation checks
  if (!perfumeName || !perfumeImg || !perfumePrice || !perfumeQty || !perfumeDesc || !categoryID) {
    alert("Enter All Fields Correctly");
    return;
  }

  const perfume = {
    PerfumeName: perfumeName,
    PerfumeImg: perfumeImg,
    PerfumePrice: parseFloat(perfumePrice),
    PerfumeQuantity: parseInt(perfumeQty),
    PerfumeDescription: perfumeDesc,
    PerfumeCatID: parseInt(categoryID)
  };

  $.ajax({
    url: `${apiBase}/perfume/register`,
    type: "POST",
    data: JSON.stringify(perfume),
    contentType: "application/json",
    success: function () {
      alert("Perfume added.");
      loadPerfumes();
      // Clear form fields:
      $("#perfumeName, #perfumeImg, #perfumePrice, #perfumeQty, #perfumeDesc").val("");
      $("#categorySelect").val("");
    },
    error: function (err) {
        console.log(err)
      alert("Error adding perfume.");
    }
  });
}


    function deletePerfume(id) {
      if (confirm("Are you sure you want to delete this perfume?")) {
        $.ajax({
          url: `${apiBase}/perfume/delete/${id}`,
          type: "DELETE",
          success: function () {
            alert("Deleted.");
            loadPerfumes();
          },
          error: function () {
            alert("Delete failed.");
          }
        });
      }
    }

    function showEditForm(perfume) {
  $("#editPerfumeId").val(perfume.PerfumeID);
  $("#editPerfumeName").val(perfume.PerfumeName);
  $("#editPerfumeImg").val(""); // Clear the file input
  $("#oldPerfumeImgName").val(perfume.PerfumeImg); // Save old image name
  $("#editPerfumePrice").val(perfume.PerfumePrice);
  $("#editPerfumeQty").val(perfume.PerfumeQuantity);
  $("#editPerfumeDesc").val(perfume.PerfumeDescription);
  $("#editCategorySelect").val(perfume.PerfumeCatID);
  $("#editPerfumeModal").modal("show");
}


   function updatePerfume() {
  let perfumeImg = $("#editPerfumeImg").val();
  perfumeImg = perfumeImg.split('\\').pop().split('/').pop();
  if (!perfumeImg) {
    perfumeImg = $("#oldPerfumeImgName").val(); // fallback to old image filename
  }

  const perfume = {
    PerfumeID: parseInt($("#editPerfumeId").val()),
    PerfumeName: $("#editPerfumeName").val(),
    PerfumeImg: perfumeImg,
    PerfumePrice: parseFloat($("#editPerfumePrice").val()),
    PerfumeQuantity: parseInt($("#editPerfumeQty").val()),
    PerfumeDescription: $("#editPerfumeDesc").val(),
    PerfumeCatID: parseInt($("#editCategorySelect").val())
  };

  $.ajax({
    url: `${apiBase}/perfume/update`,
    type: "PUT",
    data: JSON.stringify(perfume),
    contentType: "application/json",
    success: function () {
      alert("Perfume updated successfully.");
      $("#editPerfumeModal").modal("hide");
      loadPerfumes();
    },
    error: function () {
      alert("Error updating perfume.");
    }
  });
}


    $(document).ready(function () {
      loadPerfumes();
      loadCategories();
    });