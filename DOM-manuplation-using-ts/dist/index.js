"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// main.ts
document.addEventListener("DOMContentLoaded", () => {
    const productCards = Array.from(document.querySelectorAll(".product-card"));
    const cartList = document.querySelector(".cart-list");
    const cartTitle = document.querySelector(".cart h2");
    const cartTotalH3 = document.querySelector(".cart-total h3");
    const confirmBtn = document.querySelector(".confirm-btn");
    if (!cartList || !cartTitle || !cartTotalH3 || !confirmBtn) {
        console.error("Cart region not found. Ensure your HTML contains `.cart-list`, `.cart h2`, `.cart-total h3`, and `.confirm-btn`.");
        return;
    }
    const products = productCards.map((card, i) => {
        var _a, _b, _c, _d, _e;
        const name = (_c = (_b = (_a = card.querySelector(".product-name")) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim()) !== null && _c !== void 0 ? _c : `Product ${i + 1}`;
        const priceText = (_e = (_d = card.querySelector(".product-price")) === null || _d === void 0 ? void 0 : _d.textContent) !== null && _e !== void 0 ? _e : "$0";
        const price = parseFloat(priceText.replace(/[^0-9.]/g, "")) || 0;
        return { id: i + 1, name, price, quantity: 0, card };
    });
    // attach or create add-button handlers
    function attachAddHandler(btn, product) {
        btn.addEventListener("click", () => {
            if (product.quantity === 0) {
                product.quantity = 1;
                replaceWithQuantityControl(product);
                updateCart();
            }
        });
    }
    products.forEach((p) => {
        const addBtn = p.card.querySelector(".add-btn");
        if (addBtn)
            attachAddHandler(addBtn, p);
        else {
            const btn = document.createElement("button");
            btn.className = "add-btn";
            btn.textContent = "Add to Cart";
            p.card.appendChild(btn);
            attachAddHandler(btn, p);
        }
    });
    function replaceWithQuantityControl(product) {
        const card = product.card;
        const existing = card.querySelector(".add-btn");
        if (existing)
            existing.remove();
        const control = document.createElement("div");
        control.className = "quantity-control";
        control.innerHTML = `
        <button class="minus" aria-label="decrease">−</button>
        <span class="qty">${product.quantity}</span>
        <button class="plus" aria-label="increase">+</button>
      `;
        card.appendChild(control);
        const minus = control.querySelector(".minus");
        const plus = control.querySelector(".plus");
        const spanQty = control.querySelector(".qty");
        plus.addEventListener("click", () => {
            product.quantity++;
            spanQty.textContent = String(product.quantity);
            updateCart();
        });
        minus.addEventListener("click", () => {
            if (product.quantity > 1) {
                product.quantity--;
                spanQty.textContent = String(product.quantity);
                updateCart();
            }
            else {
                // remove item
                product.quantity = 0;
                control.remove();
                restoreAddButton(product);
                updateCart();
            }
        });
    }
    function restoreAddButton(product) {
        const card = product.card;
        if (card.querySelector(".add-btn"))
            return;
        const btn = document.createElement("button");
        btn.className = "add-btn";
        btn.textContent = "Add to Cart";
        card.appendChild(btn);
        attachAddHandler(btn, product);
    }
    function updateCart() {
        if (cartList) {
            cartList.innerHTML = "";
        }
        const items = products.filter((p) => p.quantity > 0);
        let total = 0;
        items.forEach((item) => {
            const li = document.createElement("li");
            li.className = "cart-item";
            const left = document.createElement("span");
            left.className = "setit";
            left.textContent = `${item.quantity}x`;
            const right = document.createElement("span");
            right.className = "mony";
            right.textContent = `@ $${item.price.toFixed(2)} $${(item.price * item.quantity).toFixed(2)}`;
            const removeBtn = document.createElement("button");
            removeBtn.type = "button";
            removeBtn.className = "remove-item";
            removeBtn.title = "Remove";
            removeBtn.textContent = "✖";
            removeBtn.addEventListener("click", () => {
                item.quantity = 0;
                const control = item.card.querySelector(".quantity-control");
                if (control)
                    control.remove();
                restoreAddButton(item);
                updateCart();
            });
            li.appendChild(left);
            li.appendChild(right);
            li.appendChild(removeBtn);
            if (cartList) {
                cartList.appendChild(li);
            }
            total += item.quantity * item.price;
        });
        // show total number of units in parentheses (sum of quantities)
        const totalUnits = items.reduce((acc, it) => acc + it.quantity, 0);
        if (cartTitle) {
            cartTitle.textContent = `Your Cart (${totalUnits})`;
        }
        if (cartTotalH3) {
            cartTotalH3.textContent = `$${total.toFixed(2)}`;
        }
    }
    confirmBtn.addEventListener("click", () => {
        const items = products.filter((p) => p.quantity > 0);
        if (items.length === 0)
            return;
        showOrderPopup(items);
    });
    function showOrderPopup(items) {
        var _a, _b;
        const existing = document.querySelector(".order-popup");
        if (existing)
            existing.remove();
        const overlay = document.createElement("div");
        overlay.className = "order-popup";
        overlay.innerHTML = `
        <div class="popup-content">
          <button class="close" aria-label="close">✖</button>
          <div class="icon">✅</div>
          <h2>Order Confirmed</h2>
          <p>We hope you enjoy your food!</p>
          <div class="order-list"></div>
          <div class="order-total"></div>
          <button class="start-new">Start New Order</button>
        </div>
      `;
        document.body.appendChild(overlay);
        const orderList = overlay.querySelector(".order-list");
        let total = 0;
        items.forEach((it) => {
            const row = document.createElement("div");
            row.className = "order-row";
            row.textContent = `${it.name} — ${it.quantity}x @ $${it.price.toFixed(2)} = $${(it.price * it.quantity).toFixed(2)}`;
            orderList.appendChild(row);
            total += it.price * it.quantity;
        });
        overlay.querySelector(".order-total").innerHTML = `
        <strong>Order Total</strong>
        <div class="total-amount">$${total.toFixed(2)}</div>
      `;
        (_a = overlay.querySelector(".start-new")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
            products.forEach((p) => (p.quantity = 0));
            document.querySelectorAll(".quantity-control").forEach((n) => n.remove());
            products.forEach((p) => {
                if (!p.card.querySelector(".add-btn"))
                    restoreAddButton(p);
            });
            updateCart();
            overlay.remove();
        });
        (_b = overlay.querySelector(".close")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => overlay.remove());
    }
    // initial render (cart is empty by default)
    updateCart();
});
//# sourceMappingURL=index.js.map