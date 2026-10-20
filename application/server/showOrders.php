<?php
/*
 * View of all the orders (GET)
 * Reads all the orders from orders.json and sends an HTML document with a table.
 * Responses:
 *   200 OK           -> HTML page with the table of all the orders
 *   401 Unauthorized -> HTML page: no active session
 *   404 Not Found    -> HTML page: orders.json cannot be found or opened
 *   405 Not Allowed  -> HTML page: the request does not use GET
 */

require_once 'functions.php';

requireMethod('GET', 'html');
requireLogin('html');

$orders = loadOrders();
if ($orders === null) {
    sendErrorPage(404, 'The orders file (orders.json) could not be found or opened. If no order has been created yet, create the first one from the operations menu.');
}

if (count($orders) === 0) {
    $content = '<p class="message info">There are no orders saved yet.</p>';
} else {
    $content = '<p>Number of orders: <strong>' . count($orders) . '</strong></p>' . renderOrdersTable($orders);
}

sendHtmlPage(200, 'All orders', $content . renderNavigationButtons());
