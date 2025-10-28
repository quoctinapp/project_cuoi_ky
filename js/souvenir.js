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

const products = [
    { id: 1, name: 'Hoa Đà Lạt', icon: "image/cam_tu_cau.png", price: 150000, description: 'Hoa tươi đóng gói đẹp mắt, giữ tươi lâu' },
    { id: 2, name: 'Dâu Tây Đà Lạt', icon: "image/dau_tay_da_lat.png", price: 200000, description: 'Dâu tây tươi ngon, sạch, 500g/hộp' },
    { id: 3, name: 'Atiso Đà Lạt', icon: "image/atiso_da_lat.png", price: 180000, description: 'Trà atiso nguyên chất, hộp 200g' },
    { id: 4, name: 'Mứt Dâu', icon: "image/mut_dau_da_lat.png", price: 120000, description: 'Mứt dâu tây thủ công, lọ 300g' },
    { id: 5, name: 'Rượu Sim', icon: "image/ruou_vang_da_lat.png", price: 250000, description: 'Rượu sim đặc sản Đà Lạt, chai 500ml' },
    { id: 6, name: 'Socola Đà Lạt', icon: "image/socola_da_lat.png", price: 100000, description: 'Socola thủ công cao cấp, hộp 200g' },
    { id: 7, name: 'Mật Ong', icon: "image/mat_ong_da_lat.png", price: 300000, description: 'Mật ong rừng nguyên chất, chai 500ml' },
    { id: 8, name: 'Cà Phê Robusta', icon: "image/ca_phe_da_lat.png", price: 220000, description: 'Cà phê rang xay đặc biệt, 250g' },
    { id: 9, name: 'Khoai Lang Tím', icon: "image/khoai_lang_tim.png", price: 80000, description: 'Khoai lang tím tươi, 1kg' },
    { id: 10, name: 'Sữa Chua Dâu', icon: "image/sua_chua_dau.png", price: 50000, description: 'Sữa chua dâu tây Đà Lạt, hộp 4 ly' },
    { id: 11, name: 'Hạt Macca', icon: "image/hat_macca.png", price: 350000, description: 'Hạt macca rang muối, hộp 250g' },
    { id: 12, name: 'Trà Ô Long', icon: '🍵', price: 160000, description: 'Trà ô long Đà Lạt, hộp 100g' }
];

let cart = JSON.parse(localStorage.getItem('cart')) || [];
let appliedCoupon = null;
const coupons = {
    'DALAT2025': { discount: 50000, type: 'fixed', description: 'Giảm 50.000đ' },
    'GIAM10': { discount: 10, type: 'percent', description: 'Giảm 10%' },
    'GIAM20': { discount: 20, type: 'percent', description: 'Giảm 20%' },
    'FREESHIP': { discount: 30000, type: 'fixed', description: 'Giảm 30.000đ phí ship' },
    'WELCOME': { discount: 15, type: 'percent', description: 'Giảm 15%' },
    'SUMMER2025': { discount: 100000, type: 'fixed', description: 'Giảm 100.000đ' }
};

function calculateDiscount(total, coupon) {
    if (coupon.type === 'fixed') {
        return Math.min(coupon.discount, total);
    } else if (coupon.type === 'percent') {
        return Math.floor(total * coupon.discount / 100);
    }
    return 0;
}

function applyCoupon() {
    const couponInput = document.getElementById('couponInput');
    const couponCode = couponInput.value.trim().toUpperCase();

    if (!couponCode) {
        showCouponMessage('Vui lòng nhập mã giảm giá', 'error');
        return;
    }

    if (cart.length === 0) {
        showCouponMessage('Giỏ hàng trống!', 'error');
        return;
    }

    const coupon = coupons[couponCode];
    if (!coupon) {
        showCouponMessage('Mã giảm giá không hợp lệ!', 'error');
        return;
    }

    appliedCoupon = coupon;
    showCouponMessage(`Áp dụng thành công: ${coupon.description}`, 'success');
    updateCartUI();
    couponInput.value = '';
}

function showCouponMessage(message, type) {
    const couponMessage = document.getElementById('couponMessage');
    couponMessage.textContent = message;
    couponMessage.className = `coupon-message show ${type}`;
    setTimeout(() => couponMessage.classList.remove('show'), 3000);
}

function renderProducts() {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = products.map(product => 
        `<div class="product-card">
            <div class="product-image">
                <img src="${product.icon}" alt="product_image">    
            </div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-description">${product.description}</div>
                <div class="product-price">${product.price.toLocaleString()}đ</div>
                <button class="btn btn-primary" onclick="addToCart(${product.id})">
                    Thêm vào giỏ
                </button>
            </div>
        </div>`).join('');
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    existingItem ? existingItem.quantity++ : cart.push({ ...product, quantity: 1 });

    saveCart();
    updateCartUI();
    showToast('Đã thêm vào giỏ hàng!', 'success');
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    let totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    let discount = 0;
    if (appliedCoupon) {
        discount = calculateDiscount(totalPrice, appliedCoupon);
        totalPrice -= discount;
    }

    cartCount.textContent = totalItems;
    cartTotal.textContent = totalPrice.toLocaleString() + 'đ';

    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">Giỏ hàng trống</div>';
        return;
    }

    cartItems.innerHTML = cart.map(item => 
        `<div class="cart-item">
            <div class="cart-item-image">${item.icon}</div>
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${item.price.toLocaleString()}đ</div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    <span class="remove-item" onclick="removeItem(${item.id})">Xóa</span>
                </div>
            </div>
        </div>`).join('');
}

function updateQuantity(productId, change) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeItem(productId);
        } else {
            saveCart();
            updateCartUI();
        }
    }
}

function removeItem(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
    showToast('Đã xóa khỏi giỏ hàng', 'success');
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

document.getElementById('cartIcon').addEventListener('click', () => {
    document.getElementById('cartSidebar').classList.add('active');
});

document.getElementById('closeCart').addEventListener('click', () => {
    document.getElementById('cartSidebar').classList.remove('active');
});

document.getElementById('menuToggle').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('active');
});

document.getElementById('checkoutBtn').addEventListener('click', () => {
    if (cart.length === 0) {
        showToast('Giỏ hàng trống!', 'error');
        return;
    }

    const orderSummary = document.getElementById('orderSummary');
    const orderTotal = document.getElementById('orderTotal');
    const orderDiscount = document.getElementById('orderDiscount');

    let total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discount = 0;

    orderSummary.innerHTML = cart.map(item => `
        <div class="summary-item">
            <span>${item.name} x ${item.quantity}</span>
            <span>${(item.price * item.quantity).toLocaleString()}đ</span>
        </div>
    `).join('');

    if (appliedCoupon) {
        discount = calculateDiscount(total, appliedCoupon);
        orderDiscount.innerHTML = `
            <div class="summary-item discount-row">
                <span>Giảm giá (${appliedCoupon.description})</span>
                <span>-${discount.toLocaleString()}đ</span>
            </div>
        `;
        total -= discount;
    } else {
        orderDiscount.innerHTML = '';
    }

    orderTotal.textContent = total.toLocaleString() + 'đ';

    document.getElementById('checkoutModal').classList.add('active');
    document.getElementById('cartSidebar').classList.remove('active');
});

document.getElementById('applyCouponBtn').addEventListener('click', applyCoupon);
document.getElementById('couponInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        applyCoupon();
    }
});

document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('checkoutModal').classList.remove('active');
});

document.getElementById('checkoutForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const originalTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountValue = appliedCoupon ? calculateDiscount(originalTotal, appliedCoupon) : 0;

    const orderData = {
        customerName: document.getElementById('customerName').value,
        customerPhone: document.getElementById('customerPhone').value,
        customerEmail: document.getElementById('customerEmail').value,
        customerAddress: document.getElementById('customerAddress').value,
        paymentMethod: document.getElementById('paymentMethod').value,
        orderNote: document.getElementById('orderNote').value,
        items: cart,
        totalAmount: originalTotal - discountValue,
        discount: discountValue,
        couponApplied: appliedCoupon ? appliedCoupon.description : null,
        timestamp: new Date().toISOString(),
        status: 'Chờ xử lý',
    };

    const newOrderRef = database.ref('orders').push();
    newOrderRef.set(orderData)
        .then(() => {
            showToast('Đặt hàng thành công! Chúng tôi sẽ liên hệ với bạn sớm.', 'success');
            cart = [];
            saveCart();
            updateCartUI();
            document.getElementById('checkoutModal').classList.remove('active');
            document.getElementById('checkoutForm').reset();
            appliedCoupon = null;
        })
        .catch((error) => {
            console.error('Lỗi:', error);
            showToast('Có lỗi xảy ra. Vui lòng thử lại!', 'error');
        });
});

renderProducts();
updateCartUI();