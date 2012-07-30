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

  auth_policies: {
    policy1: {name: "Auth Policy 1", data:{} },
    policy2: {name: "Auth Policy 2", data:{} },
    policy3: {name: "Auth Policy 3", data:{} },
    policy4: {name: "Auth Policy 4", data:{} },
    policy5: {name: "Auth Policy 5", data:{} },
  },
  
  storeInfo: null,
  
  alert_timeout: 2000,
  
  populateStoreInfo: function (info) {
    var self = this;
    self.storeInfo = info;
    $('.appstore_name').each(function (i) {
        console.log('Setting store name to ' + info.name);
        $(this).html(info.name);
    });
    if (info.icon && (info.icon !== '')) {
      $('.appstore_icon').attr('src', 'data:image/png;base64,' + info.icon);
    } else {
      $('.appstore_icon').attr('src', '/studio/static/themes/default/img/store_no_icon.png');
    }
    console.log("info: " + JSON.stringify(info));
    $.each(info.authpolicies, function (i, item) {
        console.log("iter: " + i);
        if (item.type === "oauth") {
          console.log("found OAUTH policy: " + item.id);
          var imgIcon = '<img src=\"/studio/static/themes/default/img/store_no_icon.png\" />';
          if (item.iconData && (item.iconData !== '')) {
            imgIcon = '<img src=\"data:image/png;base64,' + item.icon + '\" />';
          }
          var authPolRow='<div class=\"row-fluid auth_policy_select_btn\" data-authid=\"' + item.id + '\">' + imgIcon +
          item.name + '</div>';
          $('#auth_policy_actions').append(authPolRow);
        } else if (item.type === "ldap") {
            console.log("found LDAP policy: " + item.id + ", IGNORING");
        } else {
           console.log("found UNKNOWN auth policy type: " + item.type);
        }
    });
    self.bindLoginControls();  
  },
    
  getStoreInfo: function() {
    var self = this;
    self.models.store_info.getInfo(function (results) {
        console.log("Success function called in storeInfo");
        self.populateStoreInfo(results);
        self.show();
    },
    function (results) {
        console.log("failure function called in storeInfo");
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
    if (options.type === "auth_policy_global_unique_id_1") {
        return cbSuccess({authorised: false, msg: "Pol 1 always fails"});
    } else if (options.type === "auth_policy_global_unique_id_2") {
        return cbSuccess({authorised: true, msg: "Pol 2 always succeeds"});
    } else if (options.type === "auth_policy_global_unique_id_3") {
        return cbSuccess({authorised: false, msg: "Pol 3 always fails"});
    } else {
      return cbFailure("Unknown auth policy");
    }            
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
    console.log("calling show list");
    var self = this;
    this.hide();
    $(this.views.list).show();
    this.models.store_item.list(function(res) {
      var store_items = res.list;
      self.renderItems(store_items);
    }, function(err) {
      console.error(err);
    }, true);
  },

  renderItems: function(store_items) {
    var self = this;
    var list = $(this.views.list);
    list.find('li').remove();

    $.each(store_items, function(i, store_item) {
      var list_item = $(self.views.store_item).clone().show().removeAttr('id');
      list_item.data('store_item', store_item);
      list_item.find('.details h3').text(store_item.name);
      list_item.find('.details p').text(store_item.description);

      self.setIcon(list_item.find('img'), store_item.icon);
       
      //if (store_item.icon !== '') {
      //  list_item.find('img').attr('src', 'data:image/png;base64,' + store_item.icon);
      //} else {
      //  list_item.find('img').attr('src', '/studio/static/themes/default/img/store_no_icon.png');
      //}

      list_item.find('.show_store_item').unbind().click(function() {
        self.showStoreItem(store_item);
      });
      
      list_item.appendTo(list);
    });

    //this.bind();
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
      
    // iterate through store_item.targets and add a button for each iOS, iPhone, iPad...
    $('.install_store_item', show_item_view).unbind().click(function(e) {
        e.preventDefault();
        alert("installing....");
        //self.updateStoreItem();
        return false;
    });
  }
  
};

function init() {
  store.init();    
}


