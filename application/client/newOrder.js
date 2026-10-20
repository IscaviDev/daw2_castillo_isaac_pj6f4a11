/*
 * New order page.
 * The product list comes from the server (products.php) and the order is sent
 * to createOrder.php, which calculates the total with VAT and saves it.
 * This script only validates the form and shows the results.
 */

const MAX_QUANTITY = 100000;

// Validation rules of the text fields: field name => test, label and error message
const FIELD_RULES = {
    code: {
        test: function (value) {
            return /^[A-Za-z0-9-]{3,20}$/.test(value);
        },
        label: "Order code",
        message: "3 to 20 letters, numbers or hyphens."
    },
    fullName: {
        test: function (value) {
            return /^\p{L}[\p{L}'.-]*(\s+\p{L}[\p{L}'.-]*)+$/u.test(value) && value.length <= 100;
        },
        label: "Full name",
        message: "enter the first name and surname of the customer (letters only)."
    },
    address: {
        test: function (value) {
            return value.length >= 5 && value.length <= 150;
        },
        label: "Postal address",
        message: "5 to 150 characters."
    },
    email: {
        test: function (value) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 100;
        },
        label: "Email address",
        message: "enter a valid address, for example name@example.com."
    },
    phone: {
        test: function (value) {
            return /^\+?[0-9]{9,15}$/.test(value.replace(/\s+/g, ""));
        },
        label: "Phone number",
        message: "9 to 15 digits, it can start with +."
    }
};

/* ---------- Product list ---------- */

// Creates one row of the product table
function createProductRow(productId, product) {
    const row = document.createElement("tr");

    const checkCell = document.createElement("td");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = "check-" + productId;
    checkbox.dataset.product = productId;
    checkbox.addEventListener("change", handleProductCheck);
    checkCell.appendChild(checkbox);

    const nameCell = document.createElement("td");
    const label = document.createElement("label");
    label.htmlFor = checkbox.id;
    label.textContent = product.name;
    nameCell.appendChild(label);

    const priceCell = document.createElement("td");
    priceCell.className = "price";
    priceCell.textContent = product.price + " / " + product.unit;

    const quantityCell = document.createElement("td");
    const quantity = document.createElement("input");
    quantity.type = "number";
    quantity.id = "quantity-" + productId;
    quantity.name = "quantities[" + productId + "]";
    quantity.min = "1";
    quantity.max = String(MAX_QUANTITY);
    quantity.step = "1";
    quantity.disabled = true;
    quantity.setAttribute("aria-label", "Quantity of " + product.name);
    quantityCell.appendChild(quantity);

    row.append(checkCell, nameCell, priceCell, quantityCell);
    return row;
}

// Shows the products received from the server
function renderProducts(products) {
    const tbody = document.getElementById("product-rows");
    tbody.innerHTML = "";
    for (const productId in products) {
        tbody.appendChild(createProductRow(productId, products[productId]));
    }
}

// Asks the server for the product list
async function loadProducts() {
    try {
        const response = await fetch(SERVER_URL + "products.php");
        if (response.status === 401) {
            goTo("index.html?error=session");
            return;
        }
        if (!response.ok) {
            throw new Error(await response.text());
        }
        renderProducts(await response.json());
    } catch (error) {
        document.getElementById("product-rows").innerHTML = "";
        document.getElementById("send-button").disabled = true;
        showMessage("order-message", "The product list could not be loaded from the server. Please reload the page.", "error");
    }
}

// The quantity of a product can only be entered when the product is ticked
function handleProductCheck(event) {
    const quantity = document.getElementById("quantity-" + event.target.dataset.product);
    quantity.disabled = !event.target.checked;
    if (event.target.checked) {
        if (quantity.value === "") {
            quantity.value = "1";
        }
        quantity.focus();
    } else {
        quantity.value = "";
        quantity.classList.remove("invalid");
    }
}

/* ---------- Validation ---------- */

// Marks or unmarks a field as incorrect
function markField(field, isValid) {
    field.classList.toggle("invalid", !isValid);
}

// Returns the list of errors of the text fields
function validateFields(form) {
    const errors = [];
    for (const fieldName in FIELD_RULES) {
        const field = form.elements[fieldName];
        const value = field.value.trim();
        const isValid = FIELD_RULES[fieldName].test(value);
        markField(field, isValid);
        if (!isValid) {
            const rule = FIELD_RULES[fieldName];
            errors.push(rule.label + ": " + (value === "" ? "this field is mandatory." : rule.message));
        }
    }
    return errors;
}

// Returns the list of errors of the selected products
function validateProducts() {
    const errors = [];
    const checked = document.querySelectorAll("#product-rows input[type=checkbox]:checked");

    if (checked.length === 0) {
        errors.push("Products: tick at least one product.");
        return errors;
    }

    checked.forEach(function (checkbox) {
        const quantity = document.getElementById("quantity-" + checkbox.dataset.product);
        const value = quantity.value.trim();
        const isValid = /^[0-9]+$/.test(value) && Number(value) >= 1 && Number(value) <= MAX_QUANTITY;
        markField(quantity, isValid);
        if (!isValid) {
            const name = document.querySelector("label[for=" + checkbox.id + "]").textContent;
            errors.push("Quantity of \"" + name + "\": enter a whole number between 1 and " + MAX_QUANTITY.toLocaleString("en-GB") + ".");
        }
    });
    return errors;
}

/* ---------- Sending the order ---------- */

// Shows the total price with VAT sent by the server
function showOrderResult(code, totalWithVat) {
    const result = document.getElementById("order-result");
    const amount = Number(totalWithVat).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    result.innerHTML = "";
    const title = document.createElement("p");
    title.textContent = "Order " + code + " has been saved successfully.";
    const total = document.createElement("p");
    total.className = "result-total";
    total.textContent = "Total price of the order (21% VAT included): " + amount + " €";
    result.append(title, total);
    result.hidden = false;
}

// Leaves the form empty and ready for a new order
function resetOrderForm(form) {
    form.reset();
    document.querySelectorAll("#product-rows input[type=number]").forEach(function (quantity) {
        quantity.disabled = true;
    });
}

// Sends the order to the server and handles every possible response
async function sendOrder(form) {
    const button = document.getElementById("send-button");
    const code = form.elements.code.value.trim().toUpperCase();
    button.disabled = true;

    try {
        const response = await fetch(SERVER_URL + "createOrder.php", {
            method: "POST",
            body: new FormData(form)
        });
        const text = await response.text();

        if (response.status === 201) {
            showOrderResult(code, text);
            resetOrderForm(form);
        } else if (response.status === 401) {
            goTo("index.html?error=session");
        } else if (response.status === 404) {
            showServerDocument(text);
        } else {
            showMessage("order-message", text, "error");
        }
    } catch (error) {
        showMessage("order-message", "The server could not be reached. The order has not been sent.", "error");
    }
    button.disabled = false;
}

// Validates the whole form before sending it
function handleOrderSubmit(event) {
    event.preventDefault();
    const form = event.target;
    hideMessage("order-message");
    document.getElementById("order-result").hidden = true;

    const errors = validateFields(form).concat(validateProducts());
    if (errors.length > 0) {
        showMessage("order-message", "Please correct the following data:\n- " + errors.join("\n- "), "error");
        return;
    }
    sendOrder(form);
}

document.getElementById("order-form").addEventListener("submit", handleOrderSubmit);
requireSession().then(function (user) {
    if (user !== null) {
        loadProducts();
    }
});
