<?php
require '../../php/parse.php';
require '../../php/oauth.php';
require '../../php/error.php';
require '../../php/apis.php';

/**
 * APIs end point
 */

//error_reporting(E_ALL);
//ini_set('display_errors', 1);

try {
    $method = filter_input(INPUT_SERVER, "REQUEST_METHOD");
    $post = $_POST;
    
    $token = filter_input(INPUT_GET, "token");
    $id = filter_input(INPUT_GET, "id");
    $path = filter_input(INPUT_GET, "path");

    $apis = new Apis(
        new Oauth("Swagger"),
        $token,
        new ParseTable("Swagger"),
        new ParseTable("SwaggerHistory")
    );

    if ($path === "history") {
        $response = $apis->getHistory($id);
    } else {
        switch($method) {
            case "POST":
                $response = $apis->create($post);
                break;
            case "PUT":
                $response = $apis->update($id, $post);
                break;
            case "GET":
                if ($id) {
                    $response = $apis->get($id);
                } else {
                    $where = filter_input(INPUT_GET, "where");
                    $response = $apis->getList($where === "published");
                }
                break;
            case "DELETE":
                $response = $apis->delete($id);
                break;
        }
    }
} catch(Exception $ex) {
    $response = Error::json($ex->getMessage());
}

echo json_encode($response);



