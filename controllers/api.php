<?php
$this->respond('GET', 'api', function ($request, $response, $service, $app) {
    return 'All the things';
});
var_dump($this);