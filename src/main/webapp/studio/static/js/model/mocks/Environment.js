var results = window.location.search.match(/mock=(reset|true|false|\d+)/);
if(results) {

  var envName= function(params) {
    return _.compact(["EnvVars" , params.app , params.env]).join("_");
  };

  var lsKeys = function() {
    return _.collect(_.range(localStorage.length), function(i){
      if(localStorage.key(i).match(/^EnvVars/)) {
        return localStorage.key(i);
      } else {
        return null;
      }
    });
  };

  var createMock = function(name, count) {
    var num = parseInt(count, 10);
    var c = function(num) {
      return {
        "fields":
        {
          "name":name + " " + num,
          "value":"value " + num,
          "sysModified":"2013-02-08 " + num + ":14:50:569",
          "guid":num + "h4xjJpaA2VIs5oqICtR-Q31"
        },
        "guid":num + "h4xjJpaA2VIs5oqICtR-Q31",
        "type":"ten_Environment"
      };
    };
    var list;
    if(isNaN(num)) {
      list = [c(0)];
    } else {
      var range = _.range(num);
      list  = _.collect(range,c);
    }
    return list;
  };

  var createMockObject = function(params) {
    var guid = "guid_" + new Date();
    return {
      "fields":
      {
        "name":params.name,
        "value":params.value,
        "sysModified":new Date(),
        "guid":guid
      },
      "guid":guid,
      "type":"ten_Environment"
    };
  };

  var lsKeys = function() {
    return _.collect(_.range(localStorage.length), function(i){
      if(localStorage.key(i).match(/^EnvVars/)) {
        return localStorage.key(i);
      } else {
        return null;
      }
    });
  };

  if(results[1] === "reset") {
    var keys = lsKeys();
    _.each(keys, function(key){
      console.log("removing " + key);
      localStorage.removeItem(key);
    });
  } else {
    if(!localStorage.getItem("EnvVarsConfigured")) {
      localStorage.setItem("EnvVarsConfigured", true);
      var app = new model.App();
      var names = _.collect(app.field_config, function(v){return v.field_name;});

      app.listAll(function(res) {
        _.each(res.aaData, function(data){
          var a = _.object(names,data);
          localStorage.setItem(envName({env : "dev" , app :a.id}), JSON.stringify(createMock("dev_" + a.id,results[1])));
          localStorage.setItem(envName({env : "live" , app :a.id}), JSON.stringify(createMock("live_" + a.id,results[1])));
        });
      }, function() {
        // Failure
      }, true);
    }
  }

  (function(results){
    model.Environment.prototype.init = _.wrap(model.Environment.prototype.init,function(func) {
      func.call(this);
      this.serverPost = _.wrap(this.serverPost,function(func, url, params, success, fail, no_payload, post_process, model) {
        if(!window.location.search.match(/mock=(\d+|true|fail|reset)/)) {
          return func(url, params, success, fail, no_payload, post_process, model);
        } else {
          console.log("url=" + url);
          var name = envName(params);
          var list =   JSON.parse(localStorage.getItem(name));
          if(url == Constants.ENVIRONMENT_TARGET_LISTFORAPP_URL) {
            if (window.location.search.match(/mock=fail/)) {
              if ($.isFunction(fail)) {
                fail("doh!");
              }
            } else {
              if ($.isFunction(success)) {
                if ($.isFunction(post_process)) {
                  res = (post_process({"count" : list.length, "list" : list}, model));
                  success(res);
                } else {
                  success({status : "ok"});
                }
              }
            }
          } else if(url == Constants.ENVIRONMENT_TARGET_CREATE_URL || url == Constants.ENVIRONMENT_TARGET_UPDATE_URL) {
            if (window.location.search.match(/mock=fail/)) {
              if ($.isFunction(fail)) {
                fail("doh!");
              }
            } else {
              if (!list ) {
                list = [];
              }
              if(url == Constants.ENVIRONMENT_TARGET_CREATE_URL) {
                list.push(createMockObject(params));
              } else {
                if(list.length) {
                  var i = _.find(list, function (e) {return params.guid  === e.fields.guid;});
                  //list[i] = createMockObject(params);
                  _.extend(i.fields,_.omit(params, "env") );
                  console.log(i);
                } else {
                  list.push(createMockObject(params));
                }
              }
              localStorage.setItem(name, JSON.stringify(list));
              if ($.isFunction(success)) {
                if ($.isFunction(post_process)) {
                  res = (post_process({"count" : list.length, "list" : list}, model));
                  success(res);
                } else {
                  success({status : "ok"});
                }
              }
            }
          } else if(url == Constants.ENVIRONMENT_TARGET_DELETE_URL) {
            if (window.location.search.match(/mock=fail/)) {
              if ($.isFunction(fail)) {
                fail("doh!");
              }
            } else {
              if(list && list.length) {
                list = _.reject(list, function (e) {return params.guid  === e.fields.guid;});
              }
              if (!list ) {
                list = [];
              }
              if ($.isFunction(success)) {
                if ($.isFunction(post_process)) {
                  res = (post_process({"count" : list.length, "list" : list}, model));
                  success(res);
                } else {
                  success({status : "ok"});
                }
              }
            }
          }
          localStorage.setItem(name, JSON.stringify(list));

        }
      });
    });




  })(results);
}
