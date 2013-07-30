'use strict';

/**
 * @ngdoc directive
 * @name $strap.directives:bs-popover
 * @element any
 * @restrict A
 * @description
 *
 * ### A popover widget directive based on Twitter Bootstrap
 *
 * Fetches an external html partial (or an inline ng-template) and populates the popover with its content.
 *
 * Use any button/link to trigger a popover menu by appending a bs-popover attribute.
 *
 * Methods $scope.show(), $scope.hide() and $scope.$popover() are available inside the popover to toggle its visibility.
 *
 * @param {boolean} animation Apply a CSS fade transition to the tooltip. Default: true
 * @param {string} placement One of top, bottom, left or right. How to position the popover. Default: 'right'
 * @param {string|false} selector If provided, tooltip objects will be delegated to this target. Default: false
 * @param {string} trigger Popover trigger on click, hover, focus or manual. Default: 'click'
 * @param {string} title Title value. Default: ''
 * @param {string} content Content value. Default: ''
 * @param {string|object} delay delay showing and hiding the popover (ms) - does not apply to manual trigger type. If a number is supplied, delay is applied to both hide/show. Default: 0
 * @param {string|false} container Appends the popover to a specific element. Default: false
 * @param {boolean} unique When present, will close other popovers when on is opened. Default: false
 */

angular.module('$strap.directives')

.directive('bsPopover', function($parse, $compile, $http, $timeout, $q, $templateCache) {

  // Hide popovers when pressing esc
  $('body').on('keyup', function(ev) {
    if(ev.keyCode === 27) {
      $('.popover.in').each(function() {
        $(this).popover('hide');
      });
    }
  });

  return {
    restrict: 'A',
    scope: true,
    link: function postLink(scope, element, attr, ctrl) {

      var getter = $parse(attr.bsPopover),
        setter = getter.assign,
        value = getter(scope),
        options = {};

      if(angular.isObject(value)) {
        options = value;
      }

      $q.when(options.content || $templateCache.get(value) || $http.get(value, {cache: true})).then(function onSuccess(template) {

        // Handle response from $http promise
        if(angular.isObject(template)) {
          template = template.data;
        }

        // Handle data-unique attribute
        if(!!attr.unique) {
          element.on('show', function(ev) { // requires bootstrap 2.3.0+
            // Hide any active popover except self
            $('.popover.in').each(function() {
              var $this = $(this),
                popover = $this.data('popover');
              if(popover && !popover.$element.is(element)) {
                $this.popover('hide');
              }
            });
          });
        }

        // Handle data-hide attribute to toggle visibility
        if(!!attr.hide) {
          scope.$watch(attr.hide, function(newValue, oldValue) {
            if(!!newValue) {
              popover.hide();
            } else if(newValue !== oldValue) {
              popover.show();
            }
          });
        }

        if(!!attr.show) {
          scope.$watch(attr.show, function(newValue, oldValue) {
            if(!!newValue) {
              $timeout(function() {
                popover.show();
              });
            } else if(newValue !== oldValue) {
              popover.hide();
            }
          });
        }

        // Initialize popover
        element.popover(angular.extend({}, options, {
          content: template,
          html: true
        }));

        // Bootstrap override to provide tip() reference & compilation
        var popover = element.data('popover');
        popover.hasContent = function() {
          return this.getTitle() || template; // fix multiple $compile()
        };
        popover.getPosition = function() {
          var r = $.fn.popover.Constructor.prototype.getPosition.apply(this, arguments);

          // Compile content
          $compile(this.$tip)(scope);
          scope.$digest();

          // Bind popover to the tip()
          this.$tip.data('popover', this);

          return r;
        };

        // Provide scope display functions
        scope.$popover = function(name) {
          popover(name);
        };
        angular.forEach(['show', 'hide'], function(name) {
          scope[name] = function() {
            popover[name]();
          };
        });
        scope.dismiss = scope.hide;

        // Emit popover events
        angular.forEach(['show', 'shown', 'hide', 'hidden'], function(name) {
          element.on(name, function(ev) {
            scope.$emit('popover-' + name, ev);
          });
        });

      });

    }
  };

});