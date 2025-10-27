document.addEventListener('DOMContentLoaded', () => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const btnLogin = document.getElementById('btnLogin');
    const btnLogout = document.getElementById('btnLogout');
    const userInfo = document.getElementById('userInfo');
    const userNameDisplay = document.getElementById('userNameDisplay');
    const authModal = document.getElementById('authModal');
    const closeAuthModal = document.getElementById('closeAuthModal');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authTitle = document.getElementById('authTitle');
    const toggleAuthText = document.getElementById('toggleAuthText');
    const bookingName = document.getElementById('booking-name');
    const bookingEmail = document.getElementById('booking-email');
    const bookingPhone = document.getElementById('booking-phone');
    const bookBtn = document.querySelector('.booking-form .btn');

    function updateUserUI() {
        if (loggedInUser) {
            btnLogin.style.display = 'none';
            userInfo.style.display = 'flex';
            userNameDisplay.textContent = loggedInUser.name;
        } else {
            btnLogin.style.display = 'inline-block';
            userInfo.style.display = 'none';
        }
    }
    updateUserUI();
    document.getElementById('souvenirLink').style.display = loggedInUser ? 'block' : 'none';
    document.getElementById('serviceLink').style.display = loggedInUser ? 'block' : 'none';
    
    const serviceModule = document.getElementById("services");
    if (serviceModule && !localStorage.getItem("loggedInUser")) {
        serviceModule.style.display = "none";
    }

    btnLogin.addEventListener('click', () => {
        authModal.classList.add('active');
        showLoginForm();
    });

    closeAuthModal.addEventListener('click', () => {
        authModal.classList.remove('active');
    });

    toggleAuthText.addEventListener('click', (e) => {
        if (e.target.id === 'toggleAuthLink') {
            e.preventDefault();
            if (loginForm.style.display === 'none') {
                showLoginForm();
            } else {
                showRegisterForm();
            }
        }
    });

    function showLoginForm() {
        loginForm.style.display = 'flex';
        registerForm.style.display = 'none';
        authTitle.textContent = 'Đăng nhập';
        toggleAuthText.innerHTML = `Chưa có tài khoản? <a href="#" id="toggleAuthLink">Đăng ký ngay</a>`;
    }

    function showRegisterForm() {
        loginForm.style.display = 'none';
        registerForm.style.display = 'flex';
        authTitle.textContent = 'Đăng ký';
        toggleAuthText.innerHTML = `Đã có tài khoản? <a href="#" id="toggleAuthLink">Đăng nhập</a>`;
    }

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value.trim();
        const phone = document.getElementById('registerPhone').value.trim();

        if (!name || !email || !password || !phone) {
            alert('Vui lòng điền đầy đủ thông tin!');
            return;
        }

        let users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.some(u => u.email === email)) {
            alert('Email này đã được đăng ký!');
            return;
        }

        users.push({ name, email, password, phone });
        localStorage.setItem('users', JSON.stringify(users));
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        
        registerForm.reset();
        showLoginForm();
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();

        if (!email || !password) {
            alert('Vui lòng điền đầy đủ thông tin!');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);
        
        if (!user) {
            alert('Email hoặc mật khẩu không đúng!');
            return;
        }

        localStorage.setItem('loggedInUser', JSON.stringify(user));
        alert('Đăng nhập thành công!');
        location.reload();
    });

    btnLogout.addEventListener('click', () => {
        if (confirm('Bạn có chắc muốn đăng xuất?')) {
            localStorage.removeItem('loggedInUser');
            location.reload();
        }
    });

    if (loggedInUser) {
        if (bookingName) {
            bookingName.value = loggedInUser.name;
            bookingName.readOnly = true;
            bookingName.disabled = true;
            bookingName.style.backgroundColor = '#f5f5f5';
            bookingName.style.cursor = 'not-allowed';
        }
        if (bookingEmail) {
            bookingEmail.value = loggedInUser.email;
            bookingEmail.readOnly = true;
            bookingEmail.disabled = true;
            bookingEmail.style.backgroundColor = '#f5f5f5';
            bookingEmail.style.cursor = 'not-allowed';
        }
        if (bookingPhone) {
            bookingPhone.value = loggedInUser.phone;
            bookingPhone.readOnly = true;
            bookingPhone.disabled = true;
            bookingPhone.style.backgroundColor = '#f5f5f5';
            bookingPhone.style.cursor = 'not-allowed';
        }
    }

    if (bookBtn) {
        bookBtn.addEventListener('click', (e) => {
            if (!loggedInUser) {
                e.preventDefault();
                alert('Vui lòng đăng nhập để đặt tour!');
                authModal.classList.add('active');
                showLoginForm();
            }
        });
    }

    const locationsSwiper = new Swiper('.locations-swiper', {
        slidesPerView: 1,
        spaceBetween: 20,
        loop: true,
        autoplay: {
            delay: 3500,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        breakpoints: {
            640: {
                slidesPerView: 2,
                spaceBetween: 20,
            },
            1024: {
                slidesPerView: 3,
                spaceBetween: 30,
            },
        },
    });

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

    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                }
            }
        });
    });

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    document.querySelectorAll('.fade-in-section, .location-card').forEach(el => {
        observer.observe(el);
    });
    
    // Modal functionality
    const modal = document.getElementById('location-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const openModalBtns = document.querySelectorAll('.open-modal-btn');

    const openModal = (title, img, description) => {
        document.getElementById('modal-title').textContent = title;
        const modalImg = document.getElementById('modal-img');
        modalImg.src = img;
        modalImg.alt = title; 
        document.getElementById('modal-description').textContent = description;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    openModalBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.location-card');
            const title = card.dataset.title;
            const img = card.dataset.img;
            const description = card.dataset.description;
            openModal(title, img, description);
        });
    });

    modalCloseBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Toast notification
    const toast = document.getElementById('toast-notification');
    const toastMessage = document.getElementById('toast-message');
    let toastTimeout;

    const showToast = (message, type = 'success') => {
        clearTimeout(toastTimeout);
        toast.className = 'toast'; 
        toast.classList.add('show', type);
        toastMessage.innerHTML = message;

        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 5000); 
    };

    // Pricing calculations
    const packagePrices = { 
        "Gói Tiết Kiệm": 200000, 
        "Gói Tiêu Chuẩn": 1250000, 
        "Gói Cao Cấp": 10000000 
    };
    
    const destinationPrices = { 
        "Hồ Xuân Hương": 50000, 
        "Thung Lũng Tình Yêu": 300000, 
        "Đồi Mộng Mơ": 250000, 
        "Vườn Hoa Thành Phố": 200000 
    };
    
    const vehiclePrices = { 
        "Xe đoàn": 20000, 
        "Xe riêng 4 chỗ": 800000, 
        "Xe riêng 7 chỗ": 1200000, 
        "Xe shuttle": 500000 
    };
    
    const roomPrices = { 
        "Phổ thông": 200000, 
        "Thương gia": 1000000, 
        "Tổng thống": 2000000 
    };

    function getSeasonDiscount(date) {
        if (!date) return { season: "Bình thường", discount: 0 };

        const month = new Date(date).getMonth() + 1;

        if (month >= 5 && month <= 9) return { season: "Mùa mưa", discount: 0.15 };
        else if (month === 12 || month === 1 || month === 2) return { season: "Mùa lễ hội", discount: -0.1 };
        else if (month >= 3 && month <= 4) return { season: "Mùa hoa nở", discount: -0.05 };
        else return { season: "Mùa cao điểm du lịch", discount: -0.1 };
    }

    const bookingForm = document.querySelector('.booking-form');
    const watch_before = document.getElementById("watch_before");
    const calculationResult = document.getElementById('calculation-result');
    
    if (bookingForm) {
        const packageSelect = bookingForm.querySelector('#booking-package');
        const destinationSelect = bookingForm.querySelector('#booking-destination');
        const vehicleSelect = bookingForm.querySelector('#booking-vehicle');
        const roomSelect = bookingForm.querySelector('#booking-room');
        const guestsInput = bookingForm.querySelector('#booking-guests');
        const dateInput = bookingForm.querySelector('#booking-date');
        const resultDisplay = document.getElementById('result-display');

        function updatePriceEstimate() {
            const tourPackage = packageSelect.value;
            const destination = destinationSelect.value;
            const vehicle = vehicleSelect.value;
            const room = roomSelect.value;
            const guests = parseInt(guestsInput.value) || 0;
            const date = dateInput.value;

            if (!tourPackage || !destination || !vehicle || !room || !guests || !date) return;
            
            const tourPrice = packagePrices[tourPackage] || 0;
            const totalTourPrice = tourPrice * guests;

            const originalDestinationPrice = destinationPrices[destination] || 0;
            const { season, discount } = getSeasonDiscount(date);
            const adjustedDestinationPrice = Math.round(originalDestinationPrice * (1 - discount));
            const totalDestinationPrice = adjustedDestinationPrice * guests;

            const totalVehiclePrice = vehiclePrices[vehicle] || 0;

            const roomPricePerNight = roomPrices[room] || 0;
            const numberOfRooms = Math.ceil(guests / 2);
            const totalRoomPrice = roomPricePerNight * numberOfRooms;

            const grandTotal = totalTourPrice + totalDestinationPrice + totalVehiclePrice + totalRoomPrice;

            let discountText = '';
            if (discount > 0) discountText = `<span style="color:#28a745;">Giảm ${discount * 100}% - ${season}</span>`;
            else if (discount < 0) discountText = `<span style="color:#dc3545;">Phụ thu ${Math.abs(discount * 100)}% - ${season}</span>`;
            else discountText = `<span>${season}</span>`;
            
            resultDisplay.innerHTML = `
                <div class="estimate-detail-section">
                    <h4>📋 Chi Tiết Đặt Dịch Vụ</h4>
                    <p><strong>Ngày:</strong> ${new Date(date).toLocaleDateString('vi-VN')}</p>
                    <p><strong>Số khách:</strong> ${guests} người</p>
                    <p><strong>Mùa:</strong> ${discountText}</p>
                </div>

                <div class="estimate-detail-section">
                    <h4>💰 Bảng Giá Chi Tiết</h4>
                    
                    <p class="estimate-price-item">
                        <strong>1. Gói Tour:</strong> ${tourPackage}<br>
                        <span style="margin-left: 20px;">→ ${tourPrice.toLocaleString()}đ/người × ${guests} = <strong>${totalTourPrice.toLocaleString()}đ</strong></span>
                    </p>

                    <p class="estimate-price-item">
                        <strong>2. Vé Địa Điểm:</strong> ${destination}<br>
                        <span style="margin-left: 20px;">→ Giá gốc: ${originalDestinationPrice.toLocaleString()}đ/người</span><br>
                        <span style="margin-left: 20px;">→ Giá sau ${discount !== 0 ? (discount > 0 ? 'giảm' : 'phụ thu') : ''}: ${adjustedDestinationPrice.toLocaleString()}đ/người</span><br>
                        <span style="margin-left: 20px;">→ ${adjustedDestinationPrice.toLocaleString()}đ × ${guests} = <strong>${totalDestinationPrice.toLocaleString()}đ</strong></span>
                    </p>

                    <p class="estimate-price-item">
                        <strong>3. Xe Di Chuyển:</strong> ${vehicle}<br>
                        <span style="margin-left: 20px;">→ <strong>${totalVehiclePrice.toLocaleString()}đ</strong> (trọn gói)</span>
                    </p>

                    <p class="estimate-price-item">
                        <strong>4. Phòng Khách Sạn:</strong> ${room}<br>
                        <span style="margin-left: 20px;">→ ${roomPricePerNight.toLocaleString()}đ/phòng/đêm × ${numberOfRooms} phòng = <strong>${totalRoomPrice.toLocaleString()}đ</strong></span><br>
                        <span style="margin-left: 20px; font-size: 0.9em; color: #666;">(Ước tính ${numberOfRooms} phòng cho ${guests} khách)</span>
                    </p>
                </div>

                <div class="estimate-total">
                    <h3 style="margin: 0; font-size: 1.2em; color: yellow;">🎯 TỔNG CHI PHÍ ƯỚC TÍNH</h3>
                    <p style="font-size: 2em; font-weight: bold; margin: 10px 0;">${grandTotal.toLocaleString()}đ</p>
                    <p style="margin: 0; font-size: 0.9em; opacity: 0.9;">Giá đã bao gồm tất cả dịch vụ đã chọn</p>
                </div>
            `;
        }

        packageSelect.addEventListener('change', updatePriceEstimate);
        destinationSelect.addEventListener('change', updatePriceEstimate);
        vehicleSelect.addEventListener('change', updatePriceEstimate);
        roomSelect.addEventListener('change', updatePriceEstimate);
        guestsInput.addEventListener('input', updatePriceEstimate);
        dateInput.addEventListener('change', updatePriceEstimate);
    }

    watch_before.addEventListener("click", ()=>{
        calculationResult.classList.add('visible');
        calculationResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();

        let isValid = true;
        let bookingData = {};
        const inputs = bookingForm.querySelectorAll('input[required], select[required]');

        inputs.forEach((input) => {
            if (!input.value.trim()) {
                isValid = false;
                input.style.borderColor = 'red';
            } else if (input.type === 'email' && !input.value.includes('@')) {
                isValid = false;
                input.style.borderColor = 'red';
            } else if (input.type === 'date' && new Date(input.value) < new Date().setHours(0, 0, 0, 0)) {
                isValid = false;
                input.style.borderColor = 'red';
            } else {
                input.style.borderColor = '#ccc';
                bookingData[input.id] = input.value;
            }
        });

        if (isValid) {
            bookingData.timestamp = new Date().toISOString();
            
            const newBookingRef = database.ref('bookings').push();
            newBookingRef.set(bookingData)
                .then(() => {
                    localStorage.setItem('latestBooking', JSON.stringify(bookingData));
                    showToast('✅ Yêu cầu đã được gửi và lưu thành công!<br>Chúng tôi sẽ liên hệ với bạn sớm.', 'success');
                    bookingForm.reset();
                })
                .catch((error) => {
                    console.error('Lỗi khi lưu vào Firebase:', error);
                    showToast('❌ Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau.', 'error');
                });
        } else {
            showToast('❌ Vui lòng điền đầy đủ và chính xác các thông tin được yêu cầu.', 'error');
        }
    });
});