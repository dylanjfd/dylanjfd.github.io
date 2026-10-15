<?php
/**
 * Portfolio BTS SIO — traitement du formulaire de contact (alternative à Formspree)
 * --------------------------------------------------------------------------------
 * À utiliser sur un hébergement avec PHP 7.4+ et la fonction mail() activée
 * (GitHub Pages ne fait pas tourner PHP : utilise alors Formspree).
 *
 *   1. Renseigne CONTACT_TO (ton adresse) et, si besoin, CONTACT_FROM ci-dessous.
 *   2. Dans assets/js/main.js, mets CONFIG.FORM_ENDPOINT = '../contact.php'.
 *
 * Contrôles : méthode POST, pot de miel (_gotcha), champs obligatoires, format
 * de l'e-mail, objet autorisé, consentement RGPD. Les en-têtes du courriel sont
 * protégés contre l'injection. Réponse en JSON (envoi via JavaScript) ou en HTML
 * (navigateur sans JavaScript). Aucune donnée n'est enregistrée sur le serveur.
 */

declare(strict_types=1);

const CONTACT_TO = '';      // ex. 'prenom.nom@example.com'
const CONTACT_FROM = '';    // ex. 'no-reply@ton-domaine.fr' (adresse du domaine de l'hébergeur)
const SUBJECT_PREFIX = '[Portfolio] ';
const ALLOWED_SUBJECTS = [
    "Proposition d'alternance",
    "Offre d'emploi",
    'Question sur un projet',
    'Autre demande',
];

$wantsJson = stripos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false;

/** Longueur d'une chaîne UTF-8 (repli si l'extension mbstring est absente). */
function text_length(string $value): int
{
    return function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : strlen($value);
}

/** Supprime les retours à la ligne (protection contre l'injection d'en-têtes). */
function header_safe(string $value): string
{
    return trim(str_ireplace(["\r", "\n", '%0a', '%0d'], ' ', $value));
}

function h(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

/** Envoie la réponse (JSON ou page HTML) puis arrête le script. */
function respond(int $status, array $payload, bool $json): void
{
    http_response_code($status);
    header('X-Content-Type-Options: nosniff');

    if ($json) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($payload, JSON_UNESCAPED_UNICODE);
        exit;
    }

    $ok = !empty($payload['ok']);
    $title = $ok ? 'Message envoyé' : 'Message non envoyé';
    $text = $ok
        ? 'Merci, votre message a bien été envoyé. Je vous réponds dans les meilleurs délais.'
        : (string) ($payload['error'] ?? 'Le formulaire contient des erreurs.');
    $details = '';
    if (!empty($payload['errors'])) {
        $items = array_map(static function ($error): string {
            return '<li>' . h((string) $error) . '</li>';
        }, array_values($payload['errors']));
        $details = '<ul>' . implode('', $items) . '</ul>';
    }

    header('Content-Type: text/html; charset=utf-8');
    echo '<!doctype html><html lang="fr" data-theme="dark"><head><meta charset="utf-8">'
        . '<meta name="viewport" content="width=device-width, initial-scale=1">'
        . '<title>' . h($title) . ' — Portfolio BTS SIO</title>'
        . '<meta name="theme-color" content="#0e1320">'
        . '<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">'
        . '<link rel="stylesheet" href="assets/css/style.css"></head><body>'
        . '<main class="section"><div class="container prose">'
        . '<p class="eyebrow">' . ($ok ? 'Quête mise à jour' : 'Formulaire de contact') . '</p>'
        . '<h1>' . h($title) . '</h1>'
        . '<p>' . h($text) . '</p>' . $details
        . '<p><a class="btn btn--ghost" href="pages/contact.html">Retour au formulaire</a> '
        . '<a class="btn btn--ghost" href="index.html">Accueil</a></p>'
        . '</div></main></body></html>';
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, ['ok' => false, 'error' => 'Méthode non autorisée : utilisez le formulaire de contact.'], $wantsJson);
}

// Pot de miel : un robot remplit ce champ invisible. On répond « OK » sans rien envoyer.
if (trim((string) ($_POST['_gotcha'] ?? '')) !== '') {
    respond(200, ['ok' => true], $wantsJson);
}

$name = trim((string) ($_POST['name'] ?? ''));
$email = trim((string) ($_POST['email'] ?? ''));
$subject = trim((string) ($_POST['subject'] ?? ''));
$message = trim((string) ($_POST['message'] ?? ''));
$consent = (string) ($_POST['consent'] ?? '');

$errors = [];
if (text_length($name) < 2 || text_length($name) > 100) {
    $errors['name'] = 'Indiquez votre nom (2 à 100 caractères).';
}
if (strlen($email) > 254 || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
    $errors['email'] = 'Adresse e-mail invalide.';
}
if (!in_array($subject, ALLOWED_SUBJECTS, true)) {
    $errors['subject'] = "Choisissez l'objet de votre message.";
}
if (text_length($message) < 20 || text_length($message) > 5000) {
    $errors['message'] = 'Votre message doit contenir entre 20 et 5 000 caractères.';
}
if ($consent !== 'oui') {
    $errors['consent'] = "Le consentement à l'utilisation de vos données est nécessaire.";
}

if ($errors) {
    respond(422, ['ok' => false, 'error' => 'Le formulaire contient des erreurs.', 'errors' => $errors], $wantsJson);
}

if (CONTACT_TO === '') {
    respond(503, ['ok' => false, 'error' => "Le formulaire n'est pas encore configuré (CONTACT_TO est vide dans contact.php)."], $wantsJson);
}

$from = CONTACT_FROM !== '' ? CONTACT_FROM : CONTACT_TO;
$headers = [
    'From: ' . header_safe($from),
    'Reply-To: ' . header_safe($email),
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
];
$subjectLine = '=?UTF-8?B?' . base64_encode(SUBJECT_PREFIX . header_safe($subject)) . '?=';
$body = "Nouveau message depuis le portfolio\n\n"
    . 'Nom : ' . header_safe($name) . "\n"
    . 'E-mail : ' . header_safe($email) . "\n"
    . 'Objet : ' . header_safe($subject) . "\n\n"
    . str_replace("\r\n", "\n", $message) . "\n";

if (!mail(CONTACT_TO, $subjectLine, $body, implode("\r\n", $headers))) {
    respond(500, ['ok' => false, 'error' => "L'envoi a échoué côté serveur. Réessayez plus tard."], $wantsJson);
}

respond(200, ['ok' => true], $wantsJson);
