<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset Password</title>
  <link href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css" rel="stylesheet">
  <style>
    body {
      font-family: 'Poppins', sans-serif;
      background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.9)), url('img/mohammad-metri-1oKxSKSOowE-unsplash.jpg') center/cover;
      color: white;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }

    .box {
      background: rgba(0,0,0,0.7);
      padding: 2rem;
      border-radius: 1rem;
      box-shadow: 0 0 10px rgba(255,255,255,0.2);
      text-align: center;
      width: 90%;
      max-width: 400px;
    }

    input {
      width: 100%;
      padding: 1rem;
      border-radius: 0.5rem;
      border: none;
      margin: 1rem 0;
      font-size: 1rem;
    }

    button {
      padding: 0.7rem 2rem;
      border: none;
      border-radius: 0.5rem;
      background: darkred;
      color: white;
      cursor: pointer;
      font-size: 1rem;
    }

    button:hover {
      background: #a30000;
    }

    a {
      color: #ccc;
      display: block;
      margin-top: 1rem;
      text-decoration: underline;
    }

    .password-toggle {
      position: absolute;
      right: 10px;
      top: 35%;
      cursor: pointer;
      font-size: 18px;
    }
  </style>
</head>
<body>

<div class="box">
  <h2>Reset Your Password</h2>
  <div class="input-group" style="position: relative;">
    <input type="password" id="newPassword" placeholder="New Password" />
    <i class="fa-solid fa-eye password-toggle" onclick="togglePasswordVisibility('newPassword')"></i>
  </div>
  <div class="input-group" style="position: relative;">
    <input type="password" id="confirmPassword" placeholder="Confirm Password" />
    <i class="fa-solid fa-eye password-toggle" onclick="togglePasswordVisibility('confirmPassword')"></i>
  </div>
  <button onclick="resetPassword()">Reset</button>
  <a href="index.html">Back to Login</a>
</div>

<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

<script>
  // TempDB class for handling user data in localStorage
  class TempDB {
    constructor() {
      this.users = JSON.parse(localStorage.getItem('users') || '[]');
    }

    // Add new user with hashpass
    async addUser(user) {
      try {
        user.password = await this.hashPassword(user.password);
        this.users.push(user);
        localStorage.setItem('users', JSON.stringify(this.users));
        return true;
      } catch (error) {
        console.error('Error adding user:', error);
        return false;
      }
    }

    // Search for user by email or username
    findUserByEmailOrUsername(identifier) {
      return this.users.find(
        u =>
          (u.email && u.email.toLowerCase() === identifier.toLowerCase()) ||
          (u.username && u.username.toLowerCase() === identifier.toLowerCase())
      );
    }

    // Authenticate user (used in login)
    async authenticateUser(identifier, password) {
      try {
        const user = this.findUserByEmailOrUsername(identifier);
        if (!user) return null;

        const hashedPassword = await this.hashPassword(password);
        return user.password === hashedPassword ? user : null;
      } catch (error) {
        console.error('Authentication error:', error);
        return null;
      }
    }

    // Security question verification (username + password)
    verifySecurityAnswer(identifier, answer) {
      const user = this.findUserByEmailOrUsername(identifier);
      if (user && user.question && user.question.toLowerCase() === answer.toLowerCase()) {
        return user;
      }
      return null;
    }

    // Update password
    async updatePassword(email, newPassword) {
      try {
        const index = this.users.findIndex(u => u.email === email);
        if (index !== -1) {
          this.users[index].password = await this.hashPassword(newPassword);
          localStorage.setItem('users', JSON.stringify(this.users));
          return true;
        }
        return false;
      } catch (error) {
        console.error('Password update error:', error);
        return false;
      }
    }

    // Hash password using SHA-256
    async hashPassword(password) {
      const encoder = new TextEncoder();
      const data = encoder.encode(password + 'myMusicSalt');
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Get all users
    getAllUsers() {
      return this.users;
    }

    // Remove user from localStorage by email
    removeUser(email) {
      const userIndex = this.users.findIndex(user => user.email === email);
      if (userIndex !== -1) {
        this.users.splice(userIndex, 1);
        localStorage.setItem('users', JSON.stringify(this.users));
        return true;
      }
      return false;
    }
  }

  // Initialize the database instance
  const db = new TempDB();

  // Save reset user email to sessionStorage
  window.saveResetUser = (email) => sessionStorage.setItem('resetEmail', email);

  // Get reset user email from sessionStorage
  window.getResetUser = () => sessionStorage.getItem('resetEmail');

  // Clear reset user email from sessionStorage
  window.clearResetUser = () => sessionStorage.removeItem('resetEmail');

  // Function to toggle password visibility
  function togglePasswordVisibility(fieldId) {
    const field = document.getElementById(fieldId);
    const icon = field.nextElementSibling;
    if (field.type === 'password') {
      field.type = 'text';
      icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
      field.type = 'password';
      icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
  }

  // Function to reset password
  async function resetPassword() {
    const newPassword = document.getElementById('newPassword').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    const email = getResetUser();

    if (!email) {
      Swal.fire('Error', 'No reset session found. Please try recovery again.', 'error');
      return;
    }

    if (!newPassword || !confirmPassword) {
      Swal.fire('Missing Fields', 'Please enter both password fields.', 'warning');
      return;
    }

    if (newPassword.length < 6) {
      Swal.fire('Weak Password', 'Password must be at least 6 characters.', 'warning');
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire('Mismatch', 'Passwords do not match.', 'error');
      return;
    }

    const updated = await db.updatePassword(email, newPassword);
    if (updated) {
      sessionStorage.removeItem('resetEmail');
      Swal.fire({
        icon: 'success',
        title: 'Password Updated!',
        text: 'You can now log in with your new password.',
        confirmButtonText: 'Go to Login'
      }).then(() => {
        window.location.href = 'index.html';
      });
    } else {
      Swal.fire('Error', 'Unable to update password. Try again.', 'error');
    }
  }
</script>

</body>
</html>
