var App = App || {};
App.View = App.View || {};

App.View.FormListBase = App.View.Forms.extend({
  initialize: function(){
    var self = this;

    App.View.Forms.prototype.initialize.apply(this, arguments);

    this.singleId = this.singleTitle.toLowerCase().replace(/ /g, "");

    this.loaded = false;
    // Comes from implementee
    this.collection.fetch({ reset : true, success : function(){
      self.loaded = true;
      self.collection.bind('reset', $.proxy(self.render, self));
      self.collection.trigger('reset');
    }, error : function(){
      self.$el.removeClass('busy');
      // Avoid flicker on our loading view
      setTimeout(function(){
        if (!self.error){
          self.error = new App.View.FullPageMessageView({ message : 'Error loading ' + self.pluralTitle.toLowerCase(), button : 'Retry', cb: function(){
            self.error.$el.hide();
            self.initialize.apply(self, arguments);
          }});
          self.$el.append(self.error.render().$el);
        }else{
          self.error.$el.show();
        }
      }, 500);
    }});
  },
  render : function(){
    this.breadcrumb(['Forms', this.pluralTitle + ' List']);
    this.$el.empty();
    this.$el.addClass('span10 ' + this.pluralTitle.toLowerCase() + 'list busy');

    this.loading = $(this.templates.$fullpageLoading());
    this.$el.append(this.loading);

    if (this.loaded){
      this.$el.removeClass('busy');
      if (this.collection.length>0){
        this.renderList();
      }else{
        this.renderEmptyView();
      }
      this.trigger('rendered');
    }
    return this;
  },
  renderEmptyView : function(){
    this.message = new App.View.FullPageMessageView({ message : 'No ' + this.pluralTitle.toLowerCase() + ' found', button : 'Create ' + this.singleTitle, cb :$.proxy(this.onCreate, this)});

    this.$el.append(this.message.render().$el);
    return this;
  },
  renderList : function(){
    this.$el.append(this.templates.$formsListBaseAdd( { name : this.singleTitle.toLowerCase(), cls : this.singleId } ));
    var self = this,
    data = this.collection.toJSON();


    this.table = new App.View.DataTable({
      aaData : data,
      "fnRowCallback": function(nTr, sData, oData, iRow, iCol) {
        $(nTr).attr('data-index', iRow).attr('data-hash', sData.Hash).attr('data-_id', sData._id);
      },
      "aaSorting" : [],
      "aoColumns": this.columns,
      "bAutoWidth": false,
      "sPaginationType": 'bootstrap',
      "sDom": "<'row-fluid'<'span4'f>r>t<'row-fluid'<'pull-left'i><'pull-right'p>>",
      "bLengthChange": false,
      "iDisplayLength": 5,
      "bInfo": true,
      "oLanguage" : {
        "sEmptyTable" : "No " + this.pluralTitle.toLowerCase() + " found"
      }
    });
    this.table.render();
    this.table.$el.find('table').removeClass('table-striped').removeClass('table-bordered');
    this.$el.append(this.table.$el);
    
    this.$el.append('<br />');

    // Add in the view form view
    this.selectMessage = new App.View.FullPageMessageView({ message : 'Select a ' + this.singleTitle.toLowerCase() + ' above to preview & manage', button : false });
    this.$el.append(this.selectMessage.render().$el);
    return this;
  },

  getDataForRow : function (e){
    var self = this,
      el = e.target,
      nodeName = el.nodeName.toLowerCase();
    if (nodeName === 'th'){
      return;
    }
    el = (nodeName==="tr") ? $(el) : $($(el).parents('tr'));
    this.$el.find('tr').removeClass('info');

    el.addClass('info');

    this._id = el.data('_id');
    var model = this.collection.findWhere({ _id : this._id});
    return model;
  },

  onRowSelected : function(e){
    var self = this,
    el = e.target,
    nodeName = el.nodeName.toLowerCase();
    if (nodeName === 'th'){
      return;
    }
    el = (nodeName==="tr") ? $(el) : $($(el).parents('tr'));
    this.$el.find('tr').removeClass('info');

    el.addClass('info');

    this._id = el.data('_id');
    var model = this.collection.findWhere({_id : this._id});

    this.$el.addClass('busy');
    this.$previewEl.hide();
    this.selectMessage.$el.hide();

    // Fetch the full form definition from the serverside
    model.fetch({
      success : function(updatedModel){
        self.$el.removeClass('busy');
        // Give the animation some time to finish
        setTimeout(function(){
          if (self.error){
            self.error.$el.remove();
          }
          self.updatePreview(updatedModel);
        }, 500);
      },
      error : function(){
        self.$el.removeClass('busy');
        if (self.error){
          self.error.$el.remove();
        }
        self.error = new App.View.FullPageMessageView({ message : 'Error loading ' + self.pluralTitle.toLowerCase(), button : false, cb : function(){}});
        self.$el.append(self.error.render().$el);

      }
    });
  },
  onCreate : function(e){
    e.preventDefault();
    var self = this,
    el = e.target.nodeName.toLowerCase() === "a" ? $(e.target) : $(e.target).parent(),
    mode = $(el).data('mode');
console.log('onCreate - mode:', mode, ', singleTitle:', this.singleTitle, ', singleId:', this.singleId, 'pluralTitle:', this.pluralTitle);
    var createView = new App.View.FormCreateClone({collection : this.collection, mode : mode, singleTitle : this.singleTitle, singleId : this.singleId, pluralTitle : this.pluralTitle });
    this.$el.append(createView.render().$el);
  },
 onClone : function(e){
    e.preventDefault();
    var self = this,
    cloneSource = this.collection.findWhere({_id : this._id}),
    createView = new App.View.FormCreateClone({ collection : this.collection, mode : 'clone', cloneSource : cloneSource.toJSON(), singleId : this.singleId, singleTitle : this.singleTitle, pluralTitle : this.pluralTitle });
    this.$el.append(createView.render().$el);
  },
  onDelete : function(){
    var self = this,
    model = this.collection.findWhere({_id : this._id}),
    nameAttr = (self.singleTitle.toLowerCase()==="form") ? this.CONSTANTS.FORM.NAME : this.CONSTANTS.THEME.NAME,
    modal = new App.View.Modal({
      title: 'Confirm Delete',
      body: "Are you sure you want to delete " + self.singleTitle.toLowerCase() + " " + model.get(nameAttr) + "?",
      okText: 'Delete',
      cancelText : 'Cancel',
      ok: function (e) {
        model.destroy({
          success : function(){
            self.message(self.singleTitle + ' deleted successfully');
          },
          error : function(){
            self.message('Error deleting ' + self.singleTitle.toLowerCase(), 'danger');
          }
        });
      }
    });
    this.$el.append(modal.render().$el);
  }
});
