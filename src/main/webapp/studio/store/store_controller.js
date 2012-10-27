$(document).ready(init);

var store = {
  models: {
    store_item: new model.StoreItemConsumer(),
    store_info: new model.StoreInfo(),
    auth: new model.Auth()
  },

  views: {
    loading: "#store_loading",
    login: "#store_login",
    list: "#store_list",
    store_item: "#store_item",
    detail: "#store_detail",
    authPolicyLogin: "#store_auth_policy_login",
    user_password: "#store_user_password"
  },

  authSession: null,
  authSessionCookie: 'x-fh-auth-session',
  deviceIdCookie: 'deviceId',

  storeInfo: null,

  allowedBinaryTypes: null,

  alert_timeout: 2000,

  setStoreName: function(name) {
    $('.appstore_name').each(function(i) {
      $(this).html(name);
    });
  },

  getAllowedBinaryTypes: function() {
    var typeMap = {
      iphone: ['iphone', 'ios'],
      ipad: ['iphone', 'ipad', 'ios'],
      android: ['android'],
      unknown: ['iphone', 'ipad', 'ios', 'android']
    };

    var deviceType = this.identifyDevice();

    return typeMap[deviceType];
  },

  populateStoreInfo: function(info) {
    var self = this;
    self.storeInfo = info;
    self.setStoreName(info.name);
    if (info.icon && (info.icon !== '')) {
      $('.appstore_icon').attr('src', 'data:image/png;base64,' + info.icon);
    } else {
      $('.appstore_icon').attr('src', '/studio/static/themes/default/img/store_no_icon.png');
    }
    if (info.authpolicies.length > 0) {
      $.each(info.authpolicies, function(i, item) {
        var imgIcon = '<img class=\"auth_icon\" src=\"/studio/static/themes/default/img/store_no_icon.png\" />';
        if (item.iconData && (item.iconData !== '')) {
          imgIcon = '<img src=\"data:image/png;base64,' + item.icon + '\" class=\"auth_icon\" />';
        }

        var authPolRow = $('<button>').addClass('btn-large auth_policy_select_btn btn');
        authPolRow.attr('data-auth-policy-id', item.name);
        authPolRow.attr('data-auth-policy-type', item.type);
        if (item.type === 'OAUTH2') {
          authPolRow.addClass('google');
        } else if (item.type === 'FEEDHENRY') {
          authPolRow.addClass('feedhenry');
        } else if (item.type === 'LDAP') {
          authPolRow.addClass('ldap');
        } else {
          authPolRow.text(item.name);
        }

        $('#auth_policy_actions').append(authPolRow).append('<br/>');
      });
      self.bindLoginControls();
    } else { // no auth policies defined
      self.showAlert("error", "App Store not available");
    }
  },

  getStoreInfo: function() {
    var self = this;
    self.models.store_info.getInfo(function(results) {
      self.populateStoreInfo(results);
      self.show();
    }, function(results) {
      self.setStoreName("App Store Not Available");
      self.show();
    });
  },

  bindLoginControls: function() {
    var self = this;

    // Choose and auth policy
    $('#store_login .auth_policy_select_btn').unbind().click(function() {
      var auth_policy_id = $(this).attr('data-auth-policy-id');
      var auth_policy_type = $(this).attr('data-auth-policy-type');
      self.login(auth_policy_type, auth_policy_id);
      return false;
    });

    $('#store_auth_login_user_pass').unbind().click(function() {
      self.doLoginUserPass();
      return false;
    });

    // Logout
    $('.logout_button').unbind().click(function() {
      self.authSession = null;
      $.cookie(self.authSessionCookie, null,{"path":"/"});
      //reload page without query params
      window.location = window.location.protocol + '//' + window.location.host + window.location.pathname;
      // TODO: remove session stuff too
    });
  },

  generateDeviceId: function() {
    var s = [];
    var hexDigitals = "0123456789ABCDEF";
    for (var i = 0; i < 32; i++) {
      s[i] = hexDigitals.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[12] = "4";
    s[16] = hexDigitals.substr((s[16] & 0x3) | 0x8, 1);
    var uuid = s.join("");
    return uuid;
  },

  init: function(queryParams) {
    console.log("store:init() - queryParams: " + JSON.stringify(queryParams));
    if (queryParams && queryParams.fh_auth_session) {
      this.authSession = queryParams.fh_auth_session;
      $.cookie(this.authSessionCookie, this.authSession, {
        "path": "/"
      });
      console.log("store:init() authSession: " + this.authSession);
    } else if ($.cookie(this.authSessionCookie) != null) {
      this.authSession = $.cookie(this.authSessionCookie);
    } else {
      console.log("store:init() - no query params");
    }

    this.deviceId = $.cookie(this.deviceIdCookie);
    if (!this.deviceId) {
      this.deviceId = this.generateDeviceId();
      $.cookie(this.deviceIdCookie, this.deviceId);
    }

    if (queryParams && queryParams.message) {
      var message = queryParams.message;
      var level = 'info'; // default to info
      if(queryParams.result && (queryParams.result === 'failure')) {
        level = 'error';
      }
      this.showAlert(level, message);
    }
    $fw.server = new ServerManager();
    this.bindLoginControls();
    this.allowedBinaryTypes = this.getAllowedBinaryTypes();
    this.show();
    this.getStoreInfo();
  },

  hide: function() {
    $.each(this.views, function(k, v) {
      $(v).hide();
    });
    $('.back_button').hide(); // hidden on most screens
    $('.logout_button').show(); // visible on most screens
  },

  show: function() {
    if (this.storeInfo) {
      console.log("store:show() - have store info showing login");
      this.showLogin();
    } else {
      console.log("store:show() - no store info showing loading screen");
      this.showLoading();
    }
  },

  showLogin: function() {
    var self = this;

    if (self.authSession) { // already authenticated
      console.log("store:showLogin() - already authenticated showing list");
      return self.showList();
    }

    this.hide();
    $(this.views.login).show();
    $('.logout_button').hide();
  },

  showLoading: function() {
    var self = this;
    this.hide();
    $(this.views.loading).show();
  },

  // type: error|success|info
  showAlert: function(type, message) {
    var self = this;
    var alerts_area = $('.alerts');
    var alert = $('<div>').addClass('alert fade in alert-' + type).html(message);
    var close_button = $('<button>').addClass('close').attr("data-dismiss", "alert").text("x");
    alert.append(close_button);
    alerts_area.append(alert);
    // only automatically hide alert if it's not an error
    if ('error' !== type) {
      setTimeout(function() {
        alert.slideUp(function() {
          alert.remove();
        });
      }, self.alert_timeout);
    }
  },

  removeQueryString: function(fullUri) {
    var parts = fullUri.split(/\?/);
    return parts[0];
  },

  login: function(pol_type, pol_id) {
    var self = this;
    this.hide();
    console.log("calling $fh.auth() with auth_policy type: " + pol_type + ", and id: " + pol_id);

    var redirectTo = self.removeQueryString(window.location.href);
    console.log('should redirect to: ' + redirectTo);

    if (pol_type === 'OAUTH2') {
      self.models.auth.auth(pol_id, self.storeInfo.guid, redirectTo, {}, self.deviceId, function(res) {
        if (res && res.url) {
          window.location = res.url; // redirect to location specified by auth call
        } else {
          self.showAlert("error", "Not authorised - no url returned");
          self.showLogin();
        }
      }, function(msg) {
        self.showAlert("error", "Not authorised - Error from server: " + msg);
        self.showLogin();
      });
    } else {
      self.showUserPassLogin(pol_id);
    }
  },

  doLoginUserPass: function() {
    var self = this;
    var pol_id = $('#store_login_policy_id').val();
    var pol_username = $('#store_login_policy_username').val();
    var pol_password = $('#store_login_policy_password').val();

    var redirectTo = self.removeQueryString(window.location.href);
    console.log('should redirect to: ' + redirectTo);

    self.models.auth.auth(pol_id, self.storeInfo.guid, redirectTo, {
      userId: pol_username,
      password: pol_password
    }, self.deviceId, function(res) {
      if (res && res.sessionToken) {
        window.location = redirectTo + "?fh_auth_session=" + res.sessionToken; // redirect to location specified by auth call
      } else {
        self.showAlert("error", "Not authorised - no sessionToken returned");
        self.showLogin();
      }
    }, function(msg) {
      self.showAlert("error", "Not authorised - Error from server: " + msg);
      self.showLogin();
    });

  },

  showUserPassLogin: function(pol_id) {
    var self = this;
    $('#store_login_policy_id').val(pol_id);
    $('#store_login_policy_username').attr('placeholder', "Username");
    $('#store_login_policy_password').attr('placeholder', "Password");
    $(this.views.user_password).show();
  },

  showList: function() {
    var self = this;
    this.hide();
    console.log("store:showList() - getting store item list");

    this.models.store_item.list(self.authSession, self.allowedBinaryTypes, function(res) {
      var store_items = res.list;
      console.log("store:showList() - rendering list");
      self.renderItems(store_items);
    }, function(err) {
      // failed getting list, re-authenticate
      console.log("store:showList() - failed getting list, need to re-authenticate");
      self.authSession = null;
      $.cookie(this.authSessionCookie, self.authSession);
      self.showLogin();
    }, true);
  },

  identifyDevice: function() {
    var device = "unknown";

    if (navigator.userAgent.match(/Android/i)) {
      device = "android";
    } else if (navigator.userAgent.match(/iPhone/i)) {
      device = "iphone";
    } else if (navigator.userAgent.match(/iPod/i)) {
      device = "iphone";
    } else if (navigator.userAgent.match(/iPad/i)) {
      device = "ipad";
    }
    return device;
  },

  renderItems: function(store_items) {
    var self = this;
    var list = $(this.views.list);

    if (store_items.length > 0) {
      list.find('.store_item, h5').remove();
      $.each(store_items, function(i, store_item) {
        var list_item = $(self.views.store_item).clone().show().removeAttr('id');
        list_item.data('store_item', store_item);
        list_item.find('.details h3').text(store_item.name);

        self.setIcon(list_item.find('img'), store_item.icon);

        list_item.unbind().click(function() {
          self.showStoreItem(store_item);
        });

        list_item.appendTo(list);
      });
      ellipsisDescriptions();
    }
    $(this.views.list).show();
  },

  setIcon: function(iconTag, iconData) {
    if (iconData !== '') {
      iconTag.attr('src', 'data:image/png;base64,' + iconData);
    } else {
      iconTag.attr('src', '/studio/static/themes/default/img/store_no_icon.png');
    }
  },

  installing: function (btn){
    var self = this;
    this.showLoading();
    $(btn).attr("disabled","disabled");
        setTimeout(function(){
            $(self.views.loading).hide();
            $(btn).attr("disabled","");
        },1000);
  },  

  showStoreItem: function(store_item) {
    var self = this;
    this.hide();

    var show_item_view = $(self.views.detail);
    $('.item_guid', show_item_view).text(store_item.guid);
    $('.item_name', show_item_view).text(store_item.name);
    $('.item_id', show_item_view).text(store_item.authToken);
    $('.item_description', show_item_view).text(store_item.description);
    self.setIcon(show_item_view.find('img'), store_item.icon);

    show_item_view.show();
    $('.back_button').unbind().bind('click', function() {
      self.showList();
    }).show();

    // console.log("Store Item: " + JSON.stringify(store_item));
    // iterate through store_item.targets and add a button for each iOS, iPhone, iPad...
    $('.btn_device_install', show_item_view).hide();
    $.each(store_item.binaries, function(i, v) {
      console.log(v);
      v.url+="&deviceId="+ self.deviceId+"&itemTitle=" + store_item.name + "&itemVers=sti";
      console.log("Store Item(" + i + "): " + JSON.stringify(v));
      $('.btn_device_install', show_item_view).filter('.' + v.type).attr("href", v.url).show().unbind().click(function(e) {
        if (v.type === 'android') {
          return true;
        } else {
          // iOS way
          $('iframe').remove();
          var iframe = $('<iframe>').attr('src', '_blank').attr('src', v.url).hide();
          $(this).append(iframe);
          return false;
        }
      });
    });

    $('.install_store_item', show_item_view);
  }

};

function init() {
  function getQueryString() {
    var result = {},
      queryString = location.search.substring(1);
    var re = /([^&=]+)=([^&]*)/g,
      m;

    while (m = re.exec(queryString)) {
      result[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
    }

    console.log("getQueryString queryString = " + queryString);
    console.log("getQueryString result = " + result);
    return result;
  }
  var queryParams = getQueryString();

  store.init(queryParams);
}

function ellipsisDescriptions() {
  $('.description').ellipsis();
}

var resizeThrottleTimeout = null;
$(window).on('resize', function() {
  if (resizeThrottleTimeout !== null) {
    clearTimeout(resizeThrottleTimeout);
  }
  resizeThrottleTimeout = setTimeout(function() {
    ellipsisDescriptions();
  }, 100);
});
