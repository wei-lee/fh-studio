var App = App || {};
App.View = App.View || {};

App.View.SubmissionDetail = App.View.Forms.extend({

  templates : {
    "submissionDetail" : '#formSubmissionDetail'
  },

  events : {
     'click .downloadfile' : "downloadFile"
  },

  initialize : function (){
    this.constructor.__super__.initialize.apply(this, arguments);



    _.bindAll(this);
  },

  render : function (){
    var self = this;
    var container = $('.emptyContainer');
    container.empty();
    var data = self.options.submission.toJSON();
    data.deviceFormTimestamp = moment(data.deviceFormTimestamp).format('MMMM Do YYYY, h:mm:ss a');
    container.append(self.templates.$submissionDetail(data));
      $('.downloadfile').unbind('click').bind('click',self.downloadFile);

  },

  downloadFile : function (e){

    var btn = $(e.target);
    console.log('called download' , window.location.protocol+"//"+window.location.host+"/api/v2/forms/submission/file/"+btn.data("groupid"));
    window.location.href = window.location.protocol+"//"+window.location.host+"/api/v2/forms/submission/file/"+btn.data("groupid");
  }

});
