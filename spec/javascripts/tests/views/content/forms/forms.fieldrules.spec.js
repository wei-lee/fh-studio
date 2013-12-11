//describe("test forms list", function(){
//  var async = new AsyncSpec(this);
//  // run an async setup
//  async.beforeEach(function(done){
//    var formsList = getJSONFixture("forms/forms.json"),
//    loadFixtures('../common.html','index/forms/forms_tab.html');
//
//    App.Model.FormBase.prototype.fetch = function(options){
//      this.set(formsList.forms[0]);
//      return options.success(formsList.forms[0]);
//
//    };
//    App.Model.FormBase.prototype.destroy = function(options){
//      return options.success.apply(this, arguments);
//    };
//
//
//    spyOn(App.Collection.FormBase.prototype, 'read').andCallFake(function(method, model, options) {
//      switch(this.url){
//        case "/api/v2/forms/form/list":
//          return options.success(formsList.forms);
//      }
//    });
//
//    done();
//  }, 10);
//
//
//  async.it("Should have a fully populated forms list", function(done){
//    var formList = new App.View.FormList();
//    var form = this.views.forms.collection.at(0);
//
//    var view = new App.View.FormFieldRules({ form: form, $pagesMenuEl: {} });
//
//    console.log("view in test ", view);
//
////
////    view.render();
////
////    var formsView = view.views.forms,
////      formsLength = formsView.collection.length,
////      fixturesLength = getJSONFixture("forms/forms.json").forms.length;
////
////    expect(formsLength).toEqual(fixturesLength);
////
////    // Make sure FB starts up ok
////    expect(view.$el.find('.datatable tbody tr').length).toEqual(formsLength);
////
////
//////    formsView.fb.collection.bind('reset', function(){
//////
//////
//////    });
////    view.$el.find('.datatable tbody tr').first().click();
//    done();
//
//
//  });
//
//});
