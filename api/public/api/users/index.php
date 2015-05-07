<?php

require '../../php/parse.php';
require '../../php/oauth.php';
require '../../php/error.php';
require '../../php/polyfill.php';
require '../../php/users.php';

/**
 * Users end point
 */

//error_reporting(E_ALL);
error_reporting(E_ALL & E_STRICT);
ini_set('display_errors', 1);

try {
    $method = filter_input(INPUT_SERVER, "REQUEST_METHOD");
    
    $token = filter_input(INPUT_GET, "token");
    $editUsername = filter_input(INPUT_GET, "username");
    
    $users = new Users(new Oauth("Swagger"), $token);

    switch($method) {
        case "POST":
            $privileges = $_POST["privileges"];
            $response = $users->create($editUsername, $privileges);
            break;
        case "PUT":
            $privileges = $_PUT["privileges"];
            $response = $users->update($editUsername, $privileges);
            break;
        case "GET":
            if ($editUsername) {
                // Get a single user
                $response = $users->get($editUsername);
            } else {
                // Get a list of all users
                $response = $users->getList();
            }
            break;
        case "DELETE":
            //$response = $users->delete($editUsername);
            break;
    }
} catch(\Exception $ex) {
    $response = Error::json($ex->getMessage());
}
echo json_encode($response);
