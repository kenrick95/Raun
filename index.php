<?php
// $base  = dirname($_SERVER['PHP_SELF']);
// if (ltrim($base, '/')) {
//     $_SERVER['REQUEST_URI'] = substr($_SERVER['REQUEST_URI'], strlen($base));
// }

require_once __DIR__ . '/vendor/autoload.php';

use Raun\ApiSiteMatrix;
use Raun\SiteMatrixHardcoded;

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
        $this->dbNames = $this->getDbNames();
        $this->apiBaseUrlMap = $this->getApiBaseUrlMap();

        $def = $this->I18N->msg('def_def');
        $this->title = "Raun: $def ($this->locale)";
    }
    private function getDbNames()
    {
        $this->dbNameMap = new SiteMatrixHardcoded();

        $dbNameRaw = $this->getParam('dbname');

        if (strpos($dbNameRaw, '|') !== FALSE) {
            $dbNames = array($dbNameRaw);
        } else if (!empty($dbNameRaw)) {
            $dbNames = explode('|', $dbNameRaw);
        } else {
            $dbNames = NULL;
        }
        return $dbNames;
    }

    private function getApiBaseUrlMap()
    {
        $apiBaseUrlMap = array();
        if (
            !empty($this->dbNames) &&
            !empty($this->dbNameMap->data)
        ) {
            foreach ($this->dbNames as $dbName) {
                $projectData = $this->dbNameMap->data[$dbName];
                $apiBaseUrlMap[$dbName] = $projectData['url'];
            }
        }
        return $apiBaseUrlMap;
    }

    private function getParam($key, $default = NULL)
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
    private function renderStatic($prefix = '/dist')
    {
        // Get file name
        $requestUrl = $_SERVER['REQUEST_URI'];
        $str = $requestUrl;

        if (substr($str, 0, strlen($prefix)) == $prefix) {
            $str = substr($str, strlen($prefix));
        }

        $requestFile = str_replace(array('/', '\\'), DIRECTORY_SEPARATOR, $str);
        $fullPath = __DIR__ . $prefix . $requestFile;
        $fileContent = file_get_contents($fullPath);
        $extension = pathinfo($fullPath, PATHINFO_EXTENSION);
        if ($extension === 'js') {
            header('Content-Type: application/javascript');
        } else if ($extension === 'css') {
            header('Content-Type: text/css');
        } else {
            header('Content-Type: text/plain');
        }
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
        if (isset($_SERVER['QUERY_STRING'])) {
            $requestUrl = str_replace('?' . $_SERVER['QUERY_STRING'], '', $requestUrl);
        }

        if (php_sapi_name() == 'cli-server'  && (strpos($requestUrl, '/dist') === 0 || strpos($requestUrl, '/messages') === 0)) {
            if (strpos($requestUrl, '/dist') === 0) {
                $this->renderStatic('/dist');
            } else if (strpos($requestUrl, '/messages') === 0) {
                $this->renderStatic('/messages');
            }
        } else if ($requestUrl === '/api/sitematrix') {
            $this->renderApiSiteMatrix();
        } else if ($requestUrl === '/') {
            $this->renderHome();
        } else {

            echo $requestUrl;
            var_dump($_SERVER);
            return NULL;
        }
    }
}
$main = new Main();
$main->router();
