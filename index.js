window.$ = window.jQuery = require('jquery');

var mouseInLabel = null;
var lastSectionTarget = null;
var lastSideTarget = null;
var dragging = null;
var resizers = $(".resizeHorizontal").add(".resizeVertical");
var grabResizer = null;

function init(){
    arrangeTabs();
}

//------------ LABELS ------------//
$('.label').on('mouseenter', function(event){
    $(event.target).children(".close").fadeIn();
});
$('.label').on('mouseleave', function(event){
    $(event.target).children(".close").fadeOut();
});
$(".label").on("mouseenter", function(event){
    mouseInLabel = $(this);
    this.children[0].style="animation: fadein 0.25s forwards;";
    console.log('TEEEEST');
});
$(".label").on("mouseleave",function(event){
    mouseInLabel = null;

    this.children[0].style="animation: fadeout 0.25s backwards;";
    console.log('leave');
});
$(".label").on("click",function(event){
    tab = event.target.parentElement;
    showTab(tab.parentElement, tab);
});
$(".close").on("click",function(event){
    tab = event.target.parentElement.parentElement;
    section = tab.parentElement;
    if(section.children.length <= 2){//Sections modif
        superSection = section.parentElement;
        var j = Array.prototype.indexOf.call(superSection.children, tab.parentElement);
        var toConserv = j==0 ? superSection.children[2] : superSection.children[0];
        $(superSection).replaceWith(toConserv);
        $(superSection).removeAttr('id');
    }else{//Tabs modifs
        var i = Array.prototype.indexOf.call(tab.parentElement.children, tab);
        tab.remove();
        if(i>=2){showTab(section, section.children[i-1]);}
        else if(i==1){showTab(section, section.children[1]);}
    }
});
//------------ DRAG & DROP ------------//
$(".label").on("dragstart",function(event){
    dragging = this.parent;
});
$(".label").on("drag",function(event){
    mX = event.clientX;mY = event.clientY;
    wW = $(window).width();wH = $(window).height();
});
$(".label").on("dragover",function(event){
    lastSectionTarget = null;
    lastSideTarget = null;
});
$(".sectionContent").on("dragover",function(event){
    //event.stopPropagation();
    mouseTarget = event.target;
    mX = event.clientX;mY = event.clientY;
    sX = $(event.target).offset().left;sY = $(event.target).offset().top;
    sW = $(event.target).width();sH = $(event.target).height();
    dX = dY = dW = dH = 0;
    sideTarget = null;

    if(mX>=sX && mX<=sX+0.25*sW && mY>=sY && mY<=sY+sH){//Left
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

    if(event.target != lastSectionTarget || sideTarget != lastSideTarget){
        $("#dragIndic").offset({left:dX,top:dY});
        $("#dragIndic").width(dW);$("#dragIndic").height(dH);
    }
    lastSectionTarget = event.target;
    lastSideTarget = sideTarget;
});
$(".label").on("dragend",function(event){
    dragging = null;
    $("#dragIndic").css("visibility", "hidden");
});
function allowDrop(ev) {
    ev.preventDefault();
}

//------------ TABS ------------//

function arrangeTabs(){
    sections = document.getElementsByClassName('section');
    for(var i=0;i<sections.length;i++){
        showTab(sections[i], sections[i].children[1]);
    }
}

function showTab(section, tab){
    j = 0;
    for(var i=0;i<section.children.length;i++){
        if (section.children[i].className == "dragTab") {
            dragTab = section.children[i];

            //on positionne label
            $(dragTab).offset({left:$(section).position().left+$(dragTab).width()*j,top:$(section).position().top});
            if(dragTab==tab){//on affiche
                dragTab.children[0].style.height = "30px";
                dragTab.children[0].style.backgroundColor = $("body").css("--tab_bg");

                $(section).children('.sectionContent').html($(dragTab.children[1]).html());
            }else{//on cache
                dragTab.children[0].style.height = "29px";
                dragTab.children[0].style.backgroundColor = $("body").css("--tab_bg_inactive");
                dragTab.children[0].style.borderBottom = "0px";
            }
            j ++;
        }
    }
}

//------------ RESIZERS ------------//
$(resizers).on("mousedown", function(event){
    grabResizer = event.target;
});
resizers.resizing = function(event){
    var section = grabResizer.parentElement;
    var i = Array.prototype.indexOf.call(section.children, grabResizer);
    var prev = section.children[i-1];
    var next = section.children[i+1];
    var upDown = (grabResizer.className=="resizeHorizontal");
    var mouseY = upDown ? event.pageY : event.pageX;
    var size = upDown ? size=$(section).height()/2 : size=$(section).width()/2;
    if(size !=0){
        $(prev).css('flex-grow',mouseY/size);
        $(next).css('flex-grow',2-(mouseY/size));
    }
    //Ajustement taille labels
    if(upDown){

    }else{
        controlTabSizes(prev);
        controlTabSizes(next);

    }
}
function controlTabSizes(section){
    tabs = section.children;
    if((tabs.length-1)*$(tabs[1]).width() > $(".dragTab").css('max-width').replace('px','')){
        for(var i=1; i<tabs.length; i++){
            var newWidth = $(section).width()/(tabs.length-1);
            if(newWidth > $(".dragTab").css('min-width').replace('px','')){
                $(tabs[i]).width(newWidth);
                $(tabs[i]).offset({left:$(section).position().left+$(tabs[i]).width()*(i-1),top:$(section).position().top});
            }
        }
    }
}
//------------ GENERAL ------------//

$(window).on("dragover",function(event){
    if($(event.target).attr("class")=="sectionContent"){
        $("#dragIndic").css("visibility", "visible");
    }else{
        $("#dragIndic").css("visibility", "hidden");
    }
});
$(window).on("mousemove", function(event){
    if(grabResizer != null){resizers.resizing(event);}
});
$(window).on("mouseup", function(event){
    grabResizer = null;
});
