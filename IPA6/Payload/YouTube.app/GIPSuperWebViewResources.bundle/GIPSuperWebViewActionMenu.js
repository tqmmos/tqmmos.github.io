// Copyright 2012 Google Inc. All Rights Reserved.

/**
 * @fileoverview SuperWebView's Action Menu API.
 *
 * @author donnadupuis@google.com (Donna Dupuis)
 */
(function() {
  if (!navigator || navigator.actionMenu) {
    return;
  }

  var actionMenu = {
    apiVersion: 1
  };

  /**
   * The JS callback for returning the selected menu item as the index of the
   * button pressed. The index corresponds to the list order of the menu label
   * imposed by the client. The client code is responsible for mapping this
   * index to an appropriate action and applying the action. Clicking cancel
   * does not invoke the callback.
   * @type {!function(number))|undefined}
   * @private
   */
  actionMenu.currentActionMenuCallback_;

  /**
   * Populate and show a native action menu.
   * @param {!function(number)} selectionCallback The function called upon
   *     selecting a menu item.
   * @param {!Array.<string>} actionLabels The labels for the menu buttons.
   * @param {string} cancelLabel The label for the cancel button.
   * @param {!Array.<number>=} opt_invokingRect The coordinates and
   *     dimensions of the invoking element, as required by 'CGRectMake':
   *     [starting x-coordinate, starting y-coordinate, width, height].
   * @param {boolean=} opt_topButtonDestructive True if the first button in the
   *     menu is destructive, false otherwise.
   */
  actionMenu.showNativeActionMenu = function(selectionCallback, actionLabels,
      cancelLabel, opt_invokingRect, opt_topButtonDestructive) {
    this.currentActionMenuCallback_ = selectionCallback;
    var topButtonDestructive = !!opt_topButtonDestructive;
    opt_invokingRect ?
        navigator.googleInternal.dispatch(
            'actionmenu',
            'showActionMenuFromRect',
            {buttonRect: opt_invokingRect,
            actionLabels: actionLabels,
            cancelLabel: cancelLabel,
            topButtonDestructive: topButtonDestructive}) :
        navigator.googleInternal.dispatch(
            'actionmenu',
            'showActionMenu',
            {actionLabels: actionLabels,
            cancelLabel: cancelLabel,
            topButtonDestructive: topButtonDestructive});
  };

  navigator.actionMenu = actionMenu;
})();
