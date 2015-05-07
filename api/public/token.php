<?php
require 'php/oauth.php';
require 'php/polyfill.php';

header("Access-Control-Allow-Origin: *");
header("Expires: 1980-01-01 00:00:00");

$oauth = new Oauth();

$grantType = filter_input(INPUT_GET, "grant_type");
$code = filter_input(INPUT_GET, "code");

if ($grantType === "refresh_token") {
    //$response = $oauth->refreshToken($_POST["refresh_token"]);
} elseif ($grantType === "password") {
    //$response = $oauth->password($_POST["username"], $_POST["password"]);
} elseif ($code) {
    $response = $oauth->authorizationCode($code);
    
    if (array_key_exists("access_token", $response) && 
        array_key_exists("expires_in", $response)) {
        
        if (true) {
            // Pass values back to parent pages AuthService.setToken
            ?>
            <script>
                window.opener.AuthService.setToken('<?php echo $response["access_token"]; ?>', <?php echo $response["expires_in"]; ?>);
                window.close();
            </script>
            <?php
            exit();
        } else {
            $url = "http://smartv2.alchemysocial.com/AlchemyApi/directory.html?".
            "access_token=".$response["access_token"].
            "&expires_in=".$response["expires_in"];
        
            header("Location: ".$url);
        }
    }
} else {
    echo json_encode(array(
        "code" => $code,
        "message" => "No grant_type supplied"
    ));
    exit();
}

//list($header, $body) = explode("\r\n\r\n", $response, 2);
//$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

echo $response;

