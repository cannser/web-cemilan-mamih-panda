// =========================================
// 1. DATA PRODUK 
// =========================================

// Data Default (Akan dipakai jika belum ada data di memori browser)
const defaultProducts = {
    'basreng': { 
        name: 'Basreng Pedas', 
        price: 17500, 
        stock: 50, 
        img: 'basreng.png', 
        desc: 'Basreng yang digoreng garing dengan bumbu rempah pilihan mamih panda.'
    },
    'baso-goreng': { 
        name: 'Baso Goreng', 
        price: 18000, 
        stock: 30,
        img: 'baso.png', 
        desc: 'Baso goreng mekar dengan rasa ikan tenggiri yang kuat.'
    },
    'sebring': { 
        name: 'Sebring Kerupuk', 
        price: 16000, 
        stock: 45,
        img: 'sembring.png', 
        desc: 'Kerupuk mawar bantet dengan sensasi kruncy unik dan bumbu cikruh.'
    },
    'lumpia': { 
        name: 'Lumpia Lipat', 
        price: 17000, 
        stock: 20,
        img: 'lumpia.png', 
        desc: 'Kulit lumpia goreng kering ditaburi bumbu pedas manis.'
    },
    'makaroni': { 
        name: 'Makaroni Bantet', 
        price: 17500, 
        stock: 100,
        img: 'makaroni.png', 
        desc: 'Makaroni bantet dengan bumbu melimpah ruah.'
    }
};

// Cek LocalStorage: Kalau ada data simpanan pakai itu, kalau tidak pakai default
let productsData = JSON.parse(localStorage.getItem('pandaProducts')) || defaultProducts;

// Fungsi Simpan Produk ke Browser
function saveProductsToLocal() {
    localStorage.setItem('pandaProducts', JSON.stringify(productsData));
}

// Ambil data keranjang & Pesanan
let cart = JSON.parse(localStorage.getItem('pandaCart')) || [];
let orders = JSON.parse(localStorage.getItem('pandaOrders')) || []; // PENTING: Untuk Data Pesanan Admin

// =========================================
// 2. HELPER FUNCTIONS
// =========================================

function formatRupiah(num) {
    return 'Rp ' + parseInt(num).toLocaleString('id-ID');
}

function updateCartCount() {
    const badge = document.querySelector('.cart-badge');
    if(badge) badge.innerText = cart.length;
}

function saveCart() {
    localStorage.setItem('pandaCart', JSON.stringify(cart));
    updateCartCount();
}

// Fungsi Simpan Pesanan ke Browser (Agar Admin bisa baca)
function saveOrders() {
    localStorage.setItem('pandaOrders', JSON.stringify(orders));
}

// =========================================
// 3. LOGIKA ADMIN PANEL
// =========================================

// Fungsi Ganti Tab Halaman di Admin
function showAdminPage(pageId) {
    // Sembunyikan semua halaman admin
    document.querySelectorAll('.admin-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    
    // Munculkan halaman yang dipilih
    const targetSection = document.getElementById(pageId);
    const targetNav = document.getElementById('nav-' + pageId);
    
    if(targetSection) targetSection.classList.add('active');
    if(targetNav) targetNav.classList.add('active');

    // Jika membuka halaman pesanan, render ulang tabelnya
    if(pageId === 'pesanan') {
        renderOrderTable();
    }
}

// Render Tabel Stok
function renderStockTable() {
    const tbody = document.getElementById('stock-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    for (let key in productsData) {
        let item = productsData[key];
        tbody.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>${formatRupiah(item.price)}</td>
                <td style="font-weight:bold; color: ${item.stock < 10 ? 'red' : 'green'}">
                    ${item.stock} Pcs
                </td>
                <td>
                    <button class="btn btn-primary" onclick="openEditModal('${key}')" style="padding:5px 10px; font-size:0.8rem;">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </td>
            </tr>
        `;
    }
}

// Render Tabel Pesanan (Agar muncul di Admin)
function renderOrderTable() {
    const tbody = document.getElementById('order-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Belum ada pesanan masuk.</td></tr>';
        return;
    }

    // Loop pesanan (dari yang terbaru)
    orders.slice().reverse().forEach(order => {
        // Format list barang menjadi string
        let itemsList = order.items.map(item => `${item.name} (${item.berat}) x${item.qty}`).join('<br>');

        tbody.innerHTML += `
            <tr>
                <td><strong>${order.id}</strong><br><small>${order.date}</small></td>
                <td>${order.customer}</td>
                <td style="font-size:0.85rem; color:#555;">${itemsList}</td>
                <td style="font-weight:bold; color:var(--primary);">${order.total}</td>
                <td>
                    <span style="background:${order.status === 'Lunas' ? '#27ae60' : '#f39c12'}; color:white; padding:3px 8px; border-radius:4px; font-size:0.8rem;">
                        ${order.status}
                    </span>
                </td>
            </tr>
        `;
    });
}

function openEditModal(productId) {
    const product = productsData[productId];
    const modal = document.getElementById('editModal');
    if(modal) {
        modal.style.display = 'block';
        document.getElementById('edit-id').value = productId;
        document.getElementById('edit-name').value = product.name;
        document.getElementById('edit-price').value = product.price;
        document.getElementById('edit-stock').value = product.stock;
    }
}

function closeEditModal() {
    const modal = document.getElementById('editModal');
    if(modal) modal.style.display = 'none';
}

function saveProductChanges() {
    const id = document.getElementById('edit-id').value;
    const newPrice = parseInt(document.getElementById('edit-price').value);
    const newStock = parseInt(document.getElementById('edit-stock').value);

    productsData[id].price = newPrice;
    productsData[id].stock = newStock;

    saveProductsToLocal();
    renderStockTable();
    closeEditModal();
    alert('Data Berhasil Diupdate!');
}

// =========================================
// 4. LOGIKA DETAIL PRODUK
// =========================================

function getProductIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function renderDetailPage() {
    const productId = getProductIdFromUrl();
    const product = productsData[productId];
    const nameEl = document.getElementById('detail-name');
    
    if (!nameEl) return; 

    if (product) {
        document.getElementById('detail-name').innerText = product.name;
        document.getElementById('detail-desc').innerText = product.desc;
        document.getElementById('detail-img').src = product.img;
        
        // Hapus info stok lama agar tidak duplikat
        const oldStok = nameEl.nextElementSibling;
        if(oldStok && oldStok.tagName === 'SPAN') oldStok.remove();

        const stokInfo = product.stock > 0 
            ? `<span style="color:green; font-weight:bold; display:block; margin-top:5px;"><i class="fas fa-check-circle"></i> Stok: ${product.stock}</span>`
            : `<span style="color:red; font-weight:bold; display:block; margin-top:5px;"><i class="fas fa-times-circle"></i> Stok Habis</span>`;
            
        nameEl.insertAdjacentHTML('afterend', stokInfo);

        const basePrice = product.price;
        const beratSelect = document.getElementById('berat');
        
        beratSelect.innerHTML = `
            <option value="250gr">250gr (${formatRupiah(basePrice)})</option>
            <option value="500gr">500gr (${formatRupiah(basePrice * 2)})</option>
            <option value="1kg">1kg (${formatRupiah(basePrice * 4)})</option>
        `;
        
        document.getElementById('detail-price').innerText = `${formatRupiah(basePrice)} - ${formatRupiah(basePrice * 4)}`;

        if(product.stock <= 0) {
            document.querySelector('.action-buttons').innerHTML = `<button class="btn btn-primary" disabled style="width:100%; background:grey;">Stok Habis</button>`;
        }
    } else {
        document.querySelector('.detail-container').innerHTML = '<h2 class="text-center">Produk tidak ditemukan :(</h2>';
    }
}

function updateQty(change) {
    const display = document.getElementById('qty-display');
    if (!display) return;
    let val = parseInt(display.innerText);
    val += change;
    if (val < 1) val = 1;
    display.innerText = val;
}

function addToCartFromDetail() {
    const productId = getProductIdFromUrl();
    const product = productsData[productId];
    if(!product) return;

    const qty = parseInt(document.getElementById('qty-display').innerText);
    if (qty > product.stock) {
        alert(`Stok tidak cukup! Tersisa hanya ${product.stock} pcs.`);
        return;
    }

    const beratEl = document.getElementById('berat');
    const beratValue = beratEl.value; 
    let finalPrice = product.price;
    if(beratValue === '500gr') finalPrice = product.price * 2;
    if(beratValue === '1kg') finalPrice = product.price * 4;

    const cartItem = {
        id: new Date().getTime(),
        productId: productId,
        name: product.name,
        price: finalPrice,
        img: product.img,
        qty: qty,
        rasa: document.getElementById('rasa').value,
        berat: beratValue
    };

    cart.push(cartItem);
    saveCart();
    alert(`Berhasil menambahkan ${product.name} ke keranjang!`);
}

function buyNow() {
    const productId = getProductIdFromUrl();
    const product = productsData[productId];
    const qty = parseInt(document.getElementById('qty-display').innerText);
    if(qty > product.stock) {
        alert("Stok tidak mencukupi!");
    } else {
        addToCartFromDetail();
        window.location.href = 'keranjang.html';
    }
}

// =========================================
// 5. KERANJANG, CHECKOUT & PESANAN
// =========================================

function renderCartPage() {
    const container = document.getElementById('cart-items-container');
    const totalEl = document.getElementById('cart-total');
    if(!container) return; 

    container.innerHTML = '';
    let total = 0;

    if(cart.length === 0) {
        container.innerHTML = `<div class="card" style="text-align:center; padding:30px;">Keranjang kosong.<br><a href="index.html" style="color:var(--primary); font-weight:bold;">Belanja Sekarang</a></div>`;
    } else {
        cart.forEach((item, index) => {
            total += item.price * item.qty;
            container.innerHTML += `
                <div class="card" style="display: flex; padding: 15px; margin-bottom: 15px; align-items: center; gap: 20px;">
                    <img src="${item.img}" style="width: 80px; height: 80px; border-radius: 8px; object-fit: cover;">
                    <div style="flex: 1;">
                        <h4 style="margin: 0;">${item.name}</h4>
                        <small style="color: #666;">${item.rasa} | ${item.berat}</small>
                        <p class="price" style="margin: 5px 0; color: var(--primary); font-weight: bold;">${formatRupiah(item.price)}</p>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <button class="qty-btn-sm" onclick="changeCartQty(${index}, -1)">-</button>
                        <span style="font-weight:bold; width: 20px; text-align:center;">${item.qty}</span>
                        <button class="qty-btn-sm" onclick="changeCartQty(${index}, 1)">+</button>
                    </div>
                    <button onclick="removeFromCart(${index})" style="background: none; border: none; color: red; cursor: pointer; font-size: 1.2rem; margin-left: 10px;">&times;</button>
                </div>
            `;
        });
    }
    if(totalEl) totalEl.innerText = formatRupiah(total);
}

function changeCartQty(index, change) {
    if (cart[index].qty + change >= 1) {
        cart[index].qty += change;
        saveCart();
        renderCartPage();
    }
}

function removeFromCart(index) {
    if(confirm("Hapus item ini?")) {
        cart.splice(index, 1);
        saveCart();
        renderCartPage();
    }
}

function renderCheckoutPage() {
    const container = document.getElementById('checkout-items');
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('grand-total');
    const kodeUnikEl = document.getElementById('kode-unik');
    
    if(!container) return;

    let subtotal = 0;
    container.innerHTML = '';

    cart.forEach(item => {
        subtotal += item.price * item.qty;
        container.innerHTML += `
            <div class="checkout-summary-item">
                <img src="${item.img}" class="checkout-thumb">
                <div style="flex:1">
                    <div style="font-size:0.9rem; font-weight:600;">${item.name}</div>
                    <small>${item.rasa}, ${item.berat} x${item.qty}</small>
                </div>
                <div style="font-weight:bold; color:var(--primary);">${formatRupiah(item.price * item.qty)}</div>
            </div>
        `;
    });

    const shipping = 10000; 
    const kodeUnik = Math.floor(Math.random() * 99) + 1; 
    const grandTotal = subtotal + shipping + kodeUnik;

    if(subtotalEl) subtotalEl.innerText = formatRupiah(subtotal);
    if(kodeUnikEl) kodeUnikEl.innerText = kodeUnik;
    if(totalEl) totalEl.innerText = formatRupiah(grandTotal);
}

// =========================================
// 6. LOGIKA SUBMIT PESANAN (CORE FEATURE)
// =========================================
function handleCheckout(e) {
    e.preventDefault();
    if(cart.length === 0) {
        alert("Keranjang kosong!");
        return;
    }
    
    // Ambil Data dari Form Checkout
    const custName = document.getElementById('cust-name').value;
    const grandTotal = document.getElementById('grand-total').innerText;

    // Buat Objek Pesanan Baru
    const newOrder = {
        id: '#ORD-' + new Date().getTime().toString().slice(-6), // ID acak sederhana
        date: new Date().toLocaleDateString('id-ID'),
        customer: custName,
        items: cart, // Simpan isi keranjang agar bisa dilihat admin
        total: grandTotal,
        status: 'Pending'
    };

    // Simpan ke Array Orders & LocalStorage
    orders.push(newOrder);
    saveOrders();

    // Kurangi Stok Produk Otomatis
    cart.forEach(cartItem => {
         if(productsData[cartItem.productId]) {
             productsData[cartItem.productId].stock -= cartItem.qty;
         }
    });
    saveProductsToLocal();

    alert("Pesanan Berhasil Dibuat! \nData sudah masuk ke Admin Panel.");
    
    // Kosongkan Keranjang & Redirect
    cart = [];
    saveCart();
    window.location.href = 'index.html';
}

function handleLogin(e) {
    e.preventDefault();
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    if(u === 'admin' && p === 'admin123') {
        alert("Login Berhasil!");
        window.location.href = 'admin.html';
    } else {
        alert('Username atau password salah!');
    }
}

// =========================================
// 7. MAIN INIT (Jalankan saat load)
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    renderDetailPage();
    renderCartPage();
    renderCheckoutPage();
    
    // Cek apakah di halaman admin (ada tabel stok)
    if(document.getElementById('stock-table')) {
        renderStockTable();
    }
    // Cek apakah di halaman admin (ada tabel pesanan)
    if(document.getElementById('order-table-body')) {
        renderOrderTable();
    }
});