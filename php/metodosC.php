<?php
require_once "config.php"; 

$sql = "SELECT * FROM albumes";
$resultado = $cx->query($sql);

$albumes = array();

if ($resultado && $resultado->num_rows > 0) {
    while ($row = $resultado->fetch_assoc()) {
        $fotoURL = 'img_albumes/' . $row['fotoa']; 

        $albumes[] = array(
            'id_a' => $row['id_a'],
            'nombrea' => $row['nombrea'],
            'descripcion' => $row['descripcion'],
            'precio' => $row['precio'],
            'cantidada' => $row['cantidada'],
            'fotoa' => $fotoURL 
        );
    }
} else {
    // Mensaje de depuración si no se obtienen resultados
    echo json_encode(['error' => 'No se encontraron álbumes']);
    exit();
}

echo json_encode($albumes);
?>