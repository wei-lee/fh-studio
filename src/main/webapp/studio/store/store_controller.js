$(document).ready(init);

var store = {
  models: {
    store_item: new model.StoreItemConsumer(),
    store_info: new model.StoreInfo()
  },

  views:  {
    loading: "#store_loading",
    login: "#store_login",
    list: "#store_list",
    store_item: "#store_item",
    detail: "#store_detail",
    authPolicyLogin: "#store_auth_policy_login"
  },

  storeInfo: null,
  
  allowedBinaryTypes: null,
  
  alert_timeout: 2000,

  setStoreName: function(name) {
    $('.appstore_name').each(function (i) {
        $(this).html(name);
    });
  },
    
  getAllowedBinaryTypes: function() {
    var typeMap = {
        iphone:  ['iphone', 'ios'],
        ipad:    ['iphone', 'ipad', 'ios'],
        android: ['android'],
        unknown: ['iphone', 'ipad', 'ios', 'android']
    };
    
    var deviceType = this.identifyDevice();
         
    return typeMap[deviceType];
  },
  
  populateStoreInfo: function (info) {
    var self = this;
    self.storeInfo = info;
    self.setStoreName(info.name);
    if (info.icon && (info.icon !== '')) {
      $('.appstore_icon').attr('src', 'data:image/png;base64,' + info.icon);
    } else {
      $('.appstore_icon').attr('src', '/studio/static/themes/default/img/store_no_icon.png');
    }
    if(info.authpolicies.length > 0) {
      $.each(info.authpolicies, function (i, item) {
          console.log("iter: " + i);
          if (item.type === "OAUTH2") {
            var imgIcon = '<img class=\"auth_icon\" src=\"/studio/static/themes/default/img/store_no_icon.png\" />';
            if (item.iconData && (item.iconData !== '')) {
              imgIcon = '<img src=\"data:image/png;base64,' + item.icon + '\" class=\"auth_icon\" />';
            }
            var authPolRow='<div class=\"row-fluid auth_policy_select_btn\" data-authid=\"' + item.name + '\">' + imgIcon +
            item.name + '</div>';
            $('#auth_policy_actions').append(authPolRow);
          } else if (item.type === "ldap") {
              console.log("found LDAP policy: " + item.id + ", IGNORING");
          } else {
             console.log("found UNKNOWN auth policy type: " + item.type);
          }
      });
      self.bindLoginControls();  
    } else { // no auth policies defined
      self.showAlert("error", "App Store not available");
    }
  },
    
  getStoreInfo: function() {
    var self = this;
    self.models.store_info.getInfo(function (results) {
        self.populateStoreInfo(results);
        self.show();
    },
    function (results) {
       self.setStoreName("App Store Not Available");
       self.show();
    });
  },
  
  
  bindLoginControls: function() {
    var self = this;
    
    // Choose and auth policy
    $('#store_login .auth_policy_select_btn').unbind().click(function() {
      var auth_policy_name = $(this).attr('data-authid');
      console.log('name : ' + auth_policy_name);
      self.login(auth_policy_name);
      return false;
    });
    
    // Authenticate using selected policy
    $('#store_auth_policy_login .btn_do_auth_request').unbind().click(function() {
      console.log('auth policy authenticated');
      self.showList();
      return false;
    });
    
    // Logout
    $('#store_auth_policy_login .btn_do_auth_request').unbind().click(function() {
      console.log('auth policy authenticated');
      self.showList();
      return false;
    });
  },
    
  init: function() {
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
  },
  
  show: function() {
    if(this.storeInfo) {
      this.showLogin();
    } else {
      this.showLoading();
    };
  },
  
  showLogin: function () {
    var self = this;
    this.hide();
    $(this.views.login).show();
  },
  
  showLoading: function () {
    var self = this;
    this.hide();
    $(this.views.loading).show();
  },

  do_auth: function(options, cbSuccess, cbFailure) {
  //$fh.auth
  //  if (options.type === "auth_policy_global_unique_id_1") {
  //      return cbSuccess({authorised: false, msg: "Pol 1 always fails"});
  //  } else if (options.type === "martins_auth") {
        return cbSuccess({authorised: true, msg: "Pol 2 always succeeds"});
  //  } else if (options.type === "auth_policy_global_unique_id_3") {
  //      return cbSuccess({authorised: false, msg: "Pol 3 always fails"});
  //  } else {
  //    return cbFailure("Unknown auth policy: " + options.type);
  //  }            
  },
  
  // type: error|success|info
  showAlert: function (type, message) {
    var self = this;
    var alerts_area = $('.alerts');
    var alert = $('<div>').addClass('alert fade in alert-' + type).html(message);
    var close_button = $('<button>').addClass('close').attr("data-dismiss", "alert").text("x");
    alert.append(close_button);
    alerts_area.append(alert);
    // only automatically hide alert if it's not an error
    if ('error' !== type) {
      setTimeout(function() {
        alert.slideUp(function () {
          alert.remove();
        });
      }, self.alert_timeout);
    }
  },
  
  login: function (pol_name) {
    var self = this;
    this.hide();
    console.log("calling $fh.auth() with auth_policy id: " + pol_name);
    self.do_auth({
      "type": pol_name
    }, function(res) {
      if (res.authorised) {
        self.showAlert('success', res.msg);
        
        self.showList();
      } else {
        self.showAlert('error', res.msg);
        self.showLogin();
      }
    }, function(err) {
      self.showAlert('error', err);
      self.showLogin();
    });
  },
  
  showList: function() {
    var self = this;
    this.hide();
    $(this.views.list).show();
    this.models.store_item.list(self.allowedBinaryTypes, function(res) {
      var store_items = res.list;
      self.renderItems(store_items);
    }, function(err) {
      console.error(err);
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
    };
    return device;
  },

  renderItems: function(store_items) {
    var self = this;
    var list = $(this.views.list);
    
    if(store_items.length > 0) {
      list.find('li').remove();
      $.each(store_items, function(i, store_item) {
        var list_item = $(self.views.store_item).clone().show().removeAttr('id');
        list_item.data('store_item', store_item);
        list_item.find('.details h3').text(store_item.name);
        list_item.find('.details p').text(store_item.description);

        self.setIcon(list_item.find('img'), store_item.icon);
       
        list_item.find('.show_store_item').unbind().click(function() {
          self.showStoreItem(store_item);
        });
      
        list_item.appendTo(list);
      });
    }
  },

  setIcon: function (iconTag, iconData) {
      if (iconData !== '') {
        iconTag.attr('src', 'data:image/png;base64,' + iconData);
      } else {
        iconTag.attr('src', '/studio/static/themes/default/img/store_no_icon.png');
      }
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
          
    console.log("Store Item: " + JSON.stringify(store_item));
    // iterate through store_item.targets and add a button for each iOS, iPhone, iPad...
    $('.btn_device_install', show_item_view).hide();
    $.each(store_item.binaries, function(i,v) {
        console.log("Store Item(" + i + "): " + JSON.stringify(v));
        $('.btn_device_install', show_item_view).filter('.'+v.type).attr("href",v.url).show().unbind().click(function(e) {
        alert("installing....");
        return true;
    });;
    });
    
    $('.install_store_item', show_item_view)
  }
  
};

function init() {
  store.init();    
}


