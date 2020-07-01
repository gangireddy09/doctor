angular.module("doctorModule").directive("labSelector", ['$filter', '$parse', function($filter, $parse) {
	return {
		restrict : 'E',
		templateUrl: './views/billdesk/prelabs/templates/labSelector.html',
		scope : {
			selectedLabs : '=',
			labsData : '=',
			onSelect : '&',
			onUnSelect : '&',
			onSelectionChange: '&',
			options : '='
		},

		controller : function($scope) {
			$scope.init = function(){
				$scope.filteredData = $scope.labsData;
				$scope.options.removeTest = $scope.remove;
			};
			$scope.selectedLabs = $scope.selectedLabs || {};
			$scope.printTreeValue = function(labTestsData) {
				labTestsData.isSelected = true;
				if (labTestsData.isTest) {
					$scope.addToSelected(labTestsData);
				} else {
					for (var i = 0; i < labTestsData.subTests.length; i++) {
						$scope.printTreeValue(labTestsData.subTests[i]);
					}
				}
			};

			$scope.remove = function(testObj) {
				testObj.isSelected = false;
				if (testObj.isTest) {
					$scope.removeFromSelected(testObj);
				} else {
					var subMenu = testObj.subTests;
					for (var i = 0; i < subMenu.length; i++) {
						if (subMenu[i].isTest) {
							subMenu[i].isSelected = false;
							$scope.removeFromSelected(subMenu[i]);
						} else {
							$scope.remove(subMenu[i]);
						}
					}
				}
				if(typeof $scope.onSelectionChange === 'function') {
					$scope.onSelectionChange();
				}
			};
			function isPrescribedTest(test){
				var selectedTests = $scope.selectedLabs[test.categoryName];
				if (selectedTests) {
					var obj = selectedTests.search('id', test.id);
					return $parse('isPrescribed')(obj);
				}
			}
			$scope.selectedObject = function(testObj, state) {
				if (!isPrescribedTest(testObj)) {
					$scope.remove(testObj);
					if (state) {
						$scope.printTreeValue(testObj);
					} else {
						$scope.remove(testObj);
					}
					if(typeof $scope.onSelectionChange === 'function') {
						$scope.onSelectionChange();
					}
					$scope.options.selectAll = false;
				}
			};

			$scope.addToSelected = function(labTest) {
				if (!$scope.selectedLabs[labTest.categoryName] || !$scope.selectedLabs[labTest.categoryName].length) {
					$scope.selectedLabs[labTest.categoryName] = [];
				}
				$scope.selectedLabs[labTest.categoryName].push(labTest);
			};

			$scope.removeFromSelected = function(labTest) {
				var selectedTests = $scope.selectedLabs[labTest.categoryName];
				if (selectedTests) {
					var obj = selectedTests.search('id', labTest.id);
					if (selectedTests && selectedTests.length) {
						var index = selectedTests.indexOf(obj);
						if (index != -1) {
							selectedTests.splice(index, 1);
							if (!selectedTests.length) {
								delete $scope.selectedLabs[labTest.categoryName];
							}
						}
					}
				}
				$scope.options.selectAll = false;
			};

			$scope.$on("$clearLabs", function() {
				// On clear call back functionality
			});

			$scope.traverseTree = function(paramLabsData, labTestId) {
				if (paramLabsData.isTest) {
					if (paramLabsData.id == labTestId) {
						paramLabsData.isSelected = true;
					}
				} else {
					for (var i = 0; i < paramLabsData.subTests.length; i++) {
						if (paramLabsData.subTests[i].id == labTestId) {
							paramLabsData.subTests[i].isSelected = true;
							break;
						}
						$scope.traverseTree(paramLabsData.subTests[i], labTestId);
					}
				}
			};

			$scope.$on('$setSelectedLabs', function(event, data) {
				$scope.selectedLabs = data;
				for (var i = 0; i < Object.keys($scope.selectedLabs).length; i++) {
					var key = Object.keys($scope.selectedLabs)[i];
					var obj = $scope.selectedLabs[key];
					for (var j = 0; j < obj.length; j++) {
						var labTestId = obj[j].id;
						$scope.traverseTree($scope.labsData, labTestId);
					}
				}
			});
			$scope.onSearch = function(searchInput) {
				var searchInput = searchInput.toUpperCase();
				var filtered = $filter('filter')($scope.labsData.subTests, searchInput);
				var data = {
					subTests: angular.copy(filtered)
				};
				if (searchInput) {
					$scope.filteredData  = _expandMatched(data, searchInput.toUpperCase());
				} else {
					$scope.filteredData  = data;
				}
			};

			function _expandMatched(obj, searchInput) {
				if (obj.subTests && obj.subTests.length && $filter('filter')(obj.subTests, searchInput).length) {
					obj.showChilds = true;
					angular.forEach(obj.subTests, function(e) {
						_expandMatched(e, searchInput);
					}, this);
				}
				if (obj && obj.testName && obj.testName.toUpperCase().indexOf(searchInput) != -1) {
					obj.highlight = true;
				}
				return obj;
			}
			$scope.init();
		}
	};
}]);
