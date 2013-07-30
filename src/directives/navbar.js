'use strict';

/**
 * @ngdoc directive
 * @name $strap.directives:bs-navbar
 * @element div
 * @restrict A
 * @description
 *
 * ### A navbar widget directive based on Twitter Bootstrap.
 *
 * Performs regular expression tests with the data-match-route attribute when $location.path() gets updated.
 *
 * Toggles the active class for you. Trigger the behavior with a bs-navbar attribute.
 *
 * #### Example
 *
 * <pre>
<div class="navbar" bs-navbar>
  <div class="navbar-inner">
    <a class="brand" href="#">Title</a>
    <ul class="nav">
      <!-- You can use regular expressions -->
      <li data-match-route="/(:?navbar)"><a href="#/navbar">Home</a></li>
      <li data-match-route="/page-one"><a href="#/page-one">Page One</a></li>
      <li data-match-route="/page-two.*"><a href="#/page-two/sub-a">Page Two</a></li>
    </ul>
  </div>
</div>
 * </pre>
 *
 * @param {regexp} data-match-route A regular expression that will be matched with $location.path().
 */

angular.module('$strap.directives')

.directive('bsNavbar', function($location) {

  return {
    restrict: 'A',
    link: function postLink(scope, element, attrs, controller) {
      // Watch for the $location
      scope.$watch(function() {
        return $location.path();
      }, function(newValue, oldValue) {

        $('li[data-match-route]', element).each(function(k, li) {
          var $li = angular.element(li),
            // data('match-route') does not work with dynamic attributes
            pattern = $li.attr('data-match-route'),
            regexp = new RegExp('^' + pattern + '$', ['i']);

          if(regexp.test(newValue)) {
            $li.addClass('active').find('.collapse.in').collapse('hide');
          } else {
            $li.removeClass('active');
          }

        });
      });
    }
  };
});
