/* ===========================================================
   Brand E-commerce – Shared JavaScript
   Used by: index.html, category.html, product.html, cart.html
   =========================================================== */

document.addEventListener("DOMContentLoaded", function () {
  initMobileMenu();
  initToast();
  initNewsletterForms();
  initCartBadgeFromStorage();
  initAddToCartButtons();
  initSaveForLater();
  initQtyControls();
  initRemoveCartItem();
  initCartTotals();
  initFilterToggles();
  initFilterChips();
  initProductTabs();
  initGallery();
  initViewToggle();
});

/* ---------- Mobile slide-in menu ---------- */
function initMobileMenu() {
  var toggleBtn = document.querySelector(".menu-toggle");
  var overlay = document.querySelector(".mobile-nav-overlay");
  var nav = document.querySelector(".mobile-nav");
  var closeBtn = document.querySelector(".mobile-nav .close-btn");

  if (!toggleBtn || !overlay || !nav) return;

  function openMenu() {
    overlay.classList.add("open");
    nav.classList.add("open");
  }
  function closeMenu() {
    overlay.classList.remove("open");
    nav.classList.remove("open");
  }

  toggleBtn.addEventListener("click", openMenu);
  overlay.addEventListener("click", closeMenu);
  if (closeBtn) closeBtn.addEventListener("click", closeMenu);
}

/* ---------- Toast notification helper ---------- */
function initToast() {
  if (document.querySelector(".toast")) return;
  var toast = document.createElement("div");
  toast.className = "toast";
  document.body.appendChild(toast);
}

function showToast(message) {
  var toast = document.querySelector(".toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(function () {
    toast.classList.remove("show");
  }, 2200);
}

/* ---------- Newsletter subscribe (all pages) ---------- */
function initNewsletterForms() {
  var forms = document.querySelectorAll(".newsletter form");
  forms.forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = form.querySelector('input[type="email"]');
      var msg = form.parentElement.querySelector(".msg");
      if (input && input.value.trim() !== "") {
        if (msg) msg.textContent = "Thanks! You're subscribed with " + input.value;
        showToast("Subscribed successfully!");
        input.value = "";
      } else if (msg) {
        msg.textContent = "Please enter a valid email.";
      }
    });
  });
}

/* ---------- Cart count persisted in localStorage ---------- */
function getCartCount() {
  return parseInt(localStorage.getItem("cartCount") || "3", 10);
}
function setCartCount(n) {
  localStorage.setItem("cartCount", n);
  document.querySelectorAll(".cart-badge").forEach(function (b) {
    b.textContent = n;
  });
}
function initCartBadgeFromStorage() {
  setCartCount(getCartCount());
}

/* ---------- "Add to cart" / "Move to cart" buttons ---------- */
function initAddToCartButtons() {
  document.querySelectorAll("[data-add-to-cart]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setCartCount(getCartCount() + 1);
      showToast("Added to cart");
    });
  });
}

/* ---------- "Save for later" on cart page ---------- */
function initSaveForLater() {
  document.querySelectorAll("[data-save-later]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".cart-item");
      if (item) {
        item.remove();
        setCartCount(Math.max(0, getCartCount() - 1));
        recalcCartTotals();
        showToast("Moved to saved items");
      }
    });
  });
}

/* ---------- Remove item from cart ---------- */
function initRemoveCartItem() {
  document.querySelectorAll("[data-remove-item]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".cart-item");
      if (item) {
        item.remove();
        setCartCount(Math.max(0, getCartCount() - 1));
        recalcCartTotals();
        showToast("Item removed");
      }
    });
  });

  var removeAll = document.querySelector("[data-remove-all]");
  if (removeAll) {
    removeAll.addEventListener("click", function () {
      document.querySelectorAll(".cart-item").forEach(function (i) {
        i.remove();
      });
      setCartCount(0);
      recalcCartTotals();
      showToast("Cart cleared");
    });
  }
}

/* ---------- Quantity +/- controls on cart page ---------- */
function initQtyControls() {
  document.querySelectorAll(".qty-control").forEach(function (control) {
    var minus = control.querySelector(".qty-minus");
    var plus = control.querySelector(".qty-plus");
    var input = control.querySelector("input");

    if (minus) {
      minus.addEventListener("click", function () {
        var val = parseInt(input.value, 10) || 1;
        if (val > 1) input.value = val - 1;
        recalcCartTotals();
      });
    }
    if (plus) {
      plus.addEventListener("click", function () {
        var val = parseInt(input.value, 10) || 1;
        input.value = val + 1;
        recalcCartTotals();
      });
    }
    if (input) {
      input.addEventListener("change", recalcCartTotals);
    }
  });
}

/* ---------- Recalculate cart subtotal / total ---------- */
function recalcCartTotals() {
  var items = document.querySelectorAll(".cart-item");
  var subtotal = 0;

  items.forEach(function (item) {
    var price = parseFloat(item.getAttribute("data-price")) || 0;
    var qtyInput = item.querySelector(".qty-control input");
    var qty = qtyInput ? parseInt(qtyInput.value, 10) || 1 : 1;
    var line = price * qty;
    subtotal += line;

    var lineEl = item.querySelector(".line-price");
    if (lineEl) lineEl.textContent = "$" + line.toFixed(2);
  });

  var subtotalEl = document.querySelector("[data-subtotal]");
  var discountEl = document.querySelector("[data-discount]");
  var taxEl = document.querySelector("[data-tax]");
  var totalEl = document.querySelector("[data-total]");

  var discount = subtotal > 0 ? 60 : 0;
  var tax = subtotal > 0 ? subtotal * 0.01 : 0;
  var total = subtotal - discount + tax;

  if (subtotalEl) subtotalEl.textContent = "$" + subtotal.toFixed(2);
  if (discountEl) discountEl.textContent = "-$" + discount.toFixed(2);
  if (taxEl) taxEl.textContent = "+$" + tax.toFixed(2);
  if (totalEl) totalEl.textContent = "$" + (total > 0 ? total.toFixed(2) : "0.00");

  var cartTitle = document.querySelector("[data-cart-title]");
  if (cartTitle) cartTitle.textContent = "My cart (" + items.length + ")";

  var emptyState = document.querySelector(".empty-cart");
  var cartLayout = document.querySelector(".cart-layout");
  if (items.length === 0) {
    if (cartLayout) cartLayout.style.display = "none";
    if (emptyState) emptyState.style.display = "block";
  }
}
function initCartTotals() {
  if (document.querySelector(".cart-item")) recalcCartTotals();
}

/* ---------- Collapsible filter boxes (category page) ---------- */
function initFilterToggles() {
  document.querySelectorAll(".filter-box h4").forEach(function (h4) {
    h4.addEventListener("click", function () {
      var options = h4.parentElement.querySelector(".filter-options");
      if (options) {
        options.style.display = options.style.display === "none" ? "flex" : "none";
      }
    });
  });
}

/* ---------- Active filter chips: clicking x removes the chip ---------- */
function initFilterChips() {
  document.querySelectorAll(".chip button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      btn.closest(".chip").remove();
    });
  });

  var clearAll = document.querySelector(".clear-all");
  if (clearAll) {
    clearAll.addEventListener("click", function () {
      document.querySelectorAll(".chip").forEach(function (c) {
        c.remove();
      });
      document.querySelectorAll(".filter-options input[type='checkbox']").forEach(function (cb) {
        cb.checked = false;
      });
    });
  }
}

/* ---------- Product page tabs (Description / Reviews / Shipping / About) ---------- */
function initProductTabs() {
  var tabs = document.querySelectorAll(".tabs button");
  if (!tabs.length) return;

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        t.classList.remove("active");
      });
      document.querySelectorAll(".tab-panel").forEach(function (p) {
        p.classList.remove("active");
      });
      tab.classList.add("active");
      var target = document.getElementById(tab.getAttribute("data-tab"));
      if (target) target.classList.add("active");
    });
  });
}

/* ---------- Product gallery thumbnail swap ---------- */
function initGallery() {
  var mainImg = document.querySelector(".gallery-main img");
  var thumbs = document.querySelectorAll(".gallery-thumbs img");
  if (!mainImg || !thumbs.length) return;

  thumbs.forEach(function (thumb) {
    thumb.addEventListener("click", function () {
      thumbs.forEach(function (t) {
        t.classList.remove("active");
      });
      thumb.classList.add("active");
      mainImg.src = thumb.src;
    });
  });
}

/* ---------- Grid / list view toggle (category page) ---------- */
function initViewToggle() {
  var gridBtn = document.querySelector("[data-view='grid']");
  var listBtn = document.querySelector("[data-view='list']");
  var grid = document.querySelector(".listing-grid");
  if (!gridBtn || !listBtn || !grid) return;

  gridBtn.addEventListener("click", function () {
    grid.classList.remove("list-view");
    gridBtn.classList.add("active");
    listBtn.classList.remove("active");
  });
  listBtn.addEventListener("click", function () {
    grid.classList.add("list-view");
    listBtn.classList.add("active");
    gridBtn.classList.remove("active");
  });
}
