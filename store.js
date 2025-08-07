// ===========================
// Filtering + Search
// ===========================
document.addEventListener("DOMContentLoaded", () => {
  const filterButtons = document.querySelectorAll(".store-filter-btn .btn");
  const searchInput = document.querySelector(".search-input");
  const cards = document.querySelectorAll(".sweet-card");

  function filterCards() {
    const searchQuery = searchInput.value.toLowerCase().trim();
    const activeButton = document.querySelector(
      ".store-filter-btn .btn.active"
    );
    const activeCategory = activeButton ? activeButton.dataset.filter : "all";

    cards.forEach((card) => {
      const title = card
        .querySelector(".sweet-card-title")
        .textContent.toLowerCase();
      const cardCategory = card.dataset.category;

      const matchesCategory =
        activeCategory === "all" || cardCategory === activeCategory;
      const matchesSearch = title.includes(searchQuery);

      card.style.display = matchesCategory && matchesSearch ? "" : "none";
    });
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      filterCards();
    });
  });

  searchInput.addEventListener("input", filterCards);
  filterCards();
});


// ===========================
// Search Result Message
// ===========================
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.querySelector(".search-input");
  const cards = document.querySelectorAll(".sweet-card");
  const noResultsMessage = document.getElementById("no-results-message");

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase().trim();
    let anyVisible = false;

    cards.forEach((card) => {
      const title = card
        .querySelector(".sweet-card-title")
        .textContent.toLowerCase();
      const isFilteredOut = card.dataset.hiddenByFilter === "true";
      const matchesSearch = title.includes(query);

      if (matchesSearch && !isFilteredOut) {
        card.style.display = "";
        anyVisible = true;
      } else {
        card.style.display = "none";
      }
    });

    noResultsMessage.style.display = anyVisible ? "none" : "block";
  });
});

// ===========================
// Cart Setup + Mini Cart Toggle
// ===========================
const cartCount = document.querySelector(".cart-count");
const cartTotal = document.querySelector(".cart-total");
const cartItemsList = document.getElementById("cart-items");
const emptyMessage = document.getElementById("empty-message");
const addToCartButtons = document.querySelectorAll(".sweet-card-btn");
const cartBtn = document.querySelector(".nav-cart");
const miniCart = document.getElementById("mini-cart");
const submenu = document.querySelector(".mobile-submenu");
const menuIcon = document.querySelector(".nav-menu-icon");

let itemCount = 0;
let totalPrice = 0;
let isCartOpen = false;
const cart = {};

// Toggle cart open/close
cartBtn.addEventListener("click", (e) => {
  e.stopPropagation();

  if (submenu.classList.contains("active")) {
    submenu.classList.remove("active");
  }

  if (!isCartOpen) {
    miniCart.classList.remove("spin-close");
    miniCart.classList.add("visible");
    void miniCart.offsetWidth;
    miniCart.classList.add("spin-open");
    isCartOpen = true;
  } else {
    miniCart.classList.remove("spin-open");
    miniCart.classList.add("spin-close");
    setTimeout(() => {
      miniCart.classList.remove("visible");
      miniCart.classList.remove("spin-close");
    }, 600);
    isCartOpen = false;
  }
});

// Close mini cart when clicking outside
document.addEventListener("click", (e) => {
  const isInsideCart = miniCart.contains(e.target);
  const isCartButton = cartBtn.contains(e.target);
  const isAddToCart = e.target.closest(".sweet-card-btn");

  if (isCartOpen && !isInsideCart && !isCartButton && !isAddToCart) {
    miniCart.classList.remove("visible");
    isCartOpen = false;
  }
});

// ===========================
// Add to Cart Functionality
// ===========================
addToCartButtons.forEach((btn, index) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();

    const card = btn.closest(".sweet-card");
    const title = card.querySelector(".sweet-card-title").textContent;
    const price = parseFloat(
      card.querySelector(".sweet-card-price").textContent
    );
    const imgSrc = card.querySelector(".sweet-card-image").src;
    const id = `${title}-${index}`;

    if (cart[id]) {
      cart[id].quantity++;
    } else {
      cart[id] = { title, price, image: imgSrc, quantity: 1 };
    }

    updateCartDisplay();
    showCartNotification(`${title} added to cart`);
  });
});

// ===========================
// Update Cart UI
// ===========================
function updateCartDisplay() {
  cartItemsList.innerHTML = "";
  itemCount = 0;
  totalPrice = 0;

  const trashIconSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" class="remove-btn">
      <path d="M232.7 69.9L224 96L128 96C110.3 96 96 110.3 96 128C96 145.7 110.3 160 128 160L512 160C529.7 160 544 145.7 544 128C544 110.3 529.7 96 512 96L416 96L407.3 69.9C402.9 56.8 390.7 48 376.9 48L263.1 48C249.3 48 237.1 56.8 232.7 69.9zM512 208L128 208L149.1 531.1C150.7 556.4 171.7 576 197 576L443 576C468.3 576 489.3 556.4 490.9 531.1L512 208z"/>
    </svg>`;

  for (const key in cart) {
    const item = cart[key];
    itemCount += item.quantity;
    totalPrice += item.price * item.quantity;

    const li = document.createElement("li");
    li.innerHTML = `
      <div class="mini-cart-item" data-id="${key}">
        <img src="${item.image}" alt="${item.title}" class="mini-cart-img">
        <div class="mini-cart-details">
          <p class="mini-cart-title">${item.title}</p>
          <p class="mini-cart-price">$${(item.price * item.quantity).toFixed(
            2
          )}</p>
          <div class="quantity-controls">
            <button class="decrease-btn">–</button>
            <span class="quantity">${item.quantity}</span>
            <button class="increase-btn">+</button>
            <button class="remove-btn"></button>
          </div>
        </div>
      </div>
    `;

    li.querySelector(".remove-btn").innerHTML = trashIconSVG;
    cartItemsList.appendChild(li);
  }

  cartCount.textContent = itemCount;
  cartTotal.textContent = `$${totalPrice.toFixed(2)}`;

  const miniCartTotal = document.querySelector(".mini-cart-total-amount");
  if (miniCartTotal) {
    miniCartTotal.textContent = `$${totalPrice.toFixed(2)}`;
  }

  emptyMessage.style.display = itemCount === 0 ? "block" : "none";
  addCartItemListeners();
}

// ===========================
// Quantity + Remove Button Events
// ===========================
function addCartItemListeners() {
  document.querySelectorAll(".increase-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.closest(".mini-cart-item").dataset.id;
      cart[id].quantity++;
      updateCartDisplay();
    });
  });

  document.querySelectorAll(".decrease-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.closest(".mini-cart-item").dataset.id;
      if (cart[id].quantity > 1) {
        cart[id].quantity--;
      } else {
        delete cart[id];
      }
      updateCartDisplay();
    });
  });

  document.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.closest(".mini-cart-item").dataset.id;
      delete cart[id];
      updateCartDisplay();
    });
  });
}

// ===========================
// Notification Function
// ===========================
function showCartNotification(message = "Item added to cart") {
  const notification = document.getElementById("cart-notification");
  notification.textContent = message;
  notification.classList.add("show");

  setTimeout(() => {
    notification.classList.remove("show");
  }, 1500);
}

// ===========================
// Mobile Menu Toggle
// ===========================
// Select elements
document.addEventListener("DOMContentLoaded", () => {
  const menuIcon = document.querySelector(".nav-menu-icon");
  const submenu = document.querySelector(".mobile-submenu");
  const miniCart = document.querySelector("#mini-cart");
  const cartButton = document.querySelector(".nav-cart");

  let isCartOpen = false;

  // Toggle submenu
  menuIcon.addEventListener("click", () => {
    if (isCartOpen) {
      miniCart.classList.remove("spin-open");
      miniCart.classList.add("spin-close");
      setTimeout(() => {
        miniCart.classList.remove("visible");
        miniCart.classList.remove("spin-close");
      }, 600);
      isCartOpen = false;
    }

    submenu.classList.toggle("active");
  });

  // Toggle cart
  cartButton.addEventListener("click", () => {
    if (!isCartOpen) {
      miniCart.classList.add("visible");
      miniCart.classList.add("spin-open");
      isCartOpen = true;
    } else {
      miniCart.classList.remove("spin-open");
      miniCart.classList.add("spin-close");
      setTimeout(() => {
        miniCart.classList.remove("visible");
        miniCart.classList.remove("spin-close");
      }, 600);
      isCartOpen = false;
    }
  });
});

// ===========================
// Cart: Clear + Checkout Buttons
// ===========================
document.addEventListener("DOMContentLoaded", () => {
  const clearBtn = document.querySelector(".clear-cart-btn");
  const checkoutBtn = document.querySelector(".checkout-btn");

  clearBtn.addEventListener("click", () => {
    for (const key in cart) delete cart[key];
    itemCount = 0;
    totalPrice = 0;
    updateCartDisplay();
  });

  checkoutBtn.addEventListener("click", () => {
    if (itemCount === 0) {
      alert("🛒 Your cart is empty!");
      return;
    }

    alert("✅ Checkout successful!");
    for (const key in cart) delete cart[key];
    itemCount = 0;
    totalPrice = 0;
    updateCartDisplay();
  });
});
