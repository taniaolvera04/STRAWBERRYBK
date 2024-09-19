<?php
require_once "config.php";
header('Content-Type: text/html; charset=utf-8');

if($_POST){
    $action=$_REQUEST['action'];
    switch($action){
        case "registrar":

            $valido['success']=array('success'=>false,'mensaje'=>"");            
            $a=$_POST['usuario'];
            $b=md5($_POST['password']);
            $c=$_POST['nombre'];
            $tipo=$_POST['tipo'];


            $check="SELECT * FROM usuarios WHERE usuario='$a'";
            $res=$cx->query($check);
            if($res->num_rows==0){
                $sql="INSERT INTO usuarios VALUES(null,'$a','$b','$c',null, '$tipo')";
                if($cx->query($sql)){
                    $valido['success']=true;
                    $valido['mensaje']="SE REGISTRO CORRECTAMENTE";
                }else {
                    $valido['success']=false;
                    $valido['mensaje']="ERROR AL REGISTRAR";
                }
            }else{
                $valido['success']=false;
                $valido['mensaje']="USUARIO NO DISPONIBLE";
            }
            echo json_encode($valido);
            break;

       
            case "login": 
                $valido['success'] = array('success' => false, 'mensaje' => "");            
                $a = $_POST['usuario'];
                $b = md5($_POST['password']);
                $check = "SELECT * FROM usuarios WHERE usuario='$a' AND password='$b';";
                $res = $cx->query($check);
                if ($res->num_rows > 0) {
                    $row = $res->fetch_array();
                    $valido['success'] = true;
                    $valido['mensaje'] = "SE INICIÓ CORRECTAMENTE";
                   
                    if (isset($row['tipo'])) {
                        $valido['tipo'] = $row['tipo'];
                    } else {
                        $valido['tipo'] = "cliente"; 
                    }
                } else {
                    $valido['success'] = false;
                    $valido['mensaje'] = "USUARIO Y/O CONTRASEÑA INCORRECTO";
                }           
                echo json_encode($valido);
                break;
            

        case "select":
            header('Content-Type: text/html; charset=utf-8');
                $valido['success']=array('success'=>false,'mensaje'=>"","foto"=>"");            
                $a=$_POST['usuario'];
                $check="SELECT * FROM usuarios WHERE usuario='$a';";
                $res=$cx->query($check);
                if($res->num_rows>0){
                    $row=$res->fetch_array();
                    $valido['success']=true;
                    $valido['mensaje']=$row[3];
                    $valido['foto']=$row[4];
                }else {
                    $valido['success']=false;
                    $valido['mensaje']="USUARIO Y/O PASSWORD INCORRECTO";
                }           
                echo json_encode($valido);
    
                break;

                case "perfil":
                    header('Content-Type: application/json; charset=utf-8');
                    $valido = ['success' => false, 'mensaje' => '', 'usuario' => '', 'password' => '', 'nombre' => '', 'foto' => ''];
                    $a = $_POST['usuario'];
                    $check = "SELECT * FROM usuarios WHERE usuario='$a';";
                    $res = $cx->query($check);
                    if ($res->num_rows > 0) {
                        $row = $res->fetch_array();
                        $valido['success'] = true;
                        $valido['usuario'] = $row['usuario'];
                        $valido['password'] = $row['password'];
                        $valido['nombre'] = $row['nombre'];
                        $valido['foto'] = $row['foto'];
                    } else {
                        $valido['success'] = false;
                        $valido['mensaje'] = "ALGO SALIO MAL";
                    }
                    echo json_encode($valido);
                    break;
                
                case "saveperfil":
                    header('Content-Type: application/json; charset=utf-8');
                    $valido = ['success' => false, 'mensaje' => '', 'foto' => ''];
                    $a = $_POST['nombre'];
                    $c = $_POST['usuario'];
                    $fileName = $_FILES['foto']['name'];
                    $fileTmpName = $_FILES['foto']['tmp_name'];
                    $uploadDirectory = '../assets/img_profile/';
                
                    if (!is_dir($uploadDirectory)) {
                        mkdir($uploadDirectory, 0755, true);
                    }
                
                    $filePath = $uploadDirectory . basename($fileName);
                
                    if (move_uploaded_file($fileTmpName, $filePath)) {
                        $check = "UPDATE usuarios SET nombre='$a', foto='$filePath' WHERE usuario='$c'";
                        if ($cx->query($check) === TRUE) {
                            $valido['success'] = true;
                            $valido['mensaje'] = "SE GUARDÓ CORRECTAMENTE";
                            $valido['foto'] = $filePath;
                        } else {
                            $valido['success'] = false;
                            $valido['mensaje'] = "ALGO SALIÓ MAL EN LA ACTUALIZACIÓN";
                        }
                    } else {
                        $valido['success'] = false;
                        $valido['mensaje'] = "ALGO SALIÓ MAL AL SUBIR LA IMAGEN";
                    }
                
                    echo json_encode($valido);
                    break;
                
                        
    }
    
}else{
    $valido['success']=false;
    $valido['mensaje']="ERROR NO SE RECIBIO NADA";
}
?>