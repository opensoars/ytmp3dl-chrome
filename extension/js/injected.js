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
          app.dom.helpers.setDlButtonFeedback(true);
        })
        .catch(err => {
          app.dom.helpers.setDlButtonFeedback(false);
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
     * Were used to inject button at specific spot in dom,
     * no longer used
     */
    els: {
      button_container: document.getElementsByClassName('ytp-right-controls')[0]
      // btn_container:
      //   document.getElementById('yt-masthead-user') ||
      //   document.getElementById('yt-masthead-signin'),
      // upload_btn: document.getElementById('upload-btn')
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
       * Color according to previous dl success status
       * @param {undefined|boolean} success
       */
      setDlButtonFeedback: function (success) {
        app.dom.els.dl_btn.style.background =
          typeof success !== 'boolean' ? 'grey' : success ? 'green' : 'red';
      },

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
        app.dom.els.button_container.prepend(app.dom.els.dl_btn);
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

        dl_btn.style.position = 'relative';
        // dl_btn.style.top = '-20px';
        dl_btn.style.background = 'grey';
        dl_btn.style.color = 'white';
        dl_btn.style.fontWeight = 'bold';
        dl_btn.style.border = 'none';
        dl_btn.style.borderRadius = '6px';
        dl_btn.style.height = '30px';
        dl_btn.style.width = '30px';
        // dl_btn.style.height = '50px';
        // dl_btn.style.background = 'black';
        dl_btn.style.zIndex = 5000;
        dl_btn.style.right = '0px';
        dl_btn.style.top = '-22px';
        dl_btn.style.cursor = 'pointer';

        // dl_btn.style.top = '50px';

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

    function f() {
      fetch('http://localhost:3333/downloads/')
        .then(res => res.json())
        .then(res => {
          const dl = res[app.helpers.getVideoId(window.location.href)];
          if (!dl) {
            app.dom.helpers.setDlButtonFeedback(undefined);
          } else if (dl.error) {
            app.dom.helpers.setDlButtonFeedback(false);
          } else if (dl.completed) {
            app.dom.helpers.setDlButtonFeedback(true);
          } else {
            app.dom.helpers.setDlButtonFeedback(true);
          }
        })
        .catch(err => {
          app.dom.helpers.setDlButtonFeedback(false);
        });
    }

    let href = window.location.href;
    setInterval(() => {
      if (href !== window.location.href) {
        href = window.location.href;
        f();
      }
    }, 1000);

    f();
  };

  // Leggo
  app.init();
}, 10);
