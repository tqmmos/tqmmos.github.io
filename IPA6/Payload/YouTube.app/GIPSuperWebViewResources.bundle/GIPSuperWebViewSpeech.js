// Copyright 2009 Google Inc. All Rights Reserved.

/**
 * @fileoverview SuperWebView's implementation of the Web Speech API.
 * @author altse@google.com (Alastair Tse)
 *
 * See http://go/web-speech-api for details.
 */
(function() {
  if (!navigator ||
      (navigator.speech && !navigator.speech.init)) {
    return;
  }

  var speechApi = {
    apiVersion: 1,
    currentRequest_: null
  };

  /**
   * Performs speech recognition and returns the results via successFn.
   * @param {function(ListenEvent)} requestCallback Callback when the request
   *     completes.
   * @param {ListenOptions} options Options for the recognition.
   */
  speechApi.listen = function(requestCallback, options) {
    this.currentRequest_ = {
      callback: requestCallback,
      options: options
    };
    navigator.googleInternal.dispatch('speech', 'recognize', options);
  };

  /**
   * Cancels an in-progress speech recognition.
   */
  speechApi.stopListening = function() {
    navigator.googleInternal.dispatch('speech', 'cancel');
  };

  /**
   * Listen error constants for listen().
   */
  speechApi.ListenError = {
    UNKNOWN_ERROR: 0,
    CANCELED_ERROR: 1,
    NO_INPUT_ERROR: 2,
    NO_MATCH_ERROR: 3,
    UNSUPPORTED_LANGUAGE: 4,
    CLIENT_ERROR: 5,
    SERVER_ERROR: 6,
    NETWORK_ERROR: 7,
    AUDIO_ERROR: 8,
    LANGUAGE_MODEL_RETRIEVAL_ERROR: 9,
    LANGUAGE_MODEL_ERROR: 10
  };

  /**
   * Get Services. Not implemented.
   */
  speechApi.getServices = function(servicesCallback, options) {
    servicesCallback({
      status: this.ServicesStatus.SERVICES_ERROR,
      error: {
          code: this.ServicesError.UNKNOWN_ERROR,
          message: 'Not Implemented'
      }
    });
  };

  /**
   * Status constants for getServices.
   */
  speechApi.ServicesStatus = {
    SERVICES_OK: 0,
    SERVICES_ERROR: 1
  };
  /**
   * Error constants for getServices.
   */
  speechApi.ServicesError = {
    UNKNOWN_ERROR: 0,
    CLIENT_ERROR: 1,
    SERVER_ERROR: 2,
    NETWORK_ERROR: 3
  };

  /**
   * Text to speech. Not implemented.
   */
  speechApi.speak = function(text, callback, options) {
    callback({
      status: this.SpeakEvent.SPEAK_ERROR,
      error: {
        code: this.SpeakError.UNKNOWN_ERROR,
        message: 'Not Implemented'
      }
    });
  };
  /**
   * Stop text to speech. Not implemented.
   */
  speechApi.stopSpeaking = function() {
  };

  /**
   * Speech gender constants for speak().
   */
  speechApi.SpeakEngine = {
    FEMALE_GENDER: 0,
    MALE_GENDER: 1
  };
  /**
   * Speech error constants for speak().
   */
  speechApi.SpeakError = {
    UNKNOWN_ERROR: 0,
    ABORTED: 1,
    BARGE_IN: 2,
    UNSUPPORTED_LANGUAGE: 3,
    NETWORK_ERROR: 4,
    AUDIO_ERROR: 5
  };
  /**
   * Speech event constants for speak().
   */
  speechApi.SpeakEvent = {
    SPEAK_END: 0,
    SPEAK_START: 1,
    SPEAK_MARK: 2,
    SPEAK_ERROR: 3
  };

  /** Called by native code when a request succeeds.
   * @param {Array|ListenResult} results A sorted array of recognitions.
   * @param {int} errorCode Error code.
   * @param {string} errorDescription Error description.
   */
  speechApi.callback_ = function(results, errorCode, errorMessage) {
    var speech = navigator.speech;
    if (speech.currentRequest_ && speech.currentRequest_.callback) {
      var event = {};
      event.status = errorCode ? 1 : 0;
      if (error_code) {
        event.error = {code: errorCode, message: errorMessage};
      } else {
        event.results = results;  // TODO: not just strings.
      }
      speech.currentRequest_.callback(event);
    }
    speech.currentRequest_ = null;
  };
  // Expose as navigator.speech.
  navigator.speech = speechApi;
})();
