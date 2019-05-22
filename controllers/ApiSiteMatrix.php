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
}
