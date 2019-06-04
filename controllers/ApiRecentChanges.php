<?php

namespace Raun;

class ApiRecentChanges extends Api
{
    public function __construct($baseUrl)
    {
        $this->baseUrl = $baseUrl;
        $this->getParams = array(
            'action' => 'query',
            'list' => 'recentchanges',
            'rctype' => 'edit|new',
            'rcprop' => 'title|ids|sizes|flags|user|userid|comment|parsedcomment|timestamp|redirect|loginfo|tags',
            'rclimit' => 500
        );
    }
}
