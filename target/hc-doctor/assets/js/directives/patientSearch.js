angular.module("doctorModule").directive("patientSearch",function(){
	return{
		restrict : 'E',
		scope : {
			edit: '@',
			select: '@',
		    onSelect : '&',
		    onSave : '&'
		},
		controller : controller,
		templateUrl : function(element, attrs) {
		      return "./views/patient/" + (attrs.viewMode || 'patientSearch') + ".html";
	    }
	};
	function controller($scope,patientService,ngDialog){
		
		$scope.genderTypes = GENDERS;
		$scope.relationTypes = RELATIONS;

		$scope.searchPatient = searchPatient;
		$scope.editPatient = editPatient;
		$scope.selectPatient = selectPatient;
		$scope.patientForm = patientForm;
		$scope.fewMorePatients = fewMorePatients;
		$scope.scrollerApi = {};
		function init(){
			$scope.formLoader = false;
		}
		
		$scope.searchObj = {};
		
		function searchPatient(){
			$scope.searchObj.latestLimit = 0;
			$scope.formLoader = true;
			patientService.patientsListByOptions($scope.searchObj).then(function(res){
				if(res.length){
					$scope.scrollerApi.resetScroll();
					$scope.formLoader = false;
					$scope.patients = res;
				}else{
					$scope.formLoader = false;
					$scope.patients = [];
				}
			});
		}
		function fewMorePatients(){
			$scope.formLoader = true;
			$scope.searchObj.latestLimit = $scope.patients.length;
			patientService.patientsListByOptions($scope.searchObj).then(function(res){
				$scope.formLoader = false;
				if(res.length){
					$scope.patients = $scope.patients.concat(res);
				}
			});
		}
		function selectPatient(patient,index){
			if(typeof $scope.onSelect === 'function'){
				$scope.selected_index = index;
				$scope.onSelect({$patient:patient});
			}
		}
		function patientForm(){
			ngDialog.open({
				className:'ngdialog-theme-default formDialog',
				template :'<patient-form on-submit="onSubmit($patient)"></patient-form>',
				scope : $scope,
				closeByDocument : false,
				plain : true,
				controller : 'ngDialogCtrl'
			});
		}
		function editPatient(patient,index){
			$scope.patient = angular.copy(patient);
			$scope.editIndex = index;
			if(patient.dob != null) {
				$scope.patient.dob = new Date(patient.dob);
			}
	
			ngDialog.open({
				className:'ngdialog-theme-default formDialog',
				template : '<patient-form on-submit="onSubmit($patient)" patient="patient"></patient-form>',
				scope : $scope,
				closeByDocument : false,
				plain : true,
				controller : 'ngDialogCtrl'
			});
		}
		
		
		$scope.updatePatient = function(patient){
			if($scope.editIndex != null){
				$scope.patients[$scope.editIndex] = angular.copy(patient);
				$scope.patients[$scope.editIndex].id = null;
				window.setTimeout(function() {
					$scope.patients[$scope.editIndex].id = patient.id;
				}, 10);
				$scope.formMsgContent = "Updated successfully.";
				$scope.formMsgClass="form-msg-success";
			} else {
				$scope.formMsgClass = "form-msg-success";
				$scope.formMsgContent = "Patient created successfully.";
			}
			$scope.editIndex = null;
		};
	}
	init();
});
angular.module("doctorModule").controller("ngDialogCtrl",['$scope','ngDialog',function($scope,ngDialog){
	$scope.onSubmit = onSubmit;
	function onSubmit(patient){
		if(typeof $scope.onSave === 'function'){
			$scope.updatePatient(patient);
			$scope.onSave({$patient:patient});
		}
	}
}]);