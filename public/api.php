<?php
/**
 * Jevansrot Sciences - InfinityFree MySQL Backend API
 * Automatically deployed to htdocs/ via GitHub Actions / FTP
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
            customer_email VARCHAR(255) DEFAULT '',
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
        CREATE TABLE IF NOT EXISTS customers (
            id VARCHAR(64) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            phone VARCHAR(50) DEFAULT '',
            avatar TEXT,
            provider VARCHAR(50) DEFAULT 'google',
            created_at DATETIME NOT NULL,
            last_login DATETIME NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    $conn->query("
        CREATE TABLE IF NOT EXISTS products (
            id VARCHAR(64) PRIMARY KEY,
            slug VARCHAR(128) NOT NULL UNIQUE,
            name VARCHAR(255) NOT NULL,
            vendor VARCHAR(100) DEFAULT 'Jevansrot',
            price DECIMAL(10,2) NOT NULL,
            compare_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            original_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            discount VARCHAR(50),
            badge VARCHAR(100) DEFAULT 'b-pop',
            badge_label VARCHAR(100) DEFAULT 'Popular',
            rating DECIMAL(3,1) DEFAULT 4.8,
            reviews INT DEFAULT 0,
            is_new TINYINT(1) DEFAULT 0,
            description TEXT,
            img MEDIUMTEXT,
            ingredients_json TEXT,
            benefits_json TEXT,
            in_stock TINYINT(1) DEFAULT 1,
            stock_count INT DEFAULT 100,
            category VARCHAR(100) DEFAULT 'General',
            updated_at DATETIME
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");
}

function ensure_customer_columns($conn) {
    $needed = [
        'name' => "VARCHAR(255) NOT NULL",
        'email' => "VARCHAR(255) NOT NULL",
        'phone' => "VARCHAR(50) DEFAULT ''",
        'avatar' => "TEXT",
        'provider' => "VARCHAR(50) DEFAULT 'google'",
        'created_at' => "DATETIME NOT NULL",
        'last_login' => "DATETIME NOT NULL"
    ];
    $cols = [];
    $res = $conn->query("SHOW COLUMNS FROM customers");
    if ($res) {
        while ($r = $res->fetch_assoc()) {
            $cols[] = $r['Field'];
        }
        foreach ($needed as $col => $def) {
            if (!in_array($col, $cols)) {
                $conn->query("ALTER TABLE customers ADD COLUMN $col $def");
            }
        }
    }
}

function ensure_order_columns($conn) {
    $needed = [
        'customer_email' => "VARCHAR(255) DEFAULT ''"
    ];
    $cols = [];
    $res = $conn->query("SHOW COLUMNS FROM orders");
    if ($res) {
        while ($r = $res->fetch_assoc()) {
            $cols[] = $r['Field'];
        }
        foreach ($needed as $col => $def) {
            if (!in_array($col, $cols)) {
                $conn->query("ALTER TABLE orders ADD COLUMN $col $def");
            }
        }
    }
}

function ensure_product_columns($conn) {
    $needed = [
        'vendor' => "VARCHAR(100) DEFAULT 'Jevansrot'",
        'compare_price' => "DECIMAL(10,2) NOT NULL DEFAULT 0.00",
        'badge_label' => "VARCHAR(100) DEFAULT 'Popular'",
        'rating' => "DECIMAL(3,1) DEFAULT 4.8",
        'reviews' => "INT DEFAULT 0",
        'is_new' => "TINYINT(1) DEFAULT 0",
        'ingredients_json' => "TEXT",
        'benefits_json' => "TEXT",
        'updated_at' => "DATETIME"
    ];
    $cols = [];
    $res = $conn->query("SHOW COLUMNS FROM products");
    if ($res) {
        while ($r = $res->fetch_assoc()) {
            $cols[] = $r['Field'];
        }
        foreach ($needed as $col => $def) {
            if (!in_array($col, $cols)) {
                $conn->query("ALTER TABLE products ADD COLUMN $col $def");
            }
        }
        $conn->query("ALTER TABLE products MODIFY COLUMN img MEDIUMTEXT");
    }
}

function seed_default_products_if_empty($conn) {
    $chk = $conn->query("SELECT COUNT(*) AS cnt FROM products");
    if ($chk) {
        $row = $chk->fetch_assoc();
        if (intval($row['cnt']) > 0) return;
    }

    $seeds = [
        [
            'id' => 'p1',
            'slug' => 'boost-3499',
            'name' => 'Jevansrot Boost Medicine',
            'vendor' => 'Jevansrot',
            'img' => '/products/boost-3499.webp',
            'price' => 3499,
            'compare' => 4999,
            'off' => '30% OFF',
            'badge' => 'b-pop',
            'badgeLabel' => 'Popular',
            'rating' => 4.8,
            'reviews' => 1247,
            'isNew' => 0,
            'description' => 'A powerful daily boost formula designed to naturally enhance your energy levels, stamina, and overall vitality using our patented nano-technology.',
            'ingredients' => ['Ashwagandha Extract', 'Ginseng', 'Vitamin B Complex'],
            'benefits' => ['Boosts Energy', 'Improves Focus', 'Reduces Fatigue']
        ],
        [
            'id' => 'p2',
            'slug' => 'highpower-combo-3999',
            'name' => 'High Power Combo',
            'vendor' => 'Jevansrot',
            'img' => '/products/highpower-combo-3999.webp',
            'price' => 3999,
            'compare' => 5499,
            'off' => '27% OFF',
            'badge' => 'b-pop',
            'badgeLabel' => 'Best Seller',
            'rating' => 4.9,
            'reviews' => 2143,
            'isNew' => 0,
            'description' => 'Our ultimate high-power combo pack for complete performance enhancement. Formulated for maximum absorption and long-lasting results.',
            'ingredients' => ['Shilajit Gold', 'Safed Musli', 'Gokshura'],
            'benefits' => ['Enhances Strength', 'Improves Endurance', 'Supports Muscle Recovery']
        ],
        [
            'id' => 'p3',
            'slug' => 'Insane-combo-2999',
            'name' => 'Insane Power Combo',
            'vendor' => 'Jevansrot',
            'img' => '/products/insan-combo-2999.webp',
            'price' => 2999,
            'compare' => 4499,
            'off' => '33% OFF',
            'badge' => 'b-off',
            'badgeLabel' => 'Special Offer',
            'rating' => 4.7,
            'reviews' => 984,
            'isNew' => 0,
            'description' => 'Maximum strength combo delivering intense vitality and peak stamina. Ideal for active individuals seeking accelerated results naturally.',
            'ingredients' => ['Tribulus Terrestris', 'Fenugreek', 'Zinc Citrate'],
            'benefits' => ['Peak Performance', 'Rapid Absorption', 'Hormonal Balance']
        ],
        [
            'id' => 'p4',
            'slug' => 'medicine-1999',
            'name' => 'Jevansrot Daily Vitality',
            'vendor' => 'Jevansrot',
            'img' => '/products/medicine-1999.webp',
            'price' => 1999,
            'compare' => 2799,
            'off' => '29% OFF',
            'badge' => 'b-new',
            'badgeLabel' => 'New Arrival',
            'rating' => 4.6,
            'reviews' => 672,
            'isNew' => 1,
            'description' => 'Gentle yet potent daily wellness capsule that supports immunity, mental clarity, and metabolic function with clean, standardized botanical extracts.',
            'ingredients' => ['Amla Extract', 'Curcumin 95%', 'Moringa Leaf'],
            'benefits' => ['Immunity Support', 'Antioxidant Defense', 'Cellular Health']
        ],
        [
            'id' => 'p5',
            'slug' => 'medicine-combo-3499',
            'name' => 'Vitality & Stamina Combo',
            'vendor' => 'Jevansrot',
            'img' => '/products/medicine-combo-3499.webp',
            'price' => 3499,
            'compare' => 4999,
            'off' => '30% OFF',
            'badge' => 'b-pop',
            'badgeLabel' => 'Popular',
            'rating' => 4.8,
            'reviews' => 1432,
            'isNew' => 0,
            'description' => 'A synergistic pairing of our two top wellness formulations. Balances endocrine health while promoting continuous day-long vitality without caffeine crashes.',
            'ingredients' => ['KSM-66 Ashwagandha', 'Cordyceps Militaris', 'Rhodiola Rosea'],
            'benefits' => ['Stress Resilience', 'Physical Vitality', 'Sustained Energy']
        ],
        [
            'id' => 'p6',
            'slug' => 'oil-high-power-999',
            'name' => 'High Power Herbal Oil',
            'vendor' => 'Jevansrot',
            'img' => '/products/oil-999.webp',
            'price' => 999,
            'compare' => 1499,
            'off' => '33% OFF',
            'badge' => 'b-hot',
            'badgeLabel' => 'Hot Seller',
            'rating' => 4.9,
            'reviews' => 3120,
            'isNew' => 0,
            'description' => 'Traditional Ayurvedic cold-pressed botanical massage oil infused with 28 rare herbs. Enhances blood flow, relieves tension, and revitalizes localized tissue.',
            'ingredients' => ['Sesame Seed Oil', 'Mahanarayan Taila', 'Jyotishmati Oil', 'Eucalyptus'],
            'benefits' => ['Deep Tissue Absorption', 'Muscle Relaxation', 'Circulation Support']
        ],
        [
            'id' => 'p7',
            'slug' => 'spray-1499',
            'name' => 'Fast Relief Active Spray',
            'vendor' => 'Jevansrot',
            'img' => '/products/spray-1499.webp',
            'price' => 1499,
            'compare' => 1999,
            'off' => '25% OFF',
            'badge' => 'b-off',
            'badgeLabel' => 'Instant Action',
            'rating' => 4.7,
            'reviews' => 845,
            'isNew' => 0,
            'description' => 'Instant transdermal nano-spray for rapid muscular comfort and fast-acting joint ease. Non-greasy, fast-drying, and leaves a pleasant natural herbal fragrance.',
            'ingredients' => ['Menthol Crystals', 'Camphor Oil', 'Wintergreen Leaf', 'Clove Bud Extract'],
            'benefits' => ['30-Second Relief', 'Non-Sticky Formula', 'Targeted Application']
        ]
    ];

    foreach ($seeds as $s) {
        $id = $conn->real_escape_string($s['id']);
        $slug = $conn->real_escape_string($s['slug']);
        $name = $conn->real_escape_string($s['name']);
        $vendor = $conn->real_escape_string($s['vendor']);
        $img = $conn->real_escape_string($s['img']);
        $price = floatval($s['price']);
        $compare = floatval($s['compare']);
        $off = $conn->real_escape_string($s['off']);
        $badge = $conn->real_escape_string($s['badge']);
        $badge_label = $conn->real_escape_string($s['badgeLabel']);
        $rating = floatval($s['rating']);
        $reviews = intval($s['reviews']);
        $is_new = intval($s['isNew']);
        $desc = $conn->real_escape_string($s['description']);
        $ing = $conn->real_escape_string(json_encode($s['ingredients']));
        $ben = $conn->real_escape_string(json_encode($s['benefits']));
        $now = date('Y-m-d H:i:s');

        $sql = "INSERT INTO products (id, slug, name, vendor, img, price, compare_price, original_price, discount, badge, badge_label, rating, reviews, is_new, description, ingredients_json, benefits_json, updated_at)
                VALUES ('$id', '$slug', '$name', '$vendor', '$img', $price, $compare, $compare, '$off', '$badge', '$badge_label', $rating, $reviews, $is_new, '$desc', '$ing', '$ben', '$now')
                ON DUPLICATE KEY UPDATE updated_at = '$now'";
        $conn->query($sql);
    }
}

$action = $_GET['action'] ?? '';

// Test / Status
if ($action === 'test' || $action === 'status') {
    $conn = get_db_connection();
    if ($conn) {
        ensure_product_columns($conn);
        ensure_customer_columns($conn);
        ensure_order_columns($conn);
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

// -------------------------------------------------------------
// IMAGE UPLOAD API
// -------------------------------------------------------------
if ($action === 'upload_image' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $upload_rel_dir = 'uploads/products/';
    $upload_dir = __DIR__ . '/' . $upload_rel_dir;

    if (!is_dir($upload_dir)) {
        if (!@mkdir($upload_dir, 0777, true)) {
            // Fallback to products/ directory if uploads/ cannot be created
            $upload_rel_dir = 'products/';
            $upload_dir = __DIR__ . '/' . $upload_rel_dir;
            if (!is_dir($upload_dir)) {
                @mkdir($upload_dir, 0777, true);
            }
        }
    }

    $allowed_extensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'avif'];
    $saved_filename = '';

    // A. Check for standard multipart file upload: $_FILES['image'] or $_FILES['file']
    $file_obj = $_FILES['image'] ?? ($_FILES['file'] ?? null);

    if ($file_obj && isset($file_obj['tmp_name']) && is_uploaded_file($file_obj['tmp_name'])) {
        $orig_name = $file_obj['name'] ?? 'image.webp';
        $ext = strtolower(pathinfo($orig_name, PATHINFO_EXTENSION));
        if (!in_array($ext, $allowed_extensions)) {
            $ext = 'webp';
        }
        $clean_name = preg_replace('/[^a-zA-Z0-9_-]/', '', pathinfo($orig_name, PATHINFO_FILENAME));
        if (empty($clean_name)) $clean_name = 'prod';
        $saved_filename = $clean_name . '_' . time() . '_' . rand(100, 999) . '.' . $ext;
        $dest_path = $upload_dir . $saved_filename;

        if (@move_uploaded_file($file_obj['tmp_name'], $dest_path)) {
            $web_url = '/' . $upload_rel_dir . $saved_filename;
            echo json_encode([
                'success' => true,
                'url' => $web_url,
                'filename' => $saved_filename,
                'message' => 'Image uploaded successfully'
            ]);
            exit();
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Failed to move uploaded file to destination directory'
            ]);
            exit();
        }
    }

    // B. Check for JSON base64 encoded image in request body
    $raw = file_get_contents('php://input');
    $body = json_decode($raw, true);
    $b64_image = $body['image'] ?? ($body['data'] ?? '');

    if (!empty($b64_image)) {
        $ext = 'webp';
        if (preg_match('/^data:image\/(\w+);base64,/', $b64_image, $matches)) {
            $matched_ext = strtolower($matches[1]);
            if (in_array($matched_ext, $allowed_extensions)) {
                $ext = $matched_ext === 'jpeg' ? 'jpg' : $matched_ext;
            }
            $b64_image = substr($b64_image, strpos($b64_image, ',') + 1);
        }

        $decoded_data = base64_decode($b64_image);
        if ($decoded_data !== false) {
            $custom_name = !empty($body['name']) ? preg_replace('/[^a-zA-Z0-9_-]/', '', pathinfo($body['name'], PATHINFO_FILENAME)) : 'prod';
            if (empty($custom_name)) $custom_name = 'prod';
            $saved_filename = $custom_name . '_' . time() . '_' . rand(100, 999) . '.' . $ext;
            $dest_path = $upload_dir . $saved_filename;

            if (@file_put_contents($dest_path, $decoded_data) !== false) {
                $web_url = '/' . $upload_rel_dir . $saved_filename;
                echo json_encode([
                    'success' => true,
                    'url' => $web_url,
                    'filename' => $saved_filename,
                    'message' => 'Image saved successfully'
                ]);
                exit();
            }
        }
    }

    echo json_encode([
        'success' => false,
        'message' => 'No valid image file or base64 payload provided in request'
    ]);
    exit();
}

// -------------------------------------------------------------
// CUSTOMERS API
// -------------------------------------------------------------
if ($action === 'get_customers') {
    $conn = get_db_connection();
    if (!$conn) {
        echo json_encode(['success' => false, 'message' => 'Database unavailable']);
        exit();
    }
    ensure_customer_columns($conn);

    $res = $conn->query("SELECT * FROM customers ORDER BY last_login DESC");
    $customers = [];
    if ($res) {
        while ($row = $res->fetch_assoc()) {
            $customers[] = [
                'id' => $row['id'],
                'name' => $row['name'],
                'email' => $row['email'],
                'phone' => $row['phone'] ?? '',
                'avatar' => $row['avatar'] ?? '',
                'provider' => $row['provider'] ?? 'google',
                'createdAt' => $row['created_at'],
                'lastLogin' => $row['last_login']
            ];
        }
    }
    $conn->close();
    echo json_encode(['success' => true, 'customers' => $customers]);
    exit();
}

if ($action === 'sync_customer' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    $cust = json_decode($raw, true);
    if (!$cust || empty($cust['email'])) {
        echo json_encode(['success' => false, 'message' => 'Invalid customer payload']);
        exit();
    }
    $conn = get_db_connection();
    if (!$conn) {
        echo json_encode(['success' => false, 'message' => 'Database connection failed']);
        exit();
    }
    ensure_customer_columns($conn);

    $id = $conn->real_escape_string($cust['id'] ?? ('usr_' . substr(md5($cust['email']), 0, 10)));
    $name = $conn->real_escape_string($cust['name'] ?? explode('@', $cust['email'])[0]);
    $email = $conn->real_escape_string(strtolower(trim($cust['email'])));
    $phone = $conn->real_escape_string($cust['phone'] ?? '');
    $avatar = $conn->real_escape_string($cust['avatar'] ?? '');
    $provider = $conn->real_escape_string($cust['provider'] ?? 'google');
    $created_at = !empty($cust['createdAt']) ? date('Y-m-d H:i:s', strtotime($cust['createdAt'])) : date('Y-m-d H:i:s');
    $last_login = date('Y-m-d H:i:s');

    $sql = "INSERT INTO customers (id, name, email, phone, avatar, provider, created_at, last_login)
            VALUES ('$id', '$name', '$email', '$phone', '$avatar', '$provider', '$created_at', '$last_login')
            ON DUPLICATE KEY UPDATE 
                name = IF('$name' != '', '$name', name),
                phone = IF('$phone' != '', '$phone', phone),
                avatar = IF('$avatar' != '', '$avatar', avatar),
                provider = IF('$provider' != '', '$provider', provider),
                last_login = '$last_login'";

    if ($conn->query($sql)) {
        echo json_encode(['success' => true, 'customer_id' => $id]);
    } else {
        echo json_encode(['success' => false, 'message' => $conn->error]);
    }
    $conn->close();
    exit();
}

// -------------------------------------------------------------
// ORDERS API
// -------------------------------------------------------------
if ($action === 'get_orders') {
    $conn = get_db_connection();
    if (!$conn) {
        echo json_encode(['success' => false, 'message' => 'Database unavailable']);
        exit();
    }
    ensure_order_columns($conn);
    $res = $conn->query("SELECT * FROM orders ORDER BY created_at DESC");
    $orders = [];
    if ($res) {
        while ($row = $res->fetch_assoc()) {
            $row['items'] = json_decode($row['items_json'], true) ?: [];
            $row['customer'] = [
                'name' => $row['customer_name'],
                'phone' => $row['customer_phone'],
                'email' => $row['customer_email'] ?? '',
                'address' => $row['customer_address'],
                'city' => $row['customer_city'],
                'state' => $row['customer_state'],
                'pincode' => $row['customer_pincode']
            ];
            $orders[] = $row;
        }
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
    ensure_order_columns($conn);
    ensure_customer_columns($conn);

    $id = $conn->real_escape_string($order['id']);
    $order_num = $conn->real_escape_string($order['orderNumber'] ?? ('JEV-'.rand(1000,9999)));
    $name = $conn->real_escape_string($order['customerName'] ?? ($order['customer']['name'] ?? ''));
    $phone = $conn->real_escape_string($order['customerPhone'] ?? ($order['customer']['phone'] ?? ''));
    $email = $conn->real_escape_string($order['customerEmail'] ?? ($order['customer']['email'] ?? ''));
    $addr = $conn->real_escape_string($order['customerAddress'] ?? ($order['customer']['address'] ?? ''));
    $city = $conn->real_escape_string($order['customerCity'] ?? ($order['customer']['city'] ?? ''));
    $state = $conn->real_escape_string($order['customerState'] ?? ($order['customer']['state'] ?? ''));
    $pin = $conn->real_escape_string($order['customerPincode'] ?? ($order['customer']['pincode'] ?? ''));
    $items = $conn->real_escape_string(json_encode($order['items'] ?? []));
    $total = floatval($order['totalAmount'] ?? ($order['total'] ?? 0));
    $advance = floatval($order['advanceAmount'] ?? 0);
    $remain = floatval($order['remainAmount'] ?? ($total - $advance));
    $pay_status = $conn->real_escape_string($order['paymentStatus'] ?? 'Pending');
    $pay_method = $conn->real_escape_string($order['paymentMethod'] ?? 'Cash on Delivery');
    $status = $conn->real_escape_string($order['status'] ?? 'Pending');
    $tracking = $conn->real_escape_string($order['trackingId'] ?? ($order['trackingNumber'] ?? ''));
    $now = date('Y-m-d H:i:s');

    $sql = "INSERT INTO orders (id, order_number, created_at, customer_name, customer_phone, customer_email, customer_address, customer_city, customer_state, customer_pincode, items_json, total_amount, advance_amount, remain_amount, payment_status, payment_method, status, tracking_id, updated_at)
            VALUES ('$id', '$order_num', '$now', '$name', '$phone', '$email', '$addr', '$city', '$state', '$pin', '$items', $total, $advance, $remain, '$pay_status', '$pay_method', '$status', '$tracking', '$now')
            ON DUPLICATE KEY UPDATE 
                customer_email = IF('$email' != '', '$email', customer_email),
                advance_amount = $advance,
                remain_amount = $remain,
                payment_status = '$pay_status',
                status = '$status',
                tracking_id = '$tracking',
                updated_at = '$now'";

    if ($conn->query($sql)) {
        if (!empty($email)) {
            $c_id = 'usr_ord_' . substr(md5($email), 0, 10);
            $conn->query("
                INSERT INTO customers (id, name, email, phone, avatar, provider, created_at, last_login)
                VALUES ('$c_id', '$name', '$email', '$phone', '', 'order', '$now', '$now')
                ON DUPLICATE KEY UPDATE
                    name = IF('$name' != '', '$name', name),
                    phone = IF('$phone' != '', '$phone', phone),
                    last_login = '$now'
            ");
        }
        echo json_encode(['success' => true, 'order_id' => $id]);
    } else {
        echo json_encode(['success' => false, 'message' => $conn->error]);
    }
    $conn->close();
    exit();
}

// -------------------------------------------------------------
// PRODUCTS API
// -------------------------------------------------------------
if ($action === 'get_products') {
    $conn = get_db_connection();
    if (!$conn) {
        echo json_encode(['success' => false, 'message' => 'Database unavailable']);
        exit();
    }
    ensure_product_columns($conn);
    seed_default_products_if_empty($conn);

    $res = $conn->query("SELECT * FROM products ORDER BY id ASC");
    $products = [];
    if ($res) {
        while ($row = $res->fetch_assoc()) {
            $products[] = [
                'id' => $row['id'],
                'slug' => $row['slug'],
                'name' => $row['name'],
                'vendor' => $row['vendor'] ?? 'Jevansrot',
                'img' => $row['img'] ?? '',
                'price' => floatval($row['price']),
                'compare' => floatval(!empty($row['compare_price']) ? $row['compare_price'] : ($row['original_price'] ?? 0)),
                'off' => $row['discount'] ?? '',
                'badge' => $row['badge'] ?? 'b-pop',
                'badgeLabel' => !empty($row['badge_label']) ? $row['badge_label'] : 'Popular',
                'rating' => floatval($row['rating'] ?? 4.8),
                'reviews' => intval($row['reviews'] ?? 0),
                'isNew' => !empty($row['is_new']),
                'description' => $row['description'] ?? '',
                'ingredients' => json_decode($row['ingredients_json'] ?? '[]', true) ?: [],
                'benefits' => json_decode($row['benefits_json'] ?? '[]', true) ?: []
            ];
        }
    }
    $conn->close();
    echo json_encode(['success' => true, 'products' => $products]);
    exit();
}

if ($action === 'save_product' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    $p = json_decode($raw, true);
    if (!$p || empty($p['id'])) {
        echo json_encode(['success' => false, 'message' => 'Invalid product payload']);
        exit();
    }
    $conn = get_db_connection();
    if (!$conn) {
        echo json_encode(['success' => false, 'message' => 'Database connection failed']);
        exit();
    }
    ensure_product_columns($conn);

    $id = $conn->real_escape_string($p['id']);
    $slug = $conn->real_escape_string($p['slug'] ?? $id);
    $name = $conn->real_escape_string($p['name'] ?? '');
    $vendor = $conn->real_escape_string($p['vendor'] ?? 'Jevansrot');
    $img = $conn->real_escape_string($p['img'] ?? '');
    $price = floatval($p['price'] ?? 0);
    $compare = floatval($p['compare'] ?? ($p['original_price'] ?? 0));
    $off = $conn->real_escape_string($p['off'] ?? ($p['discount'] ?? ''));
    $badge = $conn->real_escape_string($p['badge'] ?? 'b-pop');
    $badge_label = $conn->real_escape_string($p['badgeLabel'] ?? ($p['badge_label'] ?? 'Popular'));
    $rating = floatval($p['rating'] ?? 4.8);
    $reviews = intval($p['reviews'] ?? 0);
    $is_new = !empty($p['isNew']) ? 1 : 0;
    $desc = $conn->real_escape_string($p['description'] ?? '');
    $ing = $conn->real_escape_string(json_encode($p['ingredients'] ?? []));
    $ben = $conn->real_escape_string(json_encode($p['benefits'] ?? []));
    $now = date('Y-m-d H:i:s');

    $sql = "INSERT INTO products (id, slug, name, vendor, img, price, compare_price, original_price, discount, badge, badge_label, rating, reviews, is_new, description, ingredients_json, benefits_json, updated_at)
            VALUES ('$id', '$slug', '$name', '$vendor', '$img', $price, $compare, $compare, '$off', '$badge', '$badge_label', $rating, $reviews, $is_new, '$desc', '$ing', '$ben', '$now')
            ON DUPLICATE KEY UPDATE
                slug = '$slug',
                name = '$name',
                vendor = '$vendor',
                img = '$img',
                price = $price,
                compare_price = $compare,
                original_price = $compare,
                discount = '$off',
                badge = '$badge',
                badge_label = '$badge_label',
                rating = $rating,
                reviews = $reviews,
                is_new = $is_new,
                description = '$desc',
                ingredients_json = '$ing',
                benefits_json = '$ben',
                updated_at = '$now'";

    if ($conn->query($sql)) {
        echo json_encode(['success' => true, 'product_id' => $id]);
    } else {
        echo json_encode(['success' => false, 'message' => $conn->error]);
    }
    $conn->close();
    exit();
}

if ($action === 'delete_product') {
    $id = $_GET['id'] ?? '';
    if (!$id) {
        $raw = file_get_contents('php://input');
        $body = json_decode($raw, true);
        $id = $body['id'] ?? '';
    }
    if (!$id) {
        echo json_encode(['success' => false, 'message' => 'Missing product ID']);
        exit();
    }
    $conn = get_db_connection();
    if ($conn) {
        $clean_id = $conn->real_escape_string($id);
        $conn->query("DELETE FROM products WHERE id = '$clean_id'");
        $conn->close();
        echo json_encode(['success' => true, 'message' => 'Product deleted successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Database error']);
    }
    exit();
}

if ($action === 'reset_products') {
    $conn = get_db_connection();
    if ($conn) {
        $conn->query("TRUNCATE TABLE products");
        ensure_product_columns($conn);
        seed_default_products_if_empty($conn);
        $conn->close();
        echo json_encode(['success' => true, 'message' => 'Products reset to default']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Database error']);
    }
    exit();
}

echo json_encode(['success' => true, 'service' => 'Jevansrot Sciences API v2']);
