'use strict';

/**
 * @ngdoc directive
 * @name $strap.directives:bs-select
 * @element input
 * @restrict A
 * @description
 *
 * ### A select widget directive based on Bootstrap Select.
 *
 * Append a bs-select attribute to enable bootstrap-select on a regular Angular select.
 *
 * @param {string|false} container Appends the select to a specific element or selector. Default: false
 * @param {boolean} hide-disabled Removes disabled options and optgroups from the menu. Default: false
 * @param {'value'|'count'|'count > #'} selected-text-format Where # is an integer. Specifies how the selection is displayed with a multiple select. Default: null
 * @param {string} count-selected-text Sets the format for the text displayed when selectedTextFormat is count or count > #. {0} is the selected amount. {1} is total available for selection. Default: '{0} of {1} selected'
 * @param {'auto'|integer|false} data-size When set to 'auto', the menu always opens up to show as many items as the window will allow without being cut off. Set to false to always show all items. Default: 'auto'
 * @param {boolean} show-subtext Subtext associated with a selected option will be displayed in the button.  Default: false
 * @param {boolean} show-icon Display icon(s) associated with selected option(s) in the button. If false, icons will not be displayed in the button. Default: true
 * @param {string} data-style Apply a class to the button. See bootstrap buttons styles. Default: null
 * @param {string} data-title Set the default text for bootstrap-select. Default: null
 * @param {'auto'|'#px'|'#%'} data-width Auto automatically adjusts the width of the select to accommodate its widest option. Other options set the width of the select manually, e.g. 300px or 50%. Default: null
 *
 */

angular.module('$strap.directives')

.directive('bsSelect', function($timeout) {

  var NG_OPTIONS_REGEXP = /^\s*(.*?)(?:\s+as\s+(.*?))?(?:\s+group\s+by\s+(.*))?\s+for\s+(?:([\$\w][\$\w\d]*)|(?:\(\s*([\$\w][\$\w\d]*)\s*,\s*([\$\w][\$\w\d]*)\s*\)))\s+in\s+(.*)$/;

  return {
    restrict: 'A',
    require: '?ngModel',
    link: function postLink(scope, element, attrs, controller) {

      var options = scope.$eval(attrs.bsSelect) || {};

      $timeout(function() {
        element.selectpicker(options);
        element.next().removeClass('ng-scope');
      });

      // If we have a controller (i.e. ngModelController) then wire it up
      if(controller) {

        // Watch for changes to the model value
        scope.$watch(attrs.ngModel, function(newValue, oldValue) {
          if (!angular.equals(newValue, oldValue)) {
            element.selectpicker('refresh');
          }
        });

      }

    }

  };

});
