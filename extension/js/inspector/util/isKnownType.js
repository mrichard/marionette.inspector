define([], function() {
  return function(object) {
    return object.type.match(/backbone/) || object.type.match(/marionette/);
  }
})