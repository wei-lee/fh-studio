var App = App || {};
App.View = App.View || {};

App.View.FormList = App.View.FormListBase.extend({
  templates : {
    'formsListBaseAdd' : '#formsListBaseAdd',
    'formsListMenu' : '#formsListMenu',
    'fullpageLoading' : '#fullpageLoading',
    'menu' : '#formsListMenu'
  },
  events : {
    'click tr' : 'onRowSelected',
    'click .btn-add-form' : 'onCreate',
    'click .btn-clone-form' : 'onClone',
    'click .btn-delete-form' : 'onDelete'
  },
  initialize: function(){
    this.collection = new App.Collection.Form();
    this.pluralTitle = 'Forms';
    this.singleTitle = 'Form';
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
    },{ //TODO: Make these..?
      "sTitle": 'Apps Using This',
      "mDataProp": this.CONSTANTS.FORM.USING
    },{
      "sTitle": 'Submissions today',
      "mDataProp": this.CONSTANTS.FORM.SUBSTODAY
    },{
      "sTitle": 'Submissions',
      "mDataProp": this.CONSTANTS.FORM.SUBS
    }];
    this.constructor.__super__.initialize.apply(this, arguments);
  },
  render : function(){
    App.View.FormListBase.prototype.render.apply(this, arguments);
    return this.renderPreview();
  },
  renderPreview : function(){
    this.$previewEl = $('<div class="formpreview" />');
    this.$el.append(this.$previewEl);
    this.$previewEl.hide();

    this.fb = new Formbuilder(this.$previewEl, {
      noScroll : true,
      noEditOnDrop : true,
      bootstrapData: [],
      editStructure : false
      //TODO: editValues : false mode..
    });

    // Place holders that get filled when the user clicks a form
    this.$previewEl.find('.middle').prepend('<p class="desc">Form Description</p>');
    this.$previewEl.find('.middle').prepend('<h4 class="title">Form Title</h4>');

    this.$previewEl.find('.middle').removeClass('span6').addClass('span9');
    this.$previewEl.find('.middle .fb-response-fields').addClass('well')
    this.$previewEl.find('.right').removeClass('span4').addClass('span2');

    var menu = $(this.templates.$menu());
    this.$previewEl.find('.right').html(menu);

    // Move the loading to the bottom of this element's dom
    this.loading.remove();
    this.$el.append(this.loading);
    return this;
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
            dropdown.append('<li><a class="formapp-link" data-_id="' + d.inst.guid + '" href="#">' + d.inst.title + '</a></li>');
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