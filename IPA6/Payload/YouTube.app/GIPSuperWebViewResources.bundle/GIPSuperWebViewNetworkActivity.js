// Copyright 2011 Google Inc. All Rights Reserved.

/**
 * @fileoverview SuperWebView's Network Activity API.
 * @author dominicl@google.com (Dominic Leung)
 */
(function() {
 if (!navigator || navigator.googleNetworkActivity) {
   return;
 }

 var networkActivityApi = {
   apiVersion: 1
 };

 /**
  * Start a network activity
  */
 networkActivityApi.startActivity = function() {
   navigator.googleInternal.dispatch('googlenetworkactivity', 'startActivity');
 };

 /**
  * End a network activity
  */
 networkActivityApi.endActivity = function() {
   navigator.googleInternal.dispatch('googlenetworkactivity', 'endActivity');
 };

 navigator.googleNetworkActivity = networkActivityApi;
})();
