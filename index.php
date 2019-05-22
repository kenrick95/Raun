<?php
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
    }
    private function getParam($key, $default)
    {
        if (isset($_GET[$key])) {
            return htmlspecialchars($_GET[$key]);
        }
        return $default;
    }

    private function renderHome()
    {
        require_once __DIR__ . '/views/home.phtml';
    }

    /**
     * NOTE: For usage in development server only
     */
    private function renderStatic()
    {
        // Get file name
        $requestUrl = $_SERVER['REQUEST_URI'];
        $prefix = '/dist';
        $str = $requestUrl;

        if (substr($str, 0, strlen($prefix)) == $prefix) {
            $str = substr($str, strlen($prefix));
        }

        $requestFile = str_replace(array('/', '\\'), DIRECTORY_SEPARATOR, $str);
        $fullPath = __DIR__ . '/dist' . $requestFile;
        $fileContent = file_get_contents($fullPath);
        $mimeType = mime_content_type($fullPath);
        header('Content-Type: ' . $mimeType);
        echo $fileContent;
    }

    private function renderApiSiteMatrix()
    {
        $this->apiSiteMatrix = new ApiSiteMatrix();
        header('Content-Type: application/json');
        echo json_encode($this->apiSiteMatrix->request());
    }


    public function router()
    {
        $requestUrl = $_SERVER['REQUEST_URI'];
        if (strpos($requestUrl, '/dist') === 0 && php_sapi_name() == 'cli-server') {
            $this->renderStatic();
        } else if ($requestUrl === '/api/sitematrix') {
            $this->renderApiSiteMatrix();
        } else if ($requestUrl === '/') {
            $this->renderHome();
        } else {
            return NULL;
        }
    }
}
$main = new Main();
$main->router();
