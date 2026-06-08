// Copyright 2011 Google Inc. All Rights Reserved.

(function() {
  if (!navigator || navigator.navigationBar) {
    return;
  }

  var navigationBar = {
    apiVersion: 1
  };

  /** Sets the title of the navigation bar. */
  navigationBar.setTitle = function(title) {
    navigator.googleInternal.dispatch('navigationBar', 'setTitle',
        { title: title });
  };

  navigator.navigationBar = navigationBar;
})();
