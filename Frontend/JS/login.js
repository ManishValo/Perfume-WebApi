$('#login-form').submit(function (e) {
  e.preventDefault(); // prevent form from submitting

  var UserEmail = $('#email').val();
  var UserPassword = $('#password').val(); 
  $.ajax({
    type: "POST",
    url: "http://localhost:60565/api/user/login",
    data: { UserEmail, UserPassword },
    // contentType: "application/json",
    success: function (response) {
      if (response && response.TypeID === 1) {
        window.location.href = "adminpanel.html";
      } else if (response && response.TypeID === 2) {
        sessionStorage.setItem("loggedInUser", JSON.stringify(response));
        window.location.href = "index.html";
      } else {
        alert("Invalid login or not an admin");
      }
    },
    error: function (err) {
        if (err.status === 404) {
        alert("Incorrect email or password."); 
         } 
      alert("Login failed");
      console.log(err);
    }
  });
});



$('#toggle-password').on('click', function () {
  const passwordField = $('#password');
  const type = passwordField.attr('type') === 'password' ? 'text' : 'password';
  passwordField.attr('type', type);
  $(this).toggleClass('fa-eye fa-eye-slash');
});