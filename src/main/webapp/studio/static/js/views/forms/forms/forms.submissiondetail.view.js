var App = App || {};
App.View = App.View || {};

App.View.SubmissionDetail = App.View.Forms.extend({

  templates : {
    "submissionDetail" : '#formSubmissionDetail'
  },

  initialize : function (){
    this.constructor.__super__.initialize.apply(this, arguments);
    _.bindAll(this);
  },

  render : function (){
    var self = this;
    var container = $('.emptyContainer');
    container.empty();
    console.log("container ", container);
    container.append(self.templates.$submissionDetail());
  }

});
