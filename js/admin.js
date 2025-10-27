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

let allBookings = [];
let allOrders = [];
let currentPage = 'dashboard';
let weeklyChart, packageChart, revenueChart, destinationChart;

if (sessionStorage.getItem('adminLoggedIn')) {
    showDashboard();
}

document.getElementById('loginForm').addEventListener('submit', (e) => {
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

document.getElementById('btnLogout').addEventListener('click', () => {
    sessionStorage.removeItem('adminLoggedIn');
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('adminDashboard').classList.remove('active');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
});

function showError(message) {
    const errorMsg = document.getElementById('errorMessage');
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
    setTimeout(() => errorMsg.style.display = 'none', 3000);
}

function showDashboard() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('adminDashboard').classList.add('active');
    loadAllData();
}

// Navigation
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
        const page = item.dataset.page;

        document.querySelectorAll('.menu-item').forEach(mi => mi.classList.remove('active'));
        item.classList.add('active');

        document.querySelectorAll('.data-section').forEach(section => {
            section.classList.remove('active');
        });

        document.getElementById(page + 'Section').classList.add('active');
        currentPage = page;
    });
});

function loadAllData() {
    database.ref('bookings').on('value', (snapshot) => {
        allBookings = [];
        snapshot.forEach((child) => {
            const booking = child.val();
            booking.id = child.key;
            allBookings.push(booking);
        });
        allBookings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        updateStats();
        displayBookings(allBookings);
    });

    database.ref('orders').on('value', (snapshot) => {
        allOrders = [];
        snapshot.forEach((child) => {
            const order = child.val();
            order.id = child.key;
            allOrders.push(order);
        });
        allOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        updateStats();
        displayOrders(allOrders);
    });
}

function updateStats() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    const todayBookings = allBookings.filter(b => b.timestamp && b.timestamp.startsWith(today)).length;
    const todayOrders = allOrders.filter(o => o.timestamp && o.timestamp.startsWith(today)).length;

    const weekBookings = allBookings.filter(b => b.timestamp && new Date(b.timestamp) >= weekStart).length;
    const weekOrders = allOrders.filter(o => o.timestamp && new Date(o.timestamp) >= weekStart).length;

    document.getElementById('totalBookings').textContent = allBookings.length;
    document.getElementById('totalOrders').textContent = allOrders.length;
    document.getElementById('todayTotal').textContent = todayBookings + todayOrders;
    document.getElementById('weekTotal').textContent = weekBookings + weekOrders;
    if (currentPage === 'dashboard') {
        initCharts();
    }
}

function displayBookings(bookings) {
    const container = document.getElementById('bookingsTableContent');

    if (bookings.length === 0) {
        container.innerHTML = '<div class="no-data">Không có dữ liệu đặt tour</div>';
        return;
    }

    container.innerHTML = `
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
}

function displayOrders(orders) {
    const container = document.getElementById('ordersTableContent');

    if (orders.length === 0) {
        container.innerHTML = '<div class="no-data">Không có đơn hàng</div>';
        return;
    }

    container.innerHTML = `
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Mã đơn</th>
                                <th>Khách hàng</th>
                                <th>Điện thoại</th>
                                <th>Tổng tiền</th>
                                <th>Thanh toán</th>
                                <th>Trạng thái</th>
                                <th>Ngày đặt</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${orders.map(order => `
                                <tr>
                                    <td><strong>#${order.id.substring(0, 8)}</strong></td>
                                    <td>${order.customerName || 'N/A'}</td>
                                    <td>${order.customerPhone || 'N/A'}</td>
                                    <td><strong>${(order.totalAmount || 0).toLocaleString()}đ</strong></td>
                                    <td>${order.paymentMethod || 'N/A'}</td>
                                    <td><span class="status-badge status-pending">${order.status || 'Chờ xử lý'}</span></td>
                                    <td>${order.timestamp ? new Date(order.timestamp).toLocaleString('vi-VN') : 'N/A'}</td>
                                    <td>
                                        <button class="btn-view" onclick="viewOrder('${order.id}')">Xem</button>
                                        <button class="btn-delete" onclick="deleteOrder('${order.id}')">Xóa</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
}

function deleteBooking(id) {
    if (confirm('Bạn có chắc chắn muốn xóa đặt tour này?')) {
        database.ref('bookings/' + id).remove()
            .then(() => alert('Đã xóa thành công!'))
            .catch((error) => alert('Có lỗi: ' + error.message));
    }
}

function deleteOrder(id) {
    if (confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
        database.ref('orders/' + id).remove()
            .then(() => alert('Đã xóa thành công!'))
            .catch((error) => alert('Có lỗi: ' + error.message));
    }
}

function viewOrder(id) {
    const order = allOrders.find(o => o.id === id);
    if (!order) return;

    const content = document.getElementById('orderDetailContent');
    content.innerHTML = `
                <div class="order-detail">
                    <h3>📋 Thông tin khách hàng</h3>
                    <div class="detail-row">
                        <span class="detail-label">Họ tên:</span>
                        <span class="detail-value">${order.customerName}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Điện thoại:</span>
                        <span class="detail-value">${order.customerPhone}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Email:</span>
                        <span class="detail-value">${order.customerEmail || 'Không có'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Địa chỉ:</span>
                        <span class="detail-value">${order.customerAddress}</span>
                    </div>
                </div>

                <div class="order-detail">
                    <h3>🛍️ Chi tiết đơn hàng</h3>
                    <div class="order-items">
                        ${order.items.map(item => `
                            <div class="item-row">
                                <span>${item.icon} ${item.name} x ${item.quantity}</span>
                                <strong>${(item.price * item.quantity).toLocaleString()}đ</strong>
                            </div>
                        `).join('')}
                        <div class="item-row" style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #ddd;">
                            <strong style="color: #667eea;">TỔNG CỘNG:</strong>
                            <strong style="color: #667eea; font-size: 18px;">${order.totalAmount.toLocaleString()}đ</strong>
                        </div>
                    </div>
                </div>

                <div class="order-detail">
                    <h3>💳 Thanh toán & Giao hàng</h3>
                    <div class="detail-row">
                        <span class="detail-label">Phương thức:</span>
                        <span class="detail-value">${order.paymentMethod}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Trạng thái:</span>
                        <span class="status-badge status-pending">${order.status}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Ngày đặt:</span>
                        <span class="detail-value">${new Date(order.timestamp).toLocaleString('vi-VN')}</span>
                    </div>
                    ${order.orderNote ? `
                    <div class="detail-row">
                        <span class="detail-label">Ghi chú:</span>
                        <span class="detail-value">${order.orderNote}</span>
                    </div>
                    ` : ''}
                </div>
            `;

    document.getElementById('orderModal').classList.add('active');
}

document.getElementById('closeOrderModal').addEventListener('click', () => {
    document.getElementById('orderModal').classList.remove('active');
});

document.getElementById('searchBoxBookings').addEventListener('input', filterBookings);
document.getElementById('filterPackage').addEventListener('change', filterBookings);

function filterBookings() {
    const searchTerm = document.getElementById('searchBoxBookings').value.toLowerCase();
    const packageFilter = document.getElementById('filterPackage').value;

    const filtered = allBookings.filter(booking => {
        const matchSearch = !searchTerm ||
            (booking['booking-name'] || '').toLowerCase().includes(searchTerm) ||
            (booking['booking-email'] || '').toLowerCase().includes(searchTerm) ||
            (booking['booking-phone'] || '').toLowerCase().includes(searchTerm);

        const matchPackage = !packageFilter || booking['booking-package'] === packageFilter;

        return matchSearch && matchPackage;
    });

    displayBookings(filtered);
}

document.getElementById('searchBoxOrders').addEventListener('input', filterOrders);
document.getElementById('filterStatus').addEventListener('change', filterOrders);

function filterOrders() {
    const searchTerm = document.getElementById('searchBoxOrders').value.toLowerCase();
    const statusFilter = document.getElementById('filterStatus').value;

    const filtered = allOrders.filter(order => {
        const matchSearch = !searchTerm ||
            (order.customerName || '').toLowerCase().includes(searchTerm) ||
            (order.customerPhone || '').toLowerCase().includes(searchTerm) ||
            (order.customerEmail || '').toLowerCase().includes(searchTerm) ||
            order.id.toLowerCase().includes(searchTerm);

        const matchStatus = !statusFilter || order.status === statusFilter;

        return matchSearch && matchStatus;
    });

    displayOrders(filtered);
}

window.deleteBooking = deleteBooking;
window.deleteOrder = deleteOrder;
window.viewOrder = viewOrder;

function initCharts() {
    if (weeklyChart) weeklyChart.destroy();
    if (packageChart) packageChart.destroy();
    if (revenueChart) revenueChart.destroy();
    if (destinationChart) destinationChart.destroy();

    const last7Days = getLast7Days();
    const bookingsByDay = last7Days.map(date => 
        allBookings.filter(b => b.timestamp && b.timestamp.startsWith(date)).length
    );
    const ordersByDay = last7Days.map(date => 
        allOrders.filter(o => o.timestamp && o.timestamp.startsWith(date)).length
    );

    const ctxWeekly = document.getElementById('weeklyChart').getContext('2d');
    weeklyChart = new Chart(ctxWeekly, {
        type: 'line',
        data: {
            labels: last7Days.map(d => new Date(d).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })),
            datasets: [
                {
                    label: 'Đặt tour',
                    data: bookingsByDay,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Đơn hàng',
                    data: ordersByDay,
                    borderColor: '#764ba2',
                    backgroundColor: 'rgba(118, 75, 162, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });

    const packageCount = {};
    allBookings.forEach(b => {
        const pkg = b['booking-package'] || 'Không xác định';
        packageCount[pkg] = (packageCount[pkg] || 0) + 1;
    });

    const ctxPackage = document.getElementById('packageChart').getContext('2d');
    packageChart = new Chart(ctxPackage, {
        type: 'doughnut',
        data: {
            labels: Object.keys(packageCount),
            datasets: [{
                data: Object.values(packageCount),
                backgroundColor: [
                    '#667eea',
                    '#764ba2',
                    '#f093fb',
                    '#4facfe'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    const revenueByDay = last7Days.map(date => {
        const dayOrders = allOrders.filter(o => o.timestamp && o.timestamp.startsWith(date));
        return dayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    });

    const ctxRevenue = document.getElementById('revenueChart').getContext('2d');
    revenueChart = new Chart(ctxRevenue, {
        type: 'bar',
        data: {
            labels: last7Days.map(d => new Date(d).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })),
            datasets: [{
                label: 'Doanh thu (đ)',
                data: revenueByDay,
                backgroundColor: 'rgba(102, 126, 234, 0.8)',
                borderColor: '#667eea',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    isplay: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString() + 'đ';
                        }
                    }
                }
            }
        }
    });

    const destinationCount = {};
    allBookings.forEach(b => {
        const dest = b['booking-destination'] || 'Không xác định';
        destinationCount[dest] = (destinationCount[dest] || 0) + 1;
    });

    const topDestinations = Object.entries(destinationCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const ctxDestination = document.getElementById('destinationChart').getContext('2d');
    destinationChart = new Chart(ctxDestination, {
        type: 'bar',
        data: {
            labels: topDestinations.map(d => d[0]),
            datasets: [{
                label: 'Số lượt đặt',
                data: topDestinations.map(d => d[1]),
                backgroundColor: [
                    '#667eea',
                    '#764ba2',
                    '#f093fb',
                    '#4facfe',
                    '#43e97b'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date.toISOString().split('T')[0]);
    }
    return days;
}