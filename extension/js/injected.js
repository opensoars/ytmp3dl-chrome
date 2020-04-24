setTimeout(() => {
  console.log('ok???');

  var chrome = chrome || {};

  /**
   * Top level application namespace.
   * @namespace
   */
  var app = {};

  /**
   * Application helper functions.
   * @namespace
   */
  app.helpers = {
    /**
     * Extracts and returns a YT video id from a YT video url.
     * @param {string} url - YT video string (current page)
     * @return {null|string} video_id - YT video id or null if nothing was found
     */
    getVideoId: function (url) {
      var video_id = null;
      try {
        var q = url.split('/watch?')[1],
          qs = q.split('&');
        for (var i = 0; i < qs.length; i += 1) {
          var single_q = qs[i];
          if (single_q.indexOf('v=') !== -1 && single_q.charAt(0) === 'v') {
            video_id = single_q.split('v=')[1];
          }
        }
      } catch (e) {
        video_id = null;
      }
      return video_id.length === 11 ? video_id : null;
    },

    /**
     * Sends messages to the extension its background script. Binds
     * app.handlers.onMsgRes as the callback function.
     * @param {object} json_data - JSON to send to the background script
     */
    sendMsg: function (json_data) {
      console.log('sendMsg', json_data);

      fetch(`http://localhost:3333/downloads/${json_data.v}`, {
        method: 'POST'
      })
        .then(res => res.json())
        .then(res => {
          console.log('res', res);
          if (res.error) {
            alert(res.error);
          }
        });

      // chrome.runtime.sendMessage(json_data, app.handlers.onMsgRes);
    }
  };

  /**
   * Application event handler funtions.
   * @namespace
   */
  app.handlers = {
    /**
     * Gets used as a callback function for chrome.runTime.sendMessage.
     */
    onMsgRes: function (res) {
      // DEV
      console.log(res);
    }
  };

  /**
   * Extracts video id from YT urls.
   * @param {string} url - YT url to extract video id from
   * @return {string} video_id - YT video id
   */
  app.dom = {
    /**
     * Application DOM elements collection.
     */
    els: {
      btn_container:
        document.getElementById('yt-masthead-user') ||
        document.getElementById('yt-masthead-signin'),
      upload_btn: document.getElementById('upload-btn')
    },

    /**
     * Application DOM event handler functions collection.
     */
    handlers: {
      /**
       * Gets called when the dl_btn is clicked.
       * Calls app.helpers.sendMsg. Binds app.handlers.onMsgRes as callback.
       */
      onDlBtnClick: function (evt) {
        var json_data = {
          v: app.helpers.getVideoId(window.location.href)
        };

        app.helpers.sendMsg(json_data, app.handlers.onMsgRes);

        evt.preventDefault();
        return false;
      }
    },

    /**
     * Application DOM helper functions.
     */
    helpers: {
      /**
       * Creates all elements used by the application and stores them in
       * app.dom.els.
       */
      createEls: function () {
        var els = app.dom.els;

        // Create the two DOM elements required for a download button
        els.dl_btn = app.dom.helpers.createDlBtn();
        els.dl_btn_content = app.dom.helpers.createDlBtnContent();

        // Append the content DOM element to the parent btn DOM element
        els.dl_btn.appendChild(els.dl_btn_content);
      },

      /**
       * Used to bind all DOM event listeners.
       */
      addEventListeners: function () {
        app.dom.els.dl_btn.addEventListener(
          'click',
          app.dom.handlers.onDlBtnClick
        );
      },
      /**
       * Inserts completed dl_btn into the btn_container before the upload_btn
       * so it gets shown to the left of upload.
       */
      insertBtn: function () {
        document.body.appendChild(app.dom.els.dl_btn);
      },

      /**
       * @return {DOM} dl_btn
       */
      createDlBtn: function () {
        var dl_btn = document.createElement('button');

        // dl_btn.href = '#';
        // dl_btn.className =
        //   'yt-uix-button yt-uix-button-size-default' + ' yt-uix-button-primary';
        dl_btn.setAttribute('style', 'margin-right: 15px;');

        dl_btn.style.position = 'absolute';
        dl_btn.style.width = '50px';
        dl_btn.style.height = '50px';
        // dl_btn.style.background = 'black';
        dl_btn.style.zIndex = 5000;
        dl_btn.style.right = '0px';
        dl_btn.style.top = '50px';

        return dl_btn;
      },

      /**
       * @return {DOM} dl_btn_content
       */
      createDlBtnContent: function () {
        var dl_btn_content = document.createElement('span');
        // dl_btn_content.className = 'yt-uix-button-content';
        dl_btn_content.textContent = 'DL';

        return dl_btn_content;
      }
    }
  };

  /**
   * Application initialization function.
   */
  app.init = function () {
    app.dom.helpers.createEls();
    app.dom.helpers.addEventListeners();
    app.dom.helpers.insertBtn();
  };

  // Leggo
  app.init();
}, 10);
