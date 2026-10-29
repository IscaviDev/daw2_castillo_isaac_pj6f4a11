/*
 * Shared client functions used by every page.
 * The client side only works as a user interface: it never stores data
 * and never makes calculations. All of that is done by the PHP server.
 */

// Base URL of the PHP scripts, relative to the client pages
const SERVER_URL = "../server/";

// Loads another page of the application
function goTo(page) {
    window.location.href = page;
}

// Every button with a data-go attribute navigates to the page it indicates
function setupNavigationButtons() {
    const buttons = document.querySelectorAll("[data-go]");
    buttons.forEach(function (button) {
        button.addEventListener("click", function () {
            goTo(button.dataset.go);
        });
    });
}

// Shows a message inside a container. type: "success", "error" or "info"
function showMessage(elementId, text, type) {
    const element = document.getElementById(elementId);
    element.textContent = text;
    element.className = "message " + type;
    element.hidden = false;
}

// Hides a message container
function hideMessage(elementId) {
    const element = document.getElementById(elementId);
    element.textContent = "";
    element.hidden = true;
}

// Protected pages call this function: if the server says there is no active
// session, the user is sent back to the start page.
// Returns the name of the logged in user, or null.
async function requireSession() {
    try {
        const response = await fetch(SERVER_URL + "session.php");
        if (response.status === 200) {
            const session = await response.json();
            showLoggedUser(session.user);
            return session.user;
        }
    } catch (error) {
        // The server could not be reached: treated as a non active session
    }
    goTo("index.html?error=session");
    return null;
}

// Writes the name of the logged in user in the page header
function showLoggedUser(userName) {
    const element = document.getElementById("logged-user");
    if (element) {
        element.textContent = "Logged in as: " + userName;
    }
}

// Menus with a drop-down list and a single access button.
// pages is an associative object: option value -> page to open
function setupOperationSelector(selectId, buttonId, messageId, pages) {
    const select = document.getElementById(selectId);
    document.getElementById(buttonId).addEventListener("click", function () {
        const option = select.value;
        if (!(option in pages)) {
            showMessage(messageId, "Please select an option from the list first.", "error");
            select.focus();
            return;
        }
        goTo(pages[option]);
    });
    select.addEventListener("change", function () {
        hideMessage(messageId);
    });
}

document.addEventListener("DOMContentLoaded", setupNavigationButtons);
