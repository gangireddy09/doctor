angular.module("doctorModule").controller("opListCtrl",['$scope','opService','ngDialog','$stateParams',function($scope,opService,ngDialog,$stateParams){

    $scope.getOpList = getOpList;
    
    function init(){
    	$scope.formLoader = false;
    	$scope.op = {opDate:{}};
    	getDoctor();
    	$scope.op.opDate = new Date();
    	getOpList();
    }
   
    function getDoctor(){
    	if(sessionStorage.getItem('doctor')){
    		$scope.op.doctor = JSON.parse(sessionStorage.getItem('doctor'));
    	}
    }
    function getOpList(){
    	$scope.formLoader = true;
    	opService.search($scope.op).then(function(res){
    		$scope.opList = res;
    		$scope.formLoader = false;
    	});
    }
    init();
}]);