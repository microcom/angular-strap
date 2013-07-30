'use strict';

angular.module('$strap.directives')
/**
 * @ngdoc service
 * @name $strap.services:$modal
 * @description
 *
 * ### A modal widget service based on Twitter Bootstrap.
 *
 */

.factory('$modal', function($rootScope, $compile, $http, $timeout, $q, $templateCache, $strapConfig) {

  var ModalFactory = function ModalFactory(config) {

    function Modal(config) {

      var options = angular.extend({show: true}, $strapConfig.modal, config),
          scope = options.scope ? options.scope : $rootScope.$new(),
          templateUrl = options.template;

      return $q.when($templateCache.get(templateUrl) || $http.get(templateUrl, {cache: true}).then(function(res) { return res.data; }))
      .then(function onSuccess(template) {

        // Build modal object
        var id = templateUrl.replace('.html', '').replace(/[\/|\.|:]/g, '-') + '-' + scope.$id;
        var $modal = $('<div class="modal hide" tabindex="-1"></div>').attr('id', id).addClass('fade').html(template);
        if(options.modalClass) $modal.addClass(options.modalClass);

        $('body').append($modal);

        // Compile modal content
        $timeout(function() {
          $compile($modal)(scope);
        });

        // Provide scope display functions
        scope.$modal = function(name) {
          $modal.modal(name);
        };
        angular.forEach(['show', 'hide'], function(name) {
          scope[name] = function() {
            $modal.modal(name);
          };
        });
        scope.dismiss = scope.hide;

        // Emit modal events
        angular.forEach(['show', 'shown', 'hide', 'hidden'], function(name) {
          $modal.on(name, function(ev) {
            scope.$emit('modal-' + name, ev);
          });
        });

        // Support autofocus attribute
        $modal.on('shown', function(ev) {
          $('input[autofocus], textarea[autofocus]', $modal).first().trigger('focus');
        });
        // Auto-remove $modal created via service
        $modal.on('hidden', function(ev) {
          if(!options.persist) scope.$destroy();
        });

        // Garbage collection
        scope.$on('$destroy', function() {
          $modal.remove();
        });

        $modal.modal(options);

        return $modal;

      });

    }

    return new Modal(config);

  };

  return ModalFactory;

})
/**
 * @ngdoc directive
 * @name $strap.directives:bs-modal
 * @element div
 * @restrict A
 * @description
 *
 * ### A modal widget directive based on Twitter Bootstrap.
 *
 * Fetches an external html partial (or an inline ng-template) and populates the modal with its content.
 *
 * Use any button/link to trigger a modal by appending a bs-modal attribute.
 *
 * Both $scope.show(), $scope.hide() & $scope.$modal() are available inside the modal to toggle its visibility.
 *
 * #### Examples
 *
 * <pre>
<!-- Button to trigger modal -->
<button type="button" class="btn" bs-modal="'partials/modal.html'">...</button>

<!-- Modal (external ./partials/modal.html or inline ng-template) -->
<div class="modal-header">
  <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
  <h3>Modal header</h3>
</div>
<div class="modal-body">
  <p>{{modal.content}}</p>
  <br />
  <pre>2 + 3 = {{ 2 + 3 }}</pre>
</div>
<div class="modal-footer">
  <button type="button" class="btn" ng-click="hide()">Close</button>
  <button class="btn btn-primary" ng-click="modal.saved=true;hide()">Save changes</button>
</div>
 * </pre>
 *
 * @param {string} modal-class Class to add to the modal. Default: ''
 * @param {boolean|"static"} backdrop Includes a modal-backdrop element. Alternatively, specify static for a backdrop which doesn't close the modal on click. Default: true
 * @param {boolean} keyboard Closes the modal when escape key is pressed. Default: true
 * @param {boolean} show Default: true
 * @param {string} template Path to the template file to use. Default: ''
 * @param {string} bs-modal Same as template. Path to the template file to use. Default: ''
 *
 */

.directive('bsModal', function($q, $modal) {

  return {
    restrict: 'A',
    scope: true,
    link: function postLink(scope, iElement, iAttrs, controller) {

      var options = {
        template: scope.$eval(iAttrs.bsModal),
        persist: true,
        show: false,
        scope: scope
      };

      // $.fn.datepicker options
      angular.forEach(['modalClass', 'backdrop', 'keyboard'], function(key) {
        if(angular.isDefined(iAttrs[key])) options[key] = iAttrs[key];
      });

      $q.when($modal(options)).then(function onSuccess(modal) {
        iElement.attr('data-target', '#' + modal.attr('id')).attr('data-toggle', 'modal');
      });

    }
  };
});
