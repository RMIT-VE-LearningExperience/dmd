(function(){
    var bodyReset = '';

    var w = '820px'; // Specify the maximum width of iframe

    // Check for testing environment
    var hostname = window.location.hostname;
    var widgetVersion = '/makatea';
    var origin = 'https://1stavailable.com.au';
    if (hostname.match(/localhost|(^|\.)1stavailable\.com\.au|(^|\.)myhealth1st\.com\.au/ig)) origin = window.location.protocol + '//' + window.location.host;
    else if (hostname.match(/^test1stavailable\.com\.au/ig)) origin = 'https://makatea.1stavailable.com.au';
    else widgetVersion = '';

    var getScrollPosition = function() {
        return (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
    }

    var createWidget = function(widgetEl, type) {
        var button = widgetEl;
        var wid_id = button.id;
        //get the source tracking parameter from HTML
        var sourceTrackingName = button.getAttribute("data-mh1-source");

        // Create popup
        var popup = document.createElement('div');

        // Insert the overlay into the DOM after the button element
        if (widgetEl.tagName == 'LI')  {
            document.body.appendChild(popup);
            document.getElementsByTagName("body")[0].style.overflow = "auto";
        }
        else {
             document.body.appendChild(popup);
        }

        // Click event to show the overlay and widget iframe
        button.onclick = function(e) {
                var wid_id = this.id;
                var wid_skin = this.getAttribute('skin');

                // Disable the default click handler for the popup button
                if (!e) e = window.event;
                if (e.preventDefault) e.preventDefault();
                e.returnValue = false;

                // store body inline styles so they can be reset
                bodyReset = document.body.style.cssText;

                // Background element + styling
                var bg = document.createElement('div');
                bg.style.position = "fixed";
                bg.style.zIndex = "0";
                bg.style.width = "100%";
                bg.style.height = "200%";
                bg.style.top = "0";
                bg.style.left = "0";

                // Background tranparent background
                try {
                    bg.style.backgroundColor = "rgba(0,0,0,0.85)";
                }
                catch (e) { // No rgba support - probably ie 7 or 8
                    if ((navigator.appVersion.indexOf("MSIE 7.")!=-1) || (navigator.appVersion.indexOf("MSIE 8.")!=-1)) { // ie7/8
                        bg.style.background = "url(#)"; // workaround to make transparent div clickable
                        bg.style.filter = "progid:DXImageTransform.Microsoft.gradient(startColorstr=#CC000000, endColorstr=#CC000000)";

                        if (document.compatMode != 'CSS1Compat') { // Quirks mode
                            bg.style.position = "absolute";
                        }
                    }
                    else { // fallback no tranparency
                        bg.style.backgroundColor = "black";
                    }
                }

                // close button element + styling
                var close = document.createElement('a');
                close.style.position = 'relative';
                close.style.top = '0';
                close.style.right = '.2em';
                close.style.float = 'right';
                close.style.fontSize = '48px';
                close.style.zIndex = '1';
                close.style.lineHeight = '1';
                close.style.margin = '0';
                close.style.textDecoration = 'none';
                close.style.color = '#888';
                close.style.cursor="pointer";
                close.innerHTML = ' &times; ';


                // iframe container element + styling
                var iframeContainer = document.createElement('div');
                iframeContainer.style.margin = '0 auto';
                iframeContainer.style.overflow = 'auto';
                iframeContainer.style['-webkit-overflow-scrolling'] = 'touch';
                iframeContainer.style.position = 'relative';
                iframeContainer.style.width = '100%';
                iframeContainer.style.maxWidth = w;
                iframeContainer.style.height = '100%';
                iframeContainer.style.filter = 'none';
                iframeContainer.style.border = 'none';

                // iframe element + styling
                var iframe = document.createElement('iframe');
                iframe.style.boxSizing = 'border-box';
                iframe.style.padding = '0';
                iframe.style.margin = '0';
                iframe.style.border = 'none';
                iframe.style.position = 'absolute';
                iframe.style.top = '0';
                iframe.style.left = '0';
                iframe.style.width = '100%';
                iframe.style.height = '100%';
                iframe.setAttribute('width', '100%');
                iframe.setAttribute('height', '100%');
				
                if(sourceTrackingName){
                    iframe.setAttribute('src', origin +'/AppointmentWidget'+ widgetVersion +'?theme=popup&source='+sourceTrackingName+'&'+ type +'_id='+wid_id + (wid_skin ? '&skin='+wid_skin : ''));
                }else{
                    iframe.setAttribute('src', origin +'/AppointmentWidget'+ widgetVersion +'?theme=popup&'+ type +'_id='+wid_id + (wid_skin ? '&skin='+wid_skin : ''));
                }

                // add iframe to its container
                iframeContainer.appendChild(iframe);

                // popup styling
                popup.style.display = "none";
                popup.style.position = "absolute";
                popup.style.zIndex = "999999";
                popup.style.textAlign = "center";
                popup.style.top = "0";
                popup.style.left = "0";
                popup.style.width = "100%";
                if (
                    (navigator.appVersion.indexOf("MSIE 7.") != -1) ||
                    (navigator.appVersion.indexOf("MSIE 8.") != -1) ||
                    (navigator.appVersion.indexOf("MSIE 9.") != -1)
                ) popup.style.height = "100%";

                // add elements to popup
                popup.appendChild(bg);
                popup.appendChild(close);
                popup.appendChild(iframeContainer);

                // Click event to hide the overlay
                popup.getElementsByTagName('a')[0].onclick = function(e) {
                  // hide popup
                  popup.style.display = 'none';

                  // clear popup children
                  while (popup.lastChild) {
                      popup.removeChild(popup.lastChild);
                  }

                  // reset document styling
                  document.body.style.cssText = bodyReset;

                  // reset document scroll position
                  window.scrollTo(0, parseInt(popup.style.top));

                  // ie7-8 quirks mode popup positioning workarounds
                  if (((navigator.appVersion.indexOf("MSIE 7.")!=-1) || (navigator.appVersion.indexOf("MSIE 8.")!=-1)) && (document.compatMode != 'CSS1Compat')) { // ie7/8 quirks mode
                      document.getElementsByTagName("body")[0].style.overflow = "auto";
                      popup.getElementsByTagName('div')[0].style.width = '80%';
                  }
                };

                // prevent click events propagating though the iframe
                popup.getElementsByTagName('iframe')[0].onclick = function(e) {
                        if (!e) e = window.event;
                        e.cancelBubble = true;
                        if (e.stopPropagation) e.stopPropagation();
                };

                // show and position popup
                popup.style.display = 'block';
                popup.style.top = getScrollPosition() + 'px';

                // adjust popup height to account for close button on narrow screens
                popup.style.height = "calc(100% - "+ iframeContainer.offsetTop +"px)";

                // prevent scrolling on document
                document.body.style.top = (getScrollPosition() * -1) + 'px';
                document.body.style.overflow = 'hidden'
                document.body.style.position = 'fixed';
                document.body.style.width = '100%';
                document.body.style.height = '100%';
                if (navigator.appVersion.indexOf("MSIE")) document.body.style.overflow = 'visible';

                // ie7-8 quirks mode popup positioning
                if (((navigator.appVersion.indexOf("MSIE 7.") != -1) || (navigator.appVersion.indexOf("MSIE 8.") != -1)) && (document.compatMode != 'CSS1Compat')) { // ie7/8 quirks mode
                    document.getElementsByTagName("body")[0].style.overflow = "hidden";
                    popup.style.width = document.body.clientWidth + 'px';
                    popup.style.height = document.body.clientHeight + 'px';
                    popup.style.top = getScrollPosition() + 'px';
                    if (popup.getElementsByTagName('div')[1].offsetWidth > 800) {
                        popup.getElementsByTagName('div')[1].style.width = '800px';
                    }
                }

                return false;
        };
    }

    var widget_setup = function() {
        var firstAvailableMenulist = document.getElementById('menu1st');

        // prevent # link scrolling to the top
        if (firstAvailableMenulist) {
            firstAvailableMenulist.onclick = function(e) {
                if (!e) e = window.event;
                if (e.preventDefault) e.preventDefault();
            }
        }

        var practiceList = document.getElementsByClassName('1stAvailableWidget');
        for (var i = 0; i < practiceList.length; i++) {
            createWidget(practiceList[i], 'practice');
        }

        var practitionerList = document.getElementsByClassName('1stAvailableWidget2');
        for (var i = 0; i < practitionerList.length; i++) {
            createWidget(practitionerList[i], 'practitioner');
        }

    };


    var onload_old = window.onload;
    window.onload = function() {
        if (onload_old) {
            onload_old();
        }

        widget_setup();
    };

})();