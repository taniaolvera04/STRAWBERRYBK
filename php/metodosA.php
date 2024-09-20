<?php
require_once "config.php";
header('Content-Type: application/json; charset=utf-8');
date_default_timezone_set('America/Mexico_City'); 


$valido['success']=array('success'=>false,'mensaje'=>"");


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'];

    switch ($action) {
       
        case "guardar":
            // Obtener los datos del formulario
            $a = $_POST['nombrea'] ?? '';
            $b = $_POST['descripcion'] ?? '';
            $c = $_POST['precio'] ?? 0;
            $e = $_POST['cantidada'] ?? 0;
            $h = $_POST['categoria'] ?? '';
         
            // Manejo de la imagen
            $fileName = $_FILES['fotoa']['name'];
            $fileTmpName = $_FILES['fotoa']['tmp_name'];
            $uploadDirectory = '../assets/img_albumes/';
        
            // Verificar y crear directorio si no existe
            if (!is_dir($uploadDirectory)) {
                mkdir($uploadDirectory, 0755, true);
            }
        
            $filePath = $uploadDirectory . basename($fileName);
        
            // Mover la imagen subida al directorio deseado
            if (move_uploaded_file($fileTmpName, $filePath)) {
                // Insertar los datos del álbum en la base de datos
                $sqlInsertAlbum = "INSERT INTO albumes (nombrea, descripcion, precio, cantidada, fotoa, categoria) 
                                   VALUES ('$a', '$b', $c, $e, '$filePath', '$h')";
        
                if ($cx->query($sqlInsertAlbum)) {
                    $valido['success'] = true;
                    $valido['mensaje'] = "Álbum registrado correctamente";
                } else {
                    $valido['mensaje'] = "Error al guardar el álbum en la base de datos: " . $cx->error;
                }
            } else {
                $valido['mensaje'] = "Error al subir la imagen del álbum";
            }
        
            echo json_encode($valido);
            break;


        
            case "selectAll":

                $sql = "SELECT albumes.id_a, albumes.nombrea, albumes.descripcion, albumes.precio, albumes.cantidada,
                albumes.fotoa, categorias.categoria 
                FROM albumes
                INNER JOIN categorias ON albumes.categoria = categorias.categoria"; 
            
            $registros=array('data'=>array());
            $res=$cx->query($sql);
            if($res->num_rows>0){
                while($row=$res->fetch_array()){
                    $registros['data'][]=array($row[0],$row[1],$row[2],$row[3],$row[4],$row[5],$row[6]);
                }
            }
            
            echo json_encode($registros);
            
            break;

        

            case "delete":
                $ida = $_POST['ida'];
            
                // Respuesta por defecto
                $valido = array(
                    'success' => false,
                    'mensaje' => 'Error al procesar la solicitud'
                );
            
                // Verificar si el ID del álbum es numérico
                if (!is_numeric($ida)) {
                    $valido['mensaje'] = "ID de álbum no válido";
                } else {
                    // Preparar la consulta SQL para eliminar el álbum con una consulta preparada
                    $sql = "DELETE FROM albumes WHERE id_a = ?";
                    $stmt = $cx->prepare($sql);
                    $stmt->bind_param("i", $ida); // "i" indica que el parámetro es un entero (ID del álbum)
                    
                    // Ejecutar la consulta para eliminar el álbum
                    if ($stmt->execute()) {
                        $valido['success'] = true;
                        $valido['mensaje'] = "Se eliminó el álbum correctamente";
                    } else {
                        $valido['mensaje'] = "Error al eliminar el álbum: " . $stmt->error;
                    }
                }
            
                // Devolver respuesta en formato JSON
                echo json_encode($valido);
                break;
            
            

       
            case "select":
                $valido = [
                    'success' => false,
                    'mensaje' => "",
                    'ida' => "",
                    'nombrea' => "",
                    'descripcion' => "",
                    'precio' => "",
                    'cantidada' => "",
                    'fotoa' => "",
                    'categoria' => ""
                ];
            
                $ida = $_POST['ida'];
                $sql = "SELECT * FROM albumes WHERE id_a = $ida";
            
                $res = $cx->query($sql);
                if ($res && $row = $res->fetch_array()) {
                    $valido['success'] = true;
                    $valido['mensaje'] = "SE ENCONTRÓ ÁLBUM";
                    $valido['ida'] = $row['id_a'];
                    $valido['nombrea'] = $row['nombrea'];
                    $valido['descripcion'] = $row['descripcion'];
                    $valido['precio'] = $row['precio'];
                    $valido['cantidada'] = $row['cantidada'];
                    $valido['fotoa'] = $row['fotoa'];
                    $valido['categoria'] = $row['categoria'];
                } else {
                    $valido['mensaje'] = "Álbum no encontrado.";
                }
            
                echo json_encode($valido);
                break;
            
        
    
                case "update":
                    // Obtener los datos del formulario
                    $ida = $_POST['ida'] ?? '';
                    $a = $_POST['nombrea'] ?? '';
                    $b = $_POST['descripcion'] ?? '';
                    $c = $_POST['precio'] ?? 0;
                    $e = $_POST['cantidada'] ?? 0;
                    $h = $_POST['categoria'] ?? '';
                
                    // Manejo de la imagen
                    $fileName = $_FILES['fotoa']['name'];
                    $fileTmpName = $_FILES['fotoa']['tmp_name'];
                    $uploadDirectory = '../assets/img_albumes/';
                
                    // Verificar y crear directorio si no existe
                    if (!is_dir($uploadDirectory)) {
                        mkdir($uploadDirectory, 0755, true);
                    }
                
                    // Inicializar la ruta del archivo
                    $filePath = '';
                
                    // Mover la imagen subida al directorio deseado si se proporciona una nueva imagen
                    if (!empty($fileName)) {
                        $filePath = $uploadDirectory . basename($fileName);
                
                        if (!move_uploaded_file($fileTmpName, $filePath)) {
                            $valido['mensaje'] = "Error al subir la imagen del álbum";
                            echo json_encode($valido);
                            exit;
                        }
                    } else {
                        // Si no se proporciona una nueva imagen, buscar la actual
                        $currentImageQuery = "SELECT fotoa FROM albumes WHERE id_a = $ida";
                        $currentImageResult = $cx->query($currentImageQuery);
                        $currentImage = ($currentImageResult && $row = $currentImageResult->fetch_array()) ? $row['fotoa'] : '';
                        $filePath = $currentImage; // Mantener la imagen actual
                    }
                
                    // Actualizar los datos del álbum en la base de datos
                    $sqlUpdateAlbum = "UPDATE albumes SET 
                                        nombrea = '$a',
                                        descripcion = '$b',
                                        precio = $c,
                                        cantidada = $e,
                                        fotoa = '$filePath',
                                        categoria = '$h'
                                        WHERE id_a = $ida";
                
                    if ($cx->query($sqlUpdateAlbum)) {
                        $valido['success'] = true;
                        $valido['mensaje'] = "Álbum actualizado correctamente";
                    } else {
                        $valido['mensaje'] = "Error al actualizar el álbum en la base de datos: " . $cx->error;
                    }
                
                    echo json_encode($valido);
                    break;
                
                



   //METODOS PARA AGREGAR CATEGORIAS

   case "guardarCa":
    $a = $_POST['nombrec'];
        
$sql = "INSERT INTO categorias VALUES (null,'$a')";
        
        if ($cx->query($sql)) {
            $valido['success'] = true;
            $valido['mensaje'] = "CATEGORÍA SE GUARDÓ CORRECTAMENTE";
        } else {
            $valido['mensaje'] = "ERROR AL GUARDAR CATEGORÍA EN BD";
        }
    echo json_encode($valido);
    break;


   case "selectCa":
            
    $valido['success']=array('success'=>false,'mensaje'=>"",'idc'=>"",'nombrec'=>"");

    $idc=$_POST['idc'];
    $sql="SELECT * FROM categorias WHERE id_c=$idc";

    $res=$cx->query($sql);
    $row=$res->fetch_array();
    
    $valido['success']==true;
    $valido['mensaje']="SE ENCONTRÓ CATEGORÍA";

    $valido['idc']=$row[0];
    $valido['nombrec']=$row[1];

echo json_encode($valido);

break;


case "selectAllCa":

    $sql="SELECT * FROM categorias";
    $registros=array('data'=>array());
    $res=$cx->query($sql);
    if($res->num_rows>0){
        while($row=$res->fetch_array()){
            $registros['data'][]=array($row[0],$row[1]);
        }
    }
    
    echo json_encode($registros);

break;

    case "updateCa":

        $idc=$_POST['idc'];
        $a=$_POST['nombrec'];
    
        $sql="UPDATE categorias SET categoria='$a' WHERE id_c=$idc";
    
        if($cx->query($sql)){
           $valido['success']=true;
           $valido['mensaje']="SE ACTUALIZÓ CORRECTAMENTE LA CATEGORIA";
        }else{
            $valido['success']=false;
           $valido['mensaje']="ERROR AL ACTUALIZAR EN BD"; 
        }
    
        echo json_encode($valido);
        break;
        
    
        case "deleteCa":
            if(isset($_POST['idc'])) {
                $idc = $_POST['idc'];
                
                // Realizar la eliminación en la base de datos
                $sql = "DELETE FROM categorias WHERE id_c = $idc";
                if($cx->query($sql)){
                    $valido['success'] = true;
                    $valido['mensaje'] = "SE ELIMINÓ CORRECTAMENTE";
                } else {
                    $valido['success'] = false;
                    $valido['mensaje'] = "ERROR AL ELIMINAR EN BD"; 
                }
            } else {
                $valido['success'] = false;
                $valido['mensaje'] = "ID de categoría no proporcionado"; 
            }
            echo json_encode($valido);
            break;


            //MOSTRAR TODOS LOS USUARIOS 
            case "selectAllUsu":

                $sql="SELECT * FROM usuarios";
                $registros=array('data'=>array());
                $res=$cx->query($sql);
                if($res->num_rows>0){
                    while($row=$res->fetch_array()){
                        $registros['data'][]=array($row[0],$row[1],$row[2],$row[3],$row[5]);
                    }
                }
                
                echo json_encode($registros);
            
            break;

            case "selectAllOr":

                $sql = "SELECT o.id_o, u.nombre, o.nombrea, o.cantidad, o.total, o.fecha_o
                FROM orden o
                INNER JOIN usuarios u ON o.id_u = u.id_u"; 
                
               $registros = array('data' => array());
    
                $res = $cx->query($sql);
                if ($res && $res->num_rows > 0) {
                    while ($row = $res->fetch_assoc()) {
                        // Ensure to format data as needed
                        $registros['data'][] = array(
                            $row['id_o'],
                            $row['nombre'],
                            $row['nombrea'],
                            $row['cantidad'],
                            floatval($row['total']),
                            $row['fecha_o'] // Keeping as is for date
                        );
                    }
                }
    
                echo json_encode($registros);
                break;
    
                case "selectHis":
                    $usuario = $_POST['usuario'] ?? '';
                
                    // Primero, recuperar el id_u del usuario
                    $stmtUsuario = $cx->prepare("SELECT id_u FROM usuarios WHERE usuario = ?");
                    $stmtUsuario->bind_param("s", $usuario);
                    $stmtUsuario->execute();
                    $resultadoUsuario = $stmtUsuario->get_result();
                
                    $registros = array('data' => array());
                
                    if ($resultadoUsuario->num_rows > 0) {
                        $idUsuario = $resultadoUsuario->fetch_assoc()['id_u'];
                
                        // Obtener las órdenes del usuario
                        $stmtOrdenes = $cx->prepare("SELECT o.id_o, o.nombrea, a.fotoa, a.precio, o.cantidad, o.total, o.fecha_o
                                                      FROM orden o
                                                      INNER JOIN albumes a ON o.nombrea = a.nombrea 
                                                      WHERE o.id_u = ?");
                        $stmtOrdenes->bind_param("i", $idUsuario);
                        $stmtOrdenes->execute();
                        $resultadoOrdenes = $stmtOrdenes->get_result();
                
                        if ($resultadoOrdenes->num_rows > 0) {
                            while ($row = $resultadoOrdenes->fetch_array()) {
                                $registros['data'][] = array($row[0], $row[1], $row[2], $row[3], $row[4], $row[5], $row[6]);
                            }
                        }
                    } else {
                        $registros['mensaje'] = "Usuario no encontrado.";
                    }
                
                    echo json_encode($registros);
                    break;
                
            
}

} else {
    echo json_encode(["error" => "Método no permitido"]);
}


?>