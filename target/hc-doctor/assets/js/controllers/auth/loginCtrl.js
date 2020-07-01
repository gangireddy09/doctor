angular.module("doctorModule").controller("loginCtrl",['$scope','loginService','opService','$state', 'commonService', function($scope,loginService,opService,$state, commonService){
	
	$scope.submit = submit;
	$scope.getDoctorByUserId = getDoctorByUserId;
	
	function init(){
		$scope.invalidLogin = false;
		$scope.loginForm = {};
		
		//TODO Remove once u got an idea
		commonService.getOpTypes().then(function(res) {
			//console.log("OP Types", res);
		});
		commonService.getOpTypes().then(function(res) {
			//console.log("Lab Data", res);
		});
		commonService.getLabReportData().then(function(res) {
			//console.log("Report Data: ", res);
		});
	}
	function submit() {
		loginService.login($scope.user).then(function(res){
			if(res){
				if(res.userRole.roleName === "DOCTOR"){
					getDoctorByUserId(res.id);
				}else if(res.userRole.roleName === "JRDOCTOR"){
					$state.go('opPatientList');
				}else{
					$scope.invalidLogin = true;
					$scope.user = {};
					$scope.loginForm.$setPristine();
				}
				sessionStorage.setItem('role',res.userRole.roleName);
				sessionStorage.setItem('userName',res.userId);
			}else{
				$scope.invalidLogin = true;
				$scope.user = {};
				$scope.loginForm.$setPristine();
			}
		});
	}

	function getDoctorByUserId(userId) {
		sessionStorage.clear();
		commonService.getDoctorByUserId(userId).then(function(res){
			if (res.id) {
				var doctor = angular.copy(res);
				sessionStorage.setItem('doctor',JSON.stringify(doctor));
				$state.go('opList');
			}
		});
	};
	init();
}]);