<?php
$render_home = function ($request, $response, $service, $app) {
    $locale = $service->I18N->getLang();
    $language = $request->param('language', 'id');
    $project = $request->param('project', 'wikipedia');
    
    $service->locale = $locale;
    $service->language = $language;
    $service->project = $project;
    $service->title = "Raun: $language.$project ($locale)";
    $service->render('views/home.phtml');
};

// $this->respond('GET', '', $render_home);
$this->respond('GET', '/', $render_home);
