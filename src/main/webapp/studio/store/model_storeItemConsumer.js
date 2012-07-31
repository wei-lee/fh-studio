model.StoreItemConsumer = model.Model.extend({

  // Model config
  config: {},

  init: function() {},

  list: function(authSession, allowedTypes, success, fail) {
    var self = this;
    var MAM_STORE_ITEMS_URL = '/box/srv/1.1/mas/appstore/getstoreitems';
    if(authSession) {
      MAM_STORE_ITEMS_URL = MAM_STORE_ITEMS_URL + "?fh_auth_session=" + authSession;
    }

///////DUMMY DATA BEING RETURNED
//    var dummySuccessResp = {status:"ok", list:[
//     { name:"dummy app 1", authToken:"dummy1", description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin fermentum augue gravida dui luctus luctus. Quisque interdum fringilla tortor, nec malesuada augue mollis eu. Maecenas vitae magna et sem pretium lacinia nec sed massa. Cras nec tincidunt risus. Mauris quis nibh ut purus dapibus rutrum ac at dui. Maecenas non diam eu odio porta faucibus nec eu leo. Integer et tellus in eros consectetur accumsan. Pellentesque dignissim dapibus odio ac porttitor. Nam orci tellus, pulvinar eget pellentesque a, blandit vitae leo. Maecenas pharetra, ante sed tincidunt commodo, leo nibh tristique orci, ac dignissim urna sapien sit amet mi. Nam a ornare arcu. Aenean tincidunt dictum adipiscing. Nulla viverra pharetra sem vel posuere. Fusce ac felis odio. Etiam non urna risus, ac malesuada odio. Quisque ante purus, varius eget egestas ut, rhoncus eu ligula. Fusce quis ante velit. Sed feugiat pellentesque nisl, vitae egestas est dictum a. Quisque auctor porttitor magna in pellentesque. Cras mollis tempor porta. Pellentesque velit enim, tincidunt eget blandit et, placerat et turpis. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec at mauris vitae massa pharetra laoreet. Praesent quis sem vel tellus feugiat varius.", icon:"", binaries:[{type:"iphone",url:"http://google.com"}]},
//     { name:"dummy app 2", authToken:"dummy2", description:"desc app 2", icon:"", binaries:[{type:"iphone",url:"http://google.com"}]}
//    ]};
//    var dummyFailureResp = {status:"error", message:"Client Operation Prohibited"};
//    
//    if (authSession === "oneTWOthree") {
//      return success(dummySuccessResp);
//    } else {
//      return fail(dummyFailureResp);
//    }
///////DUMMY DATA ^^^^^^^^^^^

    var params = {};
    return this.serverPost(MAM_STORE_ITEMS_URL, params,  function(res) {
      return self.filterAllowedTypes(res, allowedTypes, success)
    }, fail);   
  },
    
  filterAllowedTypes: function (res, allowedTypes, cb) {
    var filteredRes = {
        status: res.status,
        list: []
    };
    console.log("res: " + JSON.stringify(res));
    console.log("allowed: " + JSON.stringify(allowedTypes));
    $.each(res.list, function(itemIndex, item) {
      console.log("item: " + JSON.stringify(item));
      var filteredItem = {};
      var isAllowed = false;
      $.each(item, function (k, v) {
        if (k !== 'binaries') {
            filteredItem[k] = v;
        }
      });
      filteredItem.binaries = [];
      $.each(item.binaries, function (binaryIndex, binary) {
        if(allowedTypes.indexOf(binary.type) > -1) {
            isAllowed = true;
            filteredItem.binaries.push(binary);
        }
      });
      if(isAllowed) {
        filteredRes.list.push(filteredItem);
      }
    });
    return cb(filteredRes);
  }
  
});