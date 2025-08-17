//shortcuts
var shortcuts = new Array(256);
shortcuts.fill(false);
shortcuts[48] = function(){record(0)}; //zero key
shortcuts[46]= function(){record(5)}; //decimal key
shortcuts[49] = function(){record(10)}; //one key
shortcuts[50] = function(){record(20)}; //two key
shortcuts[51] = function(){record(30)}; //three key
shortcuts[52]= function(){record(40)}; //four key
shortcuts[53]= function(){record(50)}; //five key
shortcuts[54]= function(){record(60)}; //six key
shortcuts[55]= function(){record(70)}; //seven key
shortcuts[56]= function(){record(80)}; //eight key
shortcuts[57]= function(){record(90)}; //nine key
shortcuts[13]=  function(){manual_entry_activate()}; //enter key
shortcuts[43]= function(){record(100)}; //plus key
shortcuts[45]= function(){erase()}; //minus key
shortcuts[42]= function(){record(75)}; //mult key
shortcuts[47]= function(){record(25)}; //div key


var button_ids = new Array(256);
button_ids.fill(false);
button_ids[48] = "zero";
button_ids[46]= "point";
button_ids[49]= "one" ;
button_ids[50]= "two";
button_ids[51]= "three";
button_ids[52]= "four";
button_ids[53]= "five";
button_ids[54]= "six";
button_ids[55]= "seven";
button_ids[56]= "eight";
button_ids[57]= "nine";
button_ids[13]= "enter";
button_ids[43]= "plus";
button_ids[45]= "minus";
button_ids[42]= "multiply";
button_ids[47]= "divide";

var osk_codes = {};

for (i=0; i<255; i++) {
	if(button_ids[i]) {
		osk_codes[button_ids[i]]=i;
	}
}

var runninglist = [];
var manual_mode = false;
var reset_armed = false;
var numpad_layout = "pc";

$('#manual_entry').hide();
$('#numpad_mac').hide();
$('#layout_switch').prop('checked', false); // Checks it


var lookup = new Array(256)
for(i = 0; i < lookup.length; i++) {lookup[i] = i}

//reassign non-numlocked keycodes to numlocked equivalents so they always behave as expected
//also reassign the numpad's keycodes to regular number row equivalents to make sure we always capture them

lookup[45]=48 //0 INS key 96
lookup[46]=46//. DEL key
// ENTER key doesn't have a second mode
// + key doesn't have a second mode
// - key doesn't have a second mode
// * key doesn't have a second mode
// / key doesn't have a second mode
lookup[35]=49; // 1 / End key
lookup[40]=50;// 2 / Down arrow key
lookup[34]=51;// 3 / PgDn key
lookup[37]=52;// 4 / Left arrow key
lookup[12]=53;// 5 / undefined key - likely "clear" on most windows keyboards but NOT mac keyboards, where clear is instead of numlock. this is why we won't use numlock to trigger anything. hopefully most people will just keep numlock on
lookup[39]=54;// 6 / right arrow key
lookup[36]=55; // 7 / Home key
lookup[38]=56; // 8 / up arrow key
lookup[33]=57;// 9 / PgUp key

// and now the numpad equivalents to regular keyboard values:
lookup[96]=48; //0 INS key 96
lookup[110]=46;//. DEL key
lookup[107]=43;// numpad plus to regular plus key
lookup[109]=45;// numpad minus to regular minus/dash key
lookup[106]=42;// numpad mul to regular mul key
lookup[111]=47;// numpad div to regular div key
// ENTER key doesn't have a second mode
lookup[97]=49; // 1 / End key
lookup[98]=50;// 2 / Down arrow key
lookup[99]=51;// 3 / PgDn key
lookup[100]=52;// 4 / Left arrow key
lookup[101]=53;// 5 / undefined key - likely "clear" on most windows keyboards but NOT mac keyboards, where clear is instead of numlock. this is why we won't use numlock to trigger anything. hopefully most people will just keep numlock on
lookup[102]=54;// 6 / right arrow key
lookup[103]=55; // 7 / Home key
lookup[104]=56; // 8 / up arrow key
lookup[105]=57;// 9 / PgUp key


function numlock(keycode) {
  return lookup[keycode]
}


Array.prototype.sum = function() {
    return this.reduce(function(a, b) {return a+b});
};

Array.prototype.mean = function() {
    return this.sum()/this.length;
};


function record(number){
  if (isNaN(number)) {return null} else {
  runninglist.push(number);
  updateticker();
  updatescore();
  }
}

function reset_disarm() {
	reset_armed = false;
		 $('#minus_'+numpad_layout).removeClass('btn-danger').addClass('btn-primary ').addClass('btn-operator ');
}

function reset_arm() {
	reset_armed = true;
		 $('#minus_'+numpad_layout).removeClass('btn-primary').removeClass('btn-operator').addClass('btn-danger ');
}

function erase(){
  runninglist.pop();
  updateticker();
  updatescore();
  reset_arm();
  setTimeout(reset_disarm,200);
}

function updateticker(){
  if (runninglist.length == 0) {
    $("#ticker").text("...");
  } else {
    $("#ticker").html(runninglist.join("<br>"));
  }
  if($('#ticker')[0].clientHeight > ($('#numpad_'+numpad_layout)[0].clientHeight)) { //make ticker grow until it reaches height of the numpad, then it'll overflow off the top
    $('#ticker')[0].parentElement.style.height = $('#numpad_'+numpad_layout)[0].clientHeight + 'px';
  }
}

function updatescore(){
  if (runninglist.length == 0) {
    $("#output").text("Enter Scores...");
    $("#N").text("0");
  } else {
    $("#output").text(Math.round(runninglist.mean()));
    $("#N").text(runninglist.length);
  }
}

function reset_all(){
  runninglist = [];
  manual_mode = false;
  reset_armed = false;
  updateticker();
  updatescore();
}

function manual_entry_activate() {
	manual_mode = true;
	//$('#manual_entry').show();
  $('#manual_entry').modal({
    backdrop: "static",
    keyboard: false
  });
  $('#manual_entry').show();
	$('#manual_entry_input').focus();
}

function manual_entry_enter() {
		manual_mode = false;
		record(parseInt($('#manual_entry_input').val()));
		$('#manual_entry_input').val('');
	$('#manual_entry').modal('hide');

}

function manual_entry_abort() {
		manual_mode = false;
		$('#manual_entry_input').val('');
	$('#manual_entry').modal('hide');

}

function highlight_button(keycode){
	if (button_ids[keycode] && button_ids[keycode]!="minus") {
		$("#"+button_ids[keycode]+"_"+numpad_layout).addClass("btn-hover ");
		setTimeout(function(){$("#"+button_ids[keycode]+"_"+numpad_layout).removeClass("btn-hover")},100);
	}
}

function push_keys(button_id){
	keyname = button_id.split("_")[0];
  keycode = osk_codes[keyname];
	ev = $.Event('keydown');
	ev.which = keycode; 
	ev.keyCode = keycode;
	keyhandler(ev);
}

function switch_layout(){
  if ($("#layout_switch").is(":checked")) {
    numpad_layout = "mac";
    $('#numpad_pc').hide();
    $('#numpad_mac').show();
  } else {
    numpad_layout = "pc";
      $('#numpad_mac').hide();
      $('#numpad_pc').show();
  }
}


function keyhandler(keyevent){
  keycode = keyevent.which;
  keycode = lookup[keycode]; //reassign non-numlocked keys if needed
  highlight_button(keycode);
  if (reset_armed && (keycode==45)) {
	  reset_all();
	  return null;
  }
  if (manual_mode == true) { //enter
	  if (keycode == 13 ) {
		  manual_entry_enter();
		  return  null;
	  }
    if (keycode == 27 ) { //esc
      manual_entry_abort();
      return null;
    }
  } else {
    if (shortcuts[keycode] ) { //functions are truthy
      shortcuts[keycode]();
      keyevent.preventDefault(); //keep regular shortcuts from activating
    }
  }
  }

$(document).on("keydown", keyhandler)

  $(".btn-fill").on("click", function(){push_keys($(this).attr('id'))});
  $("#manual_submit").on("click", manual_entry_enter);
  $("#manual_abort").on("click", manual_entry_abort);
  

  $("#layout_switch").on("change", switch_layout);
