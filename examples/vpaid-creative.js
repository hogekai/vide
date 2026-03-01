/**
 * Minimal VPAID 2.0 ad unit for testing.
 * Exposes getVPAIDAd() globally.
 */
(function () {
  function VpaidAd() {
    this._slot = null;
    this._videoSlot = null;
    this._listeners = {};
    this._started = false;
    this._duration = 10;
    this._remainingTime = this._duration;
    this._timer = null;

    this.adLinear = true;
    this.adWidth = 0;
    this.adHeight = 0;
    this.adExpanded = false;
    this.adSkippableState = true;
    this.adRemainingTime = this._duration;
    this.adDuration = this._duration;
    this.adVolume = 1;
    this.adCompanions = "";
    this.adIcons = false;
  }

  VpaidAd.prototype.handshakeVersion = function (version) {
    return "2.0";
  };

  VpaidAd.prototype.initAd = function (
    width,
    height,
    viewMode,
    desiredBitrate,
    creativeData,
    environmentVars,
  ) {
    this._slot = environmentVars.slot;
    this._videoSlot = environmentVars.videoSlot;
    this.adWidth = width;
    this.adHeight = height;

    // Build a simple overlay UI
    this._slot.innerHTML = [
      '<div style="position:absolute;top:0;left:0;width:100%;height:100%;',
      "background:rgba(0,0,0,0.7);display:flex;flex-direction:column;",
      'align-items:center;justify-content:center;color:#fff;font-family:system-ui,sans-serif;">',
      '<div style="font-size:24px;margin-bottom:12px;">VPAID Test Creative</div>',
      '<div id="vpaid-params" style="font-size:13px;opacity:0.7;margin-bottom:16px;"></div>',
      '<div id="vpaid-timer" style="font-size:18px;margin-bottom:16px;"></div>',
      '<div style="display:flex;gap:8px;">',
      '<button id="vpaid-click" style="padding:8px 16px;cursor:pointer;">Click-through</button>',
      '<button id="vpaid-skip" style="padding:8px 16px;cursor:pointer;">Skip</button>',
      '<button id="vpaid-stop" style="padding:8px 16px;cursor:pointer;">Close</button>',
      "</div>",
      "</div>",
    ].join("");

    var paramsEl = this._slot.querySelector("#vpaid-params");
    if (paramsEl && creativeData.AdParameters) {
      paramsEl.textContent = "AdParameters: " + creativeData.AdParameters;
    }

    var self = this;
    this._slot.querySelector("#vpaid-click").addEventListener("click", function () {
      console.log("[vpaid-creative] click-through button clicked");
      self._fire("AdClickThru", ["https://example.com/landing", "0", true]);
    });
    this._slot.querySelector("#vpaid-skip").addEventListener("click", function () {
      console.log("[vpaid-creative] skip button clicked");
      self._fire("AdSkipped");
      self._cleanup();
    });
    this._slot.querySelector("#vpaid-stop").addEventListener("click", function () {
      console.log("[vpaid-creative] close button clicked");
      self.stopAd();
    });

    setTimeout(function () {
      self._fire("AdLoaded");
    }, 100);
  };

  VpaidAd.prototype.startAd = function () {
    this._started = true;
    this._fire("AdStarted");
    this._fire("AdImpression");
    this._fire("AdVideoStart");

    var self = this;
    var elapsed = 0;
    this._timer = setInterval(function () {
      elapsed++;
      self._remainingTime = self._duration - elapsed;
      self.adRemainingTime = self._remainingTime;
      self._fire("AdRemainingTimeChange");

      var timerEl = self._slot && self._slot.querySelector("#vpaid-timer");
      if (timerEl) timerEl.textContent = self._remainingTime + "s remaining";

      var pct = elapsed / self._duration;
      if (pct >= 0.25 && !self._firedQ1) {
        self._firedQ1 = true;
        self._fire("AdVideoFirstQuartile");
      }
      if (pct >= 0.5 && !self._firedMid) {
        self._firedMid = true;
        self._fire("AdVideoMidpoint");
      }
      if (pct >= 0.75 && !self._firedQ3) {
        self._firedQ3 = true;
        self._fire("AdVideoThirdQuartile");
      }
      if (elapsed >= self._duration) {
        self._fire("AdVideoComplete");
        self.stopAd();
      }
    }, 1000);
  };

  VpaidAd.prototype.stopAd = function () {
    this._cleanup();
    this._fire("AdStopped");
  };

  VpaidAd.prototype.resizeAd = function (width, height, viewMode) {
    this.adWidth = width;
    this.adHeight = height;
    this._fire("AdSizeChange");
  };

  VpaidAd.prototype.pauseAd = function () {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
    this._fire("AdPaused");
  };

  VpaidAd.prototype.resumeAd = function () {
    this._fire("AdPlaying");
  };

  VpaidAd.prototype.expandAd = function () {};
  VpaidAd.prototype.collapseAd = function () {};

  VpaidAd.prototype.skipAd = function () {
    this._fire("AdSkipped");
    this._cleanup();
  };

  VpaidAd.prototype.subscribe = function (fn, event, scope) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push({ fn: fn, scope: scope });
  };

  VpaidAd.prototype.unsubscribe = function (fn, event) {
    var list = this._listeners[event];
    if (!list) return;
    this._listeners[event] = list.filter(function (l) {
      return l.fn !== fn;
    });
  };

  VpaidAd.prototype._fire = function (event, args) {
    var list = this._listeners[event];
    if (!list) return;
    for (var i = 0; i < list.length; i++) {
      var l = list[i];
      l.fn.apply(l.scope || null, args || []);
    }
  };

  VpaidAd.prototype._cleanup = function () {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  };

  window.getVPAIDAd = function () {
    return new VpaidAd();
  };
})();
