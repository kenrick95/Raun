<?php

namespace Raun;

class SiteMatrixHardcoded
{
    public function __construct()
    {
        $this->data = json_decode(file_get_contents(__DIR__ . '/sitematrix.json'), true);
    }
}
