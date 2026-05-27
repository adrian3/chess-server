var testing="on";
var testing="off";

var script
currentNum = 0;

function nextCommand() {
	currentNum++;
	playScript(currentNum);
} 
function previousCommand() {
	currentNum--;
	playScript(currentNum);
} 

function playScript(number) {
	msg=script[number];
	console.log(msg);
	monitorConsole(msg);
}

function loadScript() {
script = rawData.split("*divider*");
// scriptSize = script.length;
// alert(script.length);
}

var str =   "rnbqkbnr pppppppp -------- -------- -------- -------- PPPPPPPP RNBQKBNR W -1 1 1 1 1 0 108 GuestCHML kurtttz 1 5 5 39 39 300 300 1 none (0:00) none 0 0 0";
var str1 =  "<12> rnbqkbnr pppppppp -------- -------- -------- -------- PPPPPPPP RNBQKBNR W -1 1 1 1 1 0 448 GuestMHSB GuestRWGD 1 5 5 39 39 300 300 1 none (0:00) none 0 0 0";
var str2 =  "<12> --kr---- -pp-bp-Q p-n--p-p ---p---- ---P---- --P--N-- q----PPP -N--R-K- W -1 0 0 0 0 4 137 GuestNFJH GuestJQGT 1 2 2 25 27 0 134 19 o-o-o (0:01) O-O-O 0 1 0";
var str3 =  "<12> rn--kb-r pp--pppb --p--n-p -------- ---N-B-- --NP-B-- PPP--PPP R---K--R B -1 1 1 1 1 5 141 ahanft ermaus -1 2 2 29 29 109 122 10 B/c1-f4 (0:06) Bf4 0 1 0";
var str4 =  "<12> r---kb-r pp-npppb --p--n-p -------- ---N-B-- --NP-B-- PPP--PPP R---K--R W -1 1 1 1 1 6 141 ahanft ermaus 1 2 2 29 29 109 123 11 N/b8-d7 (0:01) Nbd7 0 1 807";
var str5 =  "<12> -------- ------kp -------- ------p- --b--bPP ---p-P-- -p------ -B-K---- B -1 0 0 0 0 0 223 HUGOABEL megracia 0 3 0 6 10 16 27 46 P/h3-h4 (0:03) h4 0 1 199";
var str6 =  "<12> -------- ------kp -------- ------p- -----bPP -b-p-P-- -p------ -B-K---- W -1 0 0 0 0 1 223 HUGOABEL megracia 0 3 0 6 10 16 26 47 B/c4-b3 (0:02) Bb3+ 0 1 228";
var str7 =  "<12> -------- ------kp -------- ------p- -----bPP -b-p-P-- -p------ -B--K--- B -1 0 0 0 0 2 223 HUGOABEL megracia 0 3 0 6 10 12 26 47 K/d1-e1 (0:04) Ke1 0 1 206";
var str8 =  "<12> -------- ------kp -------- ------p- -----bPP -b---P-- -p-p---- -B--K--- W -1 0 0 0 0 0 223 HUGOABEL megracia 0 3 0 6 10 12 23 48 P/d3-d2 (0:02) d2+ 0 1 227";
var str9 =  "<12> -------- ------kp -------- ------p- -----bPP -b---P-- -p-p-K-- -B------ B -1 0 0 0 0 1 223 HUGOABEL megracia 0 3 0 6 10 11 23 48 K/e1-f2 (0:01) Kf2 0 1 188";
var str10 = "<12> -------- ------kp -------- ------P- -----bP- -b---P-- -p---K-- -B-q---- B -1 0 0 0 0 0 223 HUGOABEL megracia 0 3 0 6 17 10 22 49 P/h4-g5 (0:01) hxg5 0 1 194";
var str11 = "<12> -------- ------kp -------- ------P- -----bP- -b---P-- -p-q-K-- -B------ W -1 0 0 0 0 1 223 HUGOABEL megracia 0 3 0 6 17 10 18 50 Q/d1-d2 (0:03) Qd2+ 0 1 229";
var str12 = "<12> -------- ------kp -------- ------P- -----bP- -b---P-- -p-q---- -B----K- B -1 0 0 0 0 2 223 HUGOABEL megracia 0 3 0 6 17 8 18 50 K/f2-g1 (0:02) Kg1 0 1 528";
var str13 = "<12> -------- ------kp -------- ---b--P- -----bP- -----P-- -p-q---- -B----K- W -1 0 0 0 0 3 223 HUGOABEL megracia 0 3 0 6 17 8 13 51 B/b3-d5 (0:05) Bd5 0 1 227";
var str14 = "<12> -------- ------kp -------- ---b--P- ----BbP- -----P-- -p-q---- ------K- B -1 0 0 0 0 4 223 HUGOABEL megracia 0 3 0 6 17 5 13 51 B/b1-e4 (0:02) Be4 0 1 205";
var str15 = "<12> -------- ------kp -------- ------P- ----bbP- -----P-- -p-q---- ------K- W -1 0 0 0 0 0 223 HUGOABEL megracia 0 3 0 3 17 5 12 52 B/d5-e4 (0:01) Bxe4 0 1 228";
var str16 = "<12> -------- ------kp -------- ------P- ----PbP- -------- -p-q---- ------K- B -1 0 0 0 0 0 223 HUGOABEL megracia 0 3 0 3 14 5 12 52 P/f3-e4 (0:00) fxe4 0 1 535";
             //<12> r------- -------Q --pk-nP- -p-p---- ---P---- -------- --P--P-- -----K-- W -1 0 0 0 0 1 225 penguinias VERLENDSER 0 5 0 13 11 132 136 34 N/e8-f6 (0:05) Nf6 0 1 683

var rawData="Your seek intercepts EnnMal's getgame.*divider**divider*Creating: ahanft ( 191) EnnMal ( 989) rated blitz 7 3*divider*{Game 164 (ahanft vs. EnnMal) Creating rated blitz match.}*divider**divider*<12> rnbqkbnr pppppppp -------- -------- -------- -------- PPPPPPPP RNBQKBNR W -1 1 1 1 1 0 164 ahanft EnnMal 1 7 3 39 39 420 420 1 none (0:00) none 0 0 0*divider*fics% *divider*Game 164: A disconnection will be considered a forfeit.*divider*fics% *divider*2015-05-08 20:06:46.907 fics[72424:1694479] White: 420 Black: 420*divider*2015-05-08 20:06:48.847 fics[72424:1694479] d2-d4*divider*2015-05-08 20:06:49.012 fics[72424:1694479] *divider*<12> rnbqkbnr pppppppp -------- -------- ---P---- -------- PPP-PPPP RNBQKBNR B 3 1 1 1 1 0 164 ahanft EnnMal -1 7 3 39 39 420 420 1 P/d2-d4 (0:00) d4 0 0 0*divider*fics% *divider*2015-05-08 20:06:49.012 fics[72424:1694479] White: 420 Black: 420*divider*2015-05-08 20:06:50.827 fics[72424:1694479] *divider*<12> rnbqkb-r pppppppp -----n-- -------- ---P---- -------- PPP-PPPP RNBQKBNR W -1 1 1 1 1 1 164 ahanft EnnMal 1 7 3 39 39 420 420 2 N/g8-f6 (0:00) Nf6 0 1 0*divider*fics% *divider*2015-05-08 20:06:50.827 fics[72424:1694479] White: 420 Black: 420*divider*2015-05-08 20:06:52.851 fics[72424:1694479] c1-g5*divider*2015-05-08 20:06:52.987 fics[72424:1694479] *divider*<12> rnbqkb-r pppppppp -----n-- ------B- ---P---- -------- PPP-PPPP RN-QKBNR B -1 1 1 1 1 2 164 ahanft EnnMal -1 7 3 39 39 421 420 2 B/c1-g5 (0:02) Bg5 0 1 0*divider*fics% *divider*2015-05-08 20:06:52.987 fics[72424:1694479] White: 421 Black: 420*divider*2015-05-08 20:07:00.381 fics[72424:1694479] *divider*<12> rnbqkb-r pppp-ppp ----pn-- ------B- ---P---- -------- PPP-PPPP RN-QKBNR W -1 1 1 1 1 0 164 ahanft EnnMal 1 7 3 39 39 421 416 3 P/e7-e6 (0:07) e6 0 1 0*divider*";

if(testing==="on") {
	$('.testing').show();
	loadScript();
	loggedIn==true;
  localStorage.setItem('autoLogin',"no");
  localStorage.setItem('user',"user");
  localStorage.setItem('password',"password");

}


// {Game 233 (ahanft vs. kenenz) Game drawn by repetition} 1/2-1/2
//   // ex: {Game 193 (GuestLPHJ vs. IAGR) Creating unrated blitz match.}
// {Game 258 (ahanft vs. JOGGGIIII) Game aborted on move 1} *
//  {Game 472 (Mikhael vs. GARCIAPARRA) Mikhael resigns} 0-1
// {Game 27 (Rydebergova vs. gulpiyuri) Rydebergova forfeits on time} 0-1
// {Game 112 (AndreD vs. ViperMMM) AndreD forfeits on time} 0-1
// {Game 180 (Patra vs. ercsi) Patra checkmated} 0-1
// {Game 147 (DMjJMD vs. lemseduardo) lemseduardo ran out of time and DMjJMD has no material to mate} 1/2-1/2
// {Game 101 (Rydebergova vs. gulpiyuri) Rydebergova resigns} 0-1
// {Game 287 (CarlosBT vs. CharousekBlue) CharousekBlue checkmated} 1-0
// fics% 
// Removing game 101 from observation list.
// Game 145: Your opponent, Pavitra, has lost contact or quit.
// {Game 145 (ahanft vs. Pavitra) Pavitra forfeits by disconnection} 1-0


  // responses would include: messages, abort response, adjourn response, draw response, takeback response, rematch response
  // GuestWHJK declines the adjourn request.
  // GuestWHJK declines the abort request.
  // GuestWHJK declines the draw request.
  // GuestPWHM declines the takeback request.
  // GuestWHJK accepts the adjourn request.
  // GuestWHJK accepts the abort request.
  // GuestWHJK accepts the draw request.
  // GuestPWHM accepts the takeback request.
// GuestBMBZ(U)[54] says: you too
// GuestJMTW(U)[59] says: you to
// kenenz[17] says: you too



// function exitGame() {
//   // if game is over, exit instantly. If game is in progress confirm request
//   if(boardLock=="freeze") {
//     jQT.goTo('#main', 'slideright');
//   }
//   else {
//     navigator.notification.confirm(
//         'This is considered a forfeit.', // message
//          onConfirmExit,      // callback to invoke with index of button pressed
//         'Are you sure?',     // title
//         ['Yes','No']         // buttonLabels
//     );
//   }

//   }

function onConfirmExit(buttonIndex) {
    // if yes
    if(buttonIndex===1) { 
      jQT.goTo('#main', 'slideright');
      resign(); // because if you don't resign and you leave the board, the game is still in progress and you can't get back to it.
    }
    // if no
    if(buttonIndex===2) {
      // do nothing
    }
}

function finger(user) {
  if(testing!="on") {
    sendCommand('finger '+user);
  }
}
function checkForFinger(msg) {
    var fingerPattern = new RegExp("Finger of "); 
    if (fingerPattern.test(msg) === true) {
      fingerResponse = msg.replace(/\s{2,}/g, ' '); // replace multiple spaces with single

      usernameSearch = fingerResponse.split(':');
      usernameSearch = usernameSearch[0];
      userFingered = usernameSearch.replace("Finger of ", "");

      blitzSearch = fingerResponse.split('Blitz');
      if(blitzSearch!==null) {
      blitzSearch = blitzSearch[1];
      blitzSearch = blitzSearch.split(' ');
      blitzRanking = blitzSearch[1];
      } else {blitzRanking="";}

      standardSearch = fingerResponse.split('Standard');
      if(standardSearch!==null) {
      standardSearch = standardSearch[1];
      standardSearch = standardSearch.split(' ');
      standardRanking = standardSearch[1];
      } else {standardRanking="";}

      lightningSearch = fingerResponse.split('Lightning');
      if(lightningSearch!==null) {
      lightningSearch = lightningSearch[1];
      lightningSearch = lightningSearch.split(' ');
      lightningRanking = lightningSearch[1];
      } else {lightningRanking="";}

// alert(blitzRanking+' '+standardRanking+' '+lightningRanking);

      $('.'+userFingered).html(blitzRanking+' '+standardRanking+' '+lightningRanking);
    }
    else {}
}

// jQuery(document).ready(function($) {
//   checkForNewGame("GuestHHYV accepts your seek. Creating: GuestTTLQ (++++) GuestHHYV (++++) unrated blitz 5 5 {Game 224 (GuestTTLQ vs. GuestHHYV) Creating unrated blitz match.} <12> rnbqkbnr pppppppp -------- -------- -------- -------- PPPPPPPP RNBQKBNR W -1 1 1 1 1 0 224 GuestTTLQ GuestHHYV 1 5 5 39 39 300 300 1 none (0:00) none 0 0 0");
// });


// function censorOpponent() {
//   sendCommand('+censor '+getOpponentName()); 
// }
// function unCensorOpponent() {
//   sendCommand('-censor '+getOpponentName()); 
// } 
// function getCensorList() {
//   sendCommand('=censor');   
// }

// function checkForTime(msg) {
//   // ex: White: 124 Black: 118
//     var timerPattern = new RegExp("White: "); 
//     if (timerPattern.test(msg) === true) {
//       times = msg.split(': ');
//       whiteT=times[1];
//       whiteT=whiteT.replace(' Black',""); // strip text after the number
//       blackT=times[2];
//       setTimer(whiteT,blackT);
//     }
//     else {}
// }

var testdata = "test";



