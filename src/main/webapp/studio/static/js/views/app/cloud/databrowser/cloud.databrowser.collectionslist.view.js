App.View.DataBrowserCollectionsList = App.View.DataBrowserView.extend({
  templates : {
    collectionsList: '#collectionsList',
    collectionsListItem : '#collectionsListItem',
    databrowserNavbar : '#databrowserNavbar',
   // TODO: Empty collections list gets this

  },
  initialize : function(options){
    this.collection = options.collection;
    this.collection.bind('reset', this.render, this);
    this.compileTemplates();
    this.breadcrumb(['Data Browser', 'Collections']);
  },
  render: function() {
    var self = this,
    nav = this.templates.$databrowserNavbar({ brand : 'Collections', class : 'collectionsnavbar', baritems : '' });

    this.$el.empty();
    this.$el.append(nav);

    //this.collection.length = 0; // todo remove me
    if (this.collection.length === 0){
      var messageView = new App.View.DataBrowserMessageView({ message : 'Your app has no collections', button : '<i class="icon-plus"></i> Add one', cb : function(e){
        self.onCreateCollection.apply(self, arguments);
      }});
      this.$el.append(messageView.render().$el);
    }else{
      this.renderCollections();
    }
    this.collection.bind('reset', this.renderCollections);

    return this;
  },
  renderCollections : function(){
    var self = this,
    collectionItems = [],
    body, collectionItem;

    this.collection.each(function(model){
      var jsonModel = model.toJSON();
      jsonModel.id = model.id;
      jsonModel.size = Math.round((jsonModel.size/1048576)*100)/100; // size to MB rounded to 2 decimal places
      collectionItem = self.templates.$collectionsListItem( jsonModel );
      collectionItems.push(collectionItem);
    });

    body = $(this.templates.$collectionsList({ collections : collectionItems.join('') }));
    this.$el.append(body);
  },
  hide : function(){
    this.$el.hide();
    this.shown = false;
  },
  show : function(){
    this.$el.show();
    this.shown = true;
  },
  onCreateCollection : function(){
    var self = this,
    modal  = new App.View.Modal({
      title : 'Create New Collection',
      body : 'Enter a name to describe your new collection: <br /> <input placeholder="Collection Name" id="newCollectionName">',
      okText : 'Create',
      ok : function(e){
        var el = $(e.target),
        input = el.parents('.modal').find('input'),
        val = input.val();

        self.doCreateCollection(val);
      }
    });
    self.$el.append(modal.render().$el);
  },
  doCreateCollection : function(val){
     //TODO: Create on the model, dispatch to the server...
  }
});