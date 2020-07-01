angular.module("doctorModule").controller("labTestsReportCtrl", ['$scope', '$parse','commonService','labPatientService', '$state','$stateParams','ngDialog','$timeout', function($scope, $parse, commonService,labPatientService,$state, $stateParams,ngDialog,$timeout) {
	
	$scope.getLabReport = getLabReport;
	$scope.updateLabReport = updateLabReport;
	$scope.upLoadFile = upLoadFile;
	$scope.editReport = editReport;
	$scope.viewFile = viewFile;
	$scope.getSpecialLab = getSpecialLab;
	$scope.isView = false;
	$scope.formLoader = false;
	function init(){
		$scope.isUpdate = false;
		commonService.getLabData().then(function(data) {
			$scope.labsData = JSON.parse(data['json']);
		});
		if(sessionStorage.getItem('role')){
			$scope.role = sessionStorage.getItem('role');
		}
		if($stateParams.labPatientId){
			getLabReport();
		}
		$scope.labTechnicians = LAB_TECHNICIANS;
	}
	
	function getLabReport(){
		$scope.formLoader = true;
		labPatientService.getReport($stateParams.labPatientId).then(function(res){
			if(res){
				$scope.labPatientReport = res;
				$scope.labPatient = JSON.parse(res.labReport);
				$scope.labPatient.createdOn = $scope.labPatientReport.createdOn;
				$scope.isEdit = res.isReportEdit;
				$scope.formLoader = false;
			}else{
				$scope.formLoader = false;
			}
		}).catch(function(e){
			console.log('Error: ', e);
			$scope.formLoader = false;
		});
	}
	
	function updateLabReport(){
		$scope.formLoader = true;
		if($scope.role == "DOCTOR"){
			$scope.labPatientReport.status = "Doctor Edit";
		}
		if($scope.role == "DATAENTRY"){
			$scope.labPatientReport.status = "Technician Edit";
		}
		$scope.labPatientReport.labReport = JSON.stringify($scope.labPatient);
		labPatientService.saveReport($scope.labPatientReport).then(function(res){
			if(res){
				$scope.isUpdate = true;
				$scope.formLoader = false;
				$scope.formMsgClass = "form-msg-success";
				$scope.formMsgContent = "Report Submitted Successfully.";
				$scope.clearFormMsg();
				//console.log("on Update Lab Patient =>lab report:",res);
				$state.go('labTests');
			}else{
				$scope.formLoader = false;
				$scope.formMsgClass = "form-msg-error";
				$scope.formMsgContent = "Report Submission Failed.";
				$scope.clearFormMsg();
			}
		}).catch(function(e){
			console.log('Error: ', e);
			$scope.formLoader = false;
		});
	}   
	
	function editReport(){
		$scope.isView = false;
	}
	
	function viewFile(labPatientId,categoryName,testName){
		$scope.labPatientId = labPatientId;
		$scope.categoryName = categoryName;
		$scope.testName = testName;
		ngDialog.open({
			template:'<img ng-src="../hc-rest/labpatient/getreport/{{labPatientId}}?categoryName={{categoryName}}&testName={{testName}}" alt="Image is not Uploaded Yet"class="grid-md-12 no-padding"/>',
    		className: 'ngdialog-theme-default formDialog',
    		scope: $scope,
    		plain : true
    	}).closePromise.then(function() {
    	});
	}
	function upLoadFile(file,categoryName,testName){
		$scope.formLoader = true;
		var fd = new FormData();
		fd.append('file', file);
		fd.append('categoryName',categoryName);
		fd.append('testName',testName);
		labPatientService.uploadReport($scope.labPatient.id,fd).then(function(res){
			if(res){
				$scope.formLoader = false;
			}else{
				$scope.formLoader = false;
			}
		}).catch(function(e){
			console.log('Error: ', e);
			$scope.formLoader = false;
		});
	}
	$scope.clearFormMsg = function() {
		$timeout(function() {
			$scope.formMsgContent = undefined;
		}, 3000);
	};
	function getSpecialLab(lab){
		var spLabel = null;
		angular.forEach($parse('tests')(lab), function(test){
			angular.forEach($parse('report')(test), function(report){
				if ($parse('spLabel')(report)){
					spLabel = report.spLabel;
				}
			});
		});
		return spLabel;
	}
	init();
}]);
