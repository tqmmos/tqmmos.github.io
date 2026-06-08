// Copyright 2010 Google Inc. All Rights Reserved.

/**
 * @fileoverview Implementation of keyboard API.
 *
 * @author rjfioravanti@google.com (Ryan Fioravanti)
 */
(function() {
  if (!navigator || navigator.keyboard) {
    return;
  }

  var keyboard = {
    apiVersion: 1
  };

  /**
   * Enable the keyboard toggler.
   */
  keyboard.addToggler = function() {
    navigator.googleInternal.dispatch('keyboard', 'addToggler', {});
  };

  /**
   * Remove the keyboard toggler.
   */
  keyboard.removeToggler = function() {
    navigator.googleInternal.dispatch('keyboard', 'removeToggler', {});
  };

  navigator.keyboard = keyboard;
})();
