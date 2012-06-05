/*
 * Provides a mechanism for intercepting events and calling any relevant 
 * handlers/subscribers interested in those events
 */

/*globals document, $, EventManager EventChain
*/

EventManager = function () {
  var self = {
    numIntercepted: 0,
    
    // Returns the number of intercepted events
    getNumIntercepted: function () {
      return self.numIntercepted;
    },
    // increments the number of intercepted events by 1
    incrementIntercepted: function () {
      self.numIntercepted++;
    },
    
    /*
     * Bind the given target event to the passed in component, and 
     * set up the event chain for any events to be called also
     * 
     * params: 
     *  jq_comp - the jQuery component to bind to
     *  eventType - the event type e.g. 'click'
     *  target - the target event handler function to execute
     *  chain - an EventChain containing any events to be called
     */
     // TODO: prechain and postchain
    registerEvent: function (jq_comp, eventType, target, chain) {
      jq_comp.bind(eventType, function () {
        var events = chain.getChain();
        for (var fi = 0;fi < events.length;fi++) {
          var event = events[fi];
          if ('function' === typeof event) {
            event.call(this);
          }
        }
        target.call(this);
        self.incrementIntercepted();
      });
    },
    
    track: function (id) {
      Log.append(id, 'TRACKING_EVENT');
      
      
      
    },
    
    init: function () {
    }
  };
  
  self.init();

  return {
    getNumIntercepted: self.getNumIntercepted,
    //setUpEvents: self.setUpEvents,
    registerEvent: self.registerEvent,
    track: self.track
  };
};