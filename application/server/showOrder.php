<?php
/*
 * View of one order (GET)
 * Receives: code (order code)
 * Opens orders.json, finds the order and sends an HTML document with its data.
 * Responses:
 *   200 OK           -> HTML page with the tables of the order
 *   400 Bad Request  -> HTML page: the order code is missing or not valid
 *   401 Unauthorized -> HTML page: no active session
 *   404 Not Found    -> HTML page: orders.json cannot be found or opened,
 *                       or there is no order with that code
 *   405 Not Allowed  -> HTML page: the request does not use GET
 */

require_once 'functions.php';

requireMethod('GET', 'html');
requireLogin('html');

$code = normaliseOrderCode(getInputText($_GET, 'code'));
if (!isValidOrderCode($code)) {
    sendErrorPage(400, 'The order code is missing or not valid. It must have 3 to 20 letters, numbers or hyphens.');
}

$orders = loadOrders();
if ($orders === null) {
    sendErrorPage(404, 'The orders file (orders.json) could not be found or opened. If no order has been created yet, create the first one from the operations menu.');
}

if (!isset($orders[$code])) {
    sendErrorPage(404, 'There is no order with the code ' . $code . '. Please check the code and try again.');
}

$order = $orders[$code];
$content = renderOrdersTable([$code => $order])
    . '<h2>Products of the order</h2>'
    . renderProductsTable($order['products'])
    . renderNavigationButtons();

sendHtmlPage(200, 'Order ' . $code, $content);
