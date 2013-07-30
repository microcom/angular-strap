'use strict';

/**
 * @ngdoc directive
 * @name $strap.directives:bs-buttons-select
 * @element button
 * @restrict A
 * @description
 *
 * ### A switchable button widget directive based on Twitter Bootstrap
 *
 * #### Usage
 *
 * Add to a button element to change the content of that element.
 *
 * @param {array} bs-button-select Array containing strings that will be cycled through.
 * @param {expression} ng-model Scope expression where to put the string selected.
 *
 */

angular.module('$strap.directives')

.directive('bsButtonSelect', ['$parse', '$timeout', function($parse, $timeout) {

  return {
    restrict: 'A',
    require: '?ngModel',
    link: function postLink(scope, element, attrs, ctrl) {

      var getter = $parse(attrs.bsButtonSelect),
        setter = getter.assign;

      // Bind ngModelController
      if(ctrl) {
        element.text(scope.$eval(attrs.ngModel));
        // Watch model for changes
        scope.$watch(attrs.ngModel, function(newValue, oldValue) {
          element.text(newValue);
        });
      }

      // Click handling
      var values, value, index, newValue;
      element.bind('click', function(ev) {
        values = getter(scope);
        value = ctrl ? scope.$eval(attrs.ngModel) : element.text();
        index = values.indexOf(value);
        newValue = index > values.length - 2 ? values[0] : values[index + 1];

        scope.$apply(function() {
          element.text(newValue);
          if(ctrl) {
            ctrl.$setViewValue(newValue);
          }
        });
      });
    }
  };

}]);
