<?php
/*
 * Creation of a new order (POST)
 * Receives: code, fullName, address, email, phone and quantities[productId]
 *           (only the products ticked in the form)
 * Responses:
 *   201 Created      -> only the result: total price of the order with 21% VAT (e.g. "156.44")
 *   400 Bad Request  -> incorrect or missing data (text with the list of errors)
 *   401 Unauthorized -> no active session
 *   404 Not Found    -> HTML page: orders.json cannot be found or opened
 *   405 Not Allowed  -> the request does not use POST
 *   409 Conflict     -> there is already an order with the same code
 */

require_once 'functions.php';

requireMethod('POST');
requireLogin();

$products = getProducts();
$code = normaliseOrderCode(getInputText($_POST, 'code'));
$customer = getCustomerData($_POST);
$quantities = $_POST['quantities'] ?? [];

// Validation of all the data received
$errors = [];
if (!isValidOrderCode($code)) {
    $errors['code'] = 'Enter an order code of 3 to 20 characters (letters, numbers or hyphens).';
}
$errors = array_merge($errors, validateCustomer($customer), validateQuantities($quantities, $products));

if (count($errors) > 0) {
    sendText(400, "The order has not been saved. Please correct the following data:\n- " . implode("\n- ", $errors));
}

// Reading of the orders file
$orders = loadOrdersForWriting();
if ($orders === null) {
    sendErrorPage(404, 'The orders file (orders.json) was found but it could not be opened or its content is not valid. The order has not been saved.');
}

if (isset($orders[$code])) {
    sendText(409, 'There is already an order with the code ' . $code . '. Please use a different order code.');
}

// Calculation of the order and storage in orders.json
$order = buildOrder($code, $customer, calculateOrderLines($quantities, $products), $_SESSION['user']);
$orders[$code] = $order;

if (!saveOrders($orders)) {
    sendErrorPage(404, 'The orders file (orders.json) could not be found or opened for writing. The order has not been saved.');
}

sendText(201, number_format($order['totals']['withVat'], 2, '.', ''));
