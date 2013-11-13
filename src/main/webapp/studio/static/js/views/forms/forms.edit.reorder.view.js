var App = App || {};
App.View = App.View || {};

App.View.FormEditReorder = App.View.Forms.extend({
  templates : {
    form_pages : '#form_pages',
    form_page : '#form_page'
  },
  events : {},
  initialize: function(options){
    this.constructor.__super__.initialize.apply(this, arguments);
    this.fb = options.fb;
    this.form = options.form;
    this.$fbEl = options.$fbEl;
    // expects this.parent, a model this.parent.form, the parent to contain an instance of formbuilder, and that instance to be attached to this.fb
  },
  render : function(){
    var self = this,
    pagesQuery = {},
    pages;
    this.$el.empty();

    this.$el.addClass('span2');

    this.$el.append(this.templates.$form_pages());

    pagesQuery[this.CONSTANTS.FB.FIELD_TYPE] = this.CONSTANTS.FORM.PAGE_BREAK;
    pages = this.fb.mainView.collection.where(pagesQuery);

    _.each(pages, function(p){
      var page = self.templates.$form_page({_id :p.get('_id'), name :p.get('name')});
      self.$el.find('.form-pages').append(page);
    });

    this.$el.find('.form-pages').sortable({
      forcePlaceholderSize: true,
      stop : function(e, ui){
        var order = [],
        reOrdered = [],
        curPage;
        self.$el.find('.form-pages .form-page').each(function(el){
          order.push($(this).data('_id'));
        });
        /*
         We now have an array of the order of IDs - iterate over formbuilder's fields.
         . We then flatten reOrdered.
         */
        self.fb.mainView.collection.each(function(f){
          if (f.get('type')==='page_break'){ // TODO Constant
            /*
             Every time we find a page, add it and it's subsequent fields to a new array -
             then push this to reOrdered at indexOf the current page ID in order[].
             */
            if (curPage && curPage._id && curPage.length>0){
              var idx = order.indexOf(curPage._id);
              reOrdered[idx] = curPage;
            }
            curPage = [];
            curPage._id = f.get('_id');
          }
          /*
           First iteration might make reOrdered look like this:
           [ undefined, ArrayofFields, undefined]
           ..and eventually after we come across a few more pages
           all of reOrdered should be populated
           */
          curPage.push(f.toJSON());
        });
        var idx = order.indexOf(curPage._id);
        reOrdered[idx] = curPage;
        // Lastly now we're done iterating we flatten out our 2d array reOrdered, and load it back into formbuilder
        reOrdered = _.flatten(reOrdered);
        self.fb.mainView.collection.reset(reOrdered);
      }
    });
    this.$el.find('.form-page').click($.proxy(this.onFormPageClicked, this));
    return this;
  },
  onFormPageClicked : function(e){
    var el = (e.target.nodeName.toLowerCase()==="div") ? $(e.target) : $(e.target).closest('div'),
    _id = el.data('_id'),
    model = this.fb.mainView.collection.findWhere({_id : _id}),
    cid = model && model.cid;
    if ( el.is('.ui-draggable-dragging') ) {
      return;
    }

    var field = this.fb.mainView.$el.find(".fb-field-wrapper").filter(function(){ return $(this).data('cid') === cid; }),
    scroller = this.$fbEl.find('.middle .fb-response-fields'),
    scroll = scroller.scrollTop() + field.offset().top - 234;
    this.$fbEl.find('.middle .fb-response-fields').animate({scrollTop: scroll}, 750);
  },
  updatePreview: function(){
    var html = $(this.$el.find('.fb-response-fields').html());
    html.find('.actions-wrapper').remove();
    this.$el.find('.formPreviewContents').html(html);
  }
});