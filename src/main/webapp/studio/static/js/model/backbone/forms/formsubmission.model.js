var App = App || {};
App.Model = App.Model || {};
App.Collection = App.Collection || {};
App.collections = App.collections || {};



App.Model.FormSubmission = App.Model.FormBase.extend({

});


// '/api/v2/forms/submission',
App.Collection.FormSubmissions = App.Collection.FormBase.extend({
  initialize: function(models,options) {
    console.log("FormSubmissions opts " , options);

    if(options["formid"]) this.formId = options["formid"];
    if(options["appId"]) this.appId = options["appId"];
  },
  model: App.Model.FormSubmission,
  urlRead: '/api/v2/forms/submission',
  urlSearch : '/studio/static/js/model/backbone/mocks/forms/submissions.json', //change to be the search url
  sync: function (method, model, options) {
    console.log("sync called for model");
    this[method].apply(this, arguments);
  },

  read : function(method, model, options){

    console.log("read form submissions called");

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
              //selections
              sub.field1val = ('object' === typeof  sub.formFields[0].fieldValues[0]) ? sub.formFields[0].fieldValues[0].selections[0] : sub.formFields[0].fieldValues[0];
              sub.field2val = ('object' === typeof  sub.formFields[1].fieldValues[0]) ? sub.formFields[1].fieldValues[0].selections[0] : sub.formFields[1].fieldValues[0];
              sub.field3val = ('object' === typeof  sub.formFields[2].fieldValues[0]) ? sub.formFields[2].fieldValues[0].selections[0] : sub.formFields[2].fieldValues[0];
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
          App.View.Forms.prototype.message('failed to update ' + status);
          options.error(arguments);
        }
      });
    } else {
      self.trigger("sync");
    }
  },
  update : function(method, model, options){
   console.log("not yet implemented");
  },
  search : function (queryOb, options){
    $.ajax({
      type: 'POST',
      url: this.urlSearch,
      data : JSON.stringify(queryOb),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function(res){
        console.log("response read by id ", res);
        options.success(res);
      },
      error: function(xhr, status){
        console.log("error read by id ", status);
        options.error(status);
      }
    });
  }

});