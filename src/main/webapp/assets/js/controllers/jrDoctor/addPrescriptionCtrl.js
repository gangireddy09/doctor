angular.module("doctorModule").controller("addPrescriptionCtrl",['$rootScope','$scope','$state','$stateParams','$timeout','ngDialog','commonService','opPrescriptionService',  
                                                           function($rootScope,$scope,$state,$stateParams,$timeout,ngDialog,commonService,opPrescriptionService){
	$scope.init = init;
	$scope.toggleOverlay = toggleOverlay;
	$scope.showPrescription = showPrescription;
	$scope.savePrescription = savePrescription;
	$scope.changePrescriptionView = changePrescriptionView;
	$scope.getCurrentOPPrescriptions = getCurrentOPPrescriptions;
	$scope.editPatientPrescription = editPatientPrescription;
	$scope.toggleAddPopup = toggleAddPopup;
	
	function init(){
		$scope.opPatient = $stateParams.opPatient;
		$scope.prescription = {
				opPatient : $scope.opPatient,
				opId : $scope.opPatient.op.id,
				doctor : $scope.opPatient.op.doctor,
				prescriptionMedicines : []
			};
		$scope.prescription.prescribedOn = new Date();
		getCurrentOPPrescriptions();
	}
	
	function toggleOverlay(expanded) {
		$rootScope.showOverlay = expanded;
	};
	
	function showPrescription(){
		$scope.showPresc = true;
	}
	
	function changePrescriptionView(action) {
		$scope.prescriptionView = action;
	};
	
	function editPatientPrescription() {
		$scope.changePrescriptionView('prescription');
		$timeout(function() {
			$rootScope.$broadcast('$setPrescriptionTotal');
		}, 100);
	};
	
	function getCurrentOPPrescriptions() {
		opPrescriptionService.opPrescriptionList({opPatientId:$scope.opPatient.id}).then(function(res) {
			$scope.prescription.prescriptionMedicines = [];
			if (res.length) {
				$scope.oldPrescriptions = res;
				var latestPrescription = $scope.oldPrescriptions[$scope.oldPrescriptions.length - 1];
				if (latestPrescription) {
					$scope.prescription.id = latestPrescription.id;
					$scope.prescription.prescriptionMedicines = latestPrescription.prescriptionMedicines;
					$scope.oldPrescriptions.splice($scope.oldPrescriptions.length - 1, 1);
				}
			}
		});
	};
	
	function savePrescription(prescriptionMedicines) {
		$scope.prescription.prescriptionMedicines = prescriptionMedicines;
		opPrescriptionService.save($scope.prescription).then(function(res) {
			if (res.id) {
				$scope.prescription = res;
				$scope.toggleOverlay(false);
				$scope.changePrescriptionView();
			}
		});
	};
	
	function toggleAddPopup(selectPrint) {
		$scope.showAddPopup = !$scope.showAddPopup;
		$scope.selectPresPrint = selectPrint;
	};
	init();
}]);