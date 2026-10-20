<?php
/*
 * Authentication (POST)
 * Receives: user, password
 * Responses:
 *   200 OK            -> the user has been validated
 *   400 Bad Request   -> some data is missing
 *   401 Unauthorized  -> the user could not be validated
 *   500 Server Error  -> users.json cannot be read
 */

require_once 'functions.php';

requireMethod('POST');
startAppSession();

$userName = getInputText($_POST, 'user');
// The password is not trimmed: spaces can be part of it
$password = isset($_POST['password']) && is_string($_POST['password']) ? $_POST['password'] : '';

if ($userName === '' || $password === '') {
    sendText(400, 'The user name and the password are both required.');
}

$users = loadUsers();
if ($users === null) {
    sendText(500, 'The users file could not be read. Please contact the administrator.');
}

if (!validateUser($userName, $password, $users)) {
    // A failed attempt also closes any previous session
    unset($_SESSION['user']);
    sendText(401, 'Authentication error: the user could not be validated.');
}

// New session id after logging in, to avoid session fixation
session_regenerate_id(true);
$_SESSION['user'] = $userName;

sendText(200, 'User validated.');
