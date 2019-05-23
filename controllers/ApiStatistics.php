<?php

namespace Raun;

class ApiStatistics extends Api
{
    public function __construct($baseUrl)
    {
        $this->baseUrl = $baseUrl;
        $this->getParams = array(
            'action' => 'query',
            'meta' => 'siteinfo',
            'siprop' => 'statistics'
        );
    }
}
