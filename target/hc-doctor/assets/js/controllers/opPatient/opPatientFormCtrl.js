angular.module("doctorModule").controller("opPatientFormCtrl",['$scope','$stateParams','opPatientService', 'opService','commonService','$state','ngDialog','$parse',function($scope,$stateParams,opPatientService, opService,commonService, $state,ngDialog, $parse){
	
	$scope.onSelectPatient = onSelectPatient;
	$scope.onPatientAdd = onPatientAdd;
	$scope.addOpPatient = addOpPatient;
	$scope.getOpTypes = getOpTypes;
	$scope.getOpConfig = getOpConfig;
	$scope.opTypes = [];
	$scope.opConfig = {};

	function init(){
		opService.get($stateParams.opId).then(function(op) {
			$scope.op = op;
			$scope.defOpPatient = {patient:{}, op: {id: op.id}};
			getOpConfig();
			getOpTypes();
			getOpSubTypeList();
		});
		
	}
	init();
	function getOpConfig(){
		$scope.opConfig = angular.copy(OP_COST_CONFIG);
		/*opService.configList().then(function(res){
			$scope.opConfig = res;
		});*/
	}
	function getOpTypes(){
		commonService.getOpTypes().then(function(res){
			$scope.opTypes = res;
			$scope.defOpPatient.opType = $scope.opTypes[0];
			$scope.opPatient = angular.copy($scope.defOpPatient);
			$scope.setOPCost();
		});
	}

	function getOpSubTypeList(){
		commonService.getOpSubTypes().then(function(res){
			$scope.opSubTypes = res;
			$scope.defOpPatient.opSubType = $scope.opSubTypes[0];
			$scope.opPatient = angular.copy($scope.defOpPatient);
			$scope.setOPCost();
		});
	}
	
	
	function addOpPatient(){
		if ($scope.opPatient.cardNo === 'New Card') {
			var opType = $parse('opPatient.opType.id')($scope);
			var opSubType = $parse('opPatient.opSubType.id')($scope);
			var config = $parse('opConfig.costs[' + opType + '][' + opSubType + ']')($scope);
			if (config) {
				var patientId = $parse('opPatient.patient.id')($scope);
				if (patientId && !$scope.opConfig.free.includes(opSubType)) {
					var req = {
						patient: {id: patientId},
						opTypeId: opType,
						opSubTypeId: opSubType,
						validity: config.validity
					};
					opPatientService.createPatientCard(req).then(function(res) {
						$scope.opPatient.cardNo = res.id;
						saveOrUpdateOPPatient();
					});
				} else {
					saveOrUpdateOPPatient();
				}
			} else {
				saveOrUpdateOPPatient();
			}
		} else {
			saveOrUpdateOPPatient();
		}
	}
	
	function saveOrUpdateOPPatient() {
		opPatientService.save($scope.opPatient).then(function(response){
			$state.go('opPatientSearch',{opId: $scope.op.id});
		});		
	}
	function onSelectPatient(patient){
		document.querySelector("[ng-model = 'suggestModel']").value = patient.name;
		if($scope.opPatient) {
			$scope.opPatient.patient = angular.copy(patient);
		}
		$scope.checkPatientStatus(patient);
	}
	function onPatientAdd(patient){
		document.querySelector("[ng-model = 'suggestModel']").value = patient.name;
		if($scope.opPatient) {
			$scope.opPatient.patient = angular.copy(patient);
		}
		$scope.checkPatientStatus(patient);
	}
	$scope.checkPatientStatus=function(selectedPatient){
		$scope.opPatientIsExist='';
		opPatientService.getOpPatientsListByOptions({op:{id:$scope.opId}}).then(function(res) {
			$scope.opPatientList = res;
			for(var i=0;i<res.length;i++) {
				if($scope.opPatientList[i].patient.id == selectedPatient.id){
					patientRes=$scope.opPatientList[i];
					$scope.opPatientIsExist = $scope.opPatientList[i].patient.name + ' Already added to OP.';
					break;
				}
			}
			if (!$scope.opPatientIsExist) {
				$scope.setOPCost();
			}
		});
	};
	
	$scope.setOPCost = function() {
		var opType = $parse('opPatient.opType.id')($scope);
		var opSubType = $parse('opPatient.opSubType.id')($scope);
		var config = $parse('opConfig.costs[' + opType + '][' + opSubType + ']')($scope);
		if (config) {
			$scope.opPatient.consultFee = config.cost;
			var patientId = $parse('opPatient.patient.id')($scope);
			if (patientId && !$scope.opConfig.free.includes(opSubType)) {
				var req = {
					patient: {id: patientId},
					opTypeId: opType,
					opSubTypeId: opSubType,
					validity: config.validity
				};
				opPatientService.getOrCreatePatientCard(req).then(function(res) {
					if (res) {
						$scope.opPatient.cardNo = res.id;
						var cardOPCost = $parse('opConfig.costs[' + res.opTypeId + '][' + res.opSubTypeId + '].cost')($scope);
						$scope.opPatient.consultFee = config.cost - cardOPCost > 0? config.cost - cardOPCost: 0;
					} else {
						$scope.opPatient.cardNo = "New Card";
					}
				});
			}
		}
	};
}]);
