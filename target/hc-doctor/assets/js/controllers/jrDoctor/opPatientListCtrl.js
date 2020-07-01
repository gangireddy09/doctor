angular.module("doctorModule").controller("opPatientListCtrl",['$scope','opPatientService','opService','$state', 'commonService',
                                                       function($scope,opPatientService,opService,$state, commonService){
	
	$scope.init = init;
	$scope.getOpPatients = getOpPatients;
	$scope.getOpList = getOpList;
	$scope.getDoctors = getDoctors;
	
	init();
	function init(){
		getDoctors();
		$scope.op = {opDate: new Date()};
	}
	
	function getDoctors(){
		commonService.getDoctors().then(function(res) {
			$scope.doctors = res;
		});
	}
	
	function getOpList(doctorId,searchDate){
		opService.search({doctor:{id:doctorId},opDate:dateToStr(new Date(searchDate))}).then(function(res) {
			$scope.opList = res;
			
		});
	}
	
	function getOpPatients(op){
		opPatientService.getOpPatientsListByOptions({op:{id:op.id}}).then(function(res) {
			$scope.opPatientList = res;
			
		});
	}
	
}]);
