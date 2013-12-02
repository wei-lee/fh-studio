var App = App || {};
App.Model = App.Model || {};
App.Collection = App.Collection || {};
App.collections = App.collections || {};



App.Model.FormSubmission = App.Model.FormBase.extend({

});

App.Collection.FormSubmissions = App.Collection.FormBase.extend({
  initialize: function(models,options) {
    console.log("FormSubmissions opts " , options);

    if(options["formid"]) this.formId = options["formid"];
    if(options["appid"]) this.appId = options["appid"];
  },
  model: App.Model.FormSubmission,
  urlRead: '/api/v2/forms/submission',
  sync: function (method, model, options) {
    console.log("sync called for model");
    this[method].apply(this, arguments);
  },


  readByFormId :  function (formId,success, error){

    $.ajax({
      type: 'POST',
      url: url,
      data : {"formId":formId},
      success: function(res){
        console.log("response read by id ", res);
        success(res);
      },
      error: function(xhr, status){
        console.log("error read by id ", status);
        error(status);

      }
    });
  },

  read : function(method, model, options){

    var self = this;
    var data  = {};
    if(this.formId){
      data["formId"] = this.formId;
    }
    if(this.appId){
      data["appId"] = this.appId;
    }


    if(!self.loaded){
      var url = self.urlRead;
      $.ajax({
        type: 'POST',
        url: url,
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(res){
          if (res.submissions ) {
            for(var i=0; i < res.submissions.length; i++){
              var sub = res.submissions[i];
              console.log("submission formfield  ", sub.formFields[0].fieldValues[0]);
              sub.field1val = sub.formFields[0].fieldValues[0];
              sub.field2val = sub.formFields[1].fieldValues[0];
              sub.field3val = sub.formFields[2].fieldValues[0];
            }

            self.loaded = true;
            if ($.isFunction(options.success)) {
              options.success(res.submissions, options);
            }
          } else {
            if ($.isFunction(options.error)) {
              options.error(res, options);
            }
          }
        },
        error: function(xhr, status){
          options.error(arguments);
        }
      });
    } else {
      self.trigger("sync");
    }
  },
  update : function(method, model, options){
    var self = this;
    var url = self.urlUpdate;

    var data = {
      "formId":model.formid,
      "rules":model.rules
    };

    console.log("model ",data);

    $.ajax({
      type: 'POST',
      url: url,
      data: JSON.stringify(data),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function(res){
        if (res) {
          self.trigger('reset');
          if ($.isFunction(options.success)) {
            options.success(res, options);
          }
        } else {
          if ($.isFunction(options.error)) {
            options.error(res, options);
          }
        }
      },
      error: function(xhr, status){
        if ($.isFunction(options.error)) {
          options.error(arguments);
        }
      }
    });
  }
});