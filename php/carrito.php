<?php
require_once "config.php";
header('Content-Type: application/json; charset=utf-8');

date_default_timezone_set('America/Mexico_City');

$valido = ['success' => false, 'mensaje' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    switch ($action) {
        case "agregarC":
            $idAlbum = $_POST['id_a'] ?? '';
            $usuario = $_POST['usuario'] ?? '';
            $cantidad = (int) ($_POST['cantidad'] ?? 1);
        
            // Obtener ID de usuario
            $stmtUsuario = $cx->prepare("SELECT id_u FROM usuarios WHERE usuario = ?");
            $stmtUsuario->bind_param("s", $usuario);
            $stmtUsuario->execute();
            $resultadoUsuario = $stmtUsuario->get_result();
        
            if ($resultadoUsuario->num_rows > 0) {
                $idUsuario = $resultadoUsuario->fetch_assoc()['id_u'];
        
                // Comprobar si el álbum ya está en el carrito
                $stmtAlbum = $cx->prepare("SELECT id_ca, cantidad FROM carrito WHERE id_u = ? AND id_a = ?");
                $stmtAlbum->bind_param("ii", $idUsuario, $idAlbum);
                $stmtAlbum->execute();
                $resultadoAlbum = $stmtAlbum->get_result();
        
                if ($resultadoAlbum->num_rows > 0) {
                    // Actualizar cantidad
                    $rowAlbum = $resultadoAlbum->fetch_assoc();
                    $nuevaCantidad = $rowAlbum['cantidad'] + $cantidad;
        
                    $stmtUpdate = $cx->prepare("UPDATE carrito SET cantidad = ? WHERE id_ca = ?");
                    $stmtUpdate->bind_param("ii", $nuevaCantidad, $rowAlbum['id_ca']);
                    $valido['success'] = $stmtUpdate->execute();
                    $valido['mensaje'] = $valido['success'] ? "Cantidad actualizada" : "Error al actualizar cantidad";
                } else {
                    // Agregar nuevo álbum al carrito
                    $stmtNuevoAlbum = $cx->prepare("SELECT nombrea, precio FROM albumes WHERE id_a = ?");
                    $stmtNuevoAlbum->bind_param("i", $idAlbum);
                    $stmtNuevoAlbum->execute();
                    $rowAlbum = $stmtNuevoAlbum->get_result()->fetch_assoc();
        
                    if ($rowAlbum) {
                        $stmtInsert = $cx->prepare("INSERT INTO carrito (id_a, nombrea, precio, cantidad, id_u) VALUES (?, ?, ?, ?, ?)");
                        $stmtInsert->bind_param("issdi", $idAlbum, $rowAlbum['nombrea'], $rowAlbum['precio'], $cantidad, $idUsuario);
                        $valido['success'] = $stmtInsert->execute();
                        $valido['mensaje'] = $valido['success'] ? "Álbum agregado al carrito" : "Error al agregar al carrito";
        
                        // Guardar en orden y detalle_o al agregar al carrito
                        if ($valido['success']) {
                            $totalCompra = $rowAlbum['precio'] * $cantidad;
                            $fechaHora = date("Y-m-d H:i:s");
        
                            // Insertar en la tabla orden
                            $stmtOrden = $cx->prepare("INSERT INTO orden (id_u, total, fecha_o) VALUES (?, ?, ?)");
                            $stmtOrden->bind_param("ids", $idUsuario, $totalCompra, $fechaHora);
                            $stmtOrden->execute();
                            $idOrden = $cx->insert_id; // Obtener el ID de la nueva orden
        
                            // Insertar en detalle_o
                            $stmtDetalleO = $cx->prepare("INSERT INTO detalle_o (id_o, id_a, cantidad, fechahr) VALUES (?, ?, ?, ?)");
                            $stmtDetalleO->bind_param("iiis", $idOrden, $idAlbum, $cantidad, $fechaHora);
                            $stmtDetalleO->execute();

                            $stmtDetalleO = $cx->prepare("INSERT INTO detalle_ca (id_ca id_a, cantidad, fechahr) VALUES (?, ?, ?,?)");
                            $stmtDetalleO->bind_param("iiis", $idOrden, $idAlbum, $cantidad, $fechaHora);
                            $stmtDetalleO->execute();
                        }
                    } else {
                        $valido['mensaje'] = "Álbum no encontrado";
                    }
                }
            } else {
                $valido['mensaje'] = "Usuario no encontrado";
            }
            break;
        

        case "eliminarC":
            $idCarrito = $_POST['id_ca'] ?? '';
            $stmtSelect = $cx->prepare("SELECT id_a FROM carrito WHERE id_ca = ?");
            $stmtSelect->bind_param("i", $idCarrito);
            $stmtSelect->execute();
            $resultadoSelect = $stmtSelect->get_result();

            if ($resultadoSelect->num_rows > 0) {
                $row = $resultadoSelect->fetch_assoc();
                $idAlbum = $row['id_a'];

                $stmtDelete = $cx->prepare("DELETE FROM carrito WHERE id_ca = ?");
                $stmtDelete->bind_param("i", $idCarrito);
                $valido['success'] = $stmtDelete->execute();
                $valido['mensaje'] = $valido['success'] ? "Álbum eliminado" : "Error al eliminar álbum";
            } else {
                $valido['mensaje'] = "Álbum no encontrado en el carrito";
            }
            break;

        case "listarC":
            $usuario = $_POST['usuario'] ?? '';
            $stmtUsuario = $cx->prepare("SELECT id_u FROM usuarios WHERE usuario = ?");
            $stmtUsuario->bind_param("s", $usuario);
            $stmtUsuario->execute();
            $resultadoUsuario = $stmtUsuario->get_result();
        
            if ($resultadoUsuario->num_rows > 0) {
                $idUsuario = $resultadoUsuario->fetch_assoc()['id_u'];
                $stmtCarrito = $cx->prepare("SELECT id_ca, id_a, fotoa, nombrea, precio, cantidad FROM carrito WHERE id_u = ?");
                $stmtCarrito->bind_param("i", $idUsuario);
                $stmtCarrito->execute();
                $resultadoCarrito = $stmtCarrito->get_result();
        
                $carrito = [];
                while ($rowCarrito = $resultadoCarrito->fetch_assoc()) {
                    $carrito[] = $rowCarrito;
                }
        
                $totalCarrito = array_reduce($carrito, fn($carry, $item) => $carry + ($item['precio'] * $item['cantidad']), 0);
                echo json_encode(['success' => true, 'carrito' => $carrito, 'total' => $totalCarrito]);
            } else {
                echo json_encode(['success' => false, 'mensaje' => "Usuario no encontrado"]);
            }
            break;

            case "confirmarCompra":
                $usuario = $_POST['usuario'] ?? '';
                $stmtUsuario = $cx->prepare("SELECT id_u FROM usuarios WHERE usuario = ?");
                $stmtUsuario->bind_param("s", $usuario);
                $stmtUsuario->execute();
                $resultadoUsuario = $stmtUsuario->get_result();
            
                if ($resultadoUsuario->num_rows > 0) {
                    $idUsuario = $resultadoUsuario->fetch_assoc()['id_u'];
            
                    // Obtener todos los álbumes en el carrito
                    $stmtCarrito = $cx->prepare("SELECT id_ca, id_a FROM carrito WHERE id_u = ?");
                    $stmtCarrito->bind_param("i", $idUsuario);
                    $stmtCarrito->execute();
                    $resultadoCarrito = $stmtCarrito->get_result();
            
                    if ($resultadoCarrito->num_rows > 0) {
                        // Eliminar del carrito
                        $stmtDeleteCarrito = $cx->prepare("DELETE FROM carrito WHERE id_u = ?");
                        $stmtDeleteCarrito->bind_param("i", $idUsuario);
                        $stmtDeleteCarrito->execute();
            
                        // Eliminar detalles de cada álbum en detalle_ca
                        while ($rowCarrito = $resultadoCarrito->fetch_assoc()) {
                            $idCarrito = $rowCarrito['id_ca']; // Obtener id_ca
                            $stmtDeleteDetalle = $cx->prepare("DELETE FROM detalle_ca WHERE id_ca = ?");
                            $stmtDeleteDetalle->bind_param("i", $idCarrito);
                            $stmtDeleteDetalle->execute();
                        }
            
                        $valido['success'] = true;
                        $valido['mensaje'] = "Compra confirmada. Se eliminaron los productos del carrito y sus detalles.";
                    } else {
                        $valido['mensaje'] = "El carrito está vacío.";
                    }
                } else {
                    $valido['mensaje'] = "Usuario no encontrado.";
                }
                break;
            
    }
} else {
    $valido['mensaje'] = "Método no permitido";
}

// Al final del archivo PHP
echo json_encode($valido);
exit; // Termina la ejecución
?>
