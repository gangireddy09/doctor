angular.module("doctorModule").directive("requisitionSlip", function($filter) {
	return {
		restrict : 'E',
		templateUrl: './views/billdesk/prelabs/templates/requisitionSlip.html',	
		scope : {
			onCheck:'&'
		},

		controller : function($scope, $rootScope, commonService) {
				$scope.toggleSelect = toggleSelect;
				var labTestIds = [];
				commonService.getLabData().then(function(data) {
					$scope.labsData = JSON.parse(data['json']);
				});
				commonService.getLabReportData().then(function(data) {
					$scope.labsReport = JSON.parse(data['json']);
				});
				commonService.getRequisitionSlip().then(function(data) {
					$scope.consolidatedLabs = JSON.parse(data['json']);
				});
				function toggleSelect(test){
					test.isSelected = !test.isSelected;
					$scope.onCheckCallBack(test, test.isSelected);
				}
				$scope.onCheckCallBack = function(obj, checkedState) {
					var testObj = findInLabTree(obj.id, $scope.labsData.subTests);
					if (typeof $scope.onCheck == 'function')
						$scope.onCheck({$test: testObj, $checkStatus:checkedState});
				};
				function findInLabTree(id, treeNode) {
					var itemFound = treeNode.find(function(item) {
						return item.id === id;
					});
					if (!itemFound) {
						var parentNode = treeNode.find(function(item) {
							return id.indexOf(item.id) === 0;
						});
						itemFound = findInLabTree(id, parentNode.subTests);
					}
					return itemFound;
				}
			}
		};
});