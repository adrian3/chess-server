var gameToJoin = "";
var computercheck = "";
var humancount = 0;
var filter = "none";
var sort1 = "";
var sort2 = "";
var loopCount = 0;
var ArrayMemory = new Array();
var newGameCount = 0;
var showWhiteToggle = "off";
var showBlackToggle = "off";
var showRatedToggle = "off";
var showUnratedToggle = "off";

// My Prefixes for setting blocks:
// 11 to unset blocks
// 13 for sought

function getSought() {
    sendCommand("iset block 1");
    sendCommand('13 sought'); // the server response will start with 13157
    sendCommand("11 iset block 0");
}

function checkForAds(msg) {
  var adPattern = new RegExp('13157'); 
  if (adPattern.test(msg) === true) {
    msg = msg.split('13157');
    msg = msg[1];
    // alert("found 13157!");
    processAds(msg);
  }
} 

function processAds(msg) {
  // var soughtInfo = msg.replace(/^\s+|\s+$/g, ''); // trim white space
  fullGameList = msg;
  soughtArray = fullGameList.split(/(?:\r\n|\r|\n)/g);
  loopThroughGameList(soughtArray);
}




// function checkForAdsDisplayed(msg) {
//     var adsDisplayedPattern = new RegExp('ads displayed.');
//     if (adsDisplayedPattern.test(msg) === true) {
//         stillTransmittingAds = "no";
//         loopThroughGameList();
//     }
// }

// function checkForSoughtStillTransmitting(msg) {
//     var soughtInfo2 = msg.replace(/^\s+|\s+$/g, ''); // trim white space
//     fullGameList = fullGameList + soughtInfo2;
// }

function checkForSought(msg) {
    fullGameList = "";
    stillTransmittingAds = "yes";
    var soughtInfo = msg.replace(/^\s+|\s+$/g, ''); // trim white space
    fullGameList = soughtInfo;
}

function joinGame(inviteNumber, opponent) { 
    // alert(opponent);
    gameToJoin = inviteNumber;
    navigator.notification.confirm(
        'Join game?', // message
        joinGameConfirm, // callback to invoke with index of button pressed
        'Are you sure you want to play ' + opponent + '?', // title
        ['yes', 'no'] // buttonLabels
    );
}

function joinGameConfirm(choice) {
    if (choice == 1) {
        sendCommand("play " + gameToJoin);
        mode="versus";
        cancelWatchOpenGames();
        gameBegin();
    }
    if (choice == 2) {
        // dismiss
    }
}

function cleanInviteColor(inviteColor) {
    if (inviteColor.indexOf("black") == 1) {
        return ("black");
    }
    if (inviteColor.indexOf("white") == 1) {
        return ("white");
    } else {
        return ('');
    }
}

function checkIfUserIsComputer(handle) {
    var computerPattern = new RegExp("\\(C\\)");
    if (computerPattern.test(handle) === true) {
        // alert(handle+" computer");
        return ("computer");
    } else {
        // alert(handle+" human");
        return ("human");
    }
}

// function loopThroughGameList() {
//     // console.log('TESTING'+fullGameList);
//     fullGameList.split(/(?:\r\n|\r|\n)/g).forEach(printSoughtGame);
//     loopCount = 0;
// }

function printSoughtGame(soughtGame,gameID,boxNumber) {
  // console.log(boxNumber+' '+gameID);
    // if (soughtGame.length > 25) {
        // if (loopCount == 0) {
        //     soughtGame = soughtGame.substr(13); // this strips off the beginning "fics%13157" and 3 nasty hidden characters.
        // }

        soughtGame = soughtGame.replace(/ +(?= )/g, '');
        soughtGame = soughtGame.trim();
        soughtGame = soughtGame.split(" ")
            // ex  45 ++++ GuestGQQT           1   0 unrated lightning  [black]     0-9999 
            // ex2 118 1978 CatNail(C)          3   0 unrated suicide                0-9999 m

        // 1 Ad index number
        // 2 Player's rating
        // 3 Player's handle
        // 4 Time at start
        // 5 Increment per move
        // 6 Rated/unrated
        // 7 Type of chess match
        // 8 Color (if specified) **OPTIONAL
        // 9 Rating range
        // 10 Auto start/manual start and whether formula will be checked **OPTIONAL

        var inviteNumber = soughtGame[0];
        var inviteRating = soughtGame[1];
        inviteRating = "("+inviteRating+")";
        if(inviteRating=="(++++)"||inviteRating=="(----)"){inviteRating="";}
        var inviteHandle = soughtGame[2];
            var inviteStartTime = soughtGame[3];
            var inviteIncrement = soughtGame[4];
            var inviteRatedUnrated = soughtGame[5];
            var inviteGameType = soughtGame[6];

            var inviteColor = soughtGame[7];
            if(inviteColor!=undefined){inviteColor = cleanInviteColor(inviteColor);} 
            displayColor = "";
            if (inviteColor == "black") {
                inviteColor = "Black";
                displayColor = ", black";
            }
            if (inviteColor == "white") {
                inviteColor = "White";
                displayColor = ", white"; 
            }
            if (inviteColor == "") {
              inviteColor = "Automatic";
            }

            // var inviteRatingRange = soughtGame[8];
            // var inviteAutoStart = soughtGame[9];

            var estimateTotalTime = estimateTime(inviteStartTime, inviteIncrement);
            // var acceptGameButton = '<div class="'+gameID+'" onclick="joinGame(\'' + inviteNumber + '\',\'' + inviteHandle + ' ' + inviteRating + '\')"><div class="as'+inviteColor+' '+inviteRatedUnrated+' square-inner"><div class="inviteMinutes">'+inviteStartTime+'m</div><div class="inviteSeconds">'+inviteIncrement+'s</div><img src="img/as'+inviteColor+'.svg"><img class="inviteRatedUnrated" src="img/'+inviteRatedUnrated+'.svg"></div><div class="tableChallenger"><span>'+inviteHandle+'</span> <span>'+inviteRating+'</span></div></div></div>';
            var acceptGameButton = '<li class="'+gameID+'" onclick="joinGame(\'' + inviteNumber + '\',\'' + inviteHandle + ' ' + inviteRating + '\')"><img src="img/as'+inviteColor+'.svg"> <span class="as'+inviteColor+' '+inviteRatedUnrated+' square-inner">'+inviteStartTime+'m</span> +<span>'+inviteIncrement+'s</span>, <span>'+inviteRatedUnrated+'</span>, vs <span>'+inviteHandle+'</span> <span>'+inviteRating+'</span></div></li>';
            // $('.box'+boxNumber).html(acceptGameButton);
            // $('.box'+boxNumber).removeClass("unchecked");
            // $('.box'+boxNumber).removeClass("unavailable");
            $('.availableGames').append(acceptGameButton);
            $('li.'+gameID).removeClass("unchecked");
            $('li.'+gameID).removeClass("unavailable");
        // }
}
function estimateTime(baseTime, increment) {
    baseTime = baseTime * 120; // because each player gets the base time and converting it to seconds (2x60)
    additionalTime = increment * 80; // because the average number of moves for a game is 40 per player(2x40)
    totalEstimateTime = baseTime + additionalTime;
    return (totalEstimateTime);
}

function refreshList() {
    getSought();
}

function updateHighlights() {
    if (sort1 == "rated") {
        showRatedList();
    }
    if (sort1 == "unrated") {
        showUnratedList();
    }
    if (sort1 == "all") {
        showCompleteList();
    }    
    if (sort2 == "black") {
        showBlackList();
    }
    if (sort2 == "white") {
        showWhiteList()();
    }
    if (sort2 == "all") {
        showCompleteList();
    } 
}

function showRatedList() {
  sort1 = "rated";
  $('.filterButton.showUnrated').removeClass('highlight');
  $('.filterButton.showRated').addClass('highlight');
  // $('.rated').parent().css({'border-right-color' : '#ec008c','border-bottom-color' : '#ec008c'});
  // $('.unrated').parent().css({'border-right-color' : '#efefef','border-bottom-color' : '#efefef'});
  $('.unrated').parent().removeClass('highlightPink');
  $('.rated').parent().addClass('highlightPink');
}

function showUnratedList() {
  sort1 = "unrated";
  $('.filterButton.showRated').removeClass('highlight');
  $('.filterButton.showUnrated').addClass('highlight');
  // $('.unrated').parent().css({'border-right-color' : '#ec008c','border-bottom-color' : '#ec008c'});
  // $('.rated').parent().css({'border-right-color' : '#efefef','border-bottom-color' : '#efefef'});
  $('.unrated').parent().addClass('highlightPink');
  $('.rated').parent().removeClass('highlightPink');
}

function showCompleteList() {
  sort1 = "all";
  sort2 = "all";
  $('.filterButton.showRated').removeClass('highlight');
  $('.filterButton.showUnrated').removeClass('highlight');
  $('.filterButton.showBlack').removeClass('highlight');
  $('.filterButton.showWhite').removeClass('highlight');
$('.asWhite').parent().removeClass('highlightBlue');
$('.asBlack').parent().removeClass('highlightBlue');
$('.asAutomatic').parent().removeClass('highlightBlue');
$('.unrated').parent().removeClass('highlightPink');
$('.rated').parent().removeClass('highlightPink');
  // $('.asWhite').parent().css({'border-left-color' : '#efefef','border-top-color' : '#efefef'});
  // $('.asBlack').parent().css({'border-left-color' : '#efefef','border-top-color' : '#efefef'});
  // $('.asAutomatic').parent().css({'border-left-color' : '#efefef','border-top-color' : '#efefef'});
  // $('.unrated').parent().css({'border-right-color' : '#efefef','border-bottom-color' : '#efefef'});
  // $('.rated').parent().css({'border-right-color' : '#efefef','border-bottom-color' : '#efefef'});
  // $('.rated').parent().css({'opacity' : '1'});
  // $('.unrated').parent().css({'opacity' : '1'});
  // $('.asBlack').parent().css({'opacity' : '1'});
  // $('.asWhite').parent().css({'opacity' : '1'});
  // $('.asAutomatic').parent().css({'opacity' : '1'});
}

function showBlackList() {
if (showBlackToggle==="on"||showWhiteToggle==="on") {
  // sort1 = "all";
  sort2 = "all";
  // $('.filterButton.showRated').removeClass('highlight');
  // $('.filterButton.showUnrated').removeClass('highlight');
  // $('.unrated').parent().removeClass('highlightPink');
  // $('.rated').parent().removeClass('highlightPink');
  $('.filterButton.showBlack').removeClass('highlight');
  // $('.filterButton.showWhite').removeClass('highlight');
  // $('.asWhite').parent().removeClass('highlightBlue');
  $('.asBlack').parent().removeClass('highlightBlue');
 showBlackToggle = "off";
 showWhiteToggle = "off";
}
else {
 showBlackToggle = "on";
 showWhiteToggle = "on";
  sort2 = "black";
  $('.filterButton.showBlack').addClass('highlight');
  $('.filterButton.showWhite').removeClass('highlight');
  // $('.asBlack').parent().css({'border-left-color' : '#29abe2','border-top-color' : '#29abe2'});
  // $('.asWhite').parent().css({'border-left-color' : '#efefef','border-top-color' : '#efefef'});
  // $('.asAutomatic').parent().css({'border-left-color' : '#efefef','border-top-color' : '#efefef'});
$('.asBlack').parent().addClass('highlightBlue');
$('.asWhite').parent().removeClass('highlightBlue');
$('.asAutomatic').parent().removeClass('highlightBlue');
}
}

function showWhiteList() {
if (showWhiteToggle==="on"||showBlackToggle==="on") {
  // sort1 = "all";
  sort2 = "all";
  // $('.filterButton.showRated').removeClass('highlight');
  // $('.filterButton.showUnrated').removeClass('highlight');
  // $('.unrated').parent().removeClass('highlightPink');
  // $('.rated').parent().removeClass('highlightPink');
  // $('.filterButton.showBlack').removeClass('highlight');
  $('.filterButton.showWhite').removeClass('highlight');
  $('.asWhite').parent().removeClass('highlightBlue');
  // $('.asBlack').parent().removeClass('highlightBlue');
 showWhiteToggle = "off";
 showBlackToggle = "off";
}
else {
 showWhiteToggle = "on";
 showWhiteToggle = "on";
  sort2 = "white";
  $('.filterButton.showBlack').removeClass('highlight');
  $('.filterButton.showWhite').addClass('highlight');
  // $('.asWhite').parent().css({'border-left-color' : '#29abe2','border-top-color' : '#29abe2'});
  // $('.asBlack').parent().css({'border-left-color' : '#efefef','border-top-color' : '#efefef'});
  // $('.asAutomatic').parent().css({'border-left-color' : '#efefef','border-top-color' : '#efefef'});
$('.asBlack').parent().removeClass('highlightBlue');
$('.asWhite').parent().addClass('highlightBlue');
$('.asAutomatic').parent().removeClass('highlightBlue');
}
}
function exitOpenGameMode() {
    cancelWatchOpenGames();
    // stillTransmittingAds = "no";
    // watchingForGames = "no";
}

function watchOpenGames() {
    mode="watchingTables";
    jQT.goTo('#openGames', 'slideleft');
    refreshList();
    refreshTimer = setInterval(refreshList, 3000);
}

function cancelWatchOpenGames() {
    window.clearInterval(refreshTimer);
}





// function firstLoopThroughGameList() {
//   for (i = 0; i < mainSoughtArray.length; i++) {
//       printSoughtGame(mainSoughtArray[i],i);
//     }
// }


// function nextAvailableBox() {
//   availableSquares = [];
//   for (i = 0; i < 25; i++) {
//     if($('.box'+i).html()=="") {
//       availableSquares.push(i);
//     }
//   }
//   console.log(availableSquares);
// }

// function makeMoreSquaresAvailable() {
//   $('.unavailable').html("");
// }

function loopThroughGameList(soughtArray) {
    newGameCount = 0;
    prepGrid();
    soughtArray = removeSpaces(soughtArray);
    soughtArray = removeComputersFromArray(soughtArray);
    soughtArray = removeNonCompatibleGamesFromArray(soughtArray); 
    // console.log(soughtArray);
    // what happens if the sought array is greater than 50?
    // if(soughtArray.length >= availableSquares.length) {
    //   makeMoreSquaresAvailable();
    // }
    // nextAvailableBox();
  for (i = 0; i < soughtArray.length; i++) {
      checkArray(soughtArray[i]);
    }
  removeUnavailableGames();
  updateHighlights();
  // console.log(ArrayMemory);
  // console.log(soughtArray);
  ArrayMemory = soughtArray; // so next time we loop we are comparing the new array to the last loop
}

function removeSpaces(soughtArray){
  var extraspacelessArray = new Array();
  for (i = 0; i < soughtArray.length; i++) {
      valueWithSpacesRemoved = soughtArray[i].replace(/\s\s+/g, ' ');
      extraspacelessArray.push(valueWithSpacesRemoved);
    }
    return(extraspacelessArray);  
}

function removeComputersFromArray(soughtArray) {
  var computerlessArray = new Array();
  for (i = 0; i < soughtArray.length; i++) {
      computercheck = checkIfUserIsComputer(soughtArray[i]);
        if (computercheck == "human") {
          computerlessArray.push(soughtArray[i]);
        }
    }
    return(computerlessArray);
}

function removeNonCompatibleGamesFromArray(soughtArray) {
  var compatibleGameArray = new Array();
  for (i = 0; i < soughtArray.length; i++) {
      compatiblecheck = checkIfCompatibleGame(soughtArray[i]);
        if (compatiblecheck == "yes") {
          compatibleGameArray.push(soughtArray[i]);
        }
    }
    return(compatibleGameArray);
}

function checkIfCompatibleGame(info) {
    var oddsPattern = new RegExp("odds/");
    var lightningPattern = new RegExp(" lightning ");
    var blitzPattern = new RegExp(" blitz ");
    var standardPattern = new RegExp(" standard ");
    if (oddsPattern.test(info) === true) {
        return ("no"); // this filters out games that try to play games like odds/rook
    }
    if (lightningPattern.test(info) === true) {
        return ("yes");
    } 
    if (blitzPattern.test(info) === true) {
        return ("yes");
    } 
    if (standardPattern.test(info) === true) {
        return ("yes");
    }
}

function checkArray(gameDetails) {
  var gameID = getIdentifier(gameDetails);
    console.log(gameID);

  if(jQuery.inArray(gameDetails,ArrayMemory)!==-1) {
  // if the game is already in the array
  $('li.'+gameID).removeClass("unchecked");
  $('li.'+gameID).removeClass("unavailable");
  }
  else {
  // if the game is NOT in the array
    boxNumber = availableSquares[newGameCount];
    printSoughtGame(gameDetails,gameID,boxNumber);
    newGameCount++;
    // alert(gameDetails);
  }
}

function getIdentifier(gameDetails) {
  var uniqueID = gameDetails.replace(/ /g,"");
  uniqueID = uniqueID.replace("+","x");
  uniqueID = uniqueID.substring(0, 2);
  uniqueID = "table"+uniqueID;
  return(uniqueID);
}

function removeUnavailableGames() {
    $('.unchecked').addClass("unavailable");  
    $('.unchecked').removeClass("unchecked");  
    $('.unavailable').removeAttr('onclick'); // so you can't click on unavailable games
    // $('.unavailable').slideUp(2000); 
    $('.unavailable').addClass("slideHide");
setTimeout(
  function() 
  {
    $('li.unavailable').remove();
  }, 1000);

}

function prepGrid() {
  // for (i = 0; i < 24; i++) { 
  //   $('.box'+i).addClass("unchecked");
  // }
  $('ul.availableGames li').addClass('unchecked');
}


var availableSquares = new Array();


var demoArray = new Array();
// demoArray[0] = 'fics sought ads fasdf asdfas dfasdf ';
// demoArray[1] = '  52 ++++ GuestHRHB          15   0 unrated standard   [white]     0-9999 ';
// demoArray[2] = ' 55 ++++ Hillaryntin        4   0 unrated blitz                  0-9999 m';
// demoArray[3] = ' 64 ++++ GuestCWXW(C)           7   7 unrated blitz                  0-9999 ';
// demoArray[4] = ' 73 ++++ GuestJQQP           3   0 unrated blitz                  0-9999 ';
// demoArray[5] = ' 75 ++++ GuestPMXW          10   5 unrated blitz                  0-9999 ';
// demoArray[6] = ' 93 ++++ GuestPQML           2  12 unrated blitz      [black]     0-9999 ';
// demoArray[7] = '104 2616 masheen(C)          5   0 unrated suicide                0-9999 ';
// demoArray[8] = '123 ++++ GuestZXTQ          15   0 unrated standard               0-9999 ';
// demoArray[9] = '135 2616 masheen          2  12 unrated suicide                0-9999 ';
// demoArray[10] = '  3 ++++ GuestVGMG           1   5 unrated blitz      [black]     0-9999 ';

demoArray[0] = '109 1238 TheKingB        odds/rook    5   5 rated   blitz      [black]     0-9999';
demoArray[1] = '111 1653 EGRENY              1   0 rated   lightning              0-1900 ';
demoArray[2] = '  7 ++++ GuestSTTS          10   6 rated blitz                  0-9999 m';
demoArray[3] = ' 39 ++++ GuestYZVD           5  10 unrated blitz      [white]     0-9999 ';
demoArray[4] = ' 48 ++++ GuestQMGV           5   0 unrated blitz      [black]     0-9999 ';
demoArray[5] = ' 53 ++++ MFJK               15   3 unrated standard   [white]     0-9999 ';
demoArray[6] = ' 68 1234 GuestFSMC          15   5 unrated standard               0-9999 ';
demoArray[7] = ' 78 ---- kaimanas           12  15 unrated standard               0-9999 ';
demoArray[8] = ' 97 ++++ GuestKJFS           5   1 unrated blitz      [white]     0-9999 ';
demoArray[9] = ' 99 2644 masheen(C)          5   0 unrated suicide                0-9999 ';
demoArray[10] = '100 2644 masheen(C)          2  12 unrated suicide                0-9999 ';
demoArray[11] = '114 ++++ GuestKMXWD          5   0 unrated blitz                  0-9999 f';

// var demoArray2 = new Array();
// demoArray2[0] = '3 ++++ GuestZSWC          30   0 unrated standard               0-9999 ';
// demoArray2[1] = '  5 ++++ MFJK               15   2 unrated standard   [white]     0-9999 ';
// demoArray2[2] = '  7 ++++ GuestSTTS          10   6 unrated blitz                  0-9999 m';
// demoArray2[3] = ' 12 ++++ GuestFMLX           5   5 unrated blitz                  0-9999 ';
// demoArray2[4] = ' 39 ++++ GuestYZVD           5  10 unrated blitz      [white]     0-9999 ';
// demoArray2[5] = ' 53 ++++ MFJK               15   3 unrated standard   [white]     0-9999 ';
// demoArray2[6] = ' 68 1234 GuestFSMC          15   5 unrated standard               0-9999 ';
// demoArray2[7] = ' 78 ---- kaimanas           12  15 unrated standard               0-9999 ';
// demoArray2[8] = ' 97 ++++ GuestKJFS           5   1 unrated blitz      [white]     0-9999 ';
// demoArray2[9] = ' 99 2644 masheen(C)          5   0 unrated suicide                0-9999 ';
// demoArray2[10] = '  5 ++++ MFsJK               15   2 unrated standard   [white]     0-9999 ';
// demoArray2[11] = '  5 ++++ MFsJK               15   2 unrated standard   [white]     0-9999 ';
// demoArray2[12] = '  7 ++++ GusestSTTS          10   6 unrated blitz                  0-9999 m';
// demoArray2[13] = ' 12 ++++ GusestFMLX           5   5 unrated blitz                  0-9999 ';
// demoArray2[14] = ' 39 ++++ GusestYZVD           5  10 unrated blitz      [white]     0-9999 ';
// demoArray2[15] = ' 53 ++++ MFsJK               15   3 unrated standard   [white]     0-9999 ';
// demoArray2[16] = ' 68 1234 GusestFSMC          15   5 unrated standard               0-9999 ';
// demoArray2[17] = ' 78 ---- kasimanas           12  15 unrated standard               0-9999 ';
// demoArray2[18] = ' 97 ++++ GusestKJFS           5   1 unrated blitz      [white]     0-9999 ';
// demoArray2[19] = ' 99 2644 massheen(C)          5   0 unrated suicide                0-9999 ';
// demoArray2[20] = '  5 ++++ MFsJK               15   2 unrated standard   [white]     0-9999 ';
// demoArray2[21] = '  5 ++++ MFsJK               15   2 unrated standard   [white]     0-9999 ';
// demoArray2[22] = '  7 ++++ GusestSTTS          10   6 unrated blitz                  0-9999 m';
// demoArray2[23] = ' 12 ++++ GusestFMLX           5   5 unrated blitz                  0-9999 ';



// var demoArray3 = new Array();
// demoArray3[0] = '3 ++++ GuestZSWC          30   0 unrated standard               0-9999 ';
// demoArray3[1] = '  5 ++++ MFJK               15   2 unrated standard   [white]     0-9999 ';
// demoArray3[2] = '  7 ++++ GuestSTTS          10   6 unrated blitz                  0-9999 m';
// demoArray3[3] = ' 12 1234 GuestFMLX           5   5 rated blitz                  0-9999 ';
// demoArray3[4] = ' 25 ++++ GuestJVBS          60  30 unrated standard   [black]     0-9999 ';
// demoArray3[5] = ' 39 ++++ GuestYZVD           5  10 unrated blitz      [white]     0-9999 ';
// demoArray3[6] = ' 53 ++++ MFJK               15   3 unrated standard   [white]     0-9999 ';
// demoArray3[7] = ' 78 ---- kaimanas           12  15 unrated standard               0-9999 ';
// demoArray3[8] = ' 99 2644 masheen(C)          5   0 unrated suicide                0-9999 ';
// demoArray3[9] = '100 2644 masheen(C)          2  12 unrated suicide                0-9999 ';
// demoArray3[10] = '114 ++++ GuestKMXWD          5   0 unrated blitz                  0-9999 f';
// demoArray3[11] = '115 ++++ GuestKJFS           5   1 unrated blitz      [white]     0-9999 ';


var demoArray1 = new Array();
demoArray1[0] = '111 1653 EGRENY              1   0 rated   lightning              0-1900';
demoArray1[1] = ' 20 ++++ GuestPBQY           4   0 unrated blitz      [white]     0-9999 m';
demoArray1[2] = ' 28 ++++ GuestPBQY           3   0 unrated blitz      [white]     0-9999 m';
demoArray1[3] = ' 45 ++++ GuestMBBQ          10   0 unrated blitz                  0-9999 ';
demoArray1[4] = ' 48 ++++ jpkjpkjp            1   0 unrated lightning              0-9999 ';
demoArray1[5] = ' 74 ++++ GuestCQTK          10   5 unrated blitz      [white]     0-9999 ';
demoArray1[6] = ' 77 ++++ GuestBSKJ           3   3 unrated blitz                  0-9999 ';
demoArray1[7] = ' 78 ++++ GuestHVNV          15   0 unrated standard               0-9999 ';
demoArray1[8] = ' 94 1931 CatNail(C)          3   0 unrated suicide                0-9999 m';
demoArray1[9] = '110 ++++ GuestKMLV           7   7 unrated blitz                  0-9999 ';
demoArray1[10] = '119 2645 masheen(C)          5   0 unrated suicide                0-9999 ';
demoArray1[11] = '120 2645 masheen(C)          2  12 unrated suicide                0-9999 ';
demoArray1[12] = '12 ads displayed.';
var demoArray2 = new Array();
demoArray2[0] = ' 45 ++++ GuestMBBQ          10   0 unrated blitz                  0-9999 ';
demoArray2[1] = ' 48 ++++ jpkjpkjp            1   0 unrated lightning              0-9999 ';
demoArray2[2] = ' 74 ++++ GuestCQTK          10   5 unrated blitz      [white]     0-9999 ';
demoArray2[3] = ' 77 ++++ GuestBSKJ           3   3 unrated blitz                  0-9999 ';
demoArray2[4] = ' 78 ++++ GuestHVNV          15   0 unrated standard               0-9999 ';
demoArray2[5] = ' 94 1931 CatNail(C)          3   0 unrated suicide                0-9999 m';
demoArray2[6] = '110 ++++ GuestKMLV           7   7 unrated blitz                  0-9999 ';
demoArray2[7] = '119 2645 masheen(C)          5   0 unrated suicide                0-9999 ';
demoArray2[8] = '120 2645 masheen(C)          2  12 unrated suicide                0-9999 ';
demoArray2[9] = '9 ads displayed.';
var demoArray3 = new Array();
demoArray3[0] = ' 33 ++++ DickBurns          12   0 unrated blitz                  0-9999 ';
demoArray3[1] = ' 45 ++++ GuestMBBQ          10   0 unrated blitz                  0-9999 ';
demoArray3[2] = ' 48 ++++ jpkjpkjp            1   0 unrated lightning              0-9999 ';
demoArray3[3] = ' 74 ++++ GuestCQTK          10   5 unrated blitz      [white]     0-9999 ';
demoArray3[4] = ' 77 ++++ GuestBSKJ           3   3 unrated blitz                  0-9999 ';
demoArray3[5] = ' 78 ++++ GuestHVNV          15   0 unrated standard               0-9999 ';
demoArray3[6] = ' 94 1931 CatNail(C)          3   0 unrated suicide                0-9999 m';
demoArray3[7] = '110 ++++ GuestKMLV           7   7 unrated blitz                  0-9999 ';
demoArray3[8] = '119 2645 masheen(C)          5   0 unrated suicide                0-9999 ';
demoArray3[9] = '120 2645 masheen(C)          2  12 unrated suicide                0-9999 ';
demoArray3[10] = '10 ads displayed.';
var demoArray4 = new Array();
demoArray4[0] = ' 45 ++++ GuestMBBQ          10   0 unrated blitz                  0-9999 ';
demoArray4[1] = ' 48 ++++ jpkjpkjp            1   0 unrated lightning              0-9999 ';
demoArray4[2] = ' 74 ++++ GuestCQTK          10   5 unrated blitz      [white]     0-9999 ';
demoArray4[3] = ' 77 ++++ GuestBSKJ           3   3 unrated blitz                  0-9999 ';
demoArray4[4] = ' 94 1931 CatNail(C)          3   0 unrated suicide                0-9999 m';
demoArray4[5] = '110 ++++ GuestKMLV           7   7 unrated blitz                  0-9999 ';
demoArray4[6] = '119 2645 masheen(C)          5   0 unrated suicide                0-9999 ';
demoArray4[7] = '120 2645 masheen(C)          2  12 unrated suicide                0-9999 ';
demoArray4[8] = '8 ads displayed.';
var demoArray5 = new Array();
demoArray5[0] = ' 45 ++++ GuestMBBQ          10   0 unrated blitz                  0-9999 ';
demoArray5[1] = ' 48 ++++ jpkjpkjp            1   0 unrated lightning              0-9999 ';
demoArray5[2] = ' 74 ++++ GuestCQTK          10   5 unrated blitz      [white]     0-9999 ';
demoArray5[3] = ' 77 ++++ GuestBSKJ           3   3 unrated blitz                  0-9999 ';
demoArray5[4] = ' 86 1485 ChidiBest           3  10 unrated blitz                  0-9999 m';
demoArray5[5] = ' 90 ++++ GuestCKJD          15   0 unrated standard               0-9999 ';
demoArray5[6] = ' 94 1931 CatNail(C)          3   0 unrated suicide                0-9999 m';
demoArray5[7] = '119 2645 masheen(C)          5   0 unrated suicide                0-9999 ';
demoArray5[8] = '120 2645 masheen(C)          2  12 unrated suicide                0-9999 ';
demoArray5[9] = '9 ads displayed.';
var demoArray6 = new Array();
demoArray6[0] = ' 48 ++++ jpkjpkjp            1   0 unrated lightning              0-9999 ';
demoArray6[1] = ' 74 ++++ GuestCQTK          10   5 unrated blitz      [white]     0-9999 ';
demoArray6[2] = ' 77 ++++ GuestBSKJ           3   3 unrated blitz                  0-9999 ';
demoArray6[3] = ' 86 1485 ChidiBest           3  10 unrated blitz                  0-9999 m';
demoArray6[4] = ' 90 ++++ GuestCKJD          15   0 unrated standard               0-9999 ';
demoArray6[5] = ' 94 1931 CatNail(C)          3   0 unrated suicide                0-9999 m';
demoArray6[6] = '119 2645 masheen(C)          5   0 unrated suicide                0-9999 ';
demoArray6[7] = '120 2645 masheen(C)          2  12 unrated suicide                0-9999 ';
demoArray6[8] = '8 ads displayed.';
var demoArray7 = new Array();
demoArray7[0] = ' 48 ++++ jpkjpkjp            1   0 unrated lightning              0-9999 ';
demoArray7[1] = ' 74 ++++ GuestCQTK          10   5 unrated blitz      [white]     0-9999 ';
demoArray7[2] = ' 77 ++++ GuestBSKJ           3   3 unrated blitz                  0-9999 ';
demoArray7[3] = ' 86 1485 ChidiBest           3  10 unrated blitz                  0-9999 m';
demoArray7[4] = ' 94 1931 CatNail(C)          3   0 unrated suicide                0-9999 m';
demoArray7[5] = '119 2645 masheen(C)          5   0 unrated suicide                0-9999 ';
demoArray7[6] = '120 2645 masheen(C)          2  12 unrated suicide                0-9999 ';
demoArray7[7] = '130 1190 justwatch           5   0 unrated blitz                  0-9999 ';
demoArray7[8] = '8 ads displayed.';
var demoArray8 = new Array();
demoArray8[0] = ' 48 ++++ jpkjpkjp            1   0 unrated lightning              0-9999 ';
demoArray8[1] = ' 77 ++++ GuestBSKJ           3   3 unrated blitz                  0-9999 ';
demoArray8[2] = ' 86 1485 ChidiBest           3  10 unrated blitz                  0-9999 m';
demoArray8[3] = ' 94 1931 CatNail(C)          3   0 unrated suicide                0-9999 m';
demoArray8[4] = '119 2645 masheen(C)          5   0 unrated suicide                0-9999 ';
demoArray8[5] = '120 2645 masheen(C)          2  12 unrated suicide                0-9999 ';
demoArray8[6] = '130 1190 justwatch           5   0 unrated blitz                  0-9999 ';
demoArray8[7] = '7 ads displayed.';


// loopThroughGameList(demoArray1);


// var demoArray2 = new Array();
// demoArray2[0] = 'fics% sought ads fasdf asdfas dfasdf ';
// demoArray2[1] = '  52 ++++ TEST          15   0 unrated standard   [white]     0-9999 ';
// demoArray2[2] = ' 55 ++++ Hillaryntin        4   0 unrated blitz                  0-9999 m';
// demoArray2[3] = ' 64 ++++ GuestCWXW(C)           7   7 unrated blitz                  0-9999 ';
// demoArray2[4] = ' 73 ++++ GuestJQQP           3   0 unrated blitz                  0-9999 ';
// demoArray2[5] = ' 75 ++++ GuestPMXW          10   5 unrated blitz                  0-9999 ';
// demoArray2[6] = ' 93 ++++ GuestPQML           2  12 unrated blitz      [black]     0-9999 ';
// demoArray2[7] = '104 2616 masheen(C)          5   0 unrated suicide                0-9999 ';
// demoArray2[8] = '123 ++++ GuestZXTQ          15   0 unrated standard               0-9999 ';
// demoArray2[9] = '135 2616 masheen          2  12 unrated suicide                0-9999 ';
// demoArray2[10] = '  3 ++++ GuestVGMG           1   5 unrated blitz      [black]     0-9999 ';


// loopThroughGameList(demoArray2);

// alert(getIdentifier(demoArray[0]));
// checkArray('  3 ++++ GuestVGMG           1   5 unrated blitz      [black]     0-9999 ');
// checkArray('  3 ++++ GuestVGMG           1   5 unrated blitz      [black]     0-9999');

// watch the incoming games
// check if they exist in array
// if they are new add them to the grid

// $('.white').click(function(event) {
//   localStorage.setItem("color", "white");
//   $('.asWhite').addClass('highlight');
//   $('.asBlack').removeClass('highlight');
//   $('.asAutomatic').removeClass('highlight');
// });
// $('.black').click(function(event) {
//   localStorage.setItem("color", "black");
//   $('.asWhite').removeClass('highlight');
//   $('.asBlack').addClass('highlight');
//   $('.asAutomatic').removeClass('highlight');
// });
// $('.automatic').click(function(event) {
//   localStorage.setItem("color", "automatic");
//   $('.asWhite').removeClass('highlight');
//   $('.asBlack').removeClass('highlight');
//   $('.asAutomatic').addClass('highlight');
// });

