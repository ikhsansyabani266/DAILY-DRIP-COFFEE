// ==========================================
// KONFIGURASI TRANSAKSI & PROMO
// ==========================================
// Ganti angka ini dengan nomor WhatsApp toko dalam format internasional.
const NOMOR_WHATSAPP_TOKO = "62895327292342";

// Daftar master kode promo
const PROMO_CODES = {
  DIALYHEMAT: {
    code: "DIALYHEMAT",
    type: "percent",
    value: 0.20,
    minSpend: 30000,
    maxDiscount: 25000,
    desc: "Diskon 20% (min. Rp30.000)"
  },
  NGOPIASIK: {
    code: "NGOPIASIK",
    type: "fixed",
    value: 10000,
    minSpend: 40000,
    maxDiscount: 10000,
    desc: "Potongan Rp10.000 (min. Rp40.000)"
  },
  DISKON10: {
    code: "DISKON10",
    type: "percent",
    value: 0.10,
    minSpend: 0,
    maxDiscount: 50000,
    desc: "Diskon 10% tanpa syarat"
  },
  JUMATBERKAH: {
    code: "JUMATBERKAH",
    type: "fixed",
    value: 15000,
    minSpend: 50000,
    maxDiscount: 15000,
    desc: "Potongan Rp15.000 (min. Rp50.000)"
  }
};

const STORAGE_KEY_PROMO = "dialy_applied_promo_v1";
let appliedPromoCode = null;

try {
  const savedPromo = localStorage.getItem(STORAGE_KEY_PROMO);
  if (savedPromo && PROMO_CODES[savedPromo.toUpperCase()]) {
    appliedPromoCode = savedPromo.toUpperCase();
  }
} catch (e) {}

// Formatter mata uang Rupiah
const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0
});

// Elemen DOM untuk Form Pemesanan
const form = document.getElementById("transactionForm");
const nameInput = document.getElementById("customerName");
const phoneInput = document.getElementById("customerPhone");
const methodInput = document.getElementById("orderMethod");
const paymentInput = document.getElementById("paymentMethod");
const cartItemsElement = document.getElementById("cartItems");
const cart = new Map();
const cartNotes = new Map();
const resultContent = document.querySelector(".result-content");
const resultPlaceholder = document.querySelector(".result-placeholder");
const navOrderBadge = document.getElementById("navOrderBadge");
const toastContainer = document.getElementById("toastContainer");
const paymentNotice = document.getElementById("paymentNotice");

function showToast(message) {
  if (!toastContainer) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  toastContainer.appendChild(toast);
  window.setTimeout(() => toast.remove(), 2900);
}

function updatePaymentNotice() {
  if (!paymentNotice || !methodInput || !paymentInput) return;
  if (methodInput.value === "Delivery" && paymentInput.value === "Cash") {
    paymentNotice.textContent = "Delivery + Cash: pembayaran dilakukan saat pesanan diterima (COD).";
  } else if (paymentInput.value === "QRIS" || paymentInput.value === "Transfer Bank" || paymentInput.value === "E-Wallet") {
    paymentNotice.textContent = `${methodInput.value} + ${paymentInput.value}: siapkan bukti pembayaran saat konfirmasi.`;
  } else {
    paymentNotice.textContent = "Pickup + Cash: pembayaran dilakukan saat pengambilan.";
  }
}

methodInput?.addEventListener("change", updatePaymentNotice);
paymentInput?.addEventListener("change", updatePaymentNotice);
updatePaymentNotice();

// Elemen Navigasi Mobile
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

// ==========================================
// LOCAL STORAGE PERSISTENCE (CLIENT-SIDE)
// ==========================================
const STORAGE_KEY_CART = "dialy_drip_cart_items";
const STORAGE_KEY_NOTES = "dialy_drip_cart_notes";
const STORAGE_KEY_USER = "dialy_drip_customer";

function saveCartToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(Array.from(cart.entries())));

  } catch (e) {
    // Abaikan jika browser membatasi storage
  }
}

function loadCartFromStorage() {
  try {
    const savedCart = localStorage.getItem(STORAGE_KEY_CART);
    const savedNotes = localStorage.getItem(STORAGE_KEY_NOTES);
    if (savedCart) {
      const parsed = JSON.parse(savedCart);
      if (Array.isArray(parsed)) {
        parsed.forEach((entry) => {
          if (!entry || !Array.isArray(entry)) return;
          const [key, val] = entry;
          if (typeof val === "number" || typeof key === "number") {
            const idx = Number(key);
            const qty = typeof val === "number" ? val : 1;
            const product = productData[idx];
            const basePrice = product ? product[2] : 20000;
            const defaultKey = `${idx}__Ice__Normal__`;
            cart.set(defaultKey, {
              key: defaultKey,
              productIndex: idx,
              temp: "Ice",
              sugar: "Normal (100%)",
              toppings: [],
              toppingExtra: 0,
              unitPrice: basePrice,
              quantity: qty,
              note: ""
            });
          } else if (typeof val === "object" && val !== null) {
            cart.set(key, val);
          }
        });
      }
    }
    if (savedNotes) {
      const parsed = JSON.parse(savedNotes);
      if (Array.isArray(parsed)) {
        parsed.forEach(([index, note]) => {
          if (typeof index === "number" && note) cartNotes.set(index, note);
        });
      }
    }
    const savedUser = localStorage.getItem(STORAGE_KEY_USER);
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (nameInput && user.name && !nameInput.value) nameInput.value = user.name;
      if (phoneInput && user.phone && !phoneInput.value) phoneInput.value = user.phone;
    }
  } catch (e) {
    // Abaikan error parsing JSON
  }
}


// ==========================================
// HELPER FUNCTIONS & PROMO SYSTEM
// ==========================================
function formatRupiah(value) {
  return currency.format(value).replace("IDR", "Rp").replace(/\s/g, "");
}

function showError(element, message) {
  element.textContent = message;
}

function calculateCartDiscount(subtotal) {
  if (appliedPromoCode && PROMO_CODES[appliedPromoCode]) {
    const promo = PROMO_CODES[appliedPromoCode];
    if (subtotal < promo.minSpend) {
      return {
        discount: 0,
        label: `Diskon (${promo.code})`,
        status: "insufficient",
        promoCode: promo.code,
        notice: `Tambah belanjaan ${formatRupiah(promo.minSpend - subtotal)} lagi untuk mengaktifkan promo ${promo.code}.`
      };
    }
    let discount = 0;
    if (promo.type === "percent") {
      discount = Math.round(subtotal * promo.value);
      if (promo.maxDiscount) discount = Math.min(discount, promo.maxDiscount);
    } else if (promo.type === "fixed") {
      discount = Math.min(promo.value, subtotal);
    }
    return {
      discount,
      label: `Diskon (${promo.code})`,
      status: "applied",
      promoCode: promo.code,
      notice: `Kode promo ${promo.code} aktif — hemat ${formatRupiah(discount)}!`
    };
  }

  // Tanpa kode promo, tidak ada diskon otomatis
  return {
    discount: 0,
    label: "Diskon",
    status: "none",
    promoCode: null,
    notice: "Gunakan kode promo untuk mendapatkan potongan harga."
  };
}

function updatePromoUI(subtotal) {
  const promo = appliedPromoCode ? PROMO_CODES[appliedPromoCode] : null;
  const promoField = document.getElementById("cartPromoField");
  const promoActive = document.getElementById("cartPromoActive");
  const promoAppliedCode = document.getElementById("cartPromoAppliedCode");
  const promoAppliedDesc = document.getElementById("cartPromoAppliedDesc");

  if (promoField) promoField.hidden = false;

  if (promo) {
    if (promoActive) promoActive.hidden = false;
    if (promoAppliedCode) promoAppliedCode.textContent = promo.code;
    if (promoAppliedDesc) {
      if (promo.type === "percent") {
        promoAppliedDesc.textContent = `(-${Math.round(promo.value * 100)}%)`;
      } else {
        promoAppliedDesc.textContent = `(-${formatRupiah(promo.value)})`;
      }
    }
  } else {
    if (promoActive) promoActive.hidden = true;
    if (promoAppliedCode) promoAppliedCode.textContent = "";
    if (promoAppliedDesc) promoAppliedDesc.textContent = "";
  }
}

function applyPromo(code) {
  const cleanCode = (code || "").trim().toUpperCase();
  const promoMsg = document.getElementById("cartPromoMsg");

  if (!cleanCode) {
    if (promoMsg) {
      promoMsg.textContent = "Masukkan kode promo terlebih dahulu.";
      promoMsg.className = "cart-promo-msg msg-error";
    }
    return false;
  }

  if (cart.size === 0) {
    if (promoMsg) {
      promoMsg.textContent = "Keranjang belanja masih kosong. Pilih minuman terlebih dahulu.";
      promoMsg.className = "cart-promo-msg msg-error";
    }
    showToast("Keranjang belanja masih kosong.");
    return false;
  }

  const promo = PROMO_CODES[cleanCode];
  if (!promo) {
    if (promoMsg) {
      promoMsg.textContent = `Kode promo "${cleanCode}" tidak ditemukan atau sudah berakhir.`;
      promoMsg.className = "cart-promo-msg msg-error";
    }
    showToast(`Kode "${cleanCode}" tidak valid.`);
    return false;
  }

  appliedPromoCode = cleanCode;
  try {
    localStorage.setItem(STORAGE_KEY_PROMO, cleanCode);
  } catch (e) {}

  if (promoMsg) {
    promoMsg.textContent = "";
    promoMsg.className = "cart-promo-msg";
  }

  const promoInput = document.getElementById("cartPromoInput");
  if (promoInput) promoInput.value = "";

  const subtotal = Array.from(cart.values()).reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  if (subtotal < promo.minSpend) {
    showToast(`Promo ${cleanCode} dipasang! Tambah belanjaan untuk mengaktifkan.`);
  } else {
    showToast(`Kode promo ${cleanCode} berhasil diterapkan!`);
  }

  updateCartView();
  return true;
}

function removePromo() {
  appliedPromoCode = null;
  try {
    localStorage.removeItem(STORAGE_KEY_PROMO);
  } catch (e) {}

  const promoMsg = document.getElementById("cartPromoMsg");
  if (promoMsg) {
    promoMsg.textContent = "";
    promoMsg.className = "cart-promo-msg";
  }

  const promoInput = document.getElementById("cartPromoInput");
  if (promoInput) promoInput.value = "";

  showToast("Kode promo dihapus.");
  updateCartView();
}

function updateCartView() {
  const countElement = document.getElementById("cartCount");
  const subtotalElement = document.getElementById("cartSubtotal");
  if (!cartItemsElement) return;

  if (cart.size === 0) {
    cartItemsElement.innerHTML = '<div class="cart-empty"><span class="cart-empty-icon" aria-hidden="true">☕</span><strong>Keranjang masih kosong</strong><span>Pilih minuman favoritmu dari menu.</span><a href="#menu" class="empty-cart-btn">Kembali ke menu</a></div>';
    saveCartToStorage();
    if (countElement) countElement.textContent = "0 ITEM";
    if (navOrderBadge) navOrderBadge.textContent = "";
    if (subtotalElement) subtotalElement.textContent = formatRupiah(0);
    const cartDiscountLabel = document.getElementById("cartDiscountLabel");
    if (cartDiscountLabel) cartDiscountLabel.textContent = "Diskon";
    document.getElementById("cartDiscount")?.replaceChildren(document.createTextNode(formatRupiah(0)));
    document.getElementById("cartTotal")?.replaceChildren(document.createTextNode(formatRupiah(0)));
    const cartNoticeElement = document.getElementById("cartNotice");
    if (cartNoticeElement) cartNoticeElement.textContent = "Gunakan kode promo untuk mendapatkan potongan harga.";
    appliedPromoCode = null;
    try {
      localStorage.removeItem(STORAGE_KEY_PROMO);
    } catch (e) {}
    updatePromoUI(0);
    return;
  }

  let totalCount = 0;
  let totalSub = 0;
  const rows = [];

  for (const [key, item] of cart.entries()) {
    const product = productData[item.productIndex];
    if (!product) continue;
    const title = product[1];
    const unitPrice = item.unitPrice || product[2];
    const qty = item.quantity || 1;
    const lineTotal = unitPrice * qty;
    totalCount += qty;
    totalSub += lineTotal;

    const chips = [];
    if (item.temp) {
      const isHot = item.temp.toLowerCase().includes("hot");
      const icon = isHot ? "♨️" : "❄️";
      chips.push(`<span class="cart-pill cart-pill-temp ${isHot ? "pill-hot" : "pill-ice"}">${icon} ${item.temp}</span>`);
    }
    if (item.sugar) {
      chips.push(`<span class="cart-pill cart-pill-sugar">${item.sugar}</span>`);
    }
    if (item.toppings && item.toppings.length > 0) {
      item.toppings.forEach((t) => {
        chips.push(`<span class="cart-pill cart-pill-topping">+${t}</span>`);
      });
    }

    rows.push(`
      <div class="cart-row" data-key="${key}">
        <div class="cart-row-main">
          <div class="cart-row-header">
            <b class="cart-row-title">${title}</b>
            <span class="cart-row-price">${formatRupiah(lineTotal)}</span>
          </div>
          <div class="cart-row-variants" data-act="edit" data-key="${key}" title="Klik untuk ubah kustomisasi">
            ${chips.join("")}
            <button type="button" class="cart-pill-edit" data-act="edit" data-key="${key}" aria-label="Ubah varian minuman">
              <svg class="cart-edit-icon" viewBox="0 0 16 16" width="11" height="11" fill="currentColor" aria-hidden="true"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-9.5 9.5a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l9.5-9.5zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.886 2.215 2.215-.886.643-.643-.972-.972-.972-.972-.643.643z"/></svg>
              <span>Ubah</span>
            </button>
          </div>
          <div class="cart-row-footer">
            <span class="cart-row-unit">${formatRupiah(unitPrice)} <span class="cart-unit-times">×</span> ${qty}</span>
            <div class="cart-controls">
              <button type="button" class="cart-btn" data-act="dec" data-key="${key}" aria-label="Kurangi jumlah">-</button>
              <span class="cart-qty">${qty}</span>
              <button type="button" class="cart-btn" data-act="inc" data-key="${key}" aria-label="Tambah jumlah">+</button>
              <button type="button" class="cart-del" data-act="del" data-key="${key}" aria-label="Hapus dari keranjang" title="Hapus">✕</button>
            </div>
          </div>
          <div class="cart-note-wrap">
            <span class="cart-note-icon" aria-hidden="true">✎</span>
            <input class="cart-note" data-key="${key}" type="text" value="${item.note || ""}" placeholder="Catatan gelas ini (contoh: sedikit es)">
          </div>
        </div>
      </div>
    `);
  }

  cartItemsElement.innerHTML = rows.join("");
  if (countElement) countElement.textContent = `${totalCount} ITEM`;
  if (navOrderBadge) navOrderBadge.textContent = totalCount;
  if (subtotalElement) subtotalElement.textContent = formatRupiah(totalSub);

  const discountInfo = calculateCartDiscount(totalSub);
  const cartDiscountElement = document.getElementById("cartDiscount");
  const cartDiscountLabel = document.getElementById("cartDiscountLabel");
  const cartTotalElement = document.getElementById("cartTotal");
  const cartNoticeElement = document.getElementById("cartNotice");

  if (cartDiscountLabel) cartDiscountLabel.textContent = discountInfo.label;
  if (cartDiscountElement) cartDiscountElement.textContent = formatRupiah(discountInfo.discount);
  if (cartTotalElement) cartTotalElement.textContent = formatRupiah(totalSub - discountInfo.discount);
  if (cartNoticeElement) cartNoticeElement.textContent = discountInfo.notice;

  updatePromoUI(totalSub);
  saveCartToStorage();
}


// ==========================================
// MODAL POPUP KUSTOMISASI MINUMAN
// ==========================================
const customizeModal = document.getElementById("customizeModal");
const modalProductTitle = document.getElementById("modalProductTitle");
const modalProductBasePrice = document.getElementById("modalProductBasePrice");
const modalCloseBtn = document.getElementById("modalCloseBtn");
const modalItemNote = document.getElementById("modalItemNote");
const modalQtyDec = document.getElementById("modalQtyDec");
const modalQtyInc = document.getElementById("modalQtyInc");
const modalQtyVal = document.getElementById("modalQtyVal");
const modalTotalPrice = document.getElementById("modalTotalPrice");
const modalConfirmBtn = document.getElementById("modalConfirmBtn");

let currentModalIndex = 0;
let modalCurrentQty = 1;
let editingCartKey = null;

function getSelectedModalCustoms() {
  const tempInput = document.querySelector('input[name="customTemp"]:checked');
  const sugarInput = document.querySelector('input[name="customSugar"]:checked');
  const temp = tempInput ? tempInput.value : "Ice";
  const sugar = sugarInput ? sugarInput.value : "Normal (100%)";

  const checkedToppings = Array.from(document.querySelectorAll('input[name="customTopping"]:checked'));
  const toppings = checkedToppings.map((input) => input.value);
  const toppingExtra = checkedToppings.reduce((sum, input) => sum + (Number(input.dataset.price) || 0), 0);

  const product = productData[currentModalIndex];
  const basePrice = product ? product[2] : 20000;
  const unitPrice = basePrice + toppingExtra;

  return { temp, sugar, toppings, toppingExtra, unitPrice };
}

function updateModalLivePrice() {
  if (!modalTotalPrice) return;
  const { unitPrice } = getSelectedModalCustoms();
  const total = unitPrice * modalCurrentQty;
  modalTotalPrice.textContent = formatRupiah(total);
}

function openCustomizeModal(index, editKey = null) {
  const item = productData[index];
  if (!item || !customizeModal) return;

  currentModalIndex = index;
  editingCartKey = editKey;

  const modalBadge = customizeModal.querySelector(".modal-badge");
  const modalSubmitText = modalConfirmBtn ? modalConfirmBtn.querySelector("span:first-child") : null;

  if (modalProductTitle) modalProductTitle.textContent = item[1];
  if (modalProductBasePrice) modalProductBasePrice.textContent = formatRupiah(item[2]);

  if (editKey && cart.has(editKey)) {
    const existing = cart.get(editKey);
    modalCurrentQty = existing.quantity || 1;
    if (modalQtyVal) modalQtyVal.textContent = modalCurrentQty;
    if (modalItemNote) modalItemNote.value = existing.note || "";

    const tempRadio = document.querySelector(`input[name="customTemp"][value="${existing.temp}"]`);
    if (tempRadio) tempRadio.checked = true;

    const sugarRadio = document.querySelector(`input[name="customSugar"][value="${existing.sugar}"]`);
    if (sugarRadio) sugarRadio.checked = true;

    const selectedToppings = existing.toppings || [];
    document.querySelectorAll('input[name="customTopping"]').forEach((box) => {
      box.checked = selectedToppings.includes(box.value);
    });

    if (modalBadge) modalBadge.textContent = "UBAH KUSTOMISASI";
    if (modalSubmitText) modalSubmitText.textContent = "Simpan Perubahan";
  } else {
    editingCartKey = null;
    modalCurrentQty = 1;
    if (modalQtyVal) modalQtyVal.textContent = "1";
    if (modalItemNote) modalItemNote.value = "";

    const defaultTemp = document.querySelector('input[name="customTemp"][value="Ice"]');
    if (defaultTemp) defaultTemp.checked = true;

    const defaultSugar = document.querySelector('input[name="customSugar"][value="Normal (100%)"]');
    if (defaultSugar) defaultSugar.checked = true;

    document.querySelectorAll('input[name="customTopping"]').forEach((box) => {
      box.checked = false;
    });

    if (modalBadge) modalBadge.textContent = "CUSTOMIZE YOUR DRIP";
    if (modalSubmitText) modalSubmitText.textContent = "Tambahkan";
  }

  updateModalLivePrice();

  customizeModal.hidden = false;
  customizeModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeCustomizeModal() {
  if (!customizeModal) return;
  editingCartKey = null;
  customizeModal.hidden = true;
  customizeModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

if (modalCloseBtn) {
  modalCloseBtn.addEventListener("click", closeCustomizeModal);
}

if (customizeModal) {
  customizeModal.addEventListener("click", (e) => {
    if (e.target === customizeModal) closeCustomizeModal();
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && customizeModal && !customizeModal.hidden) {
    closeCustomizeModal();
  }
});

document.querySelectorAll('input[name="customTemp"], input[name="customSugar"], input[name="customTopping"]').forEach((input) => {
  input.addEventListener("change", updateModalLivePrice);
});

if (modalQtyDec) {
  modalQtyDec.addEventListener("click", () => {
    if (modalCurrentQty > 1) {
      modalCurrentQty--;
      if (modalQtyVal) modalQtyVal.textContent = modalCurrentQty;
      updateModalLivePrice();
    }
  });
}

if (modalQtyInc) {
  modalQtyInc.addEventListener("click", () => {
    if (modalCurrentQty < 99) {
      modalCurrentQty++;
      if (modalQtyVal) modalQtyVal.textContent = modalCurrentQty;
      updateModalLivePrice();
    }
  });
}

if (modalConfirmBtn) {
  modalConfirmBtn.addEventListener("click", () => {
    const { temp, sugar, toppings, toppingExtra, unitPrice } = getSelectedModalCustoms();
    const note = modalItemNote ? modalItemNote.value.trim() : "";
    const product = productData[currentModalIndex];
    const title = product ? product[1] : "Minuman";

    const toppingKey = toppings.slice().sort().join("-");
    const itemKey = `${currentModalIndex}__${temp}__${sugar}__${toppingKey}`;

    if (editingCartKey) {
      if (itemKey === editingCartKey) {
        const existing = cart.get(editingCartKey);
        if (existing) {
          existing.temp = temp;
          existing.sugar = sugar;
          existing.toppings = toppings;
          existing.toppingExtra = toppingExtra;
          existing.unitPrice = unitPrice;
          existing.quantity = modalCurrentQty;
          existing.note = note;
        }
      } else {
        if (cart.has(itemKey)) {
          const target = cart.get(itemKey);
          target.quantity += modalCurrentQty;
          if (note && !target.note) target.note = note;
          cart.delete(editingCartKey);
        } else {
          cart.delete(editingCartKey);
          cart.set(itemKey, {
            key: itemKey,
            productIndex: currentModalIndex,
            temp,
            sugar,
            toppings,
            toppingExtra,
            unitPrice,
            quantity: modalCurrentQty,
            note
          });
        }
      }
      editingCartKey = null;
      updateCartView();
      closeCustomizeModal();
      showError(document.getElementById("quantityError"), "");
      showToast(`${title} (${temp}) berhasil diperbarui.`);
      return;
    }

    if (cart.has(itemKey)) {
      const existing = cart.get(itemKey);
      existing.quantity += modalCurrentQty;
      if (note && !existing.note) existing.note = note;
    } else {
      cart.set(itemKey, {
        key: itemKey,
        productIndex: currentModalIndex,
        temp,
        sugar,
        toppings,
        toppingExtra,
        unitPrice,
        quantity: modalCurrentQty,
        note
      });
    }

    updateCartView();
    closeCustomizeModal();
    showError(document.getElementById("quantityError"), "");
    showToast(`${title} (${temp}) berhasil ditambahkan ke keranjang.`);
  });
}

function addProductToCart(index) {
  openCustomizeModal(index);
}

// ==========================================
// FORM SUBMIT & LOGIKA DISKON
// ==========================================
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();
  const method = methodInput.value;
  const payment = paymentInput.value;
  const note = "Catatan tercantum pada masing-masing produk.";
  let valid = true;

  showError(document.getElementById("nameError"), "");
  showError(document.getElementById("phoneError"), "");
  showError(document.getElementById("quantityError"), "");

  // Validasi input nama
  if (!name) {
    showError(document.getElementById("nameError"), "Nama wajib diisi.");
    valid = false;
  }

  // Validasi nomor telepon/WA pelanggan
  const cleanPhone = phone.replace(/[^0-9+]/g, "");
  if (!cleanPhone || cleanPhone.length < 9) {
    showError(document.getElementById("phoneError"), "Nomor WhatsApp wajib diisi (minimal 9 digit).");
    valid = false;
  }

  // Validasi keranjang
  if (cart.size === 0) {
    showError(document.getElementById("quantityError"), "Tambahkan minimal satu produk ke keranjang.");
    valid = false;
  }

  // Jika input tidak valid, tampilkan info peringatan
  if (!valid) {
    resultContent.hidden = true;
    resultPlaceholder.hidden = false;
    resultPlaceholder.textContent = "Periksa kembali data pesananmu.";
    return;
  }

  // Simpan data pemesan ke localStorage untuk kunjungan berikutnya
  try {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify({ name, phone }));
  } catch (e) {}

  // Hitung subtotal seluruh keranjang dan diskon (kode promo atau default)
  const subtotal = Array.from(cart.values()).reduce((sum, item) => {
    return sum + (item.unitPrice * item.quantity);
  }, 0);
  const totalGelas = Array.from(cart.values()).reduce((sum, item) => sum + item.quantity, 0);
  const discountInfo = calculateCartDiscount(subtotal);
  const discount = discountInfo.discount;
  const cartLines = Array.from(cart.values()).map((item) => {
    const product = productData[item.productIndex];
    const name = product ? product[1] : "Minuman";
    const lineTotal = item.unitPrice * item.quantity;
    const toppingStr = item.toppings && item.toppings.length > 0 ? ` + ${item.toppings.join(", ")}` : "";
    const noteStr = item.note ? `\n  Catatan: ${item.note}` : "";
    return `- ${name} x${item.quantity} — ${formatRupiah(lineTotal)}\n  Varian: ${item.temp}, ${item.sugar}${toppingStr}${noteStr}`;
  });

  // Render hasil kalkulasi ke ringkasan transaksi
  document.getElementById("resultName").textContent = name;
  document.getElementById("resultPhone").textContent = phone;
  // Helper agar ringkasan tetap aman meskipun elemen opsional tidak dirender.
  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  };

  setText("resultProduct", cartLines.join(" | "));
  setText("resultQuantity", `${totalGelas} gelas`);
  setText("resultMethod", `${method} — ${payment}`);
  setText("resultNote", note);
  setText("subtotal", formatRupiah(subtotal));
  setText("discount", formatRupiah(discount));
  setText("total", formatRupiah(subtotal - discount));
  document.getElementById("notice").textContent = discountInfo.notice;

  // Format rincian promo untuk pesan WhatsApp
  const finalTotal = subtotal - discount;
  const promoLine = discountInfo.promoCode && discount > 0
    ? `*Kode Promo:* ${discountInfo.promoCode} (-${formatRupiah(discount)})`
    : null;

  // Format pesan WhatsApp
  const message = [
    "*PESANAN BARU — DIALY DRIP COFFEE*",
    "----------------------------------",
    `*Nama:* ${name}`,
    `*Nomor Pelanggan:* ${phone}`,
    "*Daftar Pesanan:*",
    ...cartLines,
    `*Metode pesanan:* ${method}`,
    `*Metode pembayaran:* ${payment}`,
    `*Catatan:* ${note}`,
    "----------------------------------",
    `*Subtotal:* ${formatRupiah(subtotal)}`,
    ...(promoLine ? [promoLine] : []),
    `*Total Bayar:* ${formatRupiah(finalTotal)}`,
    "----------------------------------",
    "Mohon konfirmasi pesanan saya. Terima kasih!"
  ].join("\n");

  // Membuka WhatsApp secara langsung setelah checkout valid.
  // Link tetap disimpan pada tombol sebagai cadangan jika navigasi dibatalkan.
  const waUrl = `https://wa.me/${NOMOR_WHATSAPP_TOKO}?text=${encodeURIComponent(message)}`;
  const waBtn = document.getElementById("whatsappOrderBtn");
  if (waBtn) {
    waBtn.href = waUrl;
  }

  window.location.href = waUrl;

  resultPlaceholder.hidden = true;
  resultContent.hidden = false;
});

// ==========================================
// RESPONSIVE NAVBAR (DRAWER DI MOBILE)
// ==========================================
if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => navLinks.classList.remove("is-open"));
  });
}

// ==========================================
// DATA PRODUK & KATEGORI
// ==========================================
const menuTabs = document.querySelectorAll(".menu-tab");

const categoryNames = {
  "coffee-milk": "WHITE-MILK",
  "coffee-black": "BLACK",
  "non-coffee": "NON-COFFEE",
  tea: "TEA & OTHERS"
};

// Daftar produk lengkap Daily Drip Coffee
const productData = [
  ["coffee-milk", "Kopi Susu Aren", 20000, "Dialy_Drip_20_Foto_Produk/01_Kopi_Susu_Aren.png", "ESPRESSO + MILK + PALM SUGAR"],
  ["coffee-milk", "Caffe Latte", 22000, "Dialy_Drip_20_Foto_Produk/02_Caffe_Latte.png", "ESPRESSO + STEAMED MILK", true],
  ["coffee-milk", "Cappuccino", 22000, "Dialy_Drip_20_Foto_Produk/03_Cappuccino.png", "ESPRESSO + MILK FOAM"],
  ["coffee-milk", "Caramel Macchiato", 25000, "Dialy_Drip_20_Foto_Produk/04_Caramel_Macchiato.png", "ESPRESSO + MILK + CARAMEL SAUCE"],
  ["coffee-milk", "Vanilla Latte", 24000, "Dialy_Drip_20_Foto_Produk/05_Vanilla_Latte.png", "ESPRESSO + MILK + VANILLA", true],
  ["coffee-milk", "Mocha Latte", 25000, "Dialy_Drip_20_Foto_Produk/06_Mocha_Latte.png", "ESPRESSO + MILK + CHOCOLATE"],
  ["coffee-black", "Americano", 15000, "Dialy_Drip_20_Foto_Produk/07_Americano.png", "ESPRESSO + WATER", true],
  ["coffee-black", "Cold Drip Classic", 18000, "Dialy_Drip_20_Foto_Produk/08_Cold_Drip_Classic.png", "COLD DRIP + WATER"],
  ["coffee-black", "Double Espresso", 14000, "Dialy_Drip_20_Foto_Produk/09_Double_Espresso.png", "DOUBLE ESPRESSO", true],
  ["coffee-black", "Hazelnut Cold Brew", 22000, "Dialy_Drip_20_Foto_Produk/10_Hazelnut_Cold_Brew.png", "COLD BREW + HAZELNUT"],
  ["non-coffee", "Signature Coklat", 18000, "Dialy_Drip_20_Foto_Produk/11_Signature_Coklat.png", "CHOCOLATE + MILK"],
  ["non-coffee", "Dark Chocolate Cream", 20000, "Dialy_Drip_20_Foto_Produk/12_Dark_Chocolate_Cream.png", "DARK CHOCOLATE + CREAM"],
  ["non-coffee", "Taro Latte", 22000, "Dialy_Drip_20_Foto_Produk/13_Taro_Latte.png", "TARO + MILK"],
  ["non-coffee", "Matcha Latte", 22000, "Dialy_Drip_20_Foto_Produk/14_Matcha_Latte.png", "MATCHA + MILK"],
  ["non-coffee", "Houjicha Milk Tea", 22000, "Dialy_Drip_20_Foto_Produk/15_Houjicha_Milk_Tea.png", "HOUJICHA + MILK"],
  ["non-coffee", "Choco Vanilla Milkshake", 25000, "Dialy_Drip_20_Foto_Produk/16_Choco_Vanilla_Milkshake.png", "CHOCOLATE + VANILLA + MILK"],
  ["tea", "Strawberry Milkshake", 25000, "Dialy_Drip_20_Foto_Produk/17_Strawberry_Milkshake.png", "STRAWBERRY + MILK"],
  ["tea", "Earl Grey Tea", 18000, "Dialy_Drip_20_Foto_Produk/18_Earl_Grey_Tea.png", "EARL GREY + WATER", true],
  ["tea", "Lemon Hibiscus Tea", 16000, "Dialy_Drip_20_Foto_Produk/19_Lemon_Hibiscus_Tea.png", "HIBISCUS + LEMON"],
  ["tea", "Peach Tea", 16000, "Dialy_Drip_20_Foto_Produk/20_Peach_Tea.png", "TEA + PEACH", true]
];

// Inisialisasi daftar item menu dan pilihan dropdown pesanan
const menuContainer = document.getElementById("menuItems");

if (menuContainer) {
  menuContainer.innerHTML = productData
    .map((product, index) => `
      <button class="menu-item" type="button" data-category="${product[0]}" data-index="${index}">
        <span class="drink-icon">${index % 2 ? "▤" : "▥"}</span>
        <span class="menu-item-name">${product[1]}</span>
        ${product[5] ? '<span class="menu-item-bestseller">BESTSELLER</span>' : ""}
      </button>
    `)
    .join("");
}

// Ambil tombol setelah daftar produk selesai dirender.
let menuItems = menuContainer ? Array.from(menuContainer.querySelectorAll(".menu-item")) : [];

// ==========================================
// PREVIEW PRODUK TERPILIH
// ==========================================
function selectProduct(index) {
  const item = productData[index];
  if (!item) return;

  const [category, title, price, image, composition] = item;
  const previewImage = document.getElementById("previewImage");
  const previewCategory = document.getElementById("previewCategory");
  const previewTitle = document.getElementById("previewTitle");
  const previewPrice = document.getElementById("previewPrice");
  const previewComposition = document.getElementById("previewComposition");
  const previewIcon = document.getElementById("previewIcon");

  if (previewImage) {
    previewImage.src = image;
    previewImage.alt = title;
  }
  if (previewCategory) previewCategory.textContent = categoryNames[category] || category.toUpperCase();
  if (previewIcon) previewIcon.textContent = category === "tea" ? "♨" : category === "non-coffee" ? "◈" : "▥";
  if (previewTitle) previewTitle.textContent = title;
  if (previewPrice) previewPrice.textContent = formatRupiah(price);
  if (previewComposition) previewComposition.textContent = composition;

  // Set status tombol yang aktif
  menuItems.forEach((btn) => {
    btn.classList.toggle("active", Number(btn.dataset.index) === index);
  });
}

// Klik pada item menu untuk mengubah preview; klik lagi untuk kustomisasi & tambah
menuItems.forEach((item) => {
  item.addEventListener("click", () => {
    const idx = Number(item.dataset.index);
    if (item.classList.contains("active")) {
      openCustomizeModal(idx);
    } else {
      selectProduct(idx);
    }
  });
});

if (cartItemsElement) {
  cartItemsElement.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-act]");
    if (!trigger) return;
    const key = trigger.dataset.key;
    const action = trigger.dataset.act;
    const item = cart.get(key);
    if (!item) return;

    if (action === "edit") {
      openCustomizeModal(item.productIndex, key);
      return;
    }
    if (action === "inc") item.quantity += 1;
    if (action === "dec" && item.quantity > 1) item.quantity -= 1;
    if (action === "del" || (action === "dec" && item.quantity <= 1)) {
      cart.delete(key);
    }
    updateCartView();
  });

  cartItemsElement.addEventListener("input", (event) => {
    const target = event.target;
    if (target.classList.contains("cart-note")) {
      const key = target.dataset.key;
      const item = cart.get(key);
      if (item) {
        item.note = target.value;
        saveCartToStorage();
      }
    }
  });
}

// Tombol "Pesan minuman ini" pada preview membuka modal kustomisasi
const previewOrder = document.querySelector(".preview-order");
if (previewOrder) {
  previewOrder.addEventListener("click", (event) => {
    event.preventDefault();
    const selectedItem = menuItems.find((item) => item.classList.contains("active"));
    const productIndex = selectedItem ? Number(selectedItem.dataset.index) : 0;
    openCustomizeModal(productIndex);
  });
}

// ==========================================
// FILTER KATEGORI MENU (TAB)
// ==========================================
const categories = ["coffee-milk", "coffee-black", "non-coffee", "tea"];

menuTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => {
    // Perbarui status aktif tab navigasi
    menuTabs.forEach((btn) => {
      btn.classList.remove("active");
      btn.setAttribute("aria-selected", "false");
    });
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");

    const category = categories[index];

    // Filter daftar menu sesuai kategori terpilih
    menuItems.forEach((item) => {
      item.hidden = item.dataset.category !== category;
    });

    // Otomatis pilih item pertama pada kategori yang dibuka
    const firstItem = Array.from(menuItems).find((item) => item.dataset.category === category);
    if (firstItem) {
      selectProduct(Number(firstItem.dataset.index));
    }
  });
});

// Tampilkan hanya kategori awal saat halaman pertama kali dibuka.
const initialCategory = "coffee-milk";
menuItems.forEach((item) => {
  item.hidden = item.dataset.category !== initialCategory;
});

// Pilih produk awal secara default (produk index ke-0)
selectProduct(0);

// ==========================================
// PENCARIAN MENU REAL-TIME (LIVE SEARCH)
// ==========================================
const menuSearch = document.getElementById("menuSearch");
if (menuSearch) {
  menuSearch.addEventListener("input", () => {
    const query = menuSearch.value.trim().toLowerCase();
    if (!query) {
      const activeTab = document.querySelector(".menu-tab.active");
      const currentCategory = activeTab?.dataset.category || initialCategory;
      menuItems.forEach((item) => {
        item.hidden = item.dataset.category !== currentCategory;
      });
      return;
    }

    let firstMatch = null;
    menuItems.forEach((item) => {
      const name = item.querySelector(".menu-item-name")?.textContent.toLowerCase() || "";
      const match = name.includes(query);
      item.hidden = !match;
      if (match && !firstMatch) firstMatch = item;
    });

    if (firstMatch) {
      selectProduct(Number(firstMatch.dataset.index));
    }
  });
}

// ==========================================
// EVENT LISTENER PROMO CODE
// ==========================================
const cartPromoBtn = document.getElementById("cartPromoBtn");
const cartPromoInput = document.getElementById("cartPromoInput");
const cartPromoRemoveBtn = document.getElementById("cartPromoRemoveBtn");

if (cartPromoBtn && cartPromoInput) {
  cartPromoBtn.addEventListener("click", () => {
    applyPromo(cartPromoInput.value);
  });

  cartPromoInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      applyPromo(cartPromoInput.value);
    }
  });
}

if (cartPromoRemoveBtn) {
  cartPromoRemoveBtn.addEventListener("click", removePromo);
}

// Inisialisasi data keranjang dan pelanggan dari penyimpanan lokal browser
loadCartFromStorage();
updateCartView();
