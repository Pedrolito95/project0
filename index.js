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
    sections = $('flexipane-section');
    for(var i=0;i<sections.length;i++){
        if(sections[i].children.length<=1 && sections[i].children[0].className=='section'){
            $(sections[i].children[0]).unwrap();
        }
    }
    sections = $('flexipane-section');
    for(var i=0;i<sections.length;i++){
        if(sections[i].className == 'row' || sections[i].className == 'column'){
            for(var j=0; j<sections[i].children.length;j++){
                if(sections[i].className == sections[i].children[j].className){
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
        if($(section).prev().prop('tagName') == 'flexipane-resize'){
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
$(document).on("dragover", 'flexipane-paneContent',function(event){
    console.log('OOOOOKKKK4');
    event.preventDefault();
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
        $("flexipane-dragIndic").offset({left:dX,top:dY});
        $("flexipane-dragIndic").width(dW);$("flexipane-dragIndic").height(dH);
    }
    lastSectionTarget = sectionTarget;
    lastSideTarget = sideTarget;
});
$(document).on("drop", 'flexipane-paneContent',function(event){
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
            if($(initialSect).next().prop('tagName') == 'flexipane-resize'){
                $(initialSect).next().remove();
            }else if($(initialSect).prev().prop('tagName') == 'flexipane-resize'){
                $(initialSect).prev().remove();
            }
            $(initialSect).remove();
        }
    }else{
        if(draggedTabPane.children.length > 2){
            $(draggedTab).wrap('<flexipane-section><div class="pane"></div></flexipane-section>');
            $(draggedTab.parentElement).prepend('<flexipane-paneContent ondragover="event.preventDefault()"></flexipane-paneContent>');
            $(draggedTab.parentElement.children[0]).html($(draggedTab.children[1]).html());
            sectionToAdd = draggedTab.parentElement.parentElement;
        }else{
            if($(sectionToAdd).next().prop('tagName') == 'flexipane-resize'){
                $(sectionToAdd).next().remove();
            }else if($(sectionToAdd).prev().prop('tagName') == 'flexipane-resize'){
                $(sectionToAdd).prev().remove();
            }
        }
        if(setFirst){
            $(sectionToAdd).insertBefore(targetSection);
            if (leftRight){
                $(sectionToAdd).after("<flexipane-resize class='vertical'></div>");
                $(sectionToAdd).add($(sectionToAdd).next()).add($(sectionToAdd).next().next()).wrapAll('<flexipane-section class="row"></flexipane-section>');
            }
            else{
                $(sectionToAdd).after("<flexipane-resize class='horizontal'></div>");
                $(sectionToAdd).add($(sectionToAdd).next()).add($(sectionToAdd).next().next()).wrapAll('<flexipane-section class="column"></flexipane-section>');
            }
        }else{
            $(sectionToAdd).insertAfter(targetSection);
            if (leftRight){
                $(sectionToAdd).before("<flexipane-resize class='vertical'></div>");
                $(sectionToAdd).add($(sectionToAdd).prev()).add($(sectionToAdd).prev().prev()).wrapAll('<flexipane-section class="row"></flexipane-section>');
            }else{
                $(sectionToAdd).before("<flexipane-resize class='horizontal'></div>");
                $(sectionToAdd).add($(sectionToAdd).prev()).add($(sectionToAdd).prev().prev()).wrapAll('<flexipane-section class="column"></felxipane-section>');
            }
        }
    }
    correctSyntax();
    arrangeTabs();
});
$(document).on("dragend", '.label',function(event){
    $("flexipane-dragIndic").css("visibility", "hidden");
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
            dragTab.children[0].style.borderBottom = "0px";
        }
    }
}
function controlTabSizes(){
    panes = $('flexipane-pane');
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
$(document).on("mousedown", 'flexipane-resize',function(event){
    grabResizer = event.target;
});
function resizing(event){
    var section = grabResizer.parentElement;
    var prev = $(grabResizer).prev();
    var next = $(grabResizer).next();
    var nbSect = $(grabResizer.parentElement).children('flexipane-section').length;
    var upDown = (grabResizer.className=="horizontal");
    var mousePos = upDown ? event.pageY-$(prev).offset().top : event.pageX-$(prev).offset().left;
    var size = upDown ? size=$(prev).height()+$(next).height() : size=$(prev).width()+$(next).width();
    var flex = parseFloat($(prev).css('flex-grow'))+parseFloat($(next).css('flex-grow'));
    console.log(flex);
    if(mousePos*flex/size > flex){mousePos = size;}
    else if(mousePos*flex/size < 0){mousePos = 0;}
    if(size > 0){
        $(prev).css('flex-grow',mousePos*flex/size);
        $(next).css('flex-grow',flex-(mousePos*flex/size));
    }
    controlTabSizes();
}
//------------ GENERAL ------------//
$(window).resize(function(){
    arrangeTabs();
});
$(window).on("dragover",function(event){
    console.log($(event.target).prop('tagName'));
    if($(event.target).prop('tagName')=="FLEXIPANE-PANECONTENT"){
        console.log($(event.target).prop('PUTAAAAAAIN'));
        $("flexipane-dragIndic").css("visibility", "visible");
    }else{
        $("flexipane-dragIndic").css("visibility", "hidden");
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
        for(var i=0; i<$('flexipane-section').length;i++){
            if($('flexipane-section')[i].children.length==1 && $('flexipane-section')[i].children[0].children.length-1 < 42){
                $($('flexipane-section')[i].children[0]).append("<flexipane-dragTab><div class='label' draggable='true'>Sans titre<div class='close'></div></div><div class='tabContent'>Onglet vide</div></div>");
                arrangeTabs();
                controlTabSizes();
                return;
            }
        }
    });
});
