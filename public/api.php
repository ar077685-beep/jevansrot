<?php
/**
 * Jevansrot Sciences - InfinityFree MySQL Backend API
 * Automatically deployed to htdocs/ via GitHub Actions
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$db_host = 'sql211.byetcluster.com';
$db_user = 'if0_43284891';
$db_pass = '1cHfXeCOumU8K';
$db_name = 'if0_43284891_JEEVANSROTDB';
$db_port = 3306;

function get_db_connection() {
    global $db_host, $db_user, $db_pass, $db_name, $db_port;
    $conn = @new mysqli($db_host, $db_user, $db_pass, $db_name, $db_port);
    if ($conn->connect_error) {
        return null;
    }
    $conn->set_charset("utf8mb4");
    init_tables($conn);
    return $conn;
}

function init_tables($conn) {
    $conn->query("
        CREATE TABLE IF NOT EXISTS orders (
            id VARCHAR(64) PRIMARY KEY,
            order_number VARCHAR(64) NOT NULL UNIQUE,
            created_at DATETIME NOT NULL,
            customer_name VARCHAR(255) NOT NULL,
            customer_phone VARCHAR(50) NOT NULL,
            customer_address TEXT NOT NULL,
            customer_city VARCHAR(100) NOT NULL,
            customer_state VARCHAR(100) NOT NULL,
            customer_pincode VARCHAR(20) NOT NULL,
            items_json LONGTEXT NOT NULL,
            total_amount DECIMAL(10,2) NOT NULL,
            advance_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            remain_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            payment_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
            payment_method VARCHAR(50) NOT NULL DEFAULT 'Cash on Delivery',
            status VARCHAR(50) NOT NULL DEFAULT 'Pending',
            tracking_id VARCHAR(100),
            updated_at DATETIME
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    $conn->query("
        CREATE TABLE IF NOT EXISTS products (
            id VARCHAR(64) PRIMARY KEY,
            slug VARCHAR(128) NOT NULL UNIQUE,
            name VARCHAR(255) NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            original_price DECIMAL(10,2) NOT NULL,
            discount VARCHAR(50),
            badge VARCHAR(100),
            tagline VARCHAR(255),
            description TEXT,
            img TEXT,
            in_stock TINYINT(1) DEFAULT 1,
            stock_count INT DEFAULT 100,
            category VARCHAR(100) DEFAULT 'General'
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");
}

$action = $_GET['action'] ?? '';

if ($action === 'test' || $action === 'status') {
    $conn = get_db_connection();
    if ($conn) {
        $tables = [];
        $tRes = $conn->query("SHOW TABLES");
        if ($tRes) {
            while ($row = $tRes->fetch_array()) {
                $tables[] = $row[0];
            }
        }
        $conn->close();
        echo json_encode([
            'success' => true,
            'message' => 'Connected successfully to InfinityFree MySQL database!',
            'database' => $db_name,
            'host' => $db_host,
            'tables' => $tables
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Unable to connect to MySQL database from this host',
            'host' => $db_host,
            'database' => $db_name
        ]);
    }
    exit();
}

if ($action === 'get_orders') {
    $conn = get_db_connection();
    if (!$conn) {
        echo json_encode(['success' => false, 'message' => 'Database unavailable']);
        exit();
    }
    $res = $conn->query("SELECT * FROM orders ORDER BY created_at DESC");
    $orders = [];
    while ($row = $res->fetch_assoc()) {
        $row['items'] = json_decode($row['items_json'], true) ?: [];
        $orders[] = $row;
    }
    $conn->close();
    echo json_encode(['success' => true, 'orders' => $orders]);
    exit();
}

if ($action === 'save_order' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    $order = json_decode($raw, true);
    if (!$order || empty($order['id'])) {
        echo json_encode(['success' => false, 'message' => 'Invalid order data']);
        exit();
    }
    $conn = get_db_connection();
    if (!$conn) {
        echo json_encode(['success' => false, 'message' => 'Database connection failed']);
        exit();
    }

    $id = $conn->real_escape_string($order['id']);
    $order_num = $conn->real_escape_string($order['orderNumber'] ?? ('JEV-'.rand(1000,9999)));
    $name = $conn->real_escape_string($order['customerName'] ?? '');
    $phone = $conn->real_escape_string($order['customerPhone'] ?? '');
    $addr = $conn->real_escape_string($order['customerAddress'] ?? '');
    $city = $conn->real_escape_string($order['customerCity'] ?? '');
    $state = $conn->real_escape_string($order['customerState'] ?? '');
    $pin = $conn->real_escape_string($order['customerPincode'] ?? '');
    $items = $conn->real_escape_string(json_encode($order['items'] ?? []));
    $total = floatval($order['totalAmount'] ?? 0);
    $advance = floatval($order['advanceAmount'] ?? 0);
    $remain = floatval($order['remainAmount'] ?? ($total - $advance));
    $pay_status = $conn->real_escape_string($order['paymentStatus'] ?? 'Pending');
    $pay_method = $conn->real_escape_string($order['paymentMethod'] ?? 'Cash on Delivery');
    $status = $conn->real_escape_string($order['status'] ?? 'Pending');
    $tracking = $conn->real_escape_string($order['trackingId'] ?? '');
    $now = date('Y-m-d H:i:s');

    $sql = "INSERT INTO orders (id, order_number, created_at, customer_name, customer_phone, customer_address, customer_city, customer_state, customer_pincode, items_json, total_amount, advance_amount, remain_amount, payment_status, payment_method, status, tracking_id, updated_at)
            VALUES ('$id', '$order_num', '$now', '$name', '$phone', '$addr', '$city', '$state', '$pin', '$items', $total, $advance, $remain, '$pay_status', '$pay_method', '$status', '$tracking', '$now')
            ON DUPLICATE KEY UPDATE 
                advance_amount = $advance,
                remain_amount = $remain,
                payment_status = '$pay_status',
                status = '$status',
                tracking_id = '$tracking',
                updated_at = '$now'";

    if ($conn->query($sql)) {
        echo json_encode(['success' => true, 'order_id' => $id]);
    } else {
        echo json_encode(['success' => false, 'message' => $conn->error]);
    }
    $conn->close();
    exit();
}

echo json_encode(['success' => true, 'service' => 'Jevansrot Sciences API v2']);
