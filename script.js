async function getProducts(page = 1) {
    const response = await fetch(`https://www.handrailindustries.com.au/products.json?page=${page}`);
    const data = await response.json();
    return data.products.map(product => ({
        name: product.title,
        price: `$${product.variants[0].price}`,
        image: product.images[0] ? product.images[0].src : 'https://via.placeholder.com/100'
    }));
}

const productsTable = document.getElementById('products-table').getElementsByTagName('tbody')[0];
const cartItems = document.getElementById('cart-items');
const totalPrice = document.getElementById('total-price');
const copyEmailButton = document.getElementById('copy-email');
const surnameInput = document.getElementById('surname');

async function renderProducts() {
    productsTable.innerHTML = ''; // Clear existing products
    const products = await getProducts(4); // Fetch products from page 4
    products.forEach(product => {
        const row = productsTable.insertRow();
        row.innerHTML = `
            <td><input type="checkbox" data-price="${product.price.replace('$', '')}" data-name="${product.name}"></td>
            <td><input type="number" value="1" min="1" class="quantity"></td>
            <td>${product.name}</td>
            <td><img src="${product.image}" alt="${product.name}"></td>
            <td>${product.price}</td>
        `;
    });
}

function updateCart() {
    let total = 0;
    cartItems.innerHTML = '';
    const checkboxes = document.querySelectorAll('#products-table input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => {
        const row = checkbox.closest('tr');
        const quantityInput = row.querySelector('.quantity');
        const quantity = parseInt(quantityInput.value);
        const price = parseFloat(checkbox.dataset.price);
        const name = checkbox.dataset.name;
        total += price * quantity;
        const cartItem = document.createElement('div');
        cartItem.classList.add('cart-item');
        cartItem.innerText = `${name} x ${quantity} - $${(price * quantity).toFixed(2)}`;
        cartItems.appendChild(cartItem);
    });
    totalPrice.innerText = `$${total.toFixed(2)}`;
}

function copyEmailToClipboard() {
    const surname = surnameInput.value;
    if (!surname) {
        alert('Please enter your surname.');
        return;
    }

    const checkboxes = document.querySelectorAll('#products-table input[type="checkbox"]:checked');
    if (checkboxes.length === 0) {
        alert('Please select at least one item.');
        return;
    }

    let emailBody = 'Selected Items:\n\n';
    checkboxes.forEach(checkbox => {
        const row = checkbox.closest('tr');
        const quantityInput = row.querySelector('.quantity');
        const quantity = parseInt(quantityInput.value);
        const name = checkbox.dataset.name;
        const price = checkbox.dataset.price;
        emailBody += `${name} x ${quantity} - $${(price * quantity).toFixed(2)}\n`;
    });
    emailBody += `
Total: ${totalPrice.innerText}`;

    navigator.clipboard.writeText(emailBody).then(() => {
        alert('Email content copied to clipboard!');
    }, () => {
        alert('Failed to copy email content to clipboard.');
    });
}

productsTable.addEventListener('change', updateCart);
productsTable.addEventListener('input', updateCart); // Listen for input changes on quantity fields
copyEmailButton.addEventListener('click', copyEmailToClipboard);

renderProducts();
