'use strict';
// https://github.com/eternicode/bootstrap-datepicker

/**
 * @ngdoc directive
 * @name $strap.directives:bs-datepicker
 * @element input
 * @restrict A
 * @description
 *
 * ### A datepicker widget directive based on Bootstrap Datepicker.
 *
 * #### i18n
 *
 * The plugin supports i18n for the month and weekday names and the weekStart option. The default is English ('en'); other available translations are available in the js/locales/ directory, simply include your desired locale after the plugin. To add more languages, simply add a key to $.fn.datepicker.dates , before calling .datepicker() .
 *
 * Example:
 * <pre>
    $.fn.datepicker.dates['en'] = {
    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    today: "Today"
    };
 * </pre>
 *
 * #### Notes
 *
 * Will behave correctly on Apple Touch devices.
 *
 * @param {string} date-type Either 'date', to output a Javascript format date or 'iso', to output an ISO format date. Default : 'date'
 * @param {string} format The date format described as a combination of d, dd, D, DD, m, mmm, M, MM, yy, yyyy. Lowercase is numeric, uppercase is textual. Length of segment defines short vs long forms. Default: mm/dd/yyyy
 * @param {number} week-start Day of the week start, 0 being Sunday and 6, Saturday. Default: 0
 * @param {boolean} calendar-weeks Show or not the week numbers to the left of the week rows. Default: false
 * @param {date} start-date Earliest date that may be selected. Default: -Infinity
 * @param {date} end-date Latest dat that may be selected. Default: Infinity
 * @param {string} days-of-week-disabled Comma separated string of numbers from 0 to 6 representing days that should be disabled. Default: ''
 * @param {boolean} autoclose Whether or not to close the datepicker immediately after a date is selected. Default: true
 * @param {number|string} The view that the datepicker should show when it is opened. Accepts values of 0 or 'month' for month view (the default), 1 or 'year' for the 12-month overview, and 2 or 'decade' for the 10-year overview. Useful for date-of-birth datepickers. Default: 0, 'month'
 * @param {number} min-view-mode Set a limit for the view mode. Accepts: 'days' or 0, 'months' or 1, and 'years' or 2. Gives the ability to pick only a month or an year. The day is set to the 1st for 'months', and the month is set to January for 'years'. Default: 0, 'days'
 * @param {boolean|"linked"} today-btn If true or "linked", displays a "Today" button at the bottom of the datepicker to select the current date. If true, the "Today" button will only move the current date into view; if "linked", the current date will also be selected. Default: false
 * @param {boolean} today-highlight If true, highlights the current date. Default: false
 * @param {boolean} keyboard-navigation Whether or not to allow date navigation by arrow keys. Default: false
 * @param {string} language The IETF code (eg "en" for English, "pt-BR" for Brazilian Portuguese) of the language to use for month and day names. These will also be used as the input's value (and subsequently sent to the server in the case of form submissions). If a full code (eg "de-DE") is supplied the picker will first check for an "de-DE" language and if not found will fallback and check for a "de" language. If an unknown language code is given, English will be used. Default: en
 * @param {boolean} force-parse Whether or not to force parsing of the input value when the picker is closed. That is, when an invalid date is left in the input field by the user, the picker will forcibly parse that value, and set the input's value to the new, valid date, conforming to the given format.
 *
 */

angular.module('$strap.directives')

.directive('bsDatepicker', function($timeout, $strapConfig) {

  var isAppleTouch = /(iP(a|o)d|iPhone)/g.test(navigator.userAgent);

  var regexpMap = function regexpMap(language) {
    language = language || 'en';
    return {
      '/'    : '[\\/]',
      '-'    : '[-]',
      '.'    : '[.]',
      ' '    : '[\\s]',
      'dd'   : '(?:(?:[0-2]?[0-9]{1})|(?:[3][01]{1}))',
      'd'    : '(?:(?:[0-2]?[0-9]{1})|(?:[3][01]{1}))',
      'mm'   : '(?:[0]?[1-9]|[1][012])',
      'm'    : '(?:[0]?[1-9]|[1][012])',
      'DD'   : '(?:' + $.fn.datepicker.dates[language].days.join('|') + ')',
      'D'    : '(?:' + $.fn.datepicker.dates[language].daysShort.join('|') + ')',
      'MM'   : '(?:' + $.fn.datepicker.dates[language].months.join('|') + ')',
      'M'    : '(?:' + $.fn.datepicker.dates[language].monthsShort.join('|') + ')',
      'yyyy' : '(?:(?:[1]{1}[0-9]{1}[0-9]{1}[0-9]{1})|(?:[2]{1}[0-9]{3}))(?![[0-9]])',
      'yy'   : '(?:(?:[0-9]{1}[0-9]{1}))(?![[0-9]])'
    };
  };

  var regexpForDateFormat = function regexpForDateFormat(format, language) {
    var re = format, map = regexpMap(language), i;
    // Abstract replaces to avoid collisions
    i = 0;
    angular.forEach(map, function(v, k) {
      re = re.split(k).join('${' + i + '}');
      i++;
    });
    // Replace abstracted values
    i = 0;
    angular.forEach(map, function(v, k) {
      re = re.split('${' + i + '}').join(v);
      i++;
    });
    return new RegExp('^' + re + '$', ['i']);
  };

  return {
    restrict: 'A',
    require: '?ngModel',
    link: function postLink(scope, element, attrs, controller) {

      var options = angular.extend({autoclose: true}, $strapConfig.datepicker || {}),
          type = attrs.dateType || options.type || 'date';

      // $.fn.datepicker options
      angular.forEach(['format', 'weekStart', 'calendarWeeks', 'startDate', 'endDate', 'daysOfWeekDisabled', 'autoclose', 'startView', 'minViewMode', 'todayBtn', 'todayHighlight', 'keyboardNavigation', 'language', 'forceParse'], function(key) {
        if(angular.isDefined(attrs[key])) options[key] = attrs[key];
      });

      var language = options.language || 'en',
          readFormat = attrs.dateFormat || options.format || ($.fn.datepicker.dates[language] && $.fn.datepicker.dates[language].format) || 'mm/dd/yyyy',
          format = isAppleTouch ? 'yyyy-mm-dd' : readFormat,
          dateFormatRegexp = regexpForDateFormat(format, language),
          ISODateRegexp = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;

      // Handle date validity according to dateFormat
      if(controller) {

        // modelValue -> $formatters -> viewValue
        controller.$formatters.unshift(function(modelValue) {
          if (modelValue && type === 'iso' && ISODateRegexp.test(modelValue)) {
            return $.fn.datepicker.DPGlobal.parseDate(new Date(modelValue), $.fn.datepicker.DPGlobal.parseFormat(readFormat), language);
          } else if(modelValue && type === 'date' && angular.isString(modelValue)) {
            return $.fn.datepicker.DPGlobal.parseDate(modelValue, $.fn.datepicker.DPGlobal.parseFormat(readFormat), language);
          } else {
            return modelValue;
          }
        });

        // viewValue -> $parsers -> modelValue
        controller.$parsers.unshift(function(viewValue) {
          if(!viewValue) {
            controller.$setValidity('date', true);
            return null;
          } else if ((type === 'date' || type === 'iso') && angular.isDate(viewValue)) {
            controller.$setValidity('date', true);
            return viewValue;
          } else if(angular.isString(viewValue) && dateFormatRegexp.test(viewValue)) {
            controller.$setValidity('date', true);
            if(isAppleTouch) return new Date(viewValue);
            return type === 'string' ? viewValue : $.fn.datepicker.DPGlobal.parseDate(viewValue, $.fn.datepicker.DPGlobal.parseFormat(format), language);
          } else {
            controller.$setValidity('date', false);
            return undefined;
          }
        });

        // ngModel rendering
        controller.$render = function ngModelRender() {
          if(isAppleTouch) {
            var date = controller.$viewValue ? $.fn.datepicker.DPGlobal.formatDate(controller.$viewValue, $.fn.datepicker.DPGlobal.parseFormat(format), language) : '';
            element.val(date);
            return date;
          }
          if(!controller.$viewValue) element.val('');
          return element.datepicker('update', controller.$viewValue);
        };

      }

      // Use native interface for touch devices
      if(isAppleTouch) {

        element.prop('type', 'date').css('-webkit-appearance', 'textfield');

      } else {

        // If we have a ngModelController then wire it up
        if(controller) {
          element.on('changeDate', function(ev) {
            scope.$apply(function () {
              controller.$setViewValue(type === 'string' ? element.val() : ev.date);
            });
          });
        }

        // Create datepicker
        // element.attr('data-toggle', 'datepicker');
        element.datepicker(angular.extend(options, {
          format: format,
          language: language
        }));

        // Garbage collection
        scope.$on('$destroy', function() {
          var datepicker = element.data('datepicker');
          if(datepicker) {
            datepicker.picker.remove();
            element.data('datepicker', null);
          }
        });

        // Update start-date when changed
        attrs.$observe('startDate', function(value) {
          element.datepicker('setStartDate',value);
        });

        // Update end-date when changed
        attrs.$observe('endDate', function(value) {
          element.datepicker('setEndDate',value);
        });

      }

      // Support add-on
      var component = element.siblings('[data-toggle="datepicker"]');
      if(component.length) {
        component.on('click', function() {
          if (!element.prop('disabled')) { // Hack check for IE 8
            element.trigger('focus');
          }
        });
      }

    }

  };

});
