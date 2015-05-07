<?php
require '../php/polyfill.php';

header("Access-Control-Allow-Origin: *");
header("Expires: 1980-01-01 00:00:00");

// Check referrer and kick out if not our file, lame security as this can easily 
// be faked, but marginally better than nothing.
$referrer = $_SERVER['HTTP_REFERER'];
if (!strpos($referrer, '/console.html') &&
    !strpos($referrer, '/tests.html') &&
    !strpos($referrer, '/ApiTestRunner.html')) {
    //echo "Not Allowed";
    //exit();
}

// TODO Pass through headers, pass back headers.

/**
echo "Request: ";
print_r($_REQUEST);

echo "Post: ";
print_r($_POST);

echo "Get: ";
print_r($_GET);

echo "Server: <pre>";
print_r($_SERVER);
/**/

$url = $_GET['__url'];
unset($_GET['__url']);

$ch = curl_init($url);

$headers = array();
foreach(apache_request_headers() as $key => $value) {
    $headers[] = "$key: $value";
}

$headers[] = "User-Agent: API Test Console";
//print_r($headers);

if (count($_POST)) {
    if ($method === "PUT" || $method === "PATCH") {
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($post));
    } else {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
    }
}
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
curl_setopt($ch, CURLOPT_HEADER, 0);
//curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); 
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $_SERVER['REQUEST_METHOD']);

$response = curl_exec($ch);

$exploded = explode("\r\n\r\n", $response, 2);
if (isset($exploded[0])) {
    $header = $exploded[0];
}
if (isset($exploded[1])) {
    $body = $exploded[1];
}

$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
http_response_code($httpCode);

echo $response;

