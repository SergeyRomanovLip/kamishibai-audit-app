<?php
header('Access-Control-Allow-Credentials: true');
include './config.php';
mysqli_set_charset($link, "utf8");

$req = $_POST;
$cookies = $_COOKIE['webRestricted'];
$todayUnix = round($dateUnix / (60 * 60 * 24));

if ($req['req'] == 'login') {
	loginUser($req['user'], $req['password']);
}
if ($req['req'] == 'check') {
	coockieCheck();
}
if ($req['req'] == 'getQuestions') {
	getQuestionList($req['user']);
}
if ($req['req'] == 'insertAnswers') {
	writeAnswers($req['answers']);
}
if ($req['req'] == 'logout') {
	setcookie('webRestricted', '', time() + (3600 * 24 * 30), '/');
}


function coockieCheck()
{
	global $link;
	global $cookies;
	$checkUser = "SELECT * FROM kamishibaiUsers WHERE userHash = '$cookies'";
	$res = mysqli_query($link, $checkUser);
	$res = mysqli_fetch_assoc($res);
	$answer = null;
	if ($res == null) {
		echo json_encode('userIsNotAuthorized');
	} else if ($res['userHash'] == $cookies) {
		$answer = $res['login'];
		echo json_encode($answer);
	}
	return $answer;
}
function getQuestionList($user)
{
	// global $link;
	// global $todayUnix;
	// global $cookies;
	// $schedule = "SELECT * FROM kamishibaiSchedule WHERE owner = '$user' AND day='$todayUnix'";
	// $schedule = mysqli_query($link, $schedule);
	// $schedule = mysqli_fetch_assoc($schedule);
	// if ($schedule == null) {
	// 	echo json_encode('Данные отсутствуют');
	// } else {
	// 	$location = $schedule['location'];
	// 	$type = $schedule['type'];
	// 	$question = "SELECT * FROM kamishibaiQuestions WHERE location = '$location' AND type='$type'";
	// 	$question = mysqli_query($link, $question);

	// 	$questions = [];
	// 	$index = 0;

	// 	while ($row = mysqli_fetch_assoc($question)) {
	// 		$questions[$index]['question'] .= $row['question'];
	// 		$questions[$index]['location'] .= $row['location'];
	// 		$questions[$index]['type'] .= $row['type'];
	// 		$index++;
	// 	}
	// 	echo json_encode($questions);
	// }
	global $link;
	global $todayUnix;
	global $cookies;
	$schedule = "SELECT * FROM kamishibaiSchedule WHERE owner = '$user' AND day='$todayUnix'";
	$schedule = mysqli_query($link, $schedule);
	$schedule = mysqli_fetch_assoc($schedule);
	if ($schedule == null) {
		echo json_encode('Данные отсутствуют');
	} else {
		$location = $schedule['location'];
		$type = $schedule['type'];
		$checkAnswersRequest = "SELECT * FROM kamishibaiAnswers WHERE location = '$location' AND type='$type' AND owner='$user'";
		$checkAnswers = mysqli_query($link, $checkAnswersRequest);
		$checkAnswers = mysqli_fetch_assoc($checkAnswers);
		if ($checkAnswers == null) {
			$question = "SELECT * FROM kamishibaiQuestions WHERE location = '$location' AND type='$type'";
			$question = mysqli_query($link, $question);
			$questions = [];
			$index = 0;

			while ($row = mysqli_fetch_assoc($question)) {
				$questions[$index]['question'] .= $row['question'];
				$questions[$index]['location'] .= $row['location'];
				$questions[$index]['type'] .= $row['type'];
				$index++;
			}
			echo json_encode($questions);
		} else {
			echo json_encode('todayalreadyanswered');
		}
	}
}
function writeAnswers($answers)
{
	$answers = json_decode($answers);

	global $link;
	global $cookies;
	global $todayUnix;
	$checkUser = "SELECT login FROM kamishibaiUsers WHERE userHash = '$cookies'";
	$user = mysqli_query($link, $checkUser);
	$user = mysqli_fetch_assoc($user);
	$user = $user['login'];

	foreach ($answers as $value) {
		$question = $value[0];
		$answer = $value[1];
		$location = $value[2];
		$type = $value[3];
		$answersWrite = "INSERT INTO kamishibaiAnswers (owner, date, question, answer, location, type) VALUES ('$user', '$todayUnix', '$question', '$answer', '$location', '$type')";
		mysqli_query($link, $answersWrite);
	}
}
function loginUser($user, $passw)
{
	$user_hash = md5($user . $passw);
	global $link;
	$checkUser = "SELECT * FROM kamishibaiUsers WHERE userHash = '$user_hash'";
	$result3 = mysqli_query($link, $checkUser);
	$result3 = mysqli_fetch_assoc($result3);
	if ($result3 == null) {
		echo json_encode('coockiesWasNotSetted');
	} else {
		setcookie('webRestricted', $user_hash, time() + (3600 * 24 * 30), '/');
		echo json_encode('coockiesWasSetted');
	}
}


//sergey.romanovaut01051993
//9162240c972df0baa11206de5c2ddd18
