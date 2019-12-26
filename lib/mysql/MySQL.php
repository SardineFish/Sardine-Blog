<?php
	class SarMySQLResult
    {
        public $error;
        public $errno;
        public $data;
        public $succeed;
        public $affectedRows;
        public $id;
        function __construct()
        {
            $this->affectedRows=-1;
        }
    }
	class SarMySQL 
    {
        
        public $mysqli;
        public $host;
        public $uid;
        public $pwd;
        public $db;
        public $port;
        public $connected;
        function __construct($host,$uid,$pwd,$db,$port)
        {
            $this->host=$host;
            $this->uid=$uid;
            $this->pwd=$pwd;
            $this->db=$db;
            $this->port=$port;
            $this->connected=false;
        }
        public function connect()
        {
            $this->mysqli=new mysqli($this->host,$this->uid,$this->pwd,$this->db,$this->port);
            $result=new SarMySQLResult();
            if (mysqli_connect_errno()) 
            {
                $result->succeed=false;
                $result->errno=mysqli_connect_errno();
                $result->error=mysqli_connect_error();
    			return $result;
			}
            $result->succeed=true;
            $this->connected=true;
            return $result;
        }
        public function tryConnect()
        {
            if(!$this->mysqli || !$this->connected)
            {
                $result = $this->connect();
                if(!$result->succeed)
                    throw new Exception("MySQL connecting error.".$result->error,$result->errno);
            }
        }
        public function runSQL($sql):SarMySQLResult
        {
            $mysqlResult=new SarMySQLResult();

            if(!$this->connected )
            {
                $mysqlResult->succeed=false;
                $mysqlResult->error="not connected.";
                $mysqlResult->errno=0;
                return $mysqlResult;
            }

            $result=$this->mysqli->query($sql);
            
            if(!$result)
            {
                $mysqlResult->succeed=false;
                $mysqlResult->error=mysqli_error($this->mysqli);
                $mysqlResult->errno=mysqli_errno($this->mysqli);
                return $mysqlResult;
            }

            if(!is_bool($result))
            {
                $data = Array();
                $i=0;
                while( $Array = mysqli_fetch_array( $result, MYSQLI_ASSOC ) )
                {
                    $data[$i++] = $Array;
                }
                $mysqlResult->data=$data;
            }
            //echo "mysqli_insert_id(\$this->mysqli)=".mysqli_insert_id($this->mysqli);;
            $mysqlResult->id=mysqli_insert_id($this->mysqli);
            $mysqlResult->succeed=true;
            $mysqlResult->affectedRows=$this->mysqli->affected_rows;
            return $mysqlResult;
        }
        public function tryRunSQL($sql):SarMySQLResult
        {
            $result = $this->runSQL($sql);
            if(!$result->succeed)
            {
                throw new Exception($result->error,$result->errno);
            }
            return $result;
        }
        public function tryRunSQLM(string $sql)
        {
            $result = $this->runSQLM($sql);
            if(!$result[0])
            {
                throw new Exception($result->error, $result->errno);
            }
            return $result;
        }
        public function escape(string $str) : string
        {
            return $this->mysqli->real_escape_string($str);
        }
        public function runSQLM($sql)
        {
            $mysqlResult=array();

            if(!$this->connected )
            {
                $mysqlResult= new SarMySQLResult();
                $mysqlResult->succeed=false;
                $mysqlResult->error="not connected.";
                $mysqlResult->errno=0;
                return $mysqlResult;
            }

            $succeed=$this->mysqli->multi_query($sql);
            if(!$succeed)
            {
                $mysqlResult= new SarMySQLResult();
                $mysqlResult->succeed=false;
                $mysqlResult->error=mysqli_error($this->mysqli);
                $mysqlResult->errno=mysqli_errno($this->mysqli);
                return $mysqlResult;
            }
            $i=0;
            do
            {
                $result=$this->mysqli->store_result();
                $mysqlResult[$i]=new SarMySQLResult();
                if(!is_bool($result))
                {
                    $data = Array();
                    $i=0;
                    while( $Array = mysqli_fetch_array( $result, MYSQL_ASSOC ) )
                    {
                        $data[$i++] = $Array;
                    }
                    $mysqlResult[$i]->data=$data;
                }
                $mysqlResult[$i]->succeed=true;
                $mysqlResult[$i]->error=mysqli_error($this->mysqli);
                $mysqlResult[$i]->errno=mysqli_errno($this->mysqli);
                $mysqlResult[$i]->id=mysqli_insert_id($this->mysqli);
                $mysqlResult[$i]->affectedRows=$this->mysqli->affected_rows;
                $i++;
            }
            while($this->mysqli->next_result());
            return $mysqlResult;
        }
    }
/*$mysql=new SarMySQL(SAE_MYSQL_HOST_M,SAE_MYSQL_USER,SAE_MYSQL_PASS,SAE_MYSQL_DB,SAE_MYSQL_PORTbu);
	$connectResult=$mysql->connect();
	if($connectResult==true)
    {
        echo "Connected successfully!";
    }
	else
    {
        echo $connectResult;
    }
    $sql = "INSERT INTO `app_sarloyn`.`News` (`index`, `type`, `title`, `tags`, `text`) VALUES (NULL, 'TEST', 'TEST', 'TEST', 'TEST');";
	$result=$mysql->runSQL($sql);
	echo $sql;
	if($result->succeed)
    {
        echo $result->affectedRows;
    }
	else
    {
        echo "Error! ".$result->errno.':'.$result->error;
    }*/
	
?>