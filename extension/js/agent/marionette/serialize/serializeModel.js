this.serializeModel = function(model) {
  var data = {};

  if (!(model instanceof this.patchedBackbone.Model)) {
    return {};
  }

  data.attributes = this.inspectObject(model.attributes);
  data.properties = this.serializeObjectProperties(model);
  data._events = this.serializeModelEvents(model._events);
  data._previousAttributes = this.inspectObject(model._previousAttributes);
  data.changed = this.inspectObject(model.changed);
  data.cid = model.cid;

  return data;
}

this.serializeModelEvents = function(events) {

  if (_.isUndefined(events)) {
    return [];
  }

  var listeners = [];
  _.each(events, function(handlers, eventName) {
     _.each(handlers, function(handler) {
      listeners.push({
        eventName: eventName,
        context: this.inspectValue(handler.context),
        callback: this.inspectValue(handler.callback, handler.context)
      })
    }, this);
  }, this);

  return listeners;
}
