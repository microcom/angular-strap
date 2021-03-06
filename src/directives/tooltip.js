'use strict';

angular.module('$strap.directives')

.directive('bsTooltip', function($parse, $compile, $strapConfig) {

  return {
    restrict: 'A',
    scope: true,
    link: function postLink(scope, element, attrs, ctrl) {
      var options = angular.extend(
        {
          title: function() { return angular.isFunction(value) ? value.apply(null, arguments) : value; },
          html: true
        },
        $strapConfig.tooltip
      );

      angular.forEach(
        [
          'animation',
          'html',
          'placement',
          'selector',
          'trigger',
          'delay',
          'container'
        ],
        function (key) {
          if (angular.isDefined(attrs[key])) {
            if (attrs[key] === 'true' || attrs[key] === 'false') {
              options[key] = (attrs[key] === 'true');
            } else if (/^\-?([0-9]+|Infinity)$/.test(attrs[key])) {
              options[key] = parseInt(attrs[key], 10);
            } else {
              options[key] = attrs[key];
            }
          }
        }
      );

      var getter = $parse(attrs.bsTooltip),
        setter = getter.assign,
        value = getter(scope);

      // Watch bsTooltip for changes
      scope.$watch(attrs.bsTooltip, function(newValue, oldValue) {
        if(newValue !== oldValue) {
          value = newValue;
        }
      });

      if(!!attrs.unique) {
        element.on('show', function(ev) {
          // Hide any active popover except self
          $('.tooltip.in').each(function() {
            var $this = $(this),
              tooltip = $this.data('tooltip');
            if(tooltip && !tooltip.$element.is(element)) {
              $this.tooltip('hide');
            }
          });
        });
      }

      // Initialize tooltip
      element.tooltip(options);

      // Bootstrap override to provide events & tip() reference
      var tooltip = element.data('tooltip');
      tooltip.show = function() {
        var r = $.fn.tooltip.Constructor.prototype.show.apply(this, arguments);
        // Bind tooltip to the tip()
        this.tip().data('tooltip', this);
        return r;
      };

      //Provide scope display functions
      scope._tooltip = function(event) {
        element.tooltip(event);
      };
      scope.hide = function() {
        element.tooltip('hide');
      };
      scope.show = function() {
        element.tooltip('show');
      };
      scope.dismiss = scope.hide;

    }
  };

});
