<?php
require_once "config.php";
header('Content-Type: application/json; charset=utf-8');
date_default_timezone_set('America/Mexico_City'); // Cambia 'America/Mexico_City' por tu zona horaria local


$valido = ['success' => false, 'mensaje' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    switch ($action) {

        case "agregarC":
            $idProducto = $_POST['id_p'] ?? '';
            $usuario = $_POST['usuario'] ?? '';
            $cantidad = $_POST['cantidad'] ?? 1;

            // Verificar si el usuario existe
            $sqlUsuario = "SELECT id_u FROM usuarios WHERE usuario = ?";
            $stmtUsuario = $cx->prepare($sqlUsuario);
            $stmtUsuario->bind_param("s", $usuario);
            $stmtUsuario->execute();
            $resultadoUsuario = $stmtUsuario->get_result();

            if ($resultadoUsuario->num_rows > 0) {
                $row = $resultadoUsuario->fetch_assoc();
                $idUsuario = $row['id_u'];

                // Verificar si el producto ya está en el carrito
                $sqlExisteProducto = "SELECT id_carrito, cantidad FROM carrito WHERE id_u = ? AND id_p = ?";
                $stmtExisteProducto = $cx->prepare($sqlExisteProducto);
                $stmtExisteProducto->bind_param("ii", $idUsuario, $idProducto);
                $stmtExisteProducto->execute();
                $resultadoExisteProducto = $stmtExisteProducto->get_result();

                if ($resultadoExisteProducto->num_rows > 0) {
                    // Producto ya existe en el carrito, actualizar cantidad
                    $rowProducto = $resultadoExisteProducto->fetch_assoc();
                    $idCarrito = $rowProducto['id_carrito'];
                    $cantidadExistente = $rowProducto['cantidad'];

                    $nuevaCantidad = $cantidadExistente + $cantidad;

                    $sqlUpdate = "UPDATE carrito SET cantidad = ? WHERE id_carrito = ?";
                    $stmtUpdate = $cx->prepare($sqlUpdate);
                    $stmtUpdate->bind_param("ii", $nuevaCantidad, $idCarrito);

                    if ($stmtUpdate->execute()) {
                        $valido['success'] = true;
                        $valido['mensaje'] = "Cantidad de prenda actualizada en el carrito";

                        // Registrar movimiento de compra en la tabla movimientos
                        $tipoMovimiento = "venta";
                        $fechaHora = date("Y-m-d H:i:s");
                        $sqlMovimiento = "INSERT INTO movimientos (fecha, tipomov, id_p, id_u, cant) VALUES (?, ?, ?, ?, ?)";
                        $stmtMovimiento = $cx->prepare($sqlMovimiento);
                        $stmtMovimiento->bind_param("ssiii", $fechaHora, $tipoMovimiento, $idProducto, $idUsuario, $nuevaCantidad);

                        if (!$stmtMovimiento->execute()) {
                            $valido['mensaje'] .= ". Error al registrar movimiento: " . $stmtMovimiento->error;
                        }
                    } else {
                        $valido['mensaje'] = "Error al actualizar cantidad de la prenda en el carrito: " . $stmtUpdate->error;
                    }
                } else {
                    // Producto no existe en el carrito, insertar nuevo producto
                    $sqlProducto = "SELECT nombrep, precio, talla, fotop FROM prendas WHERE id_p = ?";
                    $stmtProducto = $cx->prepare($sqlProducto);
                    $stmtProducto->bind_param("i", $idProducto);
                    $stmtProducto->execute();
                    $resultadoProducto = $stmtProducto->get_result();

                    if ($resultadoProducto->num_rows > 0) {
                        $rowProducto = $resultadoProducto->fetch_assoc();
                        $nombreProducto = $rowProducto['nombrep'];
                        $precioProducto = $rowProducto['precio'];
                        $fotoProducto = $rowProducto['fotop'];
                        $tallaProducto = $rowProducto['talla'];

                        $sqlInsert = "INSERT INTO carrito (id_p, fotop, nombrep, talla, precio, cantidad, id_u) 
                                      VALUES (?, ?, ?, ?, ?, ?, ?)";
                        $stmtInsert = $cx->prepare($sqlInsert);
                        $stmtInsert->bind_param("isssdii", $idProducto, $fotoProducto, $nombreProducto, $tallaProducto, $precioProducto, $cantidad, $idUsuario);

                        if ($stmtInsert->execute()) {
                            $valido['success'] = true;
                            $valido['mensaje'] = "Prenda agregada a carrito";

                            // Registrar movimiento de compra en la tabla movimientos
                            $tipoMovimiento = "venta";
                            $fechaHora = date("Y-m-d H:i:s");
                            $sqlMovimiento = "INSERT INTO movimientos (fecha, tipomov, id_p, id_u, cant) VALUES (?, ?, ?, ?, ?)";
                            $stmtMovimiento = $cx->prepare($sqlMovimiento);
                            $stmtMovimiento->bind_param("ssiii", $fechaHora, $tipoMovimiento, $idProducto, $idUsuario, $cantidad);

                            if (!$stmtMovimiento->execute()) {
                                $valido['mensaje'] .= ". Error al registrar movimiento: " . $stmtMovimiento->error;
                            }
                        } else {
                            $valido['mensaje'] = "Error al agregar prenda al carrito: " . $stmtInsert->error;
                        }
                    } else {
                        $valido['mensaje'] = "No se encontró el producto con ID $idProducto";
                    }
                }
            } else {
                $valido['mensaje'] = "No se encontró el usuario '$usuario'";
            }
            echo json_encode($valido);
            break;

            

        case "eliminarC":
            $idCarrito = $_POST['id_carrito'] ?? '';

            if (!empty($idCarrito)) {
                $sqlDelete = "DELETE FROM carrito WHERE id_carrito = ?";
                $stmtDelete = $cx->prepare($sqlDelete);
                $stmtDelete->bind_param("i", $idCarrito);

                if ($stmtDelete->execute()) {
                    $valido['success'] = true;
                    $valido['mensaje'] = "Producto eliminado del carrito correctamente";
                } else {
                    $valido['mensaje'] = "Error al eliminar producto del carrito: " . $stmtDelete->error;
                }
            } else {
                $valido['mensaje'] = "ID de carrito no proporcionado";
            }
            echo json_encode($valido);
            break;

        case "listarC":
            $usuario = $_POST['usuario'] ?? '';

            $sqlUsuario = "SELECT id_u FROM usuarios WHERE usuario = ?";
            $stmtUsuario = $cx->prepare($sqlUsuario);
            $stmtUsuario->bind_param("s", $usuario);
            $stmtUsuario->execute();
            $resultadoUsuario = $stmtUsuario->get_result();

            if ($resultadoUsuario->num_rows > 0) {
                $row = $resultadoUsuario->fetch_assoc();
                $idUsuario = $row['id_u'];

                $sqlCarrito = "SELECT id_carrito, id_p,  fotop, nombrep, talla, precio, cantidad FROM carrito WHERE id_u = ?";
                $stmtCarrito = $cx->prepare($sqlCarrito);
                $stmtCarrito->bind_param("i", $idUsuario);
                $stmtCarrito->execute();
                $resultadoCarrito = $stmtCarrito->get_result();
                $carrito = [];

                if ($resultadoCarrito->num_rows > 0) {
                    while ($rowCarrito = $resultadoCarrito->fetch_assoc()) {
                        // Construir la URL completa de la imagen
                        $fotoURL = 'img_prendas/' . $rowCarrito['fotop'];
                    
                        $carrito[] = [
                            'id_carrito' => $rowCarrito['id_carrito'],
                            'id_p' => $rowCarrito['id_p'],
                            'fotop' => $fotoURL, // Aquí asignamos la URL completa de la imagen
                            'nombrep' => $rowCarrito['nombrep'],
                            'talla' => $rowCarrito['talla'],
                            'precio' => $rowCarrito['precio'],
                            'cantidad' => $rowCarrito['cantidad']
                        ];
                    }
                    

                    $totalCarrito = 0;
                    foreach ($carrito as $producto) {
                        $totalCarrito += $producto['precio'] * $producto['cantidad'];
                    }

                    echo json_encode(['success' => true, 'carrito' => $carrito, 'total' => $totalCarrito]);
                    
                } else {
                    echo json_encode(['success' => true, 'carrito' => [], 'total' => 0]); // No hay productos en el carrito
                }
            } else {
                echo json_encode(['success' => false, 'mensaje' => "No se encontró el usuario '$usuario'"]);
            }
            break;


              case "confirmarCompra":
            $usuario = $_POST['usuario'] ?? '';

            $sqlUsuario = "SELECT id_u FROM usuarios WHERE usuario = ?";
            $stmtUsuario = $cx->prepare($sqlUsuario);
            $stmtUsuario->bind_param("s", $usuario);
            $stmtUsuario->execute();
            $resultadoUsuario = $stmtUsuario->get_result();

            if ($resultadoUsuario->num_rows > 0) {
                $row = $resultadoUsuario->fetch_assoc();
                $idUsuario = $row['id_u'];

                // Eliminar todos los productos del carrito para este usuario
                $sqlDelete = "DELETE FROM carrito WHERE id_u = ?";
                $stmtDelete = $cx->prepare($sqlDelete);
                $stmtDelete->bind_param("i", $idUsuario);

                if ($stmtDelete->execute()) {
                    $valido['success'] = true;
                    $valido['mensaje'] = "Compra confirmada y productos eliminados del carrito";
                } else {
                    $valido['mensaje'] = "Error al eliminar productos del carrito: " . $stmtDelete->error;
                }
            } else {
                $valido['mensaje'] = "No se encontró el usuario '$usuario'";
            }

            echo json_encode($valido);
            break;
            


        default:
            echo json_encode(['success' => false, 'mensaje' => "Acción no válida"]);
            break;
    }
} else {
    echo json_encode(['success' => false, 'mensaje' => "Método no permitido"]);
}
?>
