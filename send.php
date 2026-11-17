<?php
/**
 * Gareth in Panama — lightweight site API (single file).
 *
 * Accepts POST requests (JSON or form-encoded) and currently powers the
 * contact form: it validates the payload and emails it to
 * info@garethinpanama.com using PHP's mail().
 *
 * Extensible: add new capabilities by extending ALLOWED_ACTIONS and the
 * switch below (e.g. "subscribe", "download-log", …). Every response is
 * JSON: { ok: bool, message: string, error?: string, fields?: [] }.
 *
 * Hardening included:
 *  - POST-only endpoint
 *  - honeypot field (silently accepts bot submissions, sends nothing)
 *  - strict field validation (incl. email + phone format)
 *  - header-injection safety (CR/LF and angle brackets stripped)
 *  - file-based rate limit (RATE_LIMIT emails per IP per hour)
 */

declare(strict_types=1);

// ---------- config ----------
const RECIPIENT = 'info@garethinpanama.com';
const ALLOWED_ACTIONS = ['contact'];
const ALLOWED_INTERESTS = [
    'Property Management',
    'Buying a Property',
    'Selling a Property',
    'Investment / Relocation',
    'Other',
];
const RATE_LIMIT = 10;              // emails per hour per IP
const RATE_FILE_PREFIX = 'gip-rate-';

// ---------- response helpers ----------
function respond(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function msg(string $key, string $lang): string
{
    $texts = [
        'sent'    => [
            "Thank you! Your message has been sent — we'll be in touch shortly.",
            '¡Gracias! Tu mensaje ha sido enviado — nos pondremos en contacto muy pronto.',
        ],
        'invalid' => [
            'Please complete the required fields correctly.',
            'Por favor, completa los campos requeridos correctamente.',
        ],
        'limit'   => [
            'Too many messages from this address — please try again in an hour.',
            'Demasiados mensajes desde esta dirección — inténtalo de nuevo en una hora.',
        ],
        'error'   => [
            'Something went wrong. Please email us directly at ' . RECIPIENT,
            'Algo salió mal. Escríbenos directamente a ' . RECIPIENT,
        ],
    ];
    return $texts[$key][$lang === 'es' ? 1 : 0];
}

// ---------- POST only ----------
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    respond(['ok' => false, 'error' => 'method_not_allowed', 'message' => 'POST only.'], 405);
}

// ---------- input (JSON or form-encoded) ----------
$raw = file_get_contents('php://input') ?? '';
$data = json_decode($raw, true);
if (!is_array($data)) {
    $data = $_POST;
}
if (!is_array($data)) {
    $data = [];
}

$clean = static function ($v): string {
    return trim(str_replace(["\r", "\n", "\0"], ' ', (string) ($v ?? '')));
};

$lang     = $clean($data['lang'] ?? 'en') === 'es' ? 'es' : 'en';
$action   = $clean($data['action'] ?? 'contact');
$name     = $clean($data['name'] ?? '');
$email    = $clean($data['email'] ?? '');
$phone    = $clean($data['phone'] ?? '');
$interest = $clean($data['interest'] ?? '');
$message  = trim((string) ($data['message'] ?? ''));
$honey    = $clean($data['_honey'] ?? '');

// Honeypot: real users never fill the hidden field. Accept silently.
if ($honey !== '') {
    respond(['ok' => true, 'message' => msg('sent', $lang)]);
}

if (!in_array($action, ALLOWED_ACTIONS, true)) {
    respond(['ok' => false, 'error' => 'unknown_action', 'message' => 'Unknown action.'], 400);
}

// ---------- validation ----------
$errors = [];
if ($name === '' || mb_strlen($name) > 120) {
    $errors[] = 'name';
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'email';
}
if ($phone !== '' && !preg_match('/^[+0-9 ()\-]{5,25}$/', $phone)) {
    $errors[] = 'phone';
}
if (!in_array($interest, ALLOWED_INTERESTS, true)) {
    $interest = 'Other';
}
if (mb_strlen($message) < 2 || mb_strlen($message) > 5000) {
    $errors[] = 'message';
}
if ($errors) {
    respond([
        'ok'      => false,
        'error'   => 'invalid_fields',
        'fields'  => $errors,
        'message' => msg('invalid', $lang),
    ], 422);
}

// ---------- rate limiting (file-based, per IP per hour) ----------
$ip   = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$file = sys_get_temp_dir() . '/' . RATE_FILE_PREFIX . md5($ip) . '-' . date('YmdH') . '.json';
$count = 0;
if (is_file($file)) {
    $decoded = json_decode((string) file_get_contents($file), true);
    if (is_array($decoded)) {
        $count = (int) ($decoded['count'] ?? 0);
    }
}
if ($count >= RATE_LIMIT) {
    respond(['ok' => false, 'error' => 'rate_limited', 'message' => msg('limit', $lang)], 429);
}
@file_put_contents($file, json_encode(['count' => $count + 1]));

// ---------- build + send the email ----------
$subject = '=?UTF-8?B?' . base64_encode(
    $lang === 'es' ? 'Nueva consulta — garethinpanama.com' : 'New inquiry — garethinpanama.com'
) . '?=';

$host       = parse_url('https://' . ($_SERVER['HTTP_HOST'] ?? 'garethinpanama.com'), PHP_URL_HOST);
$fromEmail  = 'no-reply@' . (is_string($host) && $host !== '' ? $host : 'garethinpanama.com');
$safeName   = str_replace(['<', '>', '"'], '', $name); // header-injection safety
// RFC 2047-encode non-ASCII display names (e.g. "José García") for mail headers
$replyName  = preg_match('/[^\x20-\x7e]/', $safeName) ? mb_encode_mimeheader($safeName, 'UTF-8') : $safeName;

$body = implode("\r\n", [
    'New website inquiry — garethinpanama.com',
    '',
    "Name:     {$name}",
    "Email:    {$email}",
    "Phone:    {$phone}",
    "Interest: {$interest}",
    'Language: ' . strtoupper($lang),
    '',
    'Message:',
    $message,
    '',
    '---',
    'Sent: ' . date('Y-m-d H:i:s') . ' — IP: ' . $ip,
]);

$headers = array_map(
    static function (string $h): string {
        return str_replace(["\r", "\n"], ' ', $h); // header-injection safety
    },
    [
        'From: Gareth in Panama Website <' . $fromEmail . '>',
        'Reply-To: ' . $replyName . ' <' . $email . '>',
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'X-Mailer: GIP-SendPHP',
    ]
);

$sent = @mail(RECIPIENT, $subject, $body, implode("\r\n", $headers));

if ($sent) {
    respond(['ok' => true, 'message' => msg('sent', $lang)]);
}
respond(['ok' => false, 'error' => 'mail_failed', 'message' => msg('error', $lang)], 500);
