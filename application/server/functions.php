<?php
/*
 * Shared server functions.
 * Every PHP script of the application includes this file, so the same code
 * is never repeated in different scripts.
 */

date_default_timezone_set('Europe/Madrid');

// Paths of the data files (outside the "application" folder)
define('USERS_FILE', __DIR__ . '/../../users/users.json');
define('ORDERS_DIR', __DIR__ . '/../../orders');
define('ORDERS_FILE', ORDERS_DIR . '/orders.json');

// VAT applied to every order (%)
define('VAT_RATE', 21);

/* ==========================================================
   HTTP responses
   ========================================================== */

// Returns the standard reason phrase of an HTTP status code
function getStatusText($statusCode)
{
    $statusTexts = [
        200 => 'OK',
        201 => 'Created',
        400 => 'Bad Request',
        401 => 'Unauthorized',
        404 => 'Not Found',
        405 => 'Method Not Allowed',
        409 => 'Conflict',
        500 => 'Internal Server Error',
    ];
    return $statusTexts[$statusCode] ?? '';
}

// Sends a plain text response (only the result, without HTML/JS/CSS) and stops the script
function sendText($statusCode, $text)
{
    http_response_code($statusCode);
    header('Content-Type: text/plain; charset=UTF-8');
    echo $text;
    exit;
}

// Sends an associative array as a JSON response and stops the script
function sendJson($statusCode, $data)
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// Sends an error in the format expected by the client
function sendError($statusCode, $message, $format = 'text')
{
    sendText($statusCode, $message);
}

// Stops the script with "405 Method Not Allowed" if the request does not use the expected method
function requireMethod($method, $format = 'text')
{
    if ($_SERVER['REQUEST_METHOD'] !== $method) {
        header('Allow: ' . $method);
        sendError(405, 'Method not allowed. This operation only accepts ' . $method . ' requests.', $format);
    }
}

/* ==========================================================
   Session and authentication
   ========================================================== */

// Starts the PHP session with secure cookies (HTTPS only, not readable from JavaScript)
function startAppSession()
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start([
            'cookie_httponly' => true,
            'cookie_secure' => true,
            'cookie_samesite' => 'Strict',
        ]);
    }
}

// Returns true if a user has logged in during the current session
function isLoggedIn()
{
    startAppSession();
    return isset($_SESSION['user']);
}

// Stops the script with "401 Unauthorized" if no user has logged in
function requireLogin($format = 'text')
{
    if (!isLoggedIn()) {
        sendError(401, 'Your session is not active. Please log in to use this operation.', $format);
    }
}

// Checks a user name and password against the users stored in users.json
function validateUser($userName, $password, $users)
{
    foreach ($users as $user) {
        if (hash_equals($user['user'], $userName) && password_verify($password, $user['password'])) {
            return true;
        }
    }
    return false;
}

/* ==========================================================
   JSON files
   ========================================================== */

// Reads a JSON file and returns its content as an associative array.
// Returns null if the file does not exist, cannot be opened or does not contain valid JSON.
function readJsonFile($path)
{
    if (!is_file($path) || !is_readable($path)) {
        return null;
    }
    $content = file_get_contents($path);
    if ($content === false) {
        return null;
    }
    $data = json_decode($content, true);
    return is_array($data) ? $data : null;
}

// Returns all the users of the application, or null if users.json cannot be read
function loadUsers()
{
    return readJsonFile(USERS_FILE);
}

// Returns a trimmed text value received in a request, or an empty string if it was not sent
function getInputText($source, $field)
{
    return isset($source[$field]) && is_string($source[$field]) ? trim($source[$field]) : '';
}

/* ==========================================================
   Product catalogue
   The only 4 products that can be included in an order.
   Prices in euros without VAT (usual prices in Spanish DIY and
   construction stores, October 2026).
   ========================================================== */

function getProducts()
{
    return [
        'P01' => [
            'name' => 'Grey cement CEM II/B-L 32.5 N (25 kg bag)',
            'unit' => 'bag',
            'price' => 3.26,
        ],
        'P02' => [
            'name' => 'Double hollow brick 24 x 11.5 x 8 cm',
            'unit' => 'brick',
            'price' => 0.15,
        ],
        'P03' => [
            'name' => 'Plasterboard 2500 x 1200 x 13 mm',
            'unit' => 'board',
            'price' => 6.94,
        ],
        'P04' => [
            'name' => 'White matt interior plastic paint (15 L bucket)',
            'unit' => 'bucket',
            'price' => 32.23,
        ],
    ];
}

// Formats an amount of money, for example 1234.5 -> "1,234.50 €"
function formatMoney($amount)
{
    return number_format($amount, 2, '.', ',') . ' €';
}
