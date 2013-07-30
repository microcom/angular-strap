'use strict';

/**
 * @ngdoc directive
 * @name $strap.directives:bs-typeahead
 * @element input
 * @restrict A
 * @description
 *
 * ### An autocomplete widget directive based on Twitter Bootstrap.
 *
 * Use any input with typeahead functionality by appending a bs-typeahead attribute.
 *
 * <pre>
<input type="text" ng-model="typeaheadValue" bs-typeahead="typeahead">

<!-- You can also use a function -->
<input type="text" ng-model="typeaheadValue" bs-typeahead="typeaheadFn">

<!-- Function defined in your controller -->
$scope.typeaheadFn = function(query) {
  return $.map($scope.typeahead, function(country) {
    return country + '_1';
  });
}

<!-- Async function defined in your controller -->
$scope.typeaheadFn = function(query, callback) {
  $http.get('/stations/autocomplete?term='+query).success(function(stations) {
    callback(stations); // This will automatically open the popup with retrieved results
  });
}
 * </pre>
 *
 * @param {expression} bsTypeahead Scope array or function that will feed elements.
 * @param {number} items Max number of items to display. Default: 8
 * @param {boolean} match-all This will bypass the matcher function. Default: false
 * @param {number} min-length Minimal input length before displaying the typeahead.
 * @param {expression} matcher TODO
 * @param {expression} sorter TODO
 * @param {expression} highlighter TODO
 *
 */

angular.module('$strap.directives')

.directive('bsTypeahead', function($parse) {

  return {
    restrict: 'A',
    require: '?ngModel',
    link: function postLink(scope, element, attrs, controller) {

      var getter = $parse(attrs.bsTypeahead),
          setter = getter.assign,
          value = getter(scope);

      // Watch bsTypeahead for changes
      scope.$watch(attrs.bsTypeahead, function(newValue, oldValue) {
        if(newValue !== oldValue) {
          value = newValue;
        }
      });

      element.attr('data-provide', 'typeahead');
      element.typeahead({
        source: function(query) { return angular.isFunction(value) ? value.apply(null, arguments) : value; },
        minLength: attrs.minLength || 1,
        items: attrs.items,
        updater: function(value) {
          // If we have a controller (i.e. ngModelController) then wire it up
          if(controller) {
            scope.$apply(function () {
              controller.$setViewValue(value);
            });
          }
          scope.$emit('typeahead-updated', value);
          return value;
        }
      });

      // Bootstrap override
      var typeahead = element.data('typeahead');
      // Fixes #2043: allows minLength of zero to enable show all for typeahead
      typeahead.lookup = function(ev) {
        var items;
        this.query = this.$element.val() || '';
        if (this.query.length < this.options.minLength) {
          return this.shown ? this.hide() : this;
        }
        items = $.isFunction(this.source) ? this.source(this.query, $.proxy(this.process, this)) : this.source;
        return items ? this.process(items) : this;
      };

      // Return true on every item, for example if the dropdown is populated with server-side sugggestions
      if(!!attrs.matchAll) {
        typeahead.matcher = function(item) {
          return true;
        };
      }

      // Support 0-minLength
      if(attrs.minLength === '0') {
        setTimeout(function() { // Push to the event loop to make sure element.typeahead is defined (breaks tests otherwise)
          element.on('focus', function() {
            element.val().length === 0 && setTimeout(element.typeahead.bind(element, 'lookup'), 200);
          });
        });
      }

    }
  };

});
