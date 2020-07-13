<?php
$host = 'localhost';
$user = 'u0950024_default';
$password = 'I5fFEA_m';
$database = 'u0950024_default';
$link = mysqli_connect($host, $user, $password, $database);
// $date = date('d.m.y');
$dateUnix = time();
$dateNoFormat = time();
$dateNoFormatYest = $dateNoFormat - 54000;
$time = date('H:i');
