var App = App || {};
App.View = App.View || {};

App.View.ThemeList = App.View.FormListBase.extend({
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
    this.collection = new App.Collection.FormThemes();
    this.pluralTitle = 'Themes';
    this.singleTitle = 'Theme';
    this.columns = [{
      "sTitle": 'Name',
      "mDataProp": this.CONSTANTS.THEME.NAME
    },{
      "sTitle": 'Updated',
      "mDataProp": this.CONSTANTS.THEME.UPDATED
    },{ //TODO: Make these..?
      "sTitle": 'Apps Using This',
      "mDataProp": this.CONSTANTS.THEME.USING
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
    this.$previewEl = $('<div class="themepreview" />');
    this.$el.append(this.$previewEl);
    this.$previewEl.hide();

    var menu = $(this.templates.$menu()).addClass('pull-right');
    this.$previewEl.append(menu);

    // Move the loading to the bottom of this element's dom
    this.loading.remove();
    this.$el.append(this.loading);
    return this;
  },
  updatePreview : function(updatedModel){

    this.$previewEl.show();
  },
  onDeleteTheme : function(){
    //TODO Common
    var self = this,
    form = this.collection.at(this.index);
    var modal = new App.View.Modal({
      title: 'Confirm Delete',
      body: "Are you sure you want to delete theme " + form.get('Name') + "?",
      okText: 'Delete',
      cancelText : 'Cancel',
      ok: function (e) {
        self.collection.remove(form, {
          success : function(){

          },
          error : function(){

          }
        });
      }
    });
    this.$el.append(modal.render().$el);
  }
});