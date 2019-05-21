<?php

function httpRequest($url, $post = "")
{
    global $settings;

    $ch = curl_init();
    //Change the user agent below suitably
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Kenrick-Tool/Raun');
    curl_setopt($ch, CURLOPT_URL, ($url));
    curl_setopt($ch, CURLOPT_ENCODING, "UTF-8");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_COOKIEFILE, $settings['cookiefile']);
    curl_setopt($ch, CURLOPT_COOKIEJAR, $settings['cookiefile']);
    if (!empty($post)) curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
    //UNCOMMENT TO DEBUG TO output.tmp
    //curl_setopt($ch, CURLOPT_VERBOSE, true); // Display communication with server
    //$fp = fopen("output.tmp", "w");
    //curl_setopt($ch, CURLOPT_STDERR, $fp); // Display communication with server

    $xml = curl_exec($ch);
    if (!$xml) {
        throw new Exception("Error getting data from server ($url): " . curl_error($ch));
    }

    curl_close($ch);

    return $xml;
}
