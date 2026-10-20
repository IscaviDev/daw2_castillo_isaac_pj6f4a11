<?php
/*
 * Session check (GET)
 * Used by the protected client pages to know whether a user has logged in.
 * Responses:
 *   200 OK           -> {"user": "<user name>"}
 *   401 Unauthorized -> no active session
 */

require_once 'functions.php';

requireMethod('GET');
requireLogin();

sendJson(200, ['user' => $_SESSION['user']]);
