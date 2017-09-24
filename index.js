window.$ = window.jQuery = require('jquery');

var mouseInLabel = null;
var lastSectionTarget = null;
var lastSideTarget = null;
var draggedTab = null;
var grabResizer = null;
$(document).ready(function(){
    init();
});
function init(){
    arrangeTabs();
}
//------------ SECTIONS ------------//
function correctSyntax(){
    sections = $('.section');
    for(var i=0;i<sections.length;i++){
        if(sections[i].children.length<=1 && sections[i].children[0].className=='section'){
            $(sections[i].children[0]).unwrap();
        }
    }
    sections = $('.section');
    for(var i=0;i<sections.length;i++){
        if(sections[i].id == 'left-right' || sections[i].id == 'up-down'){
            for(var j=0; j<sections[i].children.length;j++){
                if(sections[i].id == sections[i].children[j].id){
                    $(sections[i].children[j]).children().unwrap();
                }
            }
        }
    }
}
//------------ LABELS ------------//
$(document).on("mouseenter",".label", function(event){
    mouseInLabel = $(this);
    this.children[0].style="animation: fadein 0.25s forwards;";
});
$(document).on("mouseleave",".label",function(event){
    mouseInLabel = null;
    this.children[0].style="animation: fadeout 0.25s backwards;";
});
$(document).on("click",".label", function(event){
    tab = event.target.parentElement;
    showTab(tab);
});
$(document).on("click",".close", function(event){
    tab = event.target.parentElement.parentElement;
    deleteTab(tab);
    controlTabSizes();
});
function deleteTab(tab){
    var pane = tab.parentElement;
    var section = pane.parentElement;
    var superSection = section.parentElement;
    var n = Array.prototype.indexOf.call(superSection.children, section);
    if(pane.children.length <= 2){//Sections modif
        if($(section).prev().attr('class')== 'resizeVertical' || $(section).prev().attr('class')== 'resizeHorizontal'){
            $(section).prev().remove();
        }
        $(section).remove();
        correctSyntax();
    }else{//Tabs modifs
        var i = Array.prototype.indexOf.call(pane.children, tab);
        tab.remove();
        if(i>=2){showTab(pane.children[i-1]);}
        else if(i==1){showTab(pane.children[1]);}
    }
}
//------------ DRAG & DROP ------------//
$(document).on("dragstart",".label", function(event){
    draggedTab = event.target.parentElement;
});
$(document).on("dragover", '.label',function(event){
    lastSectionTarget = null;
    lastSideTarget = null;
});
$(document).on("dragover", '.paneContent',function(event){
    mouseTarget = event.target;
    sectionTarget = mouseTarget.parentElement.parentElement;
    mX = event.clientX;mY = event.clientY;
    sX = $(mouseTarget).offset().left;sY = $(mouseTarget).offset().top;
    sW = $(mouseTarget).width();sH = $(mouseTarget).height();
    dX = dY = dW = dH = 0;
    sideTarget = null;
    if(mouseTarget == draggedTab.parentElement.children[0] && draggedTab.parentElement.children.length<=2){
        dX=sX;dY=sY;dW=sW;dH=sH;sideTarget='center';
    }
    else if(mX>=sX && mX<=sX+0.25*sW && mY>=sY && mY<=sY+sH){//Left
        dX=sX;dY=sY;dW=sW/2;dH=sH;sideTarget='left';
    }
    else if(mX>=sX+0.75*sW && mX<=sX+sW && mY>=sY && mY<=sY+sH){//Right
        dX=sX+sW/2;dY=sY;dW=sW/2;dH=sH;sideTarget='right';
    }
    else if(mX>=sX+0.25*sW && mX<=sX+sW*0.75 && mY>=sY && mY<=sY+sH*0.25){//Up
        dX=sX;dY=sY;dW=sW;dH=sH/2;sideTarget='up';
    }
    else if(mX>=sX+0.25*sW && mX<=sX+sW*0.75 && mY>=sY+sH*0.75 && mY<=sY+sH){//Down
        dX=sX;dY=sY+sH/2;dW=sW;dH=sH/2;sideTarget='down';
    }
    else if (mX>=sX+sW*0.25 && mX<=sX+sW*0.75 && mY>=sY+0.25*sH && mY<=sY+sH*0.75){//Center
        dX=sX;dY=sY;dW=sW;dH=sH;sideTarget='center';
    }
    if(sectionTarget != lastSectionTarget || sideTarget != lastSideTarget){
        $("#dragIndic").offset({left:dX,top:dY});
        $("#dragIndic").width(dW);$("#dragIndic").height(dH);
    }
    lastSectionTarget = sectionTarget;
    lastSideTarget = sideTarget;
});
$(document).on("drop", '.paneContent',function(event){
    var targetSection = event.target.parentElement.parentElement;
    var setFirst = (sideTarget=="left" || sideTarget=="up");
    var leftRight = (sideTarget=="left" || sideTarget=="right");
    var sectionToAdd = draggedTab.parentElement.parentElement;
    var draggedTabPane = draggedTab.parentElement;
    //A et B
    if(targetSection == draggedTabPane.parentElement && draggedTabPane.parentElement.children.length==2){return;}
    if(sideTarget == 'center'){
        initialSect = draggedTab.parentElement.parentElement;
        $(targetSection.children[0]).append(draggedTab);
        if(initialSect.children[0].children.length <=1){
            if($(initialSect).next().attr('class')=='resizeVertical' || $(initialSect).next().attr('class')=='resizeHorizontal'){
                $(initialSect).next().remove();
            }else if($(initialSect).prev().attr('class')=='resizeVertical' || $(initialSect).prev().attr('class')=='resizeHorizontal'){
                $(initialSect).prev().remove();
            }
            $(initialSect).remove();
        }
    }else{
        if(draggedTabPane.children.length > 2){
            $(draggedTab).wrap('<div class="section"><div class="pane"></div></div>');
            $(draggedTab.parentElement).prepend('<div class="paneContent" ondragover="event.preventDefault()"></div>');
            $(draggedTab.parentElement.children[0]).html($(draggedTab.children[1]).html());
            sectionToAdd = draggedTab.parentElement.parentElement;
        }else{
            if($(sectionToAdd).next().attr('class')=='resizeVertical' || $(sectionToAdd).next().attr('class')=='resizeHorizontal'){
                $(sectionToAdd).next().remove();
            }else if($(sectionToAdd).prev().attr('class')=='resizeVertical' || $(sectionToAdd).prev().attr('class')=='resizeHorizontal'){
                $(sectionToAdd).prev().remove();
            }
        }
        if(setFirst){
            $(sectionToAdd).insertBefore(targetSection);
            if (leftRight){
                $(sectionToAdd).after("<div class='resizeVertical'></div>");
                $(sectionToAdd).add($(sectionToAdd).next()).add($(sectionToAdd).next().next()).wrapAll('<div class="section" id="left-right">');
            }
            else{
                $(sectionToAdd).after("<div class='resizeHorizontal'></div>");
                $(sectionToAdd).add($(sectionToAdd).next()).add($(sectionToAdd).next().next()).wrapAll('<div class="section" id="up-down"></div>');
            }
        }else{
            $(sectionToAdd).insertAfter(targetSection);
            if (leftRight){
                $(sectionToAdd).before("<div class='resizeVertical'></div>");
                $(sectionToAdd).add($(sectionToAdd).prev()).add($(sectionToAdd).prev().prev()).wrapAll('<div class="section" id="left-right"></div>');
            }else{
                $(sectionToAdd).before("<div class='resizeHorizontal'></div>");
                $(sectionToAdd).add($(sectionToAdd).prev()).add($(sectionToAdd).prev().prev()).wrapAll('<div class="section" id="up-down">');
            }
        }
    }
    correctSyntax();
    arrangeTabs();
});
$(document).on("dragend", '.label',function(event){
    $("#dragIndic").css("visibility", "hidden");
});
function allowDrop(ev) {
    ev.preventDefault();
}
//------------ TABS ------------//
function arrangeTabs(){
    sections = document.getElementsByClassName('section');
    for(var i=0;i<sections.length;i++){
        if(sections[i].children.length==1){
            showTab(sections[i].children[0].children[1]);
        }else{
            $(sections[i].children[1]).css({top:'0px',left:'0px'});
        }
    }
    controlTabSizes();
}
function showTab(tab){
    var pane = tab.parentElement;
    for(var i=1;i<pane.children.length;i++){
        dragTab = pane.children[i];
        $(dragTab).offset({left:$(pane.parentElement).offset().left+($(dragTab).width()+2)*(i-1),top:$(pane.parentElement).offset().top})
        if(i==1){
            $(dragTab).offset({left:$(dragTab.parentElement).offset().left});
        }else{
            $(dragTab).offset({left:$(pane.children[i-1]).offset().left+$(pane.children[i-1]).width()-1});
        }
        if(!dragTab.children[0]){return;}
        if(dragTab==tab){//on affiche
            $(dragTab.children[0]).css('height','31px');
            $(dragTab.children[0]).css('background-color','var(--tab_bg)');
            $(pane.children[0]).html($(dragTab.children[1]).html());
        }else{//on cache
            dragTab.children[0].style.height = "30px";
            dragTab.children[0].style.backgroundColor = $("body").css("--tab_bg_inactive");
            //$(dragTab.children[0]).css("border-left","1px solid var(--tab_bg_inactive)");
            dragTab.children[0].style.borderBottom = "0px";
        }
    }
}
function controlTabSizes(){
    panes = $('.pane');
    for(var i=0;i<panes.length;i++){
        var pane = panes[i];
        for(var j=1; j<pane.children.length; j++){
            var newWidth = $(pane).width()/(pane.children.length-1);
            $(pane.children[j]).width(newWidth);
            if(j > 1 && $(pane.children[j-1]).offset().left+$(pane.children[j-1]).width() > 0){
                $(pane.children[j]).offset({left:$(pane.children[j-1]).offset().left+$(pane.children[j-1]).width()-1});
            }
        }
    }
}
//------------ RESIZERS ------------//
$(document).on("mousedown", '.resizeHorizontal, .resizeVertical',function(event){
    grabResizer = event.target;
});
function resizing(event){
    var section = grabResizer.parentElement;
    var prev = $(grabResizer).prev();
    var next = $(grabResizer).next();
    var nbSect = $(grabResizer.parentElement).children('.section').length;
    var upDown = (grabResizer.className=="resizeHorizontal");
    var mousePos = upDown ? event.pageY-$(prev).offset().top : event.pageX-$(prev).offset().left;
    var size = upDown ? size=$(prev).height()+$(next).height() : size=$(prev).width()+$(next).width();
    if(size > 0 && mousePos*2/size < 2 && mousePos*2/size > 0){
        $(prev).css('flex-grow',mousePos*2/size);
        $(next).css('flex-grow',2-(mousePos*2/size));
    }
    controlTabSizes();
}
//------------ GENERAL ------------//
$(window).resize(function(){
    arrangeTabs();
});
$(window).on("dragover",function(event){
    if($(event.target).attr("class")=="paneContent"){
        $("#dragIndic").css("visibility", "visible");
    }else{
        $("#dragIndic").css("visibility", "hidden");
    }
});
$(window).on("mousemove", function(event){
    if(grabResizer != null){resizing(event);}
});
$(window).on("mouseup", function(event){
    grabResizer = null;
});
//Shortcuts
$.getScript("jquery.hotkeys.js", function(){
    $(document).bind('keydown', 'ctrl+A', function(){
        for(var i=0; i<$('.section').length;i++){
            if($('.section')[i].children.length==1 && $('.section')[i].children[0].children.length-1 < 42){
                $($('.section')[i].children[0]).append("<div class='dragTab'><div class='label' draggable='true'>Sans titre<div class='close'></div></div><div class='tabContent'>Onglet vide</div></div>");
                arrangeTabs();
                controlTabSizes();
                return;
            }
        }
    });
});
