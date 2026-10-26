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

document.addEventListener("DOMContentLoaded", setupNavigationButtons);
