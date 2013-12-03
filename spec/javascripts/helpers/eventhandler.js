// Setup our fixtures path
jasmine.getFixtures().fixturesPath = 'src/main/webapp/studio/inc';
jasmine.getJSONFixtures().fixturesPath = 'src/main/webapp/studio/static/js/model/backbone/mocks';

jasmine.CATCH_EXCEPTIONS = false;
jasmine.VERBOSE = true;

// spy on view & assert element triggers correct callback on view when clicked
var testEventHandler = function(fn, id) {
  spyOn(this.view, fn);
  this.view.render();
  this.view.delegateEvents();

  // verify no calls to function yet
  expect(this.view[fn].calls.length).toEqual(0);
  // emit click event with correct context, verify fn called

  if (id) {
    this.view.$el.find(id).trigger('click');
  } else {
    this.view.$el.trigger('click');
  }

  expect(this.view[fn].calls.length).toEqual(1);
}