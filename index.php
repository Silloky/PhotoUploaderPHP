<?php

if(session_status() === PHP_SESSION_NONE){
    session_start();
}

if (!(array_key_exists('connected',$_SESSION))){
    header('Location: ./login');
} else {
    if (!($_SESSION['connected'])){
        header('Location: ./login');
    }
}

$rand = random_int(1,10000)


?>


<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Upload Photos</title>
    <script src="./app.js?refreshthing=<?= $rand ?>" defer></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded&display=block:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
    <link rel="stylesheet" href="./style.css?refreshthing=<?= $rand ?>">
</head>
<body>
    <div id="sidebar">
        <div id="photos" class="scrollbarhidden">
            <span id="photo-panel-big">Photos</span>
            <div class="photoblock">
                <img src="https://images.unsplash.com/photo-1526512340740-9217d0159da9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dmVydGljYWx8ZW58MHx8MHx8fDA%3D&w=1000&q=80" alt="">
                <span>testphotovertical.png</span>
                <span>19/06/2023 14:06</span>
            </div>
        </div>
        <ul id="controls">
            <input type="file" multiple id="filebrowser" style="display: none;">
            <li class="control" onclick="$('#filebrowser').click();">
                <span class="material-symbols-rounded">add_photo_alternate</span>
                <span>Add photo(s)</span>
            </li>
            <li class="control">
                <span class="material-symbols-rounded">delete_forever</span>
                <span>Remove selected photo(s)</span>
            </li>
            <li class="control">
                <span class="material-symbols-rounded">help</span>
                <span>Show help</span>
            </li>
        </ul>
    </div>
    <div id="editor-panel">
        <!-- <img src="" alt="preview"> -->
        <div id="fields">

            <div id="map">

            </div>
        </div>
    </div>
    <div id="bottom-bar">

    </div>
</body>
</html>