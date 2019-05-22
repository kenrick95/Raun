<?php
/**
 * Raun
 * index.php
 *
 * @author Kenrick <contact@kenrick95.org>
 * @license MIT License <http://opensource.org/licenses/MIT>
 */
// $base  = dirname($_SERVER['PHP_SELF']);
// if (ltrim($base, '/')) {
//     $_SERVER['REQUEST_URI'] = substr($_SERVER['REQUEST_URI'], strlen($base));
// }

require_once __DIR__ . '/vendor/autoload.php';

use Raun\ApiSiteMatrix;

class Main
{
    protected $I18N;
    public function  __construct()
    {
        $this->I18N = new Intuition(array(
            'domain' => 'raun',
            'suppressbrackets' => true,
        ));
        $this->I18N->registerDomain('raun', __DIR__ . '/messages');
        $this->locale = $this->I18N->getLang();
        $this->language = $this->getParam('language', 'id');
        $this->project = $this->getParam('project', 'wikipedia');
        $this->title = "Raun: $this->language.$this->project ($this->locale)";

        // $this->apiSiteMatrix = new ApiSiteMatrix();
        // var_dump($this->apiSiteMatrix->httpRequest());
    }
    private function getParam($key, $default)
    {
        if (isset($_GET[$key])) {
            return htmlspecialchars($_GET[$key]);
        }
        return $default;
    }

    public function renderHome()
    {
        require_once __DIR__ . '/views/home.phtml';
    }
}
$main = new Main();
$main->renderHome();
