/*
 * Start page.
 * Shows a notice when the user arrives here after an authentication error
 * or after trying to open a protected page without logging in.
 */

const START_MESSAGES = {
    auth: "Authentication error: the user could not be validated. Please try again.",
    session: "Your session is not active. Please log in to continue."
};

function showStartMessage() {
    const reason = new URLSearchParams(window.location.search).get("error");
    if (reason in START_MESSAGES) {
        showMessage("start-message", START_MESSAGES[reason], "error");
    }
}

document.addEventListener("DOMContentLoaded", showStartMessage);
