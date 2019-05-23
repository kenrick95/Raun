<?php

namespace Raun;

class ApiUsers extends Api
{
    public function __construct($baseUrl)
    {
        $this->baseUrl = $baseUrl;
        $this->getParams = array(
            'action' => 'query',
            'list' => 'allusers',
            // 'augroup' => 'sysop',
            // 'aulimit' => 500
        );
    
    }
}
