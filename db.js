/**localStorage */
class TempDB {
  constructor() {
    this.users = JSON.parse(localStorage.getItem('users') || '[]');
  }
  addUser(u) {
    this.users.push(u);
    localStorage.setItem('users', JSON.stringify(this.users));
  }
  findUser(email) {
    return this.users.find(u => u.email === email);
  }
}
const db = new TempDB();
