const menuItems = [
    {
        name: "Burger",
        category: "Fast Food",
        price: 35,
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80"
    },
    {
        name: "Samosa",
        category: "Fast Food",
        price: 15,
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80"
    },
    {
        name: "Noodles",
        category: "Chinese",
        price: 50,
        image: "https://upload.wikimedia.org/wikipedia/commons/1/13/A_bowl_of_Spring_noodles_soup.jpg"
    },
    {
        name: "Hot Dog",
        category: "Fast Food",
        price: 35,
        image: "https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=900&q=80"
    },
    {
        name: "French Fries",
        category: "Chinese/Fast Food",
        price: 30,
        image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80"
    },
    {
        name: "Aloo Sandwich",
        category: "Sandwich",
        price: 30,
        image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80"
    },
    {
        name: "Corn Sandwich",
        category: "Sandwich",
        price: 40,
        image: "https://upload.wikimedia.org/wikipedia/commons/4/48/Toasted_ham_sandwich.jpg"
    },
    {
        name: "Cheese Sandwich",
        category: "Sandwich",
        price: 45,
        image: "https://images.unsplash.com/photo-1528736235302-52922df5c122?auto=format&fit=crop&w=900&q=80"
    },
    {
        name: "Cold Coffee",
        category: "Cold Beverage",
        price: 40,
        image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=900&q=80"
    },
    {
        name: "Diet Coke",
        category: "Cold Beverage",
        price: 30,
        image: "https://upload.wikimedia.org/wikipedia/commons/3/3c/Diet-Coke-Can.jpg"
    },
    {
        name: "Steam Momos (6pc)",
        category: "Chinese",
        price: 40,
        image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=900&q=80"
    },
    {
        name: "Spring Roll",
        category: "Rolls",
        price: 60,
        image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=900&q=80"
    }
];

const menuGrid = document.getElementById("menuGrid");
const selectedItem = document.getElementById("selectedItem");
const quantity = document.getElementById("quantity");
const billBox = document.getElementById("billBox");
const orderForm = document.getElementById("orderForm");
const addToCartBtn = document.getElementById("addToCartBtn");
const successMsg = document.getElementById("successMsg");
const cartList = document.getElementById("cartList");
const ordersList = document.getElementById("ordersList");

const cartStorageKey = "smartCanteenCart";
let cart = [];

const fallbackImage =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' width='900' height='600'>" +
        "<rect width='100%' height='100%' fill='#e5e7eb'/>" +
        "<text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' " +
        "font-family='Segoe UI, sans-serif' font-size='42' fill='#374151'>Food Image</text>" +
        "</svg>"
    );

function getItemPriceByName(name) {
    const found = menuItems.find((item) => item.name === name);
    return found ? found.price : 0;
}

function loadCart() {
    return JSON.parse(localStorage.getItem(cartStorageKey) || "[]");
}

function saveCart() {
    localStorage.setItem(cartStorageKey, JSON.stringify(cart));
}

function renderMenu() {
    if (!menuGrid || !selectedItem) {
        return;
    }

    menuGrid.innerHTML = "";
    selectedItem.innerHTML = '<option value="">Select from menu cards</option>';

    menuItems.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.name;
        option.textContent = `${item.name} - Rs ${item.price}`;
        option.dataset.price = String(item.price);
        selectedItem.appendChild(option);

        const card = document.createElement("article");
        card.className = "menu-card";
        card.innerHTML = `
            <img src="${item.image}" alt="${item.name}" onerror="this.onerror=null;this.src='${fallbackImage}'">
            <div class="menu-body">
                <h3>${item.name}</h3>
                <div class="menu-meta">
                    <span class="menu-cat">${item.category}</span>
                    <span class="menu-price">Rs ${item.price}</span>
                </div>
                <button type="button" class="pick-btn">Add to Cart</button>
            </div>
        `;

        const pickButton = card.querySelector(".pick-btn");
        pickButton.addEventListener("click", () => {
            selectedItem.value = item.name;
            addCurrentSelectionToCart();
        });

        menuGrid.appendChild(card);
    });
}

function calculateDraftTotal() {
    if (!selectedItem || !quantity) {
        return 0;
    }
    const selectedOption = selectedItem.options[selectedItem.selectedIndex];
    const price = Number(selectedOption?.dataset?.price || 0);
    const qty = Math.max(Number(quantity.value) || 1, 1);
    return price * qty;
}

function updateBill() {
    if (!billBox) {
        return;
    }
    const cartTotal = cart.reduce((sum, entry) => sum + entry.subtotal, 0);
    const draftTotal = calculateDraftTotal();
    billBox.textContent = `Cart Total: Rs ${cartTotal} | Current Selection: Rs ${draftTotal}`;
}

function renderCart() {
    if (!cartList) {
        return;
    }

    cartList.innerHTML = "";

    if (cart.length === 0) {
        cartList.innerHTML = "<li>No items added yet.</li>";
        updateBill();
        saveCart();
        return;
    }

    cart.forEach((entry, index) => {
        const li = document.createElement("li");
        li.className = "cart-item";
        li.innerHTML = `
            <span>${entry.name} x ${entry.qty} = Rs ${entry.subtotal}</span>
            <button type="button" class="remove-btn" data-index="${index}">Remove</button>
        `;
        cartList.appendChild(li);
    });

    cartList.querySelectorAll(".remove-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const index = Number(btn.dataset.index);
            cart.splice(index, 1);
            renderCart();
        });
    });

    updateBill();
    saveCart();
}

function addCurrentSelectionToCart() {
    if (!selectedItem || !quantity) {
        return;
    }
    const itemName = selectedItem.value;
    const qty = Math.max(Number(quantity.value) || 1, 1);

    if (!itemName) {
        if (successMsg) {
            successMsg.textContent = "Select an item before adding to cart.";
        }
        return;
    }

    const price = getItemPriceByName(itemName);
    const existing = cart.find((entry) => entry.name === itemName);

    if (existing) {
        existing.qty += qty;
        existing.subtotal = existing.qty * existing.price;
    } else {
        cart.push({
            name: itemName,
            price,
            qty,
            subtotal: price * qty
        });
    }

    renderCart();
    if (successMsg) {
        successMsg.textContent = `${itemName} added to cart.`;
    }
    quantity.value = "1";
    updateBill();
}

function getOrders() {
    return JSON.parse(localStorage.getItem("smartCanteenOrders") || "[]");
}

function saveOrders(orders) {
    localStorage.setItem("smartCanteenOrders", JSON.stringify(orders));
}

function renderOrders() {
    if (!ordersList) {
        return;
    }
    const orders = getOrders();
    ordersList.innerHTML = "";

    if (orders.length === 0) {
        ordersList.innerHTML = "<li>No orders yet. Place your first pre-order.</li>";
        return;
    }

    orders.slice(-6).reverse().forEach((order) => {
        const li = document.createElement("li");

        if (Array.isArray(order.items)) {
            const itemsSummary = order.items.map((item) => `${item.name} x ${item.qty}`).join(", ");
            li.textContent = `${order.token} | ${order.student} (${order.enrollment}) | ${itemsSummary} | Pickup ${order.pickupTime} at canteen counter | Rs ${order.total}`;
        } else {
            li.textContent = `${order.token} | ${order.student} (${order.enrollment}) | ${order.item} x ${order.qty} | Pickup ${order.pickupTime} at canteen counter | Rs ${order.total}`;
        }

        ordersList.appendChild(li);
    });
}

cart = loadCart();

if (selectedItem) {
    selectedItem.addEventListener("change", updateBill);
}
if (quantity) {
    quantity.addEventListener("input", updateBill);
}
if (addToCartBtn) {
    addToCartBtn.addEventListener("click", addCurrentSelectionToCart);
}

if (orderForm) {
    orderForm.addEventListener("submit", (event) => {
        event.preventDefault();

        if (cart.length === 0) {
            if (successMsg) {
                successMsg.textContent = "Add at least one item to cart before confirming order.";
            }
            return;
        }

        const student = document.getElementById("studentName").value.trim();
        const enrollment = document.getElementById("enrollment").value.trim();
        const pickupTime = document.getElementById("pickupTime").value;
        if (!pickupTime) {
            if (successMsg) {
                successMsg.textContent = "Please select a pickup slot.";
            }
            return;
        }

        const total = cart.reduce((sum, entry) => sum + entry.subtotal, 0);
        const token = `PUC-${Math.floor(Math.random() * 900 + 100)}`;

        const newOrder = {
            token,
            student,
            enrollment,
            items: cart,
            pickupTime,
            notes: document.getElementById("notes").value.trim(),
            total,
            createdAt: new Date().toISOString()
        };

        const orders = getOrders();
        orders.push(newOrder);
        saveOrders(orders);
        renderOrders();

        if (successMsg) {
            successMsg.textContent = `Order confirmed. Token ${token}. Collect from Smart Canteen Counter at ${pickupTime}.`;
        }

        orderForm.reset();
        const pickupPoint = document.getElementById("pickupPoint");
        if (pickupPoint) {
            pickupPoint.value = "Smart Canteen Counter";
        }
        if (quantity) {
            quantity.value = "1";
        }
        cart = [];
        renderCart();
    });
}

renderMenu();
renderCart();
renderOrders();
