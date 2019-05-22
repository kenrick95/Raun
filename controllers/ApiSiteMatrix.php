<?php

namespace Raun;

class ApiSiteMatrix extends Api
{
    public function __construct()
    {
        $this->baseUrl = $this->metaBaseUrl;
        $this->getParams = array(
            'action' => 'sitematrix'
        );
    }

    public function request()
    {
        $data = $this->httpRequest();

        /**
         * @var Array<{
         *   languageName: string,
         *   languageCode: string,
         *   languageDir: string,
         *   localLanguageName: string,
         *   url: string,
         *   dbName: string,
         *   wikiCode: string,
         *   localSiteName: string
         * }>
         */
        $wikis = [];
        // Flatten
        foreach ($data['sitematrix'] as $key => $value) {
            if ($key === 'specials') {
                foreach ($value as $siteData) {
                    array_push($wikis, array(
                        'languageName' => $siteData['sitename'],
                        'languageCode' => $siteData['lang'],
                        'languageDir' => 'ltr',
                        'localLanguageName' => $siteData['sitename'],
                        'url' => $siteData['url'],
                        'dbName' => $siteData['dbname'],
                        'wikiCode' => $siteData['code'],
                        'localSiteName' => $siteData['sitename'],
                    ));
                }
            } else if (is_numeric($key)) {
                foreach ($value['site'] as $siteData) {

                    array_push($wikis, array(
                        'languageName' => $value['name'],
                        'languageCode' => $value['code'],
                        'languageDir' => $value['dir'],
                        'localLanguageName' => $value['localname'],
                        'url' => $siteData['url'],
                        'dbName' => $siteData['dbname'],
                        'wikiCode' => $siteData['code'],
                        'localSiteName' => $siteData['sitename'],
                    ));
                }
            }
        }

        return $wikis;
    }
}
