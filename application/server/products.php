<?php
/*
 * Product catalogue (GET)
 * Sends the 4 products that can be ordered, with their prices already formatted,
 * so that the client only has to display them.
 * Responses:
 *   200 OK           -> {"P01": {"name": ..., "unit": ..., "price": "3.26 €"}, ...}
 *   401 Unauthorized -> no active session
 */

require_once 'functions.php';

requireMethod('GET');
requireLogin();

$catalogue = [];
foreach (getProducts() as $productId => $product) {
    $catalogue[$productId] = [
        'name' => $product['name'],
        'unit' => $product['unit'],
        'price' => formatMoney($product['price']),
    ];
}

sendJson(200, $catalogue);
