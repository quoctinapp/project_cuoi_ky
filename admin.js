const firebaseConfig = {
    apiKey: "AIzaSyDKS-bMlVv63I462R1uD4mjeplZMralzMU",
    authDomain: "test-a65cc.firebaseapp.com",
    databaseURL: "https://test-a65cc-default-rtdb.firebaseio.com",
    projectId: "test-a65cc",
    storageBucket: "test-a65cc.appspot.com",
    messagingSenderId: "743842345918",
    appId: "1:743842345918:web:a966b5368745bc3dcf7fef"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin@1234';

const loginPage = document.getElementById('loginPage');
const adminDashboard = document.getElementById('adminDashboard');
const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');
const btnLogout = document.getElementById('btnLogout');
const searchBox = document.getElementById('searchBox');
const filterPackage = document.getElementById('filterPackage');
const filterDestination = document.getElementById('filterDestination');
const tableContent = document.getElementById('tableContent');

let allBookings = [];

if (sessionStorage.getItem('adminLoggedIn')) {
    showDashboard();
}

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        showDashboard();
    } else {
        showError('Tên đăng nhập hoặc mật khẩu không đúng!');
    }
});

btnLogout.addEventListener('click', () => {
    sessionStorage.removeItem('adminLoggedIn');
    loginPage.style.display = 'flex';
    adminDashboard.classList.remove('active');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
});

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 3000);
}

function showDashboard() {
    loginPage.style.display = 'none';
    adminDashboard.classList.add('active');
    loadBookings();
}

function loadBookings() {
    database.ref('bookings').on('value', (snapshot) => {
        allBookings = [];
        snapshot.forEach((childSnapshot) => {
            const booking = childSnapshot.val();
            booking.id = childSnapshot.key;
            allBookings.push(booking);
        });

        allBookings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        updateStats();
        displayBookings(allBookings);
    });
}

function updateStats() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayCount = allBookings.filter(b => b.timestamp && b.timestamp.startsWith(today)).length;
    const weekCount = allBookings.filter(b => b.timestamp && new Date(b.timestamp) >= weekStart).length;
    const monthCount = allBookings.filter(b => b.timestamp && new Date(b.timestamp) >= monthStart).length;

    document.getElementById('totalBookings').textContent = allBookings.length;
    document.getElementById('todayBookings').textContent = todayCount;
    document.getElementById('weekBookings').textContent = weekCount;
    document.getElementById('monthBookings').textContent = monthCount;
}

function displayBookings(bookings) {
    if (bookings.length === 0) {
        tableContent.innerHTML = '<div class="no-data">Không có dữ liệu đặt chỗ</div>';
        return;
    }

    const table = `
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Họ tên</th>
                                <th>Email</th>
                                <th>Điện thoại</th>
                                <th>Ngày tham quan</th>
                                <th>Số khách</th>
                                <th>Gói tour</th>
                                <th>Địa điểm</th>
                                <th>Loại xe</th>
                                <th>Loại phòng</th>
                                <th>Ngày đặt</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${bookings.map(booking => `
                                <tr>
                                    <td>${booking['booking-name'] || 'N/A'}</td>
                                    <td>${booking['booking-email'] || 'N/A'}</td>
                                    <td>${booking['booking-phone'] || 'N/A'}</td>
                                    <td>${booking['booking-date'] || 'N/A'}</td>
                                    <td>${booking['booking-guests'] || 'N/A'}</td>
                                    <td>${booking['booking-package'] || 'N/A'}</td>
                                    <td>${booking['booking-destination'] || 'N/A'}</td>
                                    <td>${booking['booking-vehicle'] || 'N/A'}</td>
                                    <td>${booking['booking-room'] || 'N/A'}</td>
                                    <td>${booking.timestamp ? new Date(booking.timestamp).toLocaleString('vi-VN') : 'N/A'}</td>
                                    <td>
                                        <button class="btn-delete" onclick="deleteBooking('${booking.id}')">Xóa</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
    tableContent.innerHTML = table;
}

function deleteBooking(id) {
    if (confirm('Bạn có chắc chắn muốn xóa đặt chỗ này?')) {
        database.ref('bookings/' + id).remove()
            .then(() => {
                alert('Đã xóa thành công!');
            })
            .catch((error) => {
                alert('Có lỗi xảy ra: ' + error.message);
            });
    }
}

function filterBookings() {
    const searchTerm = searchBox.value.toLowerCase();
    const packageFilter = filterPackage.value;
    const destinationFilter = filterDestination.value;

    const filtered = allBookings.filter(booking => {
        const matchSearch = !searchTerm ||
            (booking['booking-name'] || '').toLowerCase().includes(searchTerm) ||
            (booking['booking-email'] || '').toLowerCase().includes(searchTerm) ||
            (booking['booking-phone'] || '').toLowerCase().includes(searchTerm);

        const matchPackage = !packageFilter || booking['booking-package'] === packageFilter;
        const matchDestination = !destinationFilter || booking['booking-destination'] === destinationFilter;

        return matchSearch && matchPackage && matchDestination;
    });

    displayBookings(filtered);
}

searchBox.addEventListener('input', filterBookings);
filterPackage.addEventListener('change', filterBookings);
filterDestination.addEventListener('change', filterBookings);

window.deleteBooking = deleteBooking;