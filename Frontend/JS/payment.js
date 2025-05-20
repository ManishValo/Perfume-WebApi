// LOGOUT FUNCTIONALITY
document.getElementById('logout-btn').addEventListener('click', function () {
  alert('You have been logged out.');
  localStorage.removeItem("loggedInUser");
  window.location.href = './index.html';
});


document.addEventListener('DOMContentLoaded', () => {
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  // console.log("name"+loggedInUser?.name)
  document.querySelector("input[name='name']").value = loggedInUser?.name
  document.querySelector("input[name=email]").value = loggedInUser?.email
})

// PAYMENT VALIDATION AND CONFIRMATION
document.getElementById('pay-btn').addEventListener('click', function () {
  const cardNumber = document.getElementById('cardnumber').value.trim().replace(/\s+/g, '');
  const cvv = document.getElementById('cvv').value.trim();
  const expiry = document.getElementById('cardexpiry').value.trim(); // Format: YYYY-MM

  // Get user details from localStorage
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  const userName = loggedInUser?.name || "User";
  const userEmail = loggedInUser?.email || "Not available";

  // CARD VALIDATION
  if (!/^\d{16}$/.test(cardNumber)) {
    alert("❌ Card number must be 16 digits");
    return;
  }

  if (!/^\d{3}$/.test(cvv)) {
    alert("❌ CVV must be a 3-digit number");
    return;
  }

  // EXPIRY VALIDATION (YYYY-MM format from <input type="month">)
  if (!/^\d{4}-\d{2}$/.test(expiry)) {
    alert("❌ Please enter a valid expiry date (YYYY-MM)");
    return;
  }

  const [expiryYear, expiryMonth] = expiry.split("-").map(Number);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // getMonth() is 0-based

  if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
    alert("❌ Card has expired");
    return;
  }

  // ALL VALID
  alert(`✅ Thank you for your purchase, ${userName}!\nOrder confirmation email will be sent to: ${userEmail}`);
  window.location.href="bill.html";
  // Clear input fields
  document.getElementById('cardnumber').value = '';
  document.getElementById('cvv').value = '';
  document.getElementById('cardexpiry').value = '';

  // Clear user's cart after successful payment
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (user) {
    const cartKey = `cart_${user.email}`;
    localStorage.setItem(cartKey, JSON.stringify([])); 
    localStorage.removeItem("cart"); 
  }
});



window.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (user) {
    document.getElementById('user-info').textContent = `${user.name}`;
  }
});
