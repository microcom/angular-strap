
angular.module('$strap.config', []).value('$strapConfig', {});
angular.module('$strap.filters', ['$strap.config']);
angular.module('$strap.services', ['$strap.config']);
angular.module('$strap.directives', ['$strap.config', '$strap.services']);
angular.module('$strap', [
  '$strap.filters',
  '$strap.directives',
  '$strap.config',
  '$strap.services'
]);
