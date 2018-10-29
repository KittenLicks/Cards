"use strict"

var reference = '!#$%&()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}€ƒ„†‡ŠŒŽ•œž';

$(document).ready(function(){
	//Add controls to cards
	var controls = $('.addcontrols');
	$('.card').append(controls);
	var controls = $('.controls');
	$('.card').append(controls);
	var fightcontrols = $('.fightcontrols');
	$('.card').append(fightcontrols);
	$('.card .controls').hide();

	$('.card').hover(function(){
		var textbox = $(this).find('input');
		if (checkVisible(textbox))
		{
			$(this).find('input').focus();
		}		
	});	
	$('.addcontrols input').keyup(function(e){
		if (e.which == 13)
		{
			addURL($(this).parents('.card'),$(this).val());
		}
	});
	loadCollectionCookies();
});
function checkCode(e){
	if (e.which == 13)
	{
		var str = $(e.target).val();
		if (str.length % 8 == 0)
		{
			startCollecting();		
			setCardsFromCode(str)			
		}
		else
		{
			alert("Sorry! That didn't appear to be a valid code.");
		}
	}
}
function addURL(card,url)
{
	if (url.endsWith('.png'))
	{
	}
	else if (url.indexOf('imgur') > 0)
	{		
		url = url.replace('imgur','i.imgur');
		url = url+'.png';
	}
	else
	{
		alert("Sorry! That did not seem to be a valid imgur URL.")
		return;
	}
	card.css('background-image','url('+url+')');
	setFull(card);
}
function removeURL(e)
{
	var card = $(e).parents('.card');
	card.css('background-image','unset');
	setEmpty(card);
}

function startCollecting()
{
	$('.intro').addClass('hide');
	$('.collection').removeClass('hide');
}
function letterToCard(letter)
{
	return (reference.indexOf(letter));
}
function numberToLetter(num)
{
	return reference[num];
}
function generateCode()
{
	var cards = $('.card');
	var code = '';
	for (var i=0;i<cards.length;i++)
	{
		var bg = $(cards[i]).css('background-image');
		var img = '';
		if (bg != 'none')
		{
			//Get the code part.
			var lastSlash = bg.lastIndexOf('/');
			var end = bg.lastIndexOf('.png');
			img = bg.substring(lastSlash+1,end);
			//Replace the slash with a letter indicating which card this is.
			img = numberToLetter(i) + img;
		}
		code += img;
	}
	return code;
}
function setCardsFromCode(code)
{
	//Handle this in increments of 8
	for (var i = 0; i <code.length;i+=8)
	{		
		var str = code.substring(i,i+8);
		var place = letterToCard(str[0]);
		str = str.substring(1);
		//Convert to imgur link.
		var link = 'https://i.imgur.com/' + str + '.png';
		var card = $('.card')[place];	
		$(card).css('background-image','url('+link+')');
		setFull($(card));
	}
}
function setFull(card)
{
	card.find('.addcontrols').hide();
	card.find('.controls').attr('style','');
	card.find('input').val('');
	card.find('.previewname').hide();
	card.addClass('filled');
	saveCollectionCookies();
}
function setEmpty(card)
{
	card.find('.controls').hide();
	card.find('.addcontrols').attr('style','');
	card.find('.previewname').show();
	card.removeClass('filled');
	saveCollectionCookies();
}
function popup()
{
	$('.blocker').fadeIn();
}
function closePopup()
{
	$('.blocker').fadeOut(function(){
		$('.popup').html('');	
	});	
}
function closeCheck(e)
{
	if ($(e.path[0]).hasClass('blocker')){
		closePopup();
	}
}
var cardsLeft = 5;
var cardsChosen = [];
function startFight()
{
	cardsLeft = 5;	
	cardsChosen = [];
	$('.fightingBar').show();
	$('.collectBar').hide();
	$('.card.filled .fightcontrols').show();
	$('.card.filled .controls').hide();
}
function cancelFight()
{
	$('.collectBar').show();
	$('.fightingBar').hide();
	$('.card.filled .fightcontrols').hide();		
	$('.card.filled .controls').attr('style','');
	$('.fightchosen').removeClass('fightchosen');
}
function addToFight(elem)
{
	if ($(elem).find('.plus').html() == '+' && cardsLeft > 0)
	{
		$(elem).find('.plus').html('-');
		cardsLeft--;	
		var link = $(elem).parent().parent().css('background-image');
		link = link.substring(5,link.length-2); //Remove 'url()'
		cardsChosen.push(link);
		$(elem).parent().parent().addClass('fightchosen');
		$('#fightCardsLeft').html(cardsLeft);
		console.log(link);
	}
	else if ($(elem).find('.plus').html() == '-')
	{
		var link = $(elem).parent().parent().css('background-image');
		link = link.substring(4,link.length-1); //Remove 'url()'
		var index= cardsChosen.indexOf(link);
		cardsChosen.splice(index,1);
		$(elem).find('.plus').html('+');
		cardsLeft++;
		$(elem).parent().parent().removeClass('fightchosen');
		$('#fightCardsLeft').html(cardsLeft);
	}
}
function generateFightLineup()
{	
	var width = $(window).width()
	var size = width/ 6.5;
	var margin = size/20;
	var spacing = margin;	

	var canvas = $('<canvas width="'+(size*5 + margin*6)+'" height="'+(size*1.36+margin*2)+'">');
	var ctx = canvas[0].getContext('2d');
	$('.popup').append(canvas);
	ctx.fillStyle="black";
	ctx.fillRect(0,0,(size*5 + margin*6),(size*1.36+margin*2))	

	for (var i in cardsChosen)
	{
		console.log(spacing);
		var img = $('<img>')[0];
		img.src=cardsChosen[i];		
		ctx.drawImage(img,spacing,margin,size,size*1.36);
		spacing = spacing+size+margin;	
	}
	popup();

}
function zoomIn(elem)
{	
	var card = $(elem).parent().parent();	
	$('.popup').append(card.clone());
	$('.popup').find('.addcontrols, .controls').remove();
	$('.popup').find('.card').css({width:'66vh', height:'90vh'});
	popup();
}
function saveCollection()
{
	var input = $('<input>');
	var code = generateCode();
	input.val(code);
	var p = $('<p>Copy the code below and store it somewhere.</p>');
	var closeButton = $('<button>Done!</button>');
	closeButton.click(closePopup);

	$('.popup').html('');
	$('.popup').append(p);
	$('.popup').append(input);
	$('.popup').append(closeButton);

	popup();
}
function checkVisible( elem ) {
    var viewHeight = $(window).height();
    var scrollTop = $(window).scrollTop();
    var y = $(elem).offset().top;
    var elementHeight = $(elem).height();

    return (  (y < (viewHeight + scrollTop)) && (y > (scrollTop - elementHeight)));
}
function loadCollectionCookies()
{
	var code = getCookie('code');
	if (code != '')
	{
		startCollecting();
		setCardsFromCode(code);
	}
}
function saveCollectionCookies()
{
	var code = generateCode();
	setCookie('code',code,'Thu, 18 Dec 2030 12:00:00 UTC');	
}
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}