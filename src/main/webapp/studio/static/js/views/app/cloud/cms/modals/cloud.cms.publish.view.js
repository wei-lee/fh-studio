App = App || {};
App.View = App.View || {};

App.View.CMSPublish = App.View.CMSModalProgress.extend({
  op : 'Publish',
  buttonText : "Done",
  mockMessages : [
    "Collecting drafts",
    "Validating draft structure",
    "Publishing drafts",
    "Reticulating Splines",
    "CMS data published successfully"
  ],
  events : {
    'click #cmsDatePicker' : 'onPublishDateFocus'
  },
  initialize: function(options){
    this.templates = _.extend(this.constructor.__super__.templates, {
      'cms_publishModal' : '#cms_publishModal'
    });
    this.collection = options.collection;
    this.auditMessage = 'published to ' + this.options.mode;
    this.compileTemplates();
    this.text = $(this.templates.$cms_publishModal());
    this.constructor.__super__.initialize.apply(this, arguments);
  },
  render : function(){
    this.constructor.__super__.render.apply(this, arguments);
    this.$el.find('#cmsDatePicker').datetimepicker({
      format: 'yyyy-mm-dd hh:ii',
      autoclose: true,
      todayBtn: true
    });
    return this;
  },
  ok : function(e){
    e.preventDefault();
    var publishRadio = this.$el.find('input[name="publishRadio"]').val();

    // If publish is now, set the timedate if it's not already defined on the section
    if (publishRadio === "later"){
      this.section.publishDate = this.$el.find('#cmsDatePicker').val();
    }
    this.collection.sync('publish', {}, { success : function(){
      this.alertMessage('CMS published successfully');
      App.dispatch.trigger(CMS_TOPICS.SECTION_PUBLISH, this.sectionModel.toJSON()); // Notify the tree that we're saving the section so it can change colour
    }, error : function(){
      this.alertMessage('CMS publish failed');
    } });

    // For now, a mock progress bar is also shown to make this do something interesting
    this.constructor.__super__.ok.apply(this, arguments);

  },
  onPublishDateFocus : function(){
    this.$el.find('#publishRadioLater').attr('checked', true);
  }
});
