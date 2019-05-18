<?php
/**
 * Raun
 * index.php
 *
 * @author Kenrick <contact@kenrick95.org>
 * @license MIT License <http://opensource.org/licenses/MIT>
 */
ob_start();
require_once __DIR__ . '/vendor/autoload.php';

$locale = "";
$language = "";
$project = "";

// Intuition initialization
$I18N = new Intuition(array(
  'domain' => 'raun',
  'suppressbrackets' => true,
));
$I18N->registerDomain( 'raun', __DIR__ . '/messages' );

$locale = $I18N->getLang();

// Decide language (of the project)
if (isset($_GET['language'])) {
    $language = htmlspecialchars($_GET['language']);
} else {
    $language = "en";
}

// Decide the project
if (isset($_GET['project'])) {
    $project = htmlspecialchars($_GET['project']);
} else {
    $project = "wikipedia";
}

// Decide the page title
$title = "Raun: $language.$project ($locale)";
ob_end_clean();
?><!doctype html>
<html dir="<?php echo $I18N->getDir(); ?>" lang="<?php echo $locale; ?>">
<head>
    <!--[if IE]>
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <![endif]-->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Patrolling wiki, enhanced!">
    <meta name="author" content="Kenrick">
    <link rel='stylesheet' href='https://cdn.jsdelivr.net/gh/kognise/water.css@latest/dist/light.min.css'>
    <link rel="stylesheet" href="dist/bundle.css">

    <title><?php echo $title; ?></title>
    <script>
    var LOCALE = '<?php echo $locale; ?>' || 'en';
    var PROJECT_SUBDOMAIN = '<?php echo $language; ?>' || 'en';
    var PROJECT_NAME = '<?php echo $project; ?>' || 'wikipedia';
    </script>
</head>
<body>
    <div id="app"></div>
    <script src="dist/bundle.js"></script>
</body>
</html>
