// Data Produk dari API DummyJSON
const apiURL = "https://dummyjson.com/products";
let products = [];
let filteredProducts = [];
let cart = [];
let categories = [];
let currentPage = 1;
let itemsPerPage = 5;
let currentCategory = 'all';

// Fetch API dan Error Handling
async function fetchProducts() {
    try {
        const response = await fetch(apiURL);
        if (!response.ok) {
            throw new Error('Gagal mengambil data produk');
        }
        const data = await response.json();
        products = data.products;
        filteredProducts = products;
        
        // Mengumpulkan kategori unik
        categories = [...new Set(products.map(product => product.category))];
        
        // Memperbarui opsi kategori
        updateCategoryOptions();
        
        displayProducts();
    } catch (error) {
        document.getElementById('product-list').innerHTML = `<p>${error.message}</p>`;
    }
}

// Fungsi untuk memperbarui opsi kategori
function updateCategoryOptions() {
    const categorySelect = document.getElementById('category');
    categorySelect.innerHTML = '<option value="all">Semua</option>';
    categories.forEach(category => {
        categorySelect.innerHTML += `<option value="${category}">${category}</option>`;
    });
}

// Tampilkan Produk di Halaman
function displayProducts() {
    const productContainer = document.getElementById('product-list');
    productContainer.innerHTML = "";
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    paginatedProducts.forEach(product => {
        const cartItem = cart.find(item => item.id === product.id);
        const quantity = cartItem ? cartItem.quantity : 0;
        productContainer.innerHTML += `
            <div class="product-item" data-id="${product.id}">
                <img src="${product.thumbnail}" alt="${product.title}">
                <div>
                    <h3>${product.title}</h3>
                    <p>${product.description}</p>
                    <p>Harga: Rp ${product.price}</p>
                    <p>Kategori: ${product.category}</p>
                    <div class="buy-controls">
                        <button class="buy-btn" onclick="addToCart(${product.id})" style="display: ${quantity === 0 ? 'inline-block' : 'none'}">Beli Sekarang</button>
                        <div class="quantity-control" style="display: ${quantity > 0 ? 'inline-flex' : 'none'}">
                            <button class="decrease-btn" onclick="decreaseQuantity(${product.id})">-</button>
                            <span class="quantity">${quantity}</span>
                            <button class="increase-btn" onclick="increaseQuantity(${product.id})">+</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    updatePagination();
}

// Fungsi untuk memperbarui pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';
    
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.classList.add('page-btn');
        if (i === currentPage) {
            pageButton.classList.add('active');
        }
        pageButton.addEventListener('click', () => changePage(i));
        paginationContainer.appendChild(pageButton);
    }
}

// Fungsi untuk mengganti halaman
function changePage(page) {
    currentPage = page;
    displayProducts();
}

// Filter Produk Berdasarkan Kategori
function filterProducts(category) {
    currentCategory = category;
    currentPage = 1; // Reset ke halaman pertama saat memfilter
    if (category === 'all') {
        filteredProducts = products;
    } else {
        filteredProducts = products.filter(product => product.category === category);
    }
    displayProducts();
}

// Tambah Item ke Keranjang
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const cartItem = cart.find(item => item.id === productId);

    if (cartItem) {
        cartItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateProductQuantity(productId, cartItem ? cartItem.quantity : 1);
    updateCart();
}

// Hapus Item dari Keranjang
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateProductQuantity(productId, 0);
    updateCart();
}

// Update Keranjang Belanja
function updateCart() {
    const cartContainer = document.getElementById('cart-items');
    const totalItems = document.getElementById('total-items');
    const totalPrice = document.getElementById('total-price');
    cartContainer.innerHTML = "";
    
    let totalQuantity = 0;
    let totalCost = 0;
    
    cart.forEach(item => {
        totalQuantity += item.quantity;
        totalCost += item.price * item.quantity;
        
        cartContainer.innerHTML += `
            <div>
                <p>${item.title} (${item.quantity}) - Rp ${item.price * item.quantity}</p>
                <button onclick="removeFromCart(${item.id})">Hapus</button>
            </div>
        `;
    });

    totalItems.textContent = totalQuantity;
    totalPrice.textContent = totalCost;
    saveCartToLocalStorage();
}

// Simpan Cart di Local Storage
function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Muat Cart dari Local Storage
function loadCartFromLocalStorage() {
    const savedCart = JSON.parse(localStorage.getItem('cart'));
    if (savedCart) {
        cart = savedCart;
        updateCart();
    }
}

// Fungsi untuk mengupdate kuantitas produk
function updateProductQuantity(productId, quantity) {
    const productElement = document.querySelector(`.product-item[data-id="${productId}"]`);
    if (productElement) {
        const quantityControl = productElement.querySelector('.quantity-control');
        const quantitySpan = quantityControl.querySelector('.quantity');
        const buyButton = productElement.querySelector('.buy-btn');

        if (quantity > 0) {
            quantityControl.style.display = 'inline-flex';
            buyButton.style.display = 'none';
            quantitySpan.textContent = quantity;
        } else {
            quantityControl.style.display = 'none';
            buyButton.style.display = 'inline-block';
        }
    }
}

// Fungsi untuk menambah kuantitas
function increaseQuantity(productId) {
    const cartItem = cart.find(item => item.id === productId);
    if (cartItem) {
        cartItem.quantity += 1;
        updateProductQuantity(productId, cartItem.quantity);
        updateCart();
    }
}

// Fungsi untuk mengurangi kuantitas
function decreaseQuantity(productId) {
    const cartItem = cart.find(item => item.id === productId);
    if (cartItem && cartItem.quantity > 0) {
        cartItem.quantity -= 1;
        updateProductQuantity(productId, cartItem.quantity);
        if (cartItem.quantity === 0) {
            removeFromCart(productId);
        } else {
            updateCart();
        }
    }
}

// Event Listener untuk Filter dan Jumlah Item
document.getElementById('category').addEventListener('change', (e) => {
    filterProducts(e.target.value);
});

document.getElementById('items-per-page').addEventListener('change', (e) => {
    itemsPerPage = parseInt(e.target.value);
    currentPage = 1; // Reset ke halaman pertama saat mengubah jumlah item per halaman
    displayProducts();
});

// Fetch dan Tampilkan Produk saat halaman dimuat
fetchProducts();
loadCartFromLocalStorage();