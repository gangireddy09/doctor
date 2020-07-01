angular.module("doctorModule").directive('treeNode', function() {
	return {
		restrict: 'E',
		templateUrl: './views/billdesk/prelabs/templates/labTests.html',		
		scope: {
			tree: '=',
			onCheck:'&'
		},
		controller: function($scope) {
			/*$scope.showChilds = [];
			
			$scope.toggleChilds = function(index) {
				$scope.showChilds[index] = !$scope.showChilds[index];
			};*/
			$scope.toggleSelect = function(node){
				node.isSelected = !node.isSelected;
				$scope.onCheckCallBack(node, node.isSelected);
			};
			$scope.onCheckCallBack = function(obj, checkedState, isRequired) {
				if($scope.$parent.node) {
					$scope.$parent.node.isSelected = false;
					if (checkedState) {
						var selectedCount = 0;
						for(var i=0; i<$scope.$parent.node.subTests.length; i++) {
							if($scope.$parent.node.subTests[i].isSelected === checkedState) {
								selectedCount++;
							}
						}
						if($scope.$parent.node.subTests.length === selectedCount) {
							$scope.$parent.node.isSelected = true;
						}
					}
				}
				if (typeof $scope.onCheck == 'function')
					$scope.onCheck({$tests: obj, $checkStatus:checkedState});
			};
			
			$scope.expanCollapse = function(){
			};
		},
	};
});