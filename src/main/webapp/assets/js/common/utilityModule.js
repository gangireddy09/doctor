angular.module('utility', ['camera', 'ngDialog', 'ui.bootstrap'])
.directive('tcCamera', ['ngDialog', function(ngDialog) {
	return {
		restrict: 'E',
		scope: {
			model: "=ngModel",
			onCapture: '&',
			confirmText: '@'
		},
		template: '<button class="btn btn-info"ng-click="capturePhoto()">Photo</button>',
		link: function(scope, ele, attr) {
			scope.autoClose = !scope.confirmText;
			scope.setModel = function(snap) {
				scope.tempModel = snap;
			};
			scope.setConfirmed = function(confirmed) {
				scope.confirmed = confirmed;
			};
			scope.capturePhoto = function() {
				ngDialog.open({
		    		template:'capturPhotoTemplate.html',
		    		className: 'ngdialog-theme-default ngdialog-lg',
		    		controller: 'cameraModelCtrl',
		    		scope: scope
		    	}).closePromise.then(function() {
		    		if (typeof scope.onCapture === 'function') {
		    			if (scope.confirmed) {
		    				scope.model = scope.tempModel;
		    			}
		    			scope.onCapture({$snap: scope.tempModel});
		    		}
		    	});
			};	
		}
	};
}])
.controller('cameraModelCtrl', ['$scope', 'ngDialog', function($scope, ngDialog) {
	$scope.onCamCapture = function(snap) {
		$scope.setModel(snap);
		if ($scope.autoClose) {
			$scope.confirm();
		}
	};
	
	$scope.confirm = function() {
		$scope.setConfirmed(true);
	};

	$scope.cancel = function() {
		$scope.setConfirmed(false);
	};
}])
.run(['$templateCache', function($templateCache) {
	$templateCache.put('capturPhotoTemplate.html', '<div class="camera-wrapper row">'
				+ '<ng-camera capture-message="Done!" class="grid-md-5"'
				+ 'countdown="3"'
				+ 'output-height="240"'
				+ 'output-width="320"'
				+ 'viewer-height="315"'
				+ 'viewer-width="420"'
				+ 'image-format="jpeg"'
				+ 'jpeg-quality="100"'
				+ 'action-message="Take picture"'
				+ 'snapshot="model"'
				+ 'overlay-url="./assets/images/overlay.png"'
				+ 'shutter-url="./assets/sounds/camera-click.mp3"'
				+ 'on-capture="onCamCapture($snap)">'
			+ '</ng-camera>'
			+ '<div class="preview-wrapper grid-md-5" ng-if="model">'
				+ '<img ng-src="{{model}}" alt="Click capture to see preview"/>'
					+ '<div class="grid-md-4 ngdialog-buttons">'
						+ '<button class="btn btn-md btn-green" ng-if="confirmText && model" ng-click="confirm();closeThisDialog(0)">{{confirmText}}</button>'
						+ '<button class="btn btn-md btn-grey" ng-if="confirmText" ng-click="cancel();closeThisDialog(0);">Cancel</button>'
					+ '</div>'
			+ '</div>');
	$templateCache.put('dateInputTemplate.html', '{{showWeeks}}<input type="text" placeholder="{{placeholder}}" class="form-field grid-md-12" ng-attr-name="{{name}}"'
			+ 'uib-datepicker-popup ng-model="model"' 
				+ 'is-open="calendarPanel.opened" datepicker-options="dateOptions"'
				+ 'ng-required="true" close-text="Close" />'
			+ '<span class="form-field-icon">'
				+ '<button type="button" class="btn btn-sm btn-sky-blue"'
					+ 'ng-click="openCalendar()">'
					+ '<i class="fa fa-calendar"></i>'
				+ '</button>'
			+ '</span>');
}]).directive('bindHtmlCompile', function($compile) {
	return {
		restrict : 'A',
		link : function(scope, element, attrs) {
			scope.$watch(function() {
				return scope.$eval(attrs.bindHtmlCompile);
			}, function(value) {
				element.html(value);
				$compile(element.contents())(scope);
			});
		}
	};
}).directive('fileViewer', function() {
	return {
		restrict: 'E',
//		templateUrl: './views/dataEntry/lab/imageView.html',
		scope: {
			files: '='
		},
		link: function(scope, ele) {
			scope.width = ele[0].offsetWidth;
			scope.slide = 0;
			scope.currentIndex = 0;
			scope.fileContent = [];
			angular.forEach(scope.files, function(file) {
				var name = file.split('.');
				scope.fileContent.push({
					name: file,
					format: name[name.length - 1]
				});
			});
			
			scope.changeSlide = function(index) {
				scope.currentIndex = index;
			};
		},
		template: '<div class="file-wrapper">'
					+'<div class="files-container" style="width:{{fileContent.length * 100}}%; left: -{{currentIndex*width}}px">'
						+'<div class="file" style="width: {{width}}px"ng-repeat="file in fileContent">'
							+'<img src="{{file.name}}" ng-if="file.format===\'jpg\'"/>'
							+'<iframe ng-attr-src="file.name" ng-if="file.format===\'pdf\'"></iframe>'
						+'</div>'
					+'</div>'
				+'</div>'
				+'<button ng-repeat="file in fileContent" ng-click="changeSlide($index)">{{$index+1}}</button>'
	};
});