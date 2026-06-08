// Copyright 2010 Google Inc. All Rights Reserved.

/**
 * @fileoverview SuperWebView's GPS API.
 *
 * Intended to mimick the HTML5 Geo API.
 * @See http://dev.w3.org/geo/api/spec-source.html
 *
 * @author rjfioravanti@google.com (Ryan Fioravanti)
 */
(function() {
  if (!navigator || navigator.googleGps) {
    return;
  }

  var gpsApi = {
    apiVersion: 1,
    /**
     * Holds the next unique request id.
     * @type {number}
     * @private
     */
    nextRequestId_: 1,
    /**
     * Map of request/watch ids to metadata.
     * @type {Object}
     * @private
     */
    idMetaDataMap_: {}
  }

  /**
   * Request current location from Core Location services.
   * @param {Function} onSuccess Callback method called when request completes.
   * @param {Function} onError Callback method called when request fails.
   */
  gpsApi.getCurrentPosition = function(onSuccess, onError) {
    var requestId = this.nextRequestId_++;
    var metaData = {onSuccess: onSuccess, onError: onError};
    this.idMetaDataMap_[requestId] = metaData;
    navigator.googleInternal.dispatch('gps', 'getCurrentPosition',
        {requestId: requestId});
  };

  /**
   * Request a stream of locations from Core Location services.
   * @param {Function} onSuccess Callback method called when request completes.
   * @param {Function} onError Callback method called when request fails.
   * @return {number} The watchId that you can use to clearWatch.
   */
  gpsApi.watchPosition = function(onSuccess, onError) {
    var watchId = this.nextRequestId_++;
    var metaData = {onSuccess: onSuccess, onError: onError, watching: true};
    this.idMetaDataMap_[watchId] = metaData;
    navigator.googleInternal.dispatch('gps', 'watchPosition',
        {watchId: watchId});
    return watchId;
  };

  /**
   * Clear an ongoing location watch.
   * @param {number} watchId The id of the watch to clear.
   */
  gpsApi.clearWatch = function(watchId) {
    var metaData = this.idMetaDataMap_[watchId];
    if (!metaData || !metaData.watching) {
      return;
    }

    delete this.idMetaDataMap_[watchId];
    navigator.googleInternal.dispatch('gps', 'clearWatch',
        {watchId: watchId});
  };

  /**
   * Called by native code when a request succeeds.
   * @param {number} requestId
   * @param {number} latitude
   * @param {number} longitude
   */
  gpsApi.callback_ = function(requestId, latitude, longitude, altitude,
      accuracy, altitudeAccuracy, heading, speed, timestamp) {
    var metaData = this.idMetaDataMap_[requestId];
    if (!metaData) {
      return;
    }

    if (!metaData.watching) {
      delete this.idMetaDataMap_[requestId];
    }

    // Core Location services returns -1 when it can't find a proper altitude.
    // HTML5 API requires that it be null instead.
    if (altitudeAccuracy == -1) {
      altitudeAccuracy = null;
      altitude = null;
    }

    // Core Location services returns -1 when heading (course) is invalid.
    // HTML5 API requires that heading be set to null when it is invalid
    // or when speed is equal to zero.
    // NOTE: It actually specifies that heading should be NaN when speed == 0
    // but this is not how mobile safari behaves so we use null to be
    // consistant.
    if (speed == 0 || heading == -1) {
      heading = null;
    }

    // Core Location returns a negative number when speed is invalid.
    // HTML5 API requires that speed be null when it is invalid.
    if (speed < 0) {
      speed = null;
    }

    // Need to convert from seconds to milliseconds and do some rounding.
    timestamp = Math.floor(timestamp * 1000);

    var coords = {
      latitude: latitude,
      longitude: longitude,
      altitude: altitude,
      accuracy: accuracy,
      altitudeAccuracy: altitudeAccuracy,
      heading: heading,
      speed: speed
    };
    var responseObj = {coords: coords, timestamp: timestamp};
    metaData.onSuccess(responseObj);
 };

 /**
  * Called by native code when a request fails.
  * @param {number} requestId
  * @param {number} error
  * @param {number} message
  */
 gpsApi.errorCallback_ = function(requestId, error, message) {
   var metaData = this.idMetaDataMap_[requestId];
   delete this.idMetaDataMap_[requestId];
   if (metaData) {
     var positionError = {
       code: error,
       message: message
     };
     metaData.onError(positionError);
   }
 };

  navigator.googleGps = gpsApi;
})();
