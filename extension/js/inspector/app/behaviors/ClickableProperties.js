define([
  'marionette',
  'util/Radio',
  'client',
  'util/isViewType',
  'util/clientInspect',
  'util/isKnownType'
], function(Marionette, Radio, client, isViewType, clientInspect, isKnownType) {

  return Marionette.Behavior.extend({
    ui: {
      property: '[data-property-name]',
      propertyContext: '[data-property-value-context]',
      propertyCallback: '[data-property-value-callback]'
    },

    events: {
      'click @ui.property': 'onClickProperty',
      'click @ui.propertyContext': 'onClickContext',
      'click @ui.propertyCallback': 'onClickCallback'
    },

    initialize: function() {
      this.client = client;
    },

    /* onClickContext handles clicks on a context object that looks like this
     *
     * <span data-property-value-context>
     *
     * We first figure out which object was clicked on,
     * then tell the app to navigate to that item.
     */
    onClickContext: function(e) {
      e.stopPropagation();
      var property = this._indexedProperty($(e.currentTarget));
      var object = property.context;
      this.navigateTo(object);
    },

    onClickCallback: function(e) {
      e.stopPropagation();
      var property = this._indexedProperty($(e.currentTarget));

      clientInspect({
        type: isViewType(property.context) ? 'View' : 'Model', // view
        cid: property.context.cid, // view27
        path: property.callback.key // render
       });
    },

    /*
     * onClickProperty tries to find the property you clicked on and
     * either navigate to it if it's a known object, function, or element or print
     * it to the console.
     *
     * Works with several different types:
     * 1. view el  (property-name '', property-key 'el')
     * 2. view options model  (property-name 'options', property-key 'model')
     * 3. view ancestor functions like trigger (property-key 'constructor.prototype.constructor.__super__', property-name 'trigger')
     *
     * @param property-key - the place to find the property
     * @param property-name - the name of the property we're looking for
     */
    onClickProperty: function(e) {
      e.stopPropagation();

      var $target = $(e.currentTarget);
      var propertyKey = $target.data('property-key') || $target.closest('ol').data('property-key');
      var propertyName = $target.data('property-name');

      if (propertyKey && !propertyKey.match(/\./)) {

        // the property key is probably 'options' or 'attributes'
        // and we know that we've already serialized that in the model (viewModel or modelModel)
        var property = this.view.model.get(propertyKey);
        if (!property) {
          return
        }

        var object = property[propertyName]
      } else {

        // If we don't have a property key then we're
        // looking for an object that is in the model's properties

        // If the property key has a period, then we're assuming
        // we're looking for an property that's in a parent class (constructor.prototype).

        // We do not support getting objects that are nested in one of the properties like (options.foo).
        // This need might come up at somepoint and we can deal with that then :)

        // this is the case where we're looking directly on the instance
        // in the properties.
        var properties = this.view.model.get('properties');
        var object = properties[propertyName];
      }

      if (!object) {
        return;
      }

      var path;
      if (propertyKey) {
        path = propertyKey + '.' + propertyName;
      } else {
        path = propertyName;
      }

      if (isKnownType(object)) {
        this.navigateTo(object);
      } else {
        this.view.model.clientInspect(path);
      }
    },

    navigateTo: function(object) {
      if (object && object.type && object.cid) {
        Radio.command('app', 'navigate:knownObject', {
          object: object
        });
      }
    },

    /* _indexedProperty finds an object based on a target span that looks like this
     *
     * <ol data-property-key="_events">
     *   <li data-property-index="{{@index}}">
     *      <span class="name"> </span>:
     *      <span data-property-value-context> </span>
     *   </li>
     * </ol>
     *
     * We do this, but determining the property key (e.g. _events)
     * and index (appearance in the _events array). Then we fetch the property
     * from the view's model which has serialized representation of the object (View or Model).
     */
    _indexedProperty: function($target) {
      var propertyKey = $target.data('property-key') || $target.closest('ol').data('property-key');
      var propertyIndex = $target.closest('li').data('property-index');


      var properties = this.view.model.get(propertyKey);
      if (!properties) {
        return
      }

      var property = properties[propertyIndex]
      if (!property) {
        return
      }

      return property;
    }

  });

});