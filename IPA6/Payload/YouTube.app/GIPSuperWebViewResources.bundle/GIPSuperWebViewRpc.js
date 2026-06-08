// Copyright 2010 Google Inc. All Rights Reserved.

/**
 * @fileoverview SuperWebView's RPC API.
 * @author sharvil@google.com (Sharvil Nanavati)
 */
(function() {
  if (!navigator ||
      (navigator.googleRpc && !navigator.googleRpc.init)) {
    return;
  }

  var rpc = {
    apiVersion: 1,
    /**
     * The function to call when a broadcast message is received by this
     * SuperWebView.
     * @private
     */
    callbackListener_: null
  };
  /**
   * Broadcasts the specified object to all SuperWebViews that share a common
   * GIPWebViewRpc. The message will also be delivered to this SuperWebView.
   * @param {!Object} message The message object to broadcast.
   */
  rpc.broadcast = function(message) {
    navigator.googleInternal.dispatch('rpc', 'broadcast', message);
  };
  /**
   * @param {function(!Object)} onRecv Function to call when a message is
   *     received by this SuperWebView.
   */
  rpc.register = function(onRecv) {
    this.callbackListener_ = onRecv;
  };
  /**
   * Called by native code when a broadcast message is received
   * @param {string} message Broadcast message as serialized key/value pairs.
   */
  rpc.callback_ = function(message) {
    if (this.callbackListener_) {
      var obj = navigator.googleInternal.deserialize_(message);
      this.callbackListener_(obj);
    }
  };
  navigator.googleRpc = rpc;
})();
