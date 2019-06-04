<?php

namespace Raun;

class ApiUsers extends Api
{
    public function __construct($baseUrl, $group = 'sysop')
    {
        $this->baseUrl = $baseUrl;
        $this->getParams = array(
            'action' => 'query',
            'list' => 'allusers',
            'augroup' => $group,
            'aulimit' => 500
        );
    }
    public function request()
    {
        $result = array();
        $hasContinue = false;
        $from = NULL;
        do {
            $additionalParam = array();
            if (!empty($from)) {
                $additionalParam['aufrom'] = $from;
            }
            $response = $this->httpRequest($additionalParam);
            $responseOk = empty($response['error'])  && empty($response['warnings']);
            $hasContinue = $responseOk && !empty($response['continue']);
            if ($responseOk) {
                $result = array_merge($result, $response['query']['allusers']);
            }
            if ($hasContinue) {
                $from = $response['continue']['aufrom'];
            }
        } while ($hasContinue);

        return $result;
    }
}
