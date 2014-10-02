/*global $, navigator, FastClick, StatusBar */
var isIEMobile = /IEMobile/.test(navigator.userAgent),
    isAndroid = /Android|\bSilk\b/.test(navigator.userAgent),
    isiOS = /iP(ad|hone|od)/.test(navigator.userAgent);

// Prevent caching of AJAX requests on Android and Windows Phone devices
if (isAndroid) {
    $(this).ajaxStart(function(){
        try {
            navigator.app.clearCache();
        } catch (err) {}
    });
} else if (isIEMobile) {
    $.ajaxSetup({
        "cache": false
    });
}

$(document)
.ready(function() {
    //Attach FastClick handler
    FastClick.attach(document.body);

    var options = "enableViewportScale=yes";

    //Use system browser for links on iOS and Windows Phone
    if (isiOS) {
        options = "location=no,enableViewportScale=yes,toolbarposition=top,closebuttoncaption=Done";
    }

    $.mobile.document.on("click",".iab",function(){
        var button = $(this),
            iab = window.open(this.href,"_blank","location=no,enableViewportScale=yes,toolbarposition=top,closebuttoncaption=Done");

        if (isIEMobile) {
            $.mobile.document.data("iabOpen",true);
            iab.addEventListener("exit",function(){
                $.mobile.document.removeData("iabOpen");
            });
        }

        setTimeout(function(){
            button.removeClass("activeButton");
        },100);
        return false;
    });

})
.one("deviceready", function() {
    try {
        //Change the status bar to match the headers
        StatusBar.overlaysWebView(false);
        StatusBar.styleDefault();
        StatusBar.backgroundColorByHexString("#F9F9F9");
    } catch (err) {}

    // Hide the splash screen
    setTimeout(function(){
        try {
            navigator.splashscreen.hide();
        } catch(err) {}
    },500);

    // For Android, Blackberry and Windows Phone devices catch the back button and redirect it
    $.mobile.document.on("backbutton",function(){
        if (isIEMobile && $.mobile.document.data("iabOpen")) {
            return false;
        }
    });

    isReady = true;
})
.one("mobileinit", function(){
    //After jQuery mobile is loaded set intial configuration
    $.mobile.activeBtnClass = "activeButton";
    setTimeout(function(){
    $("#left-panel").enhanceWithin().panel();
    },200);
    
})
.on("resume",function(){
// Handle OS resume event triggered by PhoneGap
})
.on("pause",function(){
//Handle OS pause
})
.on("pagebeforeshow",function(e){
    var page = $(e.target);

    fixInputClick(page);
});

//Set AJAX timeout
$.ajaxSetup({
    timeout: 10000
});

function fixInputClick(page) {
    // Handle Fast Click quirks
    if (!FastClick.notNeeded(document.body)) {
        page.find("input[type='checkbox']:not([data-role='flipswitch'])").addClass("needsclick");
        page.find(".ui-collapsible-heading-toggle").on("click",function(){
            var heading = $(this);

            setTimeout(function(){
                heading.removeClass("activeButton");
            },100);
        });
        page.find(".ui-select > .ui-btn").each(function(a,b){
            var ele = $(b),
                id = ele.attr("id");
            ele.attr("data-rel","popup");
            ele.attr("href","#"+id.slice(0,-6)+"listbox");
        });
    }
}

$( document ).on( "pagecreate", function() {
    $( document ).on( "swipeleft swiperight", function( e ) {
        // We check if there is no open panel on the page because otherwise
        // a swipe to close the left panel would also open the right panel (and v.v.).
        // We do this by checking the data that the framework stores on the page element (panel: open).
        if ( $( ".ui-page-active" ).jqmData( "panel" ) !== "open" ) {
            if ( e.type === "swipeleft" ) {
                $( "#right-panel" ).panel( "open" );
            } else if ( e.type === "swiperight" ) {
                $( "#left-panel" ).panel( "open" );
            }
        }
    });
});