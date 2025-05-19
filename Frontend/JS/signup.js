$(document).ready(function () {
  $('#signupForm').submit(function (e) {
    e.preventDefault();

    const fullName = $('#full-name').val().trim();
    const email = $('#email').val().trim();
    const password = $('#password').val().trim();
    const confirmPassword = $('#confirm-password').val().trim();

    if (!fullName || !email || !password || !confirmPassword) {
      alert("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    const userData = {
      UserName: fullName,
      UserEmail: email,
      UserPassword: password,
      TypeId: 2,            
      Address: null,
      City: null,
      Pincode: null,
      MobileNo: null
    };

    $.ajax({
      url: 'http://localhost:60565/api/user/register',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(userData),
      success: function (response) {
        alert("Signup successful! Please log in.");
        window.location.href = "login.html";
      },
      error: function (xhr) {
        if (xhr.responseText) {
          alert("Signup failed: " + xhr.responseText);
        } else {
          alert("Signup failed.");
        }
      }
    });
  });
});
