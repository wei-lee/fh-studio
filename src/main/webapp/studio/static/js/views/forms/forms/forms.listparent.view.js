var App = App || {};
App.View = App.View || {};

App.View.FormListParent = App.View.FormListBase.extend({
  templates : {
    'formsListBaseAdd' : '#formsListBaseAdd',
    'formsListMenu' : '#formsListMenu',
    'fullpageLoading' : '#fullpageLoading',
    'templateTabs': '#templateTabs'
  },
  events : {
    'click tr' : 'onRowSelected',
    'click .btn-add-form' : 'onCreate',
    'click .btn-clone-form' : 'onClone',
    'click .btn-delete-form' : 'onDelete'
  },
  initialiseFormTemplateList: function(params){
    this.collection = params.collection;
    this.pluralTitle = 'Forms';
    this.singleTitle = 'Form';
    this.columns = [{
      "sTitle": 'Name',
      "mDataProp": this.CONSTANTS.FORM.NAME
    },{
      "sTitle": 'Description',
      "mDataProp": this.CONSTANTS.FORM.DESC,
      "sWidth" : "275px"
    }];
    this.constructor.__super__.initialize.apply(this, arguments);
  },
  initialize: function(params){
    var self = this;
    self.pluralTitle = 'Forms';
    self.singleTitle = 'Form';
    if(params.formList){
      self.viewingTemplates = false;
      self.initialiseFormList(params);
    } else if(params.formTemplateList){
      self.viewingTemplates = true;
      self.initialiseFormTemplateList(params);
    } else {
      console.log("ERROR");
    }
  },
  initialiseFormList: function(params){
    this.collection = params.collection;

    this.columns = [{
      "sTitle": 'Name',
      "mDataProp": this.CONSTANTS.FORM.NAME
    },{
      "sTitle": 'Description',
      "mDataProp": this.CONSTANTS.FORM.DESC,
      "sWidth" : "275px"
    },{
      "sTitle": 'Updated',
      "mDataProp": this.CONSTANTS.FORM.UPDATED
    },{
      "sTitle": 'Apps Using This Form',
      "mDataProp": this.CONSTANTS.FORM.USING
    },{
      "sTitle": 'Submissions Today',
      "mDataProp": this.CONSTANTS.FORM.SUBSTODAY
    },{
      "sTitle": 'Total Submissions',
      "mDataProp": this.CONSTANTS.FORM.SUBS
    }];
    this.constructor.__super__.initialize.apply(this, arguments);
  },
  render : function(){
    var self = this;
    App.View.FormListBase.prototype.render.apply(this, arguments);

    if(self.viewingTemplates){
      self.$el.find('a#viewForm').parent('li').removeClass("active");
      self.$el.find('a#viewFormTemplates').parent('li').addClass("active");
    } else {
      self.$el.find('a#viewForm').parent('li').addClass("active");
      self.$el.find('a#viewFormTemplates').parent('li').removeClass("active");
    }
    return self.renderPreview();
  },
  renderPreview : function(){
    var self = this;
    self.$previewEl = $('<div class="formpreview" />');
    self.$el.append(self.$previewEl);
    self.$previewEl.hide();

    self.fb = new Formbuilder(self.$previewEl, {
      noScroll : true,
      noEditOnDrop : true,
      bootstrapData: [],
      editStructure : false
    });

    // Place holders that get filled when the user clicks a form
    self.$previewEl.find('.middle').prepend('<p class="desc">Form Description</p>');
    self.$previewEl.find('.middle').prepend('<h4 class="title">Form Title</h4>');

    self.$previewEl.find('.middle').removeClass('span6').addClass('span9');
    self.$previewEl.find('.middle .fb-response-fields').addClass('well');
    self.$previewEl.find('.right').removeClass('span4').addClass('span2');

    var menu = $(self.templates.$formsListMenu({"formView" : self.viewingTemplates === false}));
    self.$previewEl.find('.right').html(menu);

    // Move the loading to the bottom of this element's dom
    self.loading.remove();
    self.$el.append(self.loading);
    return self;
  },
  updatePreview : function(updatedModel){
    var fields = this.formToFormBuilderFields(updatedModel),
    dropdown = this.$previewEl.find('.apps-using-form');

    dropdown.empty();
    dropdown.append('<li class="text">' + new App.View.Spinner().render().$el.html() + '</li>');

    this.$previewEl.find('h4.title').html('Form Preview: ' + updatedModel.get(this.CONSTANTS.FORM.NAME));
    this.$previewEl.find('p.desc').html(updatedModel.get(this.CONSTANTS.FORM.DESC));

    this.$previewEl.show();
    this.fb.mainView.collection.reset(fields);

    var using = new App.Collection.AppsUsingThisForm({ id : updatedModel.id });
    using.fetch({
      success : function(apps){
        dropdown.empty();
        if (apps.length>0){
          _.each(apps, function(d){
            if(d && d.inst){
              dropdown.append('<li><a class="formapp-link" data-_id="' + d.inst.guid + '" href="#">' + d.inst.title + '</a></li>');
            }
          });
        }else{
          dropdown.append('<li class="text">No apps using this form</li>');
        }
      },
      error : function(){
        dropdown.empty().append('<li>Error loading apps using this form</li>');
      }
    });

    this.fb.mainView.$el.find('input').attr('disabled', true);
  }
});