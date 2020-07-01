angular.module("doctorModule").controller("opPatientSearchCtrl", ['$scope','$state','opPatientService','patientService','ngDialog','$stateParams','labPatientService','$parse',
function($scope,$state,opPatientService,patientService,ngDialog,$stateParams, labPatientService, $parse) {
	$scope.opId = $stateParams.opId;
	$scope.getPatientsList = getPatientsList;
	$scope.getStatusCount = getStatusCount;
	$scope.getOpPatientsByIdStatus = getOpPatientsByIdStatus;
	$scope.selectOPPatient = selectOPPatient;
	$scope.addOpPatient = addOpPatient;
	$scope.checkOpPatient = checkOpPatient;
	$scope.getObjFromListById = getObjFromListById;
	$scope.reloadOpPatients = reloadOpPatients;
	$scope.OpPatientForm = OpPatientForm;
	
	$scope.init=function(){
		$scope.search={
						patient:{}
					};
		$scope.value="on";
		$scope.prescriptionList =[];
		$scope.prescriptionMedicinsList=[];
		$scope.salesBillObj={};
		$scope.opPatientForm = 'btn';
		$scope.patientForm = 'btn';
		$scope.defaultOpPatientObj = {patient:{},op:{},status:'New'};
		getOpPatientsByIdStatus('New');
		$scope.oppatient = $scope.defaultOpPatientObj;
		//$scope.defaultOpObj = {doctor:{id:1},opDate:'2016-07-22'};
		$scope.allOpPatientsList=[];
		$scope.bgColorList={'New':'blue','All':'sky-blue','Skipped':'red','Consulted':'green','Lab':'orange'};
		$scope.stockEdit = {};
		$scope.medicineEdit = {};
		$scope.getStatusCount($scope.opId);
	};
	
	
	function getPatientsList(){
		patientService.patientsListByOptions().then(function(res){
			if (res) {
				$scope.patientsList = res;
			}
		});
	};
	
	function getStatusCount(opId){
		opPatientService.getOpPatientCountWithStatusByOpId(opId).then(function(res){
			if(res.id) {
				$scope.newCount = res.pending;
				$scope.skippedCount = res.skipped;
				$scope.consultPrescriptionCount = res.consulted;
				$scope.labCount = res.lab;
				$scope.totalCount = res.pending + res.skipped + res.consulted;
//				getLabtests(opId);
			}
		});
	};
	function getOpPatientsByIdStatus(status){
		$scope.labTestsInprogressList = [];
		$scope.labTestsCompletedList = []; 
		$scope.generalOpList = [];
		$scope.emergencyOpList = [];
		$scope.phoneCallOpList = [];
		$scope.freeOpList = [];
		$scope.reviewOpList = [];
		if(status == 'Lab'){
			getLabtests($scope.opId);
			$scope.oppatient = {op : {id : $scope.opId}, status : status};
		}else{
			if(status == "All"){
				$scope.oppatient = {op : {id : $scope.opId}};
			} else {
				$scope.oppatient = {op : {id : $scope.opId}, status : status};
			}
			opPatientService.getOpPatientsListByOptions($scope.oppatient).then(function(res){
				$scope.opPatientsList = res;
				for(var i = 0;i<$scope.opPatientsList.length;i++){
					if($scope.opPatientsList[i].opType.id =='1' && !$scope.opPatientsList[i].isReviewOp){
						if(!$scope.opPatientsList[i].opSubType ){
							$scope.generalOpList.push($scope.opPatientsList[i]);
						}else if($scope.opPatientsList[i].opSubType && ($scope.opPatientsList[i].opSubType.id !='3' && $scope.opPatientsList[i].opSubType.id !='7')  && $scope.opPatientsList[i].opSubType.id !='4'){
							$scope.generalOpList.push($scope.opPatientsList[i]);
						}
					}
					if($scope.opPatientsList[i].opType.id =='2'){
						$scope.emergencyOpList.push($scope.opPatientsList[i]);
					}
					if($scope.opPatientsList[i].opType.id =='1' && $scope.opPatientsList[i].opSubType && $scope.opPatientsList[i].opSubType.id =='4' && !$scope.opPatientsList[i].isReviewOp){
						$scope.phoneCallOpList.push($scope.opPatientsList[i]);
					}
					if($scope.opPatientsList[i].opType.id =='1' && $scope.opPatientsList[i].opSubType && ($scope.opPatientsList[i].opSubType.id =='3' || $scope.opPatientsList[i].opSubType.id =='7') && !$scope.opPatientsList[i].isReviewOp){
						$scope.freeOpList.push($scope.opPatientsList[i]);
					}
					if($scope.opPatientsList[i].opType.id =='1' && $scope.opPatientsList[i].isReviewOp){
						$scope.reviewOpList.push($scope.opPatientsList[i]);
					}
				}
				
				$scope.showMenu = false;
				$scope.bgColor = 'bg-color-'+$scope.bgColorList[status];
			});
		}
	};
	
	function selectOPPatient(opPatient) {
		$state.go("patientActions", {opPatient: opPatient});
	};
	function addOpPatient(oppatient){
		opPatientService.save(oppatient).then(function(res){
			if(res.id){
				$scope.opPatientsList.push(res);
				$scope.oppatient = {};
				$scope.oppatient.opType = oppatient.opType;
				$scope.oppatient.consultFee = oppatient.consultFee; 
				$scope.oppatient.op = oppatient.op;
				$scope.opFormClasses = "color-green";
				$scope.opFormMsg = "Patient Added To OP Successfully";
			}else{
				$scope.opFormClasses = "color-red";
				$scope.opFormMsg = "Error in OP Patient Adding.";
			}
		}).error(function(err){
				$scope.opFormClasses = "color-red";
				$scope.opFormMsg = "Error in OP Patient Adding.";
		});
	};
	function checkOpPatient(patientId){
		$scope.oppatient.patient.patientName="";
		var patientRes = undefined;
		for(var i = 0; i < $scope.opPatientsList.length; i++){
			if($scope.opPatientsList[i].patient.id == patientId){
				patientRes=$scope.opPatientsList[i];
				$scope.opPatientIsExist = $scope.opPatientsList[i].patient.patientName+' Already Exist.';
				$scope.oppatient.patient.id = "";
				$scope.oppatient.patient.patientName = "";
				break;
			}
		}
		if(patientRes == undefined){
			$scope.opPatientIsExist = '';
			for(var i = 0;i < $scope.patientsList.length; i++){
				if($scope.patientsList[i].id == patientId){
					patientRes = $scope.patientsList[i];
					$scope.oppatient.patient.patientName = patientRes.patientName;
					break;
				}
			}
		}
		if(patientRes == undefined){
			$scope.opPatientIsExist = 'No Patient Exist.';
			$scope.oppatient.patient.id = "";
			$scope.oppatient.patient.patientName = "";
		}
	};
	function reloadOpPatients(id){
//		$state.go('opPatientSearch',{opId: id});
		$scope.init();
	}
	function OpPatientForm() {
		ngDialog.open({
    		template:'<op-patient-form op="op" op-id="opId" on-save = "reloadOpPatients(opId);closeThisDialog();"></op-patient-form>',
    		plain:true,
    		className: 'ngdialog-theme-default ngdialog-lg',
    		closeByDocument : false,
    		/*controller : 'opPatientFormCtrl',*/
    		scope : $scope
    	});
	};
	function getObjFromListById(list,prop,value){
		if(list.length){
			for(var i = 0; i < list.length; i++){
				if(list[i][prop] == value){
					return list[i];
				}
			}
		}
	};
	function getLabtests(opId){
		labPatientService.search({opId:opId}).then(function(res){
			if(res.length){
				$scope.data = res.map(function(labPatientReport){
					var labReport = JSON.parse($parse('labReport')(labPatientReport));
					labReport['opLabPatient'] = labPatientReport.opLabPatient;
					labReport['id'] = labPatientReport.id;
					labReport['isLabClosed'] = labPatientReport.isLabClosed;
					labReport['isReportEdit'] = labPatientReport.isReportEdit;
					labReport['reportedOn'] = labPatientReport.reportedOn;
					labReport['testedBy'] = labPatientReport.testedBy;
					if(labReport.labs){
						var prescCount = 0, paidCount = 0;
						for(var i = 0; i < labReport.labs.length; i++){
							if(labReport.labs[i].tests){
								for(var j = 0; j < labReport.labs[i].tests.length; j++){
									if(labReport.labs[i].tests[j].isFeePaid){
										labReport['paidTests'] = ++paidCount;
									}
									labReport['prescribedTests'] = ++prescCount;
								}
							}
						}
					}
					if(labReport.reportedOn && $parse('opLabPatient.opPatient')(labReport) && $parse('opLabPatient.opPatient.status')(labReport) == 'Consulted' ){
						$scope.labTestsCompletedList.push(labReport.opLabPatient);
					}else if(!labReport.reportedOn && $parse('opLabPatient.opPatient')(labReport) && $parse('opLabPatient.opPatient.status')(labReport)){
						$scope.labTestsInprogressList.push(labReport.opLabPatient);
					}
					return labReport;
				});
				$scope.formLoader = false;
			}else{
				$scope.formLoader = false;
			}
		}, function(e){
			console.log('Error: ', e);
			$scope.formLoader = false;
		});
	}
	$scope.init();
   
}]);