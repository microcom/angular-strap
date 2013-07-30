/**
 * @doc module
 * @name $strap
 * @description
 *
 * # AngularStrap
 * ## Twitter Bootstrap directives for AngularJS
 *
 * **Version : v0.7.4 - 2013-05-26**
 *
 * http://mgcrea.github.com/angular-strap
 *
 * by _Olivier Louvignes_ <olivier@mg-crea.com>
 *
 * MIT License, http://www.opensource.org/licenses/MIT
 *
 */

/**
 * AngularStrap - Twitter Bootstrap directives for AngularJS
 * @version v0.7.4 - 2013-05-26
 * @link http://mgcrea.github.com/angular-strap
 * @author Olivier Louvignes <olivier@mg-crea.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
angular.module('$strap.config', []).value('$strapConfig', {});
angular.module('$strap.filters', ['$strap.config']);
angular.module('$strap.directives', ['$strap.config']);
angular.module('$strap', ['$strap.filters', '$strap.directives', '$strap.config']);
