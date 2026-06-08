// Copyright 2009 Google Inc. All Rights Reserved.

/**
 * @fileoverview SuperWebView's Media Picker API.
 * @author altse@google.com (Alastair Tse)
 */
(function() {
  if (!navigator ||
      (navigator.googleMediaPicker &&
      !navigator.googleMediaPicker.init)) {
    return;
  }

  var mediaPickerApi = {
    apiVersion: 1,
    /**
     * Holds the most recent request.
     * @private
     */
    currentRequest_: null,
    /**
     * Different statuses.
     * TODO(altse): To be passed by native code into the callback.
     */
    STATUS_MEDIA_PICKED: 0,
    STATUS_UPLOAD_STARTED: 1,
    STATUS_UPLOAD_FINISHED: 2,
    STATUS_UPLOAD_CANCELED: 3,
    STATUS_UPLOAD_ERROR: 4
  };

  /**
   * Starts a media picker and uploads the photo to a given destination.
   * @param {function(UploadEvent)} requestCallback Callback method called
   *      when request completes.
   * @param {UploadOptions} options Options to do with the upload media
   *      request.
   *
   * UploadOptions has the following attributes:
   *   editable: Allow editing of the image in the picker controller.
   *   mediaType: Comma separated list of supported media types
   *              (image, video)
   *   restrict: Can be either "camera" or "gallery".
   *   showPreview: Can be either true or false.  Determines if an image preview
   *                is shown when the image is selected.
   *   uploadUrl: URL to upload to. Should include scheme. Example:
   *              masf://g/upload?xxx or http://picasaweb.google.com/?
   *
   * UploadEvent has the following attributes:
   *   additionalData: JSON representation of a map with key-value pairs
   *                   for sending additional data to the client.
   *   status: 0 if OK, 1 if error.
   *   thumbnailData: Thumbnail of uploaded image in base64 string.
   *   uploadedUrl: Location of the uploaded image.
   *   error: Error description and code, if an error occurred.
   *
   */
  mediaPickerApi.upload = function(requestCallback, options) {
    this.currentRequest_ = {
      callback: requestCallback,
      options: options
    };
    navigator.googleInternal.dispatch('mediapicker', 'upload', options);
  };

  /**
   * Cancels an in-progress media upload request.
   */
  mediaPickerApi.stopUploading = function() {
    navigator.googleInternal.dispatch('mediapicker', 'cancel');
  };

  /** Called by native code when a request succeeds.
   * @param {string} thumbnailData Base64 representation of the thumbnail of
   *     uploaded data.
   * @param {Object.<string>} additionalData Map of auxiliary data that should
   *     be passed to the client.
   * @param {Array|string} uploadedUrl URL of where the newly uploaded media
   *     exists.
   * @param {int} errorCode Error code.
   * @param {string} errorMessage Error description.
   */
  mediaPickerApi.callback_ = function(thumbnailData, additionalData,
                                      uploadedUrl, errorCode, errorMessage) {
    if (this.currentRequest_ && this.currentRequest_.callback) {
      var event = {};
      if (additionalData) {
        event.additionalData = additionalData;
      }
      event.status = errorCode ? 1 : 0;
      if (errorCode) {
        event.error = {code: errorCode, message: errorMessage};
      }
      if (thumbnailData) {
        event.thumbnailData = thumbnailData;
      }
      if (uploadedUrl) {
        event.uploadedUrl = uploadedUrl;
      }
      this.currentRequest_.callback(event);
    }
    this.currentRequest_ = null;
  };
  navigator.googleMediaPicker = mediaPickerApi;
})();
