/*
 * Log in page.
 * Missing data is controlled here; the user is validated by the server (login.php).
 */

// Seconds the authentication error is shown before going back to the start page
const RETURN_DELAY_SECONDS = 3;

// Form fields and the name shown to the user for each one
const LOGIN_FIELDS = { user: "user name", password: "password" };

// Returns a list with the names of the empty fields
function getMissingFields(form) {
    const missing = [];
    for (const field in LOGIN_FIELDS) {
        if (form.elements[field].value.trim() === "") {
            missing.push(field);
        }
    }
    return missing;
}

// Shows the authentication error and returns to the start page
function handleAuthenticationError(text) {
    showMessage("login-message", text + "\nReturning to the start page in " + RETURN_DELAY_SECONDS + " seconds...", "error");
    document.getElementById("login-button").disabled = true;
    setTimeout(function () {
        goTo("index.html?error=auth");
    }, RETURN_DELAY_SECONDS * 1000);
}

// Sends the user name and password to the server
async function sendLogin(form) {
    const button = document.getElementById("login-button");
    button.disabled = true;
    try {
        const response = await fetch(SERVER_URL + "login.php", {
            method: "POST",
            body: new FormData(form)
        });
        const text = await response.text();

        if (response.status === 200) {
            goTo("menu.html");
        } else if (response.status === 401) {
            handleAuthenticationError(text);
        } else {
            showMessage("login-message", text, "error");
            button.disabled = false;
        }
    } catch (error) {
        showMessage("login-message", "The server could not be reached. Please check your connection and try again.", "error");
        button.disabled = false;
    }
}

// Validates the form before sending it
function handleLoginSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const missing = getMissingFields(form);

    if (missing.length > 0) {
        const labels = missing.map(function (field) {
            return LOGIN_FIELDS[field];
        });
        showMessage("login-message", "Please enter the following data: " + labels.join(" and ") + ".", "error");
        form.elements[missing[0]].focus();
        return;
    }
    hideMessage("login-message");
    sendLogin(form);
}

document.getElementById("login-form").addEventListener("submit", handleLoginSubmit);
