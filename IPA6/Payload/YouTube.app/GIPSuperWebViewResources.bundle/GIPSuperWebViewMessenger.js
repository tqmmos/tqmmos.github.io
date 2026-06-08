// Copyright 2010 Google Inc. All Rights Reserved.

/**
 * @fileoverview Implementation of iframe messenger, facilitates faster
 * communication from Native to Web. We use an iframe to open a custom http
 * request, the native application intercepts this and if it wants to send
 * some JavaScript to web it responds with the JavaScript content. The behavior
 * in this file will detect the onload event of the iframe, and eval the body
 * content. This achieves the same thing as
 * stringByEvaluatingJavaScriptFromString (without the return value), but is
 * significantly faster in applications with complicated DOM structures.
 *
 * @author rjfioravanti@google.com (Ryan Fioravanti)
 */
(function() {
  if (!navigator || navigator.messenger) {
    return;
  }

  var messenger = {
    apiVersion: 1,
    /**
     * The iframe element.
     * @type {Element}
     * @private
     */
    iframe_: undefined,
    /**
     * Whether the messenging is installed.
     * @type {boolean}
     * @private
     */
    installed_: false,
    /**
     * Pending timer id of iframe request.
     * @type {number}
     * @private
     */
    timerId_: undefined,
    /**
     * Timeout value for iframe requests.
     * @type {number}
     * @private
     */
    REQUEST_TIMEOUT_: 5000
  }

  /**
   * Install the messenger. You must invoke this function before fast messaging
   * will work.
   */
  messenger.install = function() {
    if (messenger.installed_) {
      return;
    }
    window.setTimeout(messenger.requestTimeoutFn_, 0);
    messenger.installed_ = true;
  };

  /**
   * Timeout function, executed every timeout or whenever we want to force
   * a new request.
   * @private
   */
  messenger.requestTimeoutFn_ = function() {
    messenger.iframeCleanup_();
    messenger.iframeSetup_();
  };

  /**
   * Removes current iframe (which will cancel pending request if there is one).
   * @private
   */
  messenger.iframeCleanup_ = function() {
    if (messenger.iframe_ && messenger.iframe_.parentNode) {
      messenger.iframe_.parentNode.removeChild(messenger.iframe_);
      messenger.iframe_ = null;
    }
  };

  /**
   * Setup new iframe, initiates a new request.
   * @private
   */
  messenger.iframeSetup_ = function() {
    if (messenger.iframe_) {
      return;
    }
    var iframe = document.createElement('iframe');
    iframe.src = window.location.protocol + window.location.host +
        '/googleWebMessage';

    iframe.style.cssText = 'position:absolute;top:-5000px;height:2px;';
    iframe.onload = messenger.iframeOnload_;
    document.body.appendChild(iframe);
    messenger.iframe_ = iframe;
    window.clearTimeout(messenger.timerId_);
    messenger.timerId_ = window.setTimeout(messenger.requestTimeoutFn_,
        messenger.REQUEST_TIMEOUT_);
  };

  /**
   * Iframe is loaded which means we got a successful response. Eval the
   * body as JavaScript and open up a new request.
   * @private
   */
  messenger.iframeOnload_ = function() {
    var childWindow = messenger.iframe_.contentWindow;
    if (childWindow) {
      var childDocument = childWindow.document;
      if (childDocument && childDocument.body) {
        var js = childDocument.body.innerHTML;
        eval(js);
      }
    }
    window.setTimeout(messenger.requestTimeoutFn_, 0);
  };

  navigator.messenger = messenger;
})();
