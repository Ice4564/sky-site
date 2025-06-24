// แสดงเครดิตด้านบนขวา
function showCredits() {
  let credits = localStorage.getItem("credits");
  if (credits === null) {
    credits = 0;
    localStorage.setItem("credits", credits);
  }

  let div = document.getElementById("creditsDisplay");
  if (!div) {
    div = document.createElement("div");
    div.id = "creditsDisplay";
    div.style.position = "fixed";
    div.style.top = "10px";
    div.style.right = "20px";
    div.style.background = "#222";
    div.style.color = "#fff";
    div.style.padding = "10px 15px";
    div.style.borderRadius = "8px";
    div.style.fontWeight = "bold";
    document.body.appendChild(div);
  }

  div.innerText = `💳 เครดิต: ${credits}฿`;
}

// สร้างสินค้าแต่ละตัว
function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";

  card.innerHTML = `
    <img src="${product.image}" alt="${product.name}" />
    <h3>${product.name}</h3>
    <p>${product.price}฿</p>
    <button onclick="buyProduct('${product.name}', ${product.price})">ซื้อเลย</button>
  `;

  return card;
}

// ซื้อสินค้า
function buyProduct(name, price) {
  let credits = parseInt(localStorage.getItem("credits") || "0");

  if (credits < price) {
    alert("❌ เครดิตไม่พอ กรุณาเติมเงินก่อน!");
    return;
  }

  if (confirm(`ต้องการซื้อ "${name}" ราคา ${price}฿ หรือไม่?`)) {
    credits -= price;
    localStorage.setItem("credits", credits);
    savePurchaseHistory(name);
    showCredits();
    alert(`✅ ซื้อ "${name}" สำเร็จ!`);
  }
}

// บันทึกประวัติ
function savePurchaseHistory(name) {
  const history = JSON.parse(localStorage.getItem("purchaseHistory") || "[]");
  history.push({
    item: name,
    time: new Date().toLocaleString()
  });
  localStorage.setItem("purchaseHistory", JSON.stringify(history));
}

// แสดงสินค้า
function renderProducts() {
  const grid = document.getElementById("productGrid");
  products.forEach(p => {
    const card = createProductCard(p);
    grid.appendChild(card);
  });
}

// เริ่มโหลด
window.onload = () => {
  showCredits();
  renderProducts();
};
