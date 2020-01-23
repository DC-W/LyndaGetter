// ==UserScript==
// @name         LyndaGetter
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Download entire set of videos attached to a Lynda course
// @author       ICE
// @match        https://www.lynda.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at      document-idle
// ==/UserScript==

var data_src = new Array();
var data_Quality;
var data_links = new Array();
(function() {
    'use strict';

    setTimeout(function(){
        //check to see if it is a playlist
        if(prompt("Clear cache? Press Y to accept")===("y"||"Y")){
            GM_setValue("data_on_loop",null);
            GM_setValue("data_src",null);
            document.getElementById("banner-play").click();
        }
        if(document.getElementsByClassName("item-name video-name ga").length>0){

            if(GM_getValue('data_on_loop')==="y"){
                data_Quality = GM_getValue('data_q');
                data_links = JSON.parse(GM_getValue("data_links"));
                loopThroughLinks();
            }else{
                var val = prompt("Press Y to download this playlist");
                if(val==="Y"|val === "y"){
                    if(GetVideoQualityOptions()){
                        data_Quality = GM_getValue('data_q');
                        initDownload();
                    }

                }
            }

        }
    },1000);

})();

function initDownload(){
    try{
        //is in download loop? yes
        GM_setValue('data_on_loop', 'y');
        get_TOC_list();

    }catch(err){
        errCatch(err);
    }
}

function GetVideoQualityOptions(){
    try{
        //get UL LI list of elements
        var lis = document.getElementsByClassName("stream-qualities")[0].getElementsByTagName("li");
        var quality_types = "Video quality types available --> ";
        //just loop and display all available qualities
        for(const li_val of lis ){
            quality_types = quality_types + "  -  " + li_val.getElementsByTagName("a")[0].getAttribute("data-quality") + "px  -  ";
            data_Quality = li_val.getElementsByTagName("a")[0].getAttribute("data-quality");
        }
        alert(quality_types);
        alert("Press Y to select a desired quality, press anything else to skip to next quality, if nothing is selected then defaulted quality is maximum");
        //look for Y to pick then break loop or N to continue loop
        //if nothing is selected then defaulted quality is maximum
        var ret = false;
        for(const li_val of lis ){
            var val = li_val.getElementsByTagName("a")[0].getAttribute("data-quality");
            var ch = prompt(val);
            if(ch==="Y" || ch==="y"){
                data_Quality = li_val.getElementsByTagName("a")[0].getAttribute("data-quality");
                ret = true;
                break;
            }else{

            }
        }
        GM_setValue('data_q', data_Quality);
        alert("Selected Download Quality is " + data_Quality + "px, starting download now...");
        return true;
    }catch(err){
        errCatch(err);
        return false;
    }
}

function get_TOC_list(){
    var link_list = document.getElementsByClassName("item-name video-name ga");
    for(var aa of link_list){
        var val = aa.href;
        if(val.indexOf("?") !== -1){
            val = val.split("?", 1);
            val = val + "";
        }

        data_links.push(val);
    }
    GM_setValue("data_links",JSON.stringify(data_links));
    location.reload();
}

function loopThroughLinks(){
    document.getElementById("banner-play").click();
    var vid = document.getElementsByTagName("video")[0];

    vid.addEventListener("playing", function() {
        if(vid.currentTime > 0 && !vid.paused && !vid.ended && vid.readyState > 2){

            var q_li = document.getElementsByClassName("stream-qualities")[0].getElementsByTagName("li");
            for(var y of q_li){
                if(y.getElementsByTagName("a")[0].getAttribute("data-quality") === data_Quality){
                    y.getElementsByTagName("a")[0].click();
                }
            }

            if(+data_links.indexOf(location.href) + +1 !== data_links.length){
                //not final link

                if(GM_getValue("data_src")!==null){
                    data_src = JSON.parse(GM_getValue("data_src"));
                }
                data_src.push(document.getElementsByTagName("video")[0].getAttribute("src"));
                GM_setValue("data_src",JSON.stringify(data_src));
                for(var z of data_src){
                    console.log(z);
                }
                vid.pause();
                alert("Copied "+data_src.length+" of "+data_links.length);
                location.href = data_links[+data_links.indexOf(location.href) + +1];
            }else{
                //final link
                data_src = JSON.parse(GM_getValue("data_src"));
                data_src.push(document.getElementsByTagName("video")[0].getAttribute("src"));
                GM_setValue("data_src",JSON.stringify(data_src));

                for(var x of data_src){
                    console.log(x);
                }
                alert("All download links Collected");
            }

        }

    });



}

function errCatch(errorx){
    console.log("Lynda Getter Error! --> "+errorx);
    alert("Something went wrong :C");
}




