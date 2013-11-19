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
    'click .btn-clone-form' : 'onCloneForm',
    'click .btn-delete-form' : 'onDeleteForm'

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
  onCreate : function(e){
    e.preventDefault();
    var self = this,
    createView = new App.View.FormCreateClone({ collection : this.collection, mode : 'create' });
    this.$el.append(createView.render().$el);
    createView.bind('message', function(){}); // TODO - do we want messages up top like with CMS?
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
    this.$previewEl.find('.middle').prepend("<p>Form Description</p>");
    this.$previewEl.find('.middle').prepend("<h4>Form Title</h4>");

    this.$previewEl.find('.middle').removeClass('span6').addClass('span9 well');
    this.$previewEl.find('.right').removeClass('span4').addClass('span2');

    var menu = $(this.templates.$menu());
    this.$previewEl.find('.right').html(menu);

    // Move the loading to the bottom of this element's dom
    this.loading.remove();
    this.$el.append(this.loading);
    return this;
  },
  updatePreview : function(updatedModel){
    var fields = this.formToFormBuilderFields(updatedModel);
    this.$previewEl.find('h4').html(updatedModel.get(this.CONSTANTS.FORM.NAME));
    this.$previewEl.find('p').html(updatedModel.get(this.CONSTANTS.FORM.DESC));

    this.$previewEl.show();
    this.fb.mainView.collection.reset(fields);
  },
  onDeleteForm : function(){
    var self = this,
    form = this.collection.at(this.index);
    var modal = new App.View.Modal({
      title: 'Confirm Delete',
      body: "Are you sure you want to delete form " + form.get(this.CONSTANTS.FORM.NAME) + "?",
      okText: 'Delete',
      cancelText : 'Cancel',
      ok: function (e) {
        form.destroy({
          success : function(){
            self.message('Form deleted successfully');
          },
          error : function(){
            self.message('Error deleting form');
          }
        });
      }
    });
    this.$el.append(modal.render().$el);
  }
});