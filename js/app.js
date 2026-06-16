var app = {
  initialize: function() {
    this.bindEvents();
  },
  bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
  },
  onDeviceReady: function() {
    app.receivedEvent('deviceready');
    init();
  },
  receivedEvent: function(id) {}
};
function init() {
  stopSpinners('all');
  if(autoLoginCheck==="yes") {
    autoLogin();
  }
  else { 
    $('.loginAuto').hide();
  }
  versusMode();
  game = new Chess(blank);
  loadPosition(blank,"white");
  if(user==="guest") {
    denyRated();
  }
  else {
    allowRated();
  }
}
// Fire up jQTouch
var jQT = new $.jQT({
  icon: 'jqtouch.png',
  icon4: 'jqtouch4.png',
  addGlossToIcon: false,
  startupScreen: 'jqt_startup.png',
  statusBar: 'black-translucent',
  preloadImages: []
});
var testing="off"; // "on" suppresses socket writes for offline UI testing; "off" sends to the relay/FICS
var loggedIn=false;
var loggedInAsGuest="";
var timerStatus="inactive";
var refreshTimer="";
var watchingForGames = "no";
var socket;
var timer;
var slowConnectTimer;
var castle="";
var boardLock="release";
var observeType;
var currentGameDetails = "";
var invalidPassword="no";
var opponentName="";
var mode="";
var muteStatus = "";
var blank = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
var gameInProgress = "no";
var autoLoginCheck = localStorage.getItem('autoLogin');
var fullGameList = "";
var clock="w";

$('.consoleWindow').hide(); // hide on startup
$('.chatWindow').hide(); // hide on startup
$('.board-overlay').hide(); // hide on startup
var promopiecesare = localStorage.getItem('PromotedPiecesBecome');
if (promopiecesare === undefined || promopiecesare === null) {
    localStorage.setItem("PromotedPiecesBecome", "0");
}
$('.rematch').click(function(event) {
  rematch();
});
$('.cancelSeek').click(function(event) {
  sendCommand('unseek');
});
$('.exitObservation').click(function(event) {
  unobserve();
  jQT.goTo('#main', 'slideright');
});
$('.getGameInfo').click(function(event) {
  console.log(currentGameDetails);
  currentGameDetails = currentGameDetails.replace(/[\n\r]/g, '');
  // $('.gameInfo').html(currentGameDetails);
  appAlert(currentGameDetails, 'Game Info:');
});
$('.takeback').click(function(event) {
  takebackAlert();
  // example of response: GuestPWHM accepts the takeback request.
});
$('.draw').click(function(event) {
  sendCommand('draw');
  // example of response: GuestWHJK declines the draw request.
});
$('.abort').click(function(event) {
  sendCommand('abort');
  // example of response: GuestWHJK declines the abort request.
});
$('.adjourn').click(function(event) {
  sendCommand('adjourn');
  // example of response: GuestWHJK declines the adjourn request.
});
$('.resign').click(function(event) {
  sendCommand('resign');
});
$('.exit').click(function(event) {
  jQT.goTo('#main', 'slideright');
  gameInProgress = "no";  // this isn't in the gameover function because you can still be on the game screen and wanting to hear messages from the opponent
});
$('.console').click(function(event) {
  $('.consoleWindow').fadeIn();  
});
$('.chat').click(function(event) {
  $('.chatWindow').fadeIn();  
  $('.opponentName').html(getOpponentName());
});
$('.soughtGames').click(function(event) {
  watchOpenGames();
});
$('.moreTime').click(function(event) {
  moreMinutes();
});
$('.lessTime').click(function(event) {
  lessMinutes();
});
$('.moreIncrement').click(function(event) {
  moreSeconds();
});
$('.lessIncrement').click(function(event) {
  lessSeconds();
});
var user = localStorage.getItem('user');
if(user===null||user===undefined||user==="") {
  localStorage.setItem('user',"guest");
  user="guest";
}
if(user!="guest") {
  $('#user').val(user);
  $('.username').html(user);
}
$( "#rated" ).on( "click", function() {
  // either returns "on" or "undefined"
  ratedCheck=$("#rated:checked").val();
  if(ratedCheck==="on") {setRated('yes')}
  if(ratedCheck===undefined) {setRated('no')}
});
var password = localStorage.getItem('password');
if(password===null||password===undefined||password==="") {
  password=" ";
}
else {
  $('#password').val(password);
}
var color = localStorage.getItem('color');
if(color==null||color==undefined){
  color="automatic";
    localStorage.setItem("color", color);
}
if (color === "white") {
    $('.asWhite').addClass('highlight');
  // $('select[name="color"]').find('option[value="white"]').attr("selected",true);
}
if (color === "black") {
    $('.asBlack').addClass('highlight');
  // $('select[name="color"]').find('option[value="black"]').attr("selected",true);
}
if (color === "automatic") {
    $('.asAutomatic').addClass('highlight');
  // $('select[name="color"]').find('option[value="automatic"]').attr("selected",true);
}
var rated = localStorage.getItem('rated');
if(rated==null){
  rated="unrated";
  localStorage.setItem("rated", rated);
}
if (rated === "rated") {
  $('#rated').attr('checked', true);
}
if (rated === "unrated") {
  $('#rated').attr('checked', false);
}
var gameTime = localStorage.getItem('minutes');
if(gameTime==null){
  gameTime=5;
  localStorage.setItem("minutes", gameTime);
}
$('.initialTime').html(gameTime);
var gameIncrement = localStorage.getItem('seconds');
if(gameIncrement==null){
  gameIncrement=5;
  localStorage.setItem("seconds", gameIncrement);
}
$('.increment').html(gameIncrement);

function connectToHost(host, port) {
  invalidPassword="no"; // clears the invalid password variable so you get password error message
  if (navigator.onLine === false) {
    appAlert("You appear to be offline. Connect to the internet to play on FICS.", "No Connection");
    setDisconnected();
    return;
  }
  window.socket = new Socket();
  window.socket.onData = receiveData;
  window.socket.onError = function(errorMessage) {
    clearTimeout(slowConnectTimer);
    appAlert("Log in to continue...", "Disconnected");
    loggedIn=false;
    console.log("Error occured, error: " + errorMessage);
    // alert("Error occured, error: " + errorMessage);
  };
  window.socket.onClose = function(hasError) {
    clearTimeout(slowConnectTimer);
    console.info("Socket closed, hasErrors=" + hasError);
    setDisconnected();
  };
  setConnected(); // show the connecting screen and start the slow-connection timer
  window.socket.open(
    host,
    port,
    onRelayConnected, // success: the relay socket opened (cold start, if any, is over)
    function(errorMessage) {
    clearTimeout(slowConnectTimer);
    appAlert("Couldn't connect to server. Are you connected to the internet?", "Error");
    console.log("Error during connection, error: " + errorMessage);
    // alert("Error during connection, error: " + errorMessage);
  });
}
function setConnected() {
  startSpinners('connecting');
  $('.slowConnectNote').remove();
  jQT.goTo('#connecting', 'fade');
  // The relay (Render free tier) can be asleep; if the socket is slow to open,
  // show a soft "waking up" message rather than a silent spinner.
  clearTimeout(slowConnectTimer);
  slowConnectTimer = setTimeout(showSlowConnect, 4000);
}
function showSlowConnect() {
  if ($('.slowConnectNote').length === 0) {
    $('#connecting .connectMessage').append('<p class="center slowConnectNote">Please wait while a connection to the server is re-established. The free server may take a moment to wake up.</p>');
  }
}
function onRelayConnected() {
  clearTimeout(slowConnectTimer);
  $('.slowConnectNote').remove();
}
function setDisconnected() {
  clearTimeout(slowConnectTimer);
  $('.slowConnectNote').remove();
  jQT.goTo('#home', 'slideright');
}
function addTextToOutputElement(text) {
  if(text.length>1&&text!=="fics% ") {
    var dataOutput = document.getElementById("data-output");
    var line = document.createElement("li");
    line.innerText = text;
    dataOutput.appendChild(line);
    if($("#data-output li").length>12) {
      jQuery("#data-output li:first-child").remove();
    }
  }
}
function writeCommand(event) {
  // send data on enter button clicked
  if (event.charCode == 13) {
    var input = document.getElementById("command-input");
    var command = input.value;
    var bytes = new Uint8Array(command.length + 1);
    for (var i = 0; i < command.length; i++) {
      bytes[i] = command.charCodeAt(i);
    }
    bytes[command.length] = "\n".charCodeAt(0);
    if(testing==="on") {
      // socket.write breaks browser testing so turn it off when testing variable is on
    }
    else {
      socket.write(bytes);
    }
    input.value = "";
  }
}
function receiveData(data) {
  var chars = new Array(data.length);
  for (var i = 0; i < data.length; i++) {
      chars.push(String.fromCharCode(data[i]));
  }
  var dataString = chars.join("");
  // dataString = dataString.replace(/(?:\r\n|\r|\n)/g, '');
  // dataString = dataString.replace('%', '');
  console.log(dataString);
  monitorConsole(dataString);
  dataString.split(/(?:\r\n|\r|\n)/g).forEach(addTextToOutputElement);
  $('.message').html(dataString);
}
function pieceTheme(piece) {
    return 'img/' + piece + '.svg';
}
function loadPosition(fen,asColor) {
  var cfg = {
    draggable: true,
    orientation: asColor,
    moveSpeed: 200,
    position: fen,
    pieceTheme: pieceTheme,
    showNotation: false,
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd
  };
  board = new ChessBoard('board', cfg);
}
function onSnapEnd() {
  board.position(game.fen());
}
function onDrop(source, target) {
  castle="";
  pos = source + " " + target;
  Movefrom = source;
  Moveto = target;
  $('.to').html(target);
  $('.from').html(source);
  // see if the move is legal
  var move = game.move({
      from: source,
      to: target,
      promotion: getPromoLetter()
  });
  // illegal move
  if (move === null) { 
      return 'snapback';
  } else {
      highlightSquares(pos);
      if(castle==="k") {sendCommand('0-0');}
      if(castle==="q") {sendCommand('0-0-0');}
      if(castle==="") {sendCommand(source+'-'+target);}
      // alert(castle);
      // alert(source+'-'+target);
      // sendCommand(source+'-'+target);
  }
  // updateStatus();
}
function onDragStart(source, piece, position, orientation) {
  if(boardLock==="freeze") {
      return false;
  }
  if(boardLock==="release") {
    if (orientation === 'white' && game.turn() === 'b') {
        return false;
    }
    if (orientation === 'black' && game.turn() === 'w') {
        return false;
    }
  }
}
function getPromoLetter() {
  promoNumber = localStorage.getItem("PromotedPiecesBecome");
  if (promoNumber === "0") {
      return ("q");
  }
  if (promoNumber === "1") {
      return ("r");
  }
  if (promoNumber === "2") {
      return ("b");
  }
  if (promoNumber === "3") {
      return ("k");
  }
}
function highlightSquares(pos) {
    $('.square-55d63').removeClass('highlightFrom');
    $('.square-55d63').removeClass('highlightTo');
    squares = pos.split(' ');
    squareFrom = squares[0];
    squareTo = squares[1];
    $('.square-' + squareFrom).addClass('highlightFrom');
    $('.square-' + squareTo).addClass('highlightTo');
}
function checkNotationForCastle(colorTurn,notation) {
  if(colorTurn==="b") {
  if(notation==="O-O-O") {highlightSquares("d1 c1");}
  if(notation==="O-O") {highlightSquares("f1 g1");}
  }
  if(colorTurn==="w") {
  if(notation==="O-O-O") {highlightSquares("d8 c8");}
  if(notation==="O-O") {highlightSquares("f8 g8");}
  }
}
function whiteOnTop() {
  var blackInfoHtml = $('div.blackInfo').html();
  var whiteInfoHtml = $('div.whiteInfo').html();  
  $('div.topBar').html('<div class="whiteInfo">'+whiteInfoHtml+'</div>');
  $('div.bottomBar').html('<div class="blackInfo">'+blackInfoHtml+'</div>');
}
function blackOnTop() {
  var blackInfoHtml = $('div.blackInfo').html();
  var whiteInfoHtml = $('div.whiteInfo').html();  
  $('div.bottomBar').html('<div class="whiteInfo">'+whiteInfoHtml+'</div>');
  $('div.topBar').html('<div class="blackInfo">'+blackInfoHtml+'</div>');
}
function getOpponentName() {
  var myColor=board.orientation();
  if(myColor=="white"){opponentColor="black";}
  if(myColor=="black"){opponentColor="white";}
  opponentName=$('.'+opponentColor+'Name').html();
  return(opponentName);
}
function getMyName() {
  var myColor=board.orientation();
  opponentName=$('.'+myColor+'Name').html();
  return(opponentName);
}
function tellOpponent(message) {
  sendCommand('tell '+getOpponentName()+ ' ' +message);
  $('.chatSent').html("Message sent: "+message);
}
function closeChat() {
  $('.chatWindow').fadeOut();
  $('.chatSent').html('');
}
function openChat() {
  $('.chatWindow').fadeIn();  
}
function closeConsole() {
  $('.consoleWindow').fadeOut();
}
function openConsole() {
  $('.consoleWindow').fadeIn();  
}
function muteToggle() {
  muteStatus = localStorage.getItem(getOpponentName());
  if(muteStatus!="muted") {
    muteOpponent();
    $('.muteButton').removeClass("unmuted").addClass("muted");
  }
  else {
    unMuteOpponent();
    $('.muteButton').removeClass("muted").addClass("unmuted");
  }
}
function muteOpponent() {
  localStorage.setItem(getOpponentName(),"muted");
  $('.muteButton').removeClass("unmuted").addClass("muted");
  $('.chatSent').html("Opponent muted.");
}
function unMuteOpponent() {
  localStorage.setItem(getOpponentName(),"unmuted");
  $('.muteButton').removeClass("muted").addClass("unmuted");
  $('.chatSent').html("Opponent unmuted.");
}
function checkMuteStatus() {
  muteStatus = localStorage.getItem(getOpponentName());
    if(muteStatus!="muted") {
      $('.muteButton').removeClass("muted").addClass("unmuted");
    }
    else {
      $('.muteButton').removeClass("unmuted").addClass("muted");
    }
}
function showNav() {
  if(mode=="versus")      {
    $('.versusNav').addClass('slideRight').removeClass('slideLeft');
  }
  if(mode=="observation") {
    $('.observeNav').addClass('slideRight').removeClass('slideLeft');
    $('.observeNext').show();
  }
}
function hideNav() {
  if(mode=="versus")      {
    $('.versusNav').removeClass('slideRight').addClass('slideLeft');
  }
  if(mode=="observation") {
    $('.observeNav').removeClass('slideRight').addClass('slideLeft');
  }
}
function setPlayerNames(whiteName,whiteRating,blackName,blackRating) {
    $('.whiteRating').html(whiteRating);
    $('.blackRating').html(blackRating);
    $('.whiteName').html(whiteName);
    $('.whiteRating').removeClass().addClass('whiteRating').addClass(whiteName);
    $('.blackName').html(blackName);
    $('.blackRating').removeClass().addClass('blackRating').addClass(blackName);
}
function allowRated() {
  $('.rated').show();
  $('.guest').hide(); 
}
function denyRated() {
  $('#rated').attr('checked', false);
  $('.rated').hide();
  $('.guest').show();
}
function observeMode() {
  mode="observation";
  $('.versus').hide();
  $('.observe').show();
  $('#board').removeClass('gameover');
}
function versusMode() {
  mode="versus";
  $('.versus').show();
  $('.observe').hide(); 
  $('#board').removeClass('gameover');
}
function gameOver() {
  stopTimer();
  $('.rematch').show();
  $('.resign').hide();
  $('.takeback').hide();
  $('.abort').hide();
  if(loggedInAsGuest=="no"){$('.adjourn').hide();} // registered users can adjourn, guests can't
  $('.draw').hide();
  $('#board').addClass('gameover');
  $('.exit').show();
  $('.board-overlay').show();
  boardLock="freeze";
  showNav();
}
function gameBegin() { 
  $('#whiteTimeVisible').removeClass('pink');  
  $('#blackTimeVisible').removeClass('pink');  
  stopSpinners('waiting');
  $('#board').removeClass('gameover');
  $('.board-overlay').hide();
  hideNav();
  jQT.goTo('#game','slideleft');
  startTimer();
  $('.exit').hide();
  $('.rematch').hide();
  $('.resign').show();
  $('.takeback').show();
  $('.abort').show();
  if(loggedInAsGuest=="no"){$('.adjourn').show();} // registered users can adjourn, guests can't
  $('.draw').show();
  gameInProgress = "yes";
  $('.availableGames').html(""); // this clears out the open tables list
}
function monitorConsole(msg) {
  if(loggedIn==true) {
    if(mode=="versus") {
      checkForNotInGame(msg); // in the rare case that you make it to the game screen without being in a match
      checkForMoves(msg);
      checkForNewGame(msg);
      checkForGameOver(msg);
      checkForOpponentMessages(msg);
      }
    if(mode=="observation") {
      checkForGameInfo(msg);
      checkForMoves(msg);
      checkForObserving(msg);
    }
    if(mode=="watchingTables") {
     checkForAds(msg);
    }
  }
  // if you aren't logged in:
  else {
    checkForLogin(msg);
    checkForGuestLogin(msg);
    checkForPasswordPrompt(msg);
    checkForWrongPassword(msg); 
    checkForUserName(msg);
  }
}
function checkForObserving(msg) {
  // You are now observing game
  var youAreObservingPattern = new RegExp('You are now observing game '); 
  if (youAreObservingPattern.test(msg) === true) {
      gameBegin();
  }
}

function checkForNotInGame(msg) {
  // You are not playing or examining a game
  var NotInGamePattern = new RegExp('You are not playing or examining a game');
  if (NotInGamePattern.test(msg) === true) {
    jQT.goTo('#main', 'slideright');      
  }
}

function checkForOpponentMessages(msg) {
  // GuestZQBG(U)[22] says: u2
  var opponentMessagePattern = new RegExp('says: '); 
  if (opponentMessagePattern.test(msg) === true) {
    opponentMessage=msg.split(' says: ');
    opponentName=opponentMessage[0];
    opponentMessage=opponentMessage[1];
    opponentMessage=opponentMessage.replace('fics%','');
      var junkPattern = new RegExp('\\[ '); // square brackets need a double back slash to escape them
      if (junkPattern.test(opponentName) === true) {
        opponentName=opponentName.split('(');
        opponentName=opponentName[0];
      }
      muteStatus = localStorage.getItem(getOpponentName());
      if(muteStatus!="muted") {
        appAlertRespond(opponentMessage,opponentName+' says: ');
      }
  }
  // ROBOadmin(*)(TD) tells you: Welcome to FICS - the Free Internet Chess Server. 
  var opponentMessagePattern2 = new RegExp(' tells you: '); 
  if (opponentMessagePattern2.test(msg) === true) {
    opponentMessage2=msg.split(' tells you: ');
    opponentName2=opponentMessage2[0];
    opponentName2=opponentName2.replace(/[\n\r]/g, ''); // remove carriage returns
    if(opponentName2!=="ROBOadmin(*)(TD)") {
      opponentMessage2=opponentMessage2[1];
      // opponentMessage2 = opponentMessage2.replace(/[\n\r]/g, ''); // remove carriage returns
      opponentMessage2=opponentMessage2.replace('fics%','');
      muteStatus = localStorage.getItem(getOpponentName());
      if(muteStatus!="muted") {
        appAlertRespond(opponentMessage2,opponentName2+' says: ');
      }
      // options could be: Respond, Mute, Dismiss
    }
  }
  var opponentAbortPattern = new RegExp(' the abort request.'); 
  if (opponentAbortPattern.test(msg) === true) {
    var abortResponse = msg.split(' the abort request.');
    abortResponse = abortResponse[0].replace(/[\n\r]/g, ''); // remove carriage returns
    abortResponse = abortResponse+' the abort request.';
    appAlert(abortResponse,"Response");
  }
  var opponentAdjournPattern = new RegExp(' the adjourn request.'); 
  if (opponentAdjournPattern.test(msg) === true) {
    var adjournResponse = msg.split(' the adjourn request.');
    adjournResponse = adjournResponse[0].replace(/[\n\r]/g, ''); // remove carriage returns
    adjournResponse = adjournResponse+' the adjourn request.';
    appAlert(adjournResponse,"Response");
  }
  var opponentTakebackPattern = new RegExp(' the takeback request'); 
  if (opponentTakebackPattern.test(msg) === true) {
    var youTakebackPattern = new RegExp('You decline the takeback request from '); 
    if (youTakebackPattern.test(msg) === true) {
      // don't need to do anything if it was you who declined the takeback request
    } 
    else {
      var takebackResponse = msg.split(' the takeback request.');
      takebackResponse = takebackResponse[0].replace(/[\n\r]/g, ''); // remove carriage returns
      takebackResponse = takebackResponse+' the takeback request.';
      appAlert(takebackResponse,"Response");
    }
  }
  var opponentDrawPattern = new RegExp(' the draw request'); 
  if (opponentDrawPattern.test(msg) === true) {
    var drawResponse = msg.split(' the draw request.');
    drawResponse = drawResponse.replace(/[\n\r]/g, ''); // remove carriage returns
    drawResponse = drawResponse[0]+' the draw request.';
    appAlert(drawResponse,"Response");
  }
  var opponentWithdrawPattern = new RegExp(' withdraws the match offer'); 
  if (opponentWithdrawPattern.test(msg) === true) {
    var withdrawResponse = msg.split(' withdraws the match offer.');
    withdrawResponse = withdrawResponse.replace(/[\n\r]/g, ''); // remove carriage returns
    withdrawResponse = withdrawResponse[0]+' withdraws the match offer.';
    appAlert(withdrawResponse,"Response");
  }
  var abortRequestSentPattern = new RegExp('Abort request sent.'); 
  if (abortRequestSentPattern.test(msg) === true) {
    appAlert("Abort request sent.","Sent");
  }
  var drawRequestSentPattern = new RegExp('Draw request sent.'); 
  if (drawRequestSentPattern.test(msg) === true) {
    appAlert("Draw request sent.","Sent");
  }
  var adjournRequestSentPattern = new RegExp('Adjourn request sent.'); 
  if (adjournRequestSentPattern.test(msg) === true) {
    appAlert("Adjourn request sent.","Sent");
  }
  var takebackRequestSentPattern = new RegExp('Takeback request sent.'); 
  if (takebackRequestSentPattern.test(msg) === true) {
    appAlert("Takeback request sent.","Sent");
  }
  var rematchPattern = new RegExp(" declines the match offer."); 
  if (rematchPattern.test(msg) === true) {
  playerName=msg.split(' ');
  playerName=playerName[0];
  response = playerName+' declines the match offer.'; // this is because it would have FICS in the response otherwise.
    navigator.notification.alert(
        response,  // message
        alertDismissed,         // callback
        'Response:',            // title
        'Okay'                  // buttonName
    );
  }
  // Braadslee accepts the match offer.
  var rematchAcceptPattern = new RegExp(" accepts the match offer."); 
  if (rematchAcceptPattern.test(msg) === true) {
    gameBegin();
  }
  // if player is already in another game the rematch gets canceled with this message:
  //  GuestNXYH is playing a game.
  var anotherGamePattern = new RegExp(" is playing a game."); 
  if (anotherGamePattern.test(msg) === true) {
  playerName = getOpponentName();
  response = playerName+' is already playing a game.';
    navigator.notification.alert(
        response,  // message
        alertDismissed,         // callback
        'Rematch response:',            // title
        'Okay'                  // buttonName
    );
  }
  // if player has logged out
  // Your last opponent, "SlavaArkhipov", is not logged in.
  var loggedOutPattern = new RegExp(" is not logged in."); 
  if (loggedOutPattern.test(msg) === true) {
  playerName = getOpponentName();
  response = playerName+'  is no longer logged in.';
    navigator.notification.alert(
        response,  // message
        alertDismissed,         // callback
        'Rematch response:',            // title
        'Okay'                  // buttonName
    );
  }
  // avmax, who was challenging you, has joined a match with albertobaleia.
  var anotherGamePattern2 = new RegExp(", who was challenging you, has joined a match with "); 
  if (anotherGamePattern2.test(msg) === true) {
  response = playerName+' is already playing a game.';
    navigator.notification.alert(
        response,  // message
        alertDismissed,         // callback
        'Rematch response:',            // title
        'Okay'                  // buttonName
    );
  }
  // Your opponent has requested no takebacks.
  var noTakebacksPattern = new RegExp('Your opponent has requested no takebacks.'); 
  if (noTakebacksPattern.test(msg) === true) {
    appAlert('Your opponent has requested no takebacks.','Response:');
  }
  // GuestHGXY would like to take back 1 half move(s).
  var opponentTakebackPattern = new RegExp(' would like to take back '); 
  if (opponentTakebackPattern.test(msg) === true) {
    numberOfHalfmoves = msg.split(" would like to take back ");
    numberOfHalfmoves = numberOfHalfmoves[1];
    numberOfHalfmoves = numberOfHalfmoves.split(' half move');
    numberOfHalfmoves = numberOfHalfmoves[0];
    takebackRequestAlert(numberOfHalfmoves);
  }
  // nopqrstuv offers you a draw.
  var drawRequestPattern = new RegExp(' offers you a draw'); 
  if (drawRequestPattern.test(msg) === true) {
    navigator.notification.confirm(
        getOpponentName()+' has requested a draw.', // message
         acceptOrDecline(" draw"),            // callback to invoke with index of button pressed
        'Draw?',           // title
        ['Accept','Decline']         // buttonLabels
    );
  }
  // That seek is not available.
  var gameUnavailablePattern = new RegExp('That seek is not available.'); 
  if (gameUnavailablePattern.test(msg) === true) {
    watchOpenGames();
    gameover();
    appAlert("Game Unavailable.","Sorry, that game is no longer available.");
  }
  // Issuing match request since the seek was set to manual.
  var gameUnavailablePattern2 = new RegExp('Issuing match request since the seek was set to manual.'); 
  if (gameUnavailablePattern2.test(msg) === true) {
    appAlert("Issuing Request.","Opponent has asked to manually approve opponents.");
  }
  // MooodyBlue, whom you were challenging, has joined a match with mudong.
  var gameUnavailablePattern3 = new RegExp(', whom you were challenging, has joined a match with '); 
  if (gameUnavailablePattern3.test(msg) === true) {
    appAlert("Game Unavailable.","Sorry, that opponent is already in another game.");
  }
  // Challenge: nopqrstuv (1016) ahanft (1178) rated blitz 7 3.
  // Challenge: Guestpipo (----) GuestBHSF (----) unrated blitz 5 5.
  var challengePattern = new RegExp('Challenge: '); 
  if (challengePattern.test(msg) === true) {
    challengeInfo = msg.split('hallenge: ');
    challengeInfo = challengeInfo[1];
    challengeInfo = challengeInfo.split('.');
    challengeInfo = challengeInfo[0];
    challengeAlert();
  }
}

function checkForNewGame(msg) {
  // You are unregistered - setting to unrated.
  // Your seek has been posted with index 154.
  // (64 player(s) saw the seek.)
  var seekViewersPattern = new RegExp("Your seek has been posted with index "); 
  if (seekViewersPattern.test(msg) === true) {
    viewers = msg.split('(')
    viewers = viewers[1]
    $('.inviteDetailsViewedBy').html(viewers);
  }
  // accepts your seek
  var acceptedSeekPattern = new RegExp(" accepts your seek"); 
  if (acceptedSeekPattern.test(msg) === true) {
    gameBegin();
  }
  // Your seek intercepts
  var seekInterceptPattern = new RegExp("Your seek intercepts"); 
  if (seekInterceptPattern.test(msg) === true) {
    gameBegin();
  }
  // Your challenge intercepts
  var seekInterceptPattern = new RegExp("Your challenge intercepts"); 
  if (seekInterceptPattern.test(msg) === true) {
    gameBegin();
  }
  // Your seek matches one posted by
  // Your seek matches one already posted by
  var seekMatchesPattern = new RegExp("Your seek matches one"); 
  if (seekMatchesPattern.test(msg) === true) {
    gameBegin();
  }
  // Creating: GuestKPNJ (++++) GuestXFKB (++++) unrated blitz 5 2
  // Creating: GuestVQWM (++++) GuestPXCC (++++) unrated blitz 5 2
  // {Game 67 (GuestVQWM vs. GuestPXCC) Creating unrated blitz match.}
  // Creating: ahanft ( 191) EnnMal ( 989) rated blitz 7 3
  var newGameCreatedPattern = new RegExp("Creating: "); 
  if (newGameCreatedPattern.test(msg) === true) {
    gameInfoPattern=msg.split('Creating: ');
    gameInfoPattern = gameInfoPattern[1];
    currentGameDetails = gameInfoPattern;
    currentGameDetails=currentGameDetails.split('{');
    currentGameDetails=currentGameDetails[0];
    ratings = currentGameDetails.match(/\(([^()]+)\)/g ); // get what's between the parenthesis
    whiteRating=ratings[0];
    blackRating=ratings[1];
    if(blackRating=="(++++)") {blackRating=" ";}
    if(whiteRating=="(++++)") {whiteRating=" ";}
    NamePattern=gameInfoPattern.split(' ('); // can't split this at spaces because if the rating is less than 1000, it comes throught as " 941" and breaks this
    whiteName=NamePattern[0];
    blackName=NamePattern[1];
    blackName=blackName.split(') ');
    blackName=blackName[1];
    setPlayerNames(whiteName,whiteRating,blackName,blackRating);
  }
}
function checkForGameInfo(msg) {
  // ex when observing:  Game 74: zampronha (2003) penguinias (2205) rated blitz 3 1
  // Game 228: alonm (2010) istarob (1834) rated blitz 3 0
  // Creating: GuestVQWM (++++) GuestPXCC (++++) unrated blitz 5 2
  // {Game 67 (GuestVQWM vs. GuestPXCC) Creating unrated blitz match.}
  // {Game 100 (GuestNXLD vs. GuestFMFF) Creating unrated blitz match.}
  var newGameObservedPattern = new RegExp("Game "); 
  if (newGameObservedPattern.test(msg) === true) {
    var GameEndPattern = new RegExp("{Game "); 
    if (GameEndPattern.test(msg) === true) {
      checkForGameOver(msg);
    }
    else {
      // Catch this exception: // WickedChess stopped examining game 213. Game 213 (which you were observing) has no examiners.
      var stoppedExaminingPattern = new RegExp(" stopped examining game "); 
      if (stoppedExaminingPattern.test(msg) === true) {
      }
      else {
        gameInfoPattern2=msg.split('ame ');
        gameInfoPattern2=gameInfoPattern2[2];
        currentGameDetails = gameInfoPattern2;
        currentGameDetails=currentGameDetails.split('<12>');
        currentGameDetails=currentGameDetails[0];
        currentGameDetails=currentGameDetails.split(': ');
        currentGameDetails=currentGameDetails[1];
        gameInfoPattern2=gameInfoPattern2.split(' ');
        whiteName=gameInfoPattern2[1];
        whiteRating=gameInfoPattern2[2];
        blackName=gameInfoPattern2[3];
        blackRating=gameInfoPattern2[4];
        setPlayerNames(whiteName,whiteRating,blackName,blackRating);
      }
    }
  }
}
function checkForMoves(msg) {
  var movePattern = new RegExp("<12> "); // all moves start with this prefix
  if (movePattern.test(msg) === true) {
    processMove(msg);
  }
}
function processMove(msg) { 
  var moveInfo = msg.split("<12>").pop();
  // console.log("TESTING"+msg);
  moveInfo = moveInfo.split(" ");
  // <12> rnbqkbnr pppppppp -------- -------- -------- -------- PPPPPPPP RNBQKBNR W -1 1 1 1 1 0 108 GuestCHML kurtttz 1 5 5 39 39 300 300 1 none (0:00) none 0 0 0

  // "<12> rnbqkb-r pppppppp -----n-- -------- ----P--- -------- PPPPKPPP RNBQ-BNR
  //  B -1 0 0 1 1 0 7 Newton Einstein 1 2 12 39 39 119 122 2 K/e1-e2 (0:06) Ke2 0"

  // This string always begins on a new line, and there are always exactly 31 non-
  // empty fields separated by blanks. The fields are:

  // 0* the string "<12>" to identify this line.

  // 1* eight fields representing the board position.  The first one is White's 8th rank (also Black's 1st rank), then White's 7th rank (also Black's 2nd), etc, regardless of who's move it is.
  var ficsNotation = moveInfo[1] + '/' + moveInfo[2] + '/' + moveInfo[3] + '/' + moveInfo[4] + '/' + moveInfo[5] + '/' + moveInfo[6] + '/' + moveInfo[7] + '/' + moveInfo[8];

  if(ficsNotation == "pppppppp/--------/--------/--------/--------/PPPPPPPP/RNBQKBNR/W") {
    // unhighlight board
    $('.square-55d63').removeClass('highlightFrom');
    $('.square-55d63').removeClass('highlightTo');
    board.position(blank);
    game.load(blank); 
  }
  else {
    // 2* color whose turn it is to move ("B" or "W")
    var colorTurn = '';
    colorTurn = moveInfo[9];
    if(colorTurn=="W"){colorTurn="w"}
    if(colorTurn=="B"){colorTurn="b"}

    // 3* -1 if the previous move was NOT a double pawn push, otherwise the chess board file  (numbered 0--7 for a--h) in which the double push was made
    var enpessant = moveInfo[10]; 
    if(enpessant==-1){enpessant="-"}
    else {
      if(colorTurn==="w"){rank=6;}
      else{rank=3;}
      if(enpessant==-0){enpessant="a"+rank}
      if(enpessant==1){enpessant="b"+rank}
      if(enpessant==2) {enpessant="c"+rank}
      if(enpessant==3) {enpessant="d"+rank}
      if(enpessant==4) {enpessant="e"+rank}
      if(enpessant==5) {enpessant="f"+rank}
      if(enpessant==6) {enpessant="g"+rank}
      if(enpessant==7) {enpessant="h"+rank}
    }

    // 4* can White still castle short? (0=no, 1=yes)
    var castle1 = moveInfo[11];
    if(castle1==1){castle1="K"} else {castle1=""}

    // 5* can White still castle long?
    var castle2 = moveInfo[12];
    if(castle2==1){castle2="Q"} else {castle2=""}

    // 6* can Black still castle short?
    var castle3 = moveInfo[13];
    if(castle3==1){castle3="k"} else {castle3=""}

    // 7* can Black still castle long?
    var castle4 = moveInfo[14];
    if(castle4==1){castle4="q"} else {castle4=""}

    var castle = castle1 + castle2 + castle3 + castle4;
    if(castle==="") {castle="-"}

    // 8* the number of moves made since the last irreversible move.  (0 if last move was irreversible.  If the value is >= 100, the game can be declared a draw due to the 50 move rule.)
    var move50count = moveInfo[15];

    // 9* The game number
    var gameNumber = moveInfo[16];

    // 10* White's name
    var whiteName = moveInfo[17];

    // 11* Black's name
    var blackName = moveInfo[18];

    // 12* my relation to this game:
    //     -3 isolated position, such as for "ref 3" or the "sposition" command
    //     -2 I am observing game being examined
    //      2 I am the examiner of this game
    //     -1 I am playing, it is my opponent's move
    //      1 I am playing and it is my move
    //      0 I am observing a game being played

    checkOrientation(whiteName,blackName);

    // 13* initial time (in seconds) of the match
    var initialTime = moveInfo[20];

    // 14* increment In seconds) of the match
    var increment = moveInfo[21];

    // 15* White material strength
    // 16* Black material strength
    // 17* White's remaining time
    var whiteTime = moveInfo[24];
    // $('.whiteTime').html(whiteTime);

    // 18* Black's remaining time
    var blackTime = moveInfo[25];
    // $('.blackTime').html(blackTime);

    setTimer(whiteTime,blackTime);    
    startClock(colorTurn);    

    // 19* the number of the move about to be made (standard chess numbering -- White's and Black's first moves are both 1, etc.)
    var moveNumber = moveInfo[26];

    // 20* verbose coordinate notation for the previous move ("none" if there were none) [note this used to be broken for examined games]
    var pos = moveInfo[27]; 
    if(pos!="(0:00)"){ // this comes through on new games
      pos = checkForPawnPromotion(pos);
      pos = cleanCoordinates(pos);
          highlightSquares(pos);
    }
    // 21* time taken to make previous move "(min:sec)".
    // 22* pretty notation for the previous move ("none" if there is none)
    var notation = moveInfo[29];
    if(notation!="none"){
      checkNotationForCastle(colorTurn,notation);
    }

    // 23* flip field for board orientation: 1 = Black at bottom, 0 = White at bottom.

    var fenEndInfo = ' ' + colorTurn + ' ' + castle + ' ' + enpessant + ' ' + move50count + ' ' + moveNumber; 
    fen = "";
    fen = convertToFen(ficsNotation) + fenEndInfo;
    board.position(fen);
    // alert(game.load(fen)); this alerts true when fen is valid
    game.load(fen);
  }
}
function checkForGameOver(msg) {
  // {Game 258 (ahanft vs. JOGGGIIII) Game aborted on move 1} *
  var gameOverPattern = new RegExp("{Game "); 
  if (gameOverPattern.test(msg) === true) {
    msgSplit=msg.split('{Game ');
    msgSplit=msgSplit[1];
    var opponents = msgSplit.match(/\(([^()]+)\)/g ); // get what's between the parenthesis
    opponents = opponents[0];
    var results= msgSplit.split(') ');
    results = results[1];

    var newGamePattern = new RegExp("Creating "); 
    // if it is a new game:
    if (newGamePattern.test(results) === true) { 
      // it's a new game, this gets caught by another function
    }
    else {
    // if it is a game over message
    // catch this: Blitz rating adjustment: 1186 --> 1182
    var ratingAdjustmentPattern = new RegExp("rating adjustment: ");
    var newRatingMessage = "";
    if (ratingAdjustmentPattern.test(results) === true) {
      var ratingNums = results.split('adjustment: ');
      ratingNums = ratingNums[1];
      ratingNums = ratingNums.split(' --> ');
      oldrating = ratingNums[0];
      newrating = ratingNums[1];
      var getNextNumber = /\d+/g;
      newrating = newrating.match(getNextNumber);
      newrating = newrating[0];
      newRatingMessage = "\nNew Rating: "+newrating;
      }
      theResult = results.split('} ');
      result = theResult[0];
      score = theResult[1];

      $('.result').html(result);
      $('.rating-change').html(newRatingMessage);
      gameOver();
    }
  } 
}
function appAlert(message,title) {
if (navigator.notification) {
  navigator.notification.alert(message,alertDismissed,title,'OK');
  }
  else {
    alert(title+': '+message);
  }
}
function alertDismissed() {
    // do nothing
}
function appAlertRespond(message,title) {
// this is used when a user sends you a message. 
if(gameInProgress != "no") {
  if(mode=="versus") { // because we don't want want to receive challenges in observation mode because there is no good way to switch to versus mode.

      navigator.notification.confirm(
        message, // message
        confirmRespond,         // callback to invoke with index of button pressed
        title,                  // title
        ['Respond','Dismiss']   // buttonLabels
      );
    }
  }
}
function confirmRespond(buttonIndex) {
  // if Respond
  if(buttonIndex===1) { 
    openChat();
  }
  // if Dismiss
  if(buttonIndex===2) {
    // do nothing
  }
}
function takebackRequestAlert(takebackInfo) {
  navigator.notification.confirm(
    getOpponentName()+' would like to take back '+takebackInfo+'halfmoves', // message
     acceptOrDecline(' takeback'),  // callback to invoke with index of button pressed
    'Takeback Requested',           // title
    ['Accept','Decline']            // buttonLabels
  );
}
function takebackAlert() {
  navigator.notification.confirm(
    'Number of moves to request taken back:', // message
     takebackConfirm,           // callback to invoke with index of button pressed
    'Takeback Details',         // title
    ['1','2','3','4']           // buttonLabels
  );
}
function takebackConfirm(choice) {
  sendCommand('takeback '+choice);
}
function challengeAlert() {
  if (navigator.notification) {
    navigator.notification.confirm(
      "Would you like to play again?",                // message
      acceptOrDecline(" match"),    // callback to invoke with index of button pressed
      'Challenge Received:',        // title
      ['Accept','Decline']          // buttonLabels
    );
  }
  else {
    alert(challengeInfo);
  }
}
function acceptOrDecline(response) {
  // if accepted
  if(buttonIndex===1) { 
    accept(response);
  }
  // if declined
  if(buttonIndex===2) {
    decline(response);
  }
}
function checkForPawnPromotion(pos) {
// ex. <12> RQ---bk- -------- ---p---- ---Pp--- ----P--p --K-B--- ------p- -r------ B -1 0 0 0 0 0 78 Tabiya shutnic 0 3 0 19 12 15 1 50 P/b7-b8=Q (0:01) b8=Q 0 1 333
  // ex. P/b7-b8=Q
    var pawnPromotionPattern = new RegExp("="); 
    if (pawnPromotionPattern.test(pos) === true) {
      pos = pos.split('=');
      // promoPiece=pos[1];
      pos = pos[0];
    return(pos);
    }
    else {
      return(pos);
    }
}
function changeRankToNumber(rank) {
  if(rank == "a") {return(0);}
  if(rank == "b") {return(1);}
  if(rank == "c") {return(2);}
  if(rank == "d") {return(3);}
  if(rank == "e") {return(4);}
  if(rank == "f") {return(5);}
  if(rank == "g") {return(6);}
  if(rank == "h") {return(7);}
  }
  function checkOrientation(whiteName,blackName) {
  if(mode=="observation") {
    boardLock="freeze";
    board.orientation('white');
    blackOnTop();
  }
  else {
    // user is defined when page loads, it gets pulled from local storage
    if(whiteName===user){
      // flip board to white
      board.orientation('white');
      blackOnTop();
      boardLock="release";
    }
    if(blackName===user){
      // flip board to black
      board.orientation('black');
      whiteOnTop();
      boardLock="release";    
    }
  }
}
function cleanCoordinates(pos) { 
  if(pos==="o-o"||pos==="o-o-o"||pos==="O-O"||pos==="O-O-O") {
    return(pos);
  }
  if(pos!="o-o-o"&&pos!="o-o"&&pos!="O-O"&&pos!="O-O-O"){
    // ex. P/d7-d6
    posArray = pos.split("/");
    fromTo=posArray[1];
    if(fromTo==undefined) {fromTo="-"}
    fromTo = fromTo.replace('-', ' ');
    return(fromTo);
  }
}
function convertToFen(ficsNotation) {
    fenArray = ficsNotation.split("");
    var count = 0;
    var fen = "";
    for (var i = 0; i < fenArray.length; i++) {
        if (fenArray[i] == "-") {
            count++;
            if(i == fenArray.length-1){ // this catches if the last character is a "-"
                fen = fen + count;
            }
        } else {
            if (count > 0) {
                fen = fen + count;
            }
            fen = fen + fenArray[i];
            count = 0;
        }
    }
    return(fen);
}
function checkForWrongPassword(msg) {
  // **** Invalid password! ****
    var invalidPasswordPattern = new RegExp("Invalid password! "); 
    if (invalidPasswordPattern.test(msg) === true) {
      if(invalidPassword!="yes") {
      appAlert('Invalid password',"Error");
        localStorage.setItem('password','');
        $('#password').val("");
      }
      else{}
      invalidPassword="yes";
    }
    else {}
}
function checkForPasswordPrompt(msg) {
  // password: 
    var passwordPattern = new RegExp("password: "); 
    if (passwordPattern.test(msg) === true) {
      sendCommand(password);
    }
    else {}
}
function checkForLogin(msg) {
    var loginPattern = new RegExp("login: "); 
    if (loginPattern.test(msg) === true) { 
      sendCommand(user);
    }
    else {}
}
function autoLogin() {
  startSpinners('connecting');
  user = localStorage.getItem('user');
  password = localStorage.getItem('password');
  connectToHost('freechess.org', 5000);
  $('.loginAuto').show();
}
function forgetUser() {
  localStorage.setItem('autoLogin',"no");
  localStorage.setItem('user','');
  localStorage.setItem('password','');
  $('#password').val("");
  $('.loginAuto').hide();
  $('.username').html("");
  $('#user').val("");
  $('.username').html("");
}
function saveLogins() { 
  var newuser=$('#user').val();
  var newpassword=$('#password').val();
    localStorage.setItem('autoLogin',"yes");
    localStorage.setItem('user',newuser);
    user=newuser;
    $('.loginAuto').show();
    localStorage.setItem('password',newpassword);
    password=newpassword;
    connectToHost('freechess.org', 5000);
}
function dontSaveLogins() {
  var newuser=$('#user').val();
  var newpassword=$('#password').val();
  user=newuser;
  password=newpassword;
  connectToHost('freechess.org', 5000);
}

function checkForUserName(msg) {
  // **** Starting FICS session as GuestFLQK(U) ****
  var userNamePattern = new RegExp("Starting FICS session as ");
  if (userNamePattern.test(msg) === true) {
    loggedIn=true;
    jQT.goTo('#main', 'slideleft');
    stopSpinners('connecting');
    style12();

    var userNameString = msg.split('Starting FICS session as ');
    userNameString = userNameString[1];
    userNameClean = userNameString.split(' ');
    userName = userNameClean[0];

    userName = userName.replace(/["'()]/g, "parenthesis");
    userName = userName.replace("parenthesisUparenthesis", ""); // strip out the parenthesis and everything in them. This gets rid of the (U)

    $('.loginStatus').html(", " + userName);
    // jQT.goTo('#new', 'slideright');
    user = userName; // I don't override the local storage because the user could be non-guest but trying to play as a guest for some reason. The user variable gets compared to the game being watched to detect which way to orient the board. 

    var guestPattern = new RegExp("Guest");
    if (guestPattern.test(userName) === true) {
      denyRated();
    }
    else {
      allowRated();
    }
  }
}
function checkForGuestLogin(msg) {
  // Press return to enter the server as "Guest
    var guestLoginPrompt = new RegExp('Press return to enter the server as'); 
    if (guestLoginPrompt.test(msg) === true) {
      denyRated(); // because guests can't play rated games
      // guestName=msg.split('Press return to enter the server as "');
      // guestName = guestName[1];
      // guestName = guestName.split('":');
      // guestName = guestName[0];
     
      sendCommand(''); // the equivelent of pressing return   
        // $('.loginStatus').html("Logged in as, "+ guestName);
    }
}
function sendChat(event) {
    // send data on enter button clicked
    if (event.charCode == 13) {
        var input = document.getElementById("chat-input");
        var chatMessage = input.value;
        tellOpponent(chatMessage);
        input.value = "";
    }
}
function sendCommand(message) {
  console.log(message);
        var bytes = new Uint8Array(message.length + 1);
        for (var i = 0; i < message.length; i++) {
            bytes[i] = message.charCodeAt(i);
        }
        bytes[message.length] = "\n".charCodeAt(0);
  if(testing==="on") {
    // do nothing because socket.write breaks browser testing so turn it off when testing variable is on
  }
  else {
    socket.write(bytes);
  }
}
function loginAs() {
  loggedInAsGuest="no";
  allowRated();
  $('.adjourn').show(); // registered users can adjourn, guests can't
  loginConfirm();
}
function loginAsGuest() {
  loggedInAsGuest="yes";
  denyRated();
  $('.adjourn').hide();  // registered users can adjourn, guests can't
  user="guest";
  // sendCommand("quit"); // log out in case logged in
  connectToHost('freechess.org', 5000);
}
function logout() {
  jQT.goTo('#home', 'slideright');
  sendCommand("quit"); // log out in case logged in 
  loggedIn=false; 
  autoLoginCheck = localStorage.getItem('autoLogin');
  if(autoLoginCheck==="yes") {
    var userCheck = localStorage.getItem('user');
    if(userCheck!="guest") {
        $('.username').html(userCheck);
    }
  }
}
function loginConfirm() {
    navigator.notification.confirm(
        'Tap yes if you want to login as this user when app launches.', // message
         onConfirm,            // callback to invoke with index of button pressed
        'Remember me?',           // title
        ['Yes','No','Cancel']         // buttonLabels
    );
}
function onConfirm(buttonIndex) {
    // if yes
    if(buttonIndex===1) { 
      saveLogins();
    }
    // if no
    if(buttonIndex===2) {
      dontSaveLogins();
    }
    // if cancel
    if(buttonIndex===3) {
      // do nothing
    }
}
function rematch() {
  sendCommand('rematch');
  appAlert("Rematch request sent.");
}
function accept(response) {
  if(response==undefined){response="";}
  sendCommand('accept'+response);
}
function decline(response) {
  if(response==undefined){response="";}
  sendCommand('decline'+response);
}
function mute() {
    stopSeeks();
    sendCommand('set chanoff 1');
    sendCommand('set shout 0');
    sendCommand('set silence 1');
}
function unmute() {
    sendCommand('set chanoff 0');
}
function stopSeeks() {
    sendCommand('set seek 0');
}
function style12() {
    sendCommand('set style 12');
    mute();
}
function unobserve() {
    stopTimer();
    sendCommand('unobserve');
}
function observeGame(gameNumber) {
    jQT.goTo('#game', 'slideleft');
    unobserve();
    observeMode();
    board.orientation('white');
    style12();
// player: Observe the game being played by the listed user
// game:   Observe the given game number
// /l:     Observe the highest rated lightning game
// /b:     Observe the highest rated blitz game
// /s:     Observe the highest rated standard game
// /S:     Observe the highest rated suicide game
// /w:     Observe the highest rated wild game
// /z:     Observe the highest rated crazyhouse game
// /B:     Observe the highest rated bughouse game
// /L:     Observe the highest rated losers game
// /x:     Observe the highest rated atomic game
    sendCommand('observe '+gameNumber);
}
function observeBest(gameType) {
  jQT.goTo('#game', 'slideleft');
  $('.observeNext').hide();
  $('.versusNav').removeClass('slideRight').addClass('slideLeft');
  $('.board-overlay').hide();
  observeType = gameType;
  if(gameType==undefined) {gameType = observeType;}
  if(gameType=="Blitz") {gameTypeCode="/b"}
  if(gameType=="Lightning") {gameTypeCode="/l"}
  if(gameType=="Standard") {gameTypeCode="/s"}
  unobserve();
  observeMode();
  board.orientation('white');
  style12();
  sendCommand('observe '+ gameTypeCode);
}
function startSpinners(spinnerClass) {
  if(spinnerClass=="connecting") {
  $('.connectSpinner').addClass('spinner');
  }
  if(spinnerClass=="waiting") {
  $('.waitingSpinner').addClass('spinner');
  }
  if(spinnerClass=="all") {
  $('.connectSpinner').addClass('spinner');
  $('.waitingSpinner').addClass('spinner');
  }
}
function stopSpinners(spinnerClass) {
  if(spinnerClass=="connecting") {
  $('.connectSpinner').removeClass('spinner');
  }
  if(spinnerClass=="waiting") {
  $('.waitingSpinner').removeClass('spinner');
  }
  if(spinnerClass=="all") {
  $('.connectSpinner').removeClass('spinner');
  $('.waitingSpinner').removeClass('spinner');
  }
}
function countdown() {
  if(clock==="w") {
    currentWTime=$('#whiteTime').html();

    if(currentWTime<=11) {
      $('#whiteTimeVisible').addClass('pink');
    }
    else {
      $('#whiteTimeVisible').removeClass('pink');  
    }

    if(currentWTime>0) {
      currentWTime--;
    }
    $('#whiteTime').html(currentWTime);
    $('#whiteTimeVisible').html(secondsToMinutes(currentWTime));
  }
  if(clock==="b") {
    currentBTime=$('#blackTime').html();
    if(currentBTime<=11) {
      $('#blackTimeVisible').addClass('pink');
    }
    else {
      $('#blackTimeVisible').removeClass('pink');  
    }
    if(currentBTime>0) {
      currentBTime--;
  }
    $('#blackTime').html(currentBTime);
    $('#blackTimeVisible').html(secondsToMinutes(currentBTime));
  }
}
function startClock(turn) {
  if (turn === "b") { 
      clock="b";
  }
  if (turn === "w") { 
      clock="w";
  }
}
function setTimer(whiteTime, blackTime) {
  // alert("w:"+whiteTime+' b:'+blackTime+' turn:'+turn);
  console.log('White: '+whiteTime+' Black: '+blackTime);

  $('#blackTime').html(blackTime);
  $('#blackTimeVisible').html(secondsToMinutes(blackTime));
  $('#whiteTime').html(whiteTime);
  $('#whiteTimeVisible').html(secondsToMinutes(whiteTime));
}
function startTimer() {
  if(timerStatus!="active"){
  timer=setInterval(countdown, 1000);
  timerStatus="active";
  }
}
function stopTimer() {
  if(timerStatus!="inactive"){
  window.clearInterval(timer);
  timerStatus="inactive";
  }
}
function setGameTime(minutes) {
    localStorage.setItem("minutes", minutes);
}
function setIncrement(seconds) {
    localStorage.setItem("seconds", seconds);
}
function secondsToMinutes(secs) {
  var hours = Math.floor(secs / (60 * 60));   
  var divisor_for_minutes = secs % (60 * 60);
  var minutes = Math.floor(divisor_for_minutes / 60);
  var divisor_for_seconds = divisor_for_minutes % 60;
  var seconds = Math.ceil(divisor_for_seconds);
     var obj = {
      "h": hours,
      "m": minutes,
      "s": seconds
  };
  if(minutes>0){
    time=minutes+'m'+seconds+'s';
  }
    else{
    time=seconds+'s';
    }
  return time;
} 
function moreMinutes() {
  initialTime = $('.initialTime').html();
  initialTime++;
  $('.initialTime').html(initialTime);
  setGameTime(initialTime);
}
function lessMinutes() {
  initialTime = $('.initialTime').html();
  if(initialTime>1){
  initialTime--;
  $('.initialTime').html(initialTime);
  setGameTime(initialTime);
  }
}
function moreSeconds() {
  initialIncrement = $('.increment').html();
  initialIncrement++;
  $('.increment').html(initialIncrement);
  setIncrement(initialIncrement);
}
function lessSeconds() {
  initialIncrement = $('.increment').html();
  if(initialIncrement>1){
  initialIncrement--;
  $('.increment').html(initialIncrement);
  setIncrement(initialIncrement);
  }
}
function seekGame() {
  startSpinners('waiting');
  checkMuteStatus();
  versusMode();
  jQT.goTo('#waiting', 'slideleft');
  var visibleColor = localStorage.getItem('color');
  rated = localStorage.getItem('rated');
  if(color==="automatic") {
    color="";
    visibleColor="automatic";
  }
  minutes = localStorage.getItem('minutes');
  seconds = localStorage.getItem('seconds');
  seekString='seek ' + minutes + ' ' + seconds + ' ' + rated + ' ' + color;
  
  $('.inviteDetailsTime').html(minutes+' minutes');
  $('.inviteDetailsIncrement').html(seconds+' seconds');
  $('.inviteDetailsColor').html(visibleColor);
  if(rated=="rated") {
    $('.inviteDetailsRated').html("Yes");
  }
  else {
    $('.inviteDetailsRated').html("No");      
  }
  style12();
  sendCommand(seekString);
}
function setRated(yesorno) {
  if (yesorno === "yes") {
    localStorage.setItem("rated", "rated");
    $('.yes').addClass('highlight');
    $('.no').removeClass('highlight');
  }
if (yesorno === "no") {
    localStorage.setItem("rated", "unrated");
    $('.yes').removeClass('highlight');
    $('.no').addClass('highlight');
  }
}
