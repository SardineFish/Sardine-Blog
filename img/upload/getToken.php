<?php
    define("DEBUG",false);
    require "../../lib/mysql/const.php";
    require "../../lib/mysql/MySQL.php";
    require "../../statistics/Statistics.php";
    require "../../img/Img.php";
    class QiniuTokenResponse
    {
        public $status;
        public $msg;
        public $data;
        function __construct()
        {
            $this->status=">_<";
            $this->msg="";
            $this->data=null;
        }
        function send()
        {
            echo json_encode($this);
            exit();
        }
    }
    class token
    {
        public $scope;
        public $deadline;
        function __construct($scope,$deadline)
        {
            $this->scope=$scope;
            $this->deadline=$deadline;
        }
    }
    function urlsafe_base64_encode($string) 
    {
        $data = base64_encode($string);
        $data = str_replace(array('+','/'),array('-','_'),$data);
        return $data;
    }
    $accessKey="_Z9zEXWg4gXN4hsJeu77VQdFYrAKzCKCatZVIoq3";
    $secretKey="O9hEQhX47e4gIwYltHdyKE7xUGCP6krv5e7z71Bn";
    $response=new QiniuTokenResponse();
    $deadline=time()+3600;
    $putPolicy=json_encode(new token("sardineimg",$deadline));
    //$putPolicy='{"scope":"sardineimg:0","deadline":1441354091}';
    //echo "putPolicy=".$putPolicy."<br>";
    $encodedPutPolicy=urlsafe_base64_encode($putPolicy);
    //echo "encodedPutPolicy=".$encodedPutPolicy."<br>";
    $sign=hash_hmac('sha1',$encodedPutPolicy,$secretKey,true);
    //echo "sign=".$sign."<br>";
    $encodedSign = urlsafe_base64_encode($sign);
    //echo "encodedSign=".$encodedSign."<br>";
    $uploadToken = $accessKey . ':' . $encodedSign . ':' . $encodedPutPolicy;
    //echo "uploadToken=".$uploadToken."<br>";
    $id=Img::NewId();
    $response->data->key=urlsafe_base64_encode($id->data.(time()%1000));
    $response->data->token=$uploadToken;
    $response->data->url="http://upload.qiniu.com/";
    $response->status="^_^";
    $response->send();
?>