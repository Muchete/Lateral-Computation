<?php
  if(!empty($_POST['data'])){
    $data = $_POST['data'];
    $fname = "log.csv";//generates random name

    $file = fopen("stats/" .$fname, 'a');//creates new file
    fwrite($file, $data);
    fwrite($file, "\n");
    fclose($file);
  }
?>
