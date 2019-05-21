<?php
/**
 * Raun
 * index.php
 *
 * @author Kenrick <contact@kenrick95.org>
 * @license MIT License <http://opensource.org/licenses/MIT>
 */
$base  = dirname($_SERVER['PHP_SELF']);
if (ltrim($base, '/')) {
    $_SERVER['REQUEST_URI'] = substr($_SERVER['REQUEST_URI'], strlen($base));
}


require_once __DIR__ . '/vendor/autoload.php';


$klein = new \Klein\Klein();

$I18N = new Intuition(array(
    'domain' => 'raun',
    'suppressbrackets' => true,
));
$I18N->registerDomain('raun', __DIR__ . '/messages');


$klein->respond(function ($request, $response, $service, $app) use ($klein) {
    global $base;
    $service->base_url = $base;
    global $I18N;
    $service->I18N = $I18N;
});



$klein->with("/api", "controllers/api.php");
$klein->with("", "controllers/home.php");
$klein->dispatch();
