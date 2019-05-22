<?php
namespace Raun;

class Api
{
    public $endpoint = "/w/api.php";

    /**
     * @var string[]
     * @example `array("a" => "orange", "b" => "banana", "c" => "apple")`;
     */
    public $getParams = array();

    /**
     * @var string
     */
    public $baseUrl;

    /**
     * @var string
     */
    public $metaBaseUrl = 'https://meta.wikimedia.org';

    public function httpRequest(array $getData = array(), array $postData = array())
    {
        $fullGetParams = array_merge($this->getParams, $getData, array('format' => 'json'));
        $fullGetParamsString = '?' . http_build_query($fullGetParams);
        $fullUrl = $this->baseUrl . $this->endpoint . $fullGetParamsString;

        echo $fullUrl;

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Kenrick-Tool/Raun');
        curl_setopt($ch, CURLOPT_URL, $fullUrl);
        curl_setopt($ch, CURLOPT_ENCODING, "UTF-8");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        if (!empty($postData)) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        }
        //UNCOMMENT TO DEBUG TO output.tmp
        //curl_setopt($ch, CURLOPT_VERBOSE, true); // Display communication with server
        //$fp = fopen("output.tmp", "w");
        //curl_setopt($ch, CURLOPT_STDERR, $fp); // Display communication with server

        $response = curl_exec($ch);
        if (!$response) {
            throw new Exception("Error getting data from server ($fullUrl): " . curl_error($ch));
        }

        curl_close($ch);

        return json_decode($response, true);
    }
}
