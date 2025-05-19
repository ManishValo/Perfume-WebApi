const BASE_URL = "http://localhost:60565/api/user"; // Replace 'port' with actual port

function goBack() {
    window.history.back();
}

function logout() {
    alert("You have been logged out.");
    window.location.href = "login.html";
}

// Load users
function loadUsers() {
    $.ajax({
        url: `${BASE_URL}/get-all`,
        method: "GET",
        success: function (data) {
            let rows = "";
            data.forEach(user => {
                rows += `
                <tr>
                  <td>${user.UserID}</td>
                  <td>${user.UserName}</td>
                  <td>${user.UserEmail}</td>
                  <td>${user.TypeId == 1 ? "Admin" : "Customer"}</td>
                  <td>
                <button class="btn btn-sm btn-info me-1" onclick='viewUser(${JSON.stringify(user)})'>View</button>
                <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.UserID})">Delete</button>
                 </td>
                </tr>`;
            });

            $('#userTable tbody').html(rows);
        }
    });
}

// Delete user
function deleteUser(userId) {
    if (confirm("Are you sure?")) {
        $.ajax({
            url: `${BASE_URL}/delete/${userId}`,
            type: "DELETE",
            success: function () {
                alert("User deleted.");
                loadUsers();
            }
        });
    }
}

function viewUser(user) {
    $('#viewUserID').text(user.UserID);
    $('#viewUserName').text(user.UserName);
    $('#viewUserEmail').text(user.UserEmail);
    $('#viewMobileNo').text(user.MobileNo ?? 'N/A');
    $('#viewType').text(user.TypeId == 1 ? 'Admin' : 'Customer');
    $('#viewAddress').text(user.Address ?? 'N/A');
    $('#viewCity').text(user.City ?? 'N/A');
    $('#viewPincode').text(user.Pincode ?? 'N/A');

    $('#viewUserModal').modal('show');
}


// Show/hide extra fields for customer
$('#typeId').change(function () {
    const typeId = $(this).val();
    if (typeId === "2") {
        $('#customerFields').show();
    } else {
        $('#customerFields').hide();
    }
});

// Add user
$('#userForm').submit(function (e) {
    e.preventDefault();

    const userData = {
        userName: $('#userName').val(),
        userEmail: $('#userEmail').val(),
        userPassword: $('#userPassword').val(),
        mobileNo: $('#mobileNo').val(),
        typeId: $('#typeId').val(),
        address: $('#typeId').val() === "2" ? $('#address').val() : null,
        city: $('#typeId').val() === "2" ? $('#city').val() : null,
        pincode: $('#typeId').val() === "2" ? $('#pincode').val() : null
    };

    $.ajax({
        url: `${BASE_URL}/add`,
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(userData),
        success: function () {
            alert("User added successfully.");
            $('#addUserModal').modal('hide');
            $('#userForm')[0].reset();
            $('#customerFields').hide();
            loadUsers();
        },
        error: function () {
            alert("Error adding user.");
        }
    });
});

$(document).ready(function () {
    loadUsers();
});