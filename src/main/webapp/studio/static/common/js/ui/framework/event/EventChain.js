/*
 * Represents a chain for events to be executed i.e. the events are to be triggered in a certain order
 */
EventChain = function () {
  var self = {
    chain: [],
    
    /*
     * add a another event to the end of the chain
     */
    push: function (event) {
      self.chain.push(event);
    },
    
    getChain: function () {
      return self.chain;
    }
  };
  
  return {
    push: self.push,
    getChain: self.getChain
  };
};