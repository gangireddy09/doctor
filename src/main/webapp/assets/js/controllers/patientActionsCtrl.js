angular.module("doctorModule").controller("patientActionsCtrl", ['$scope','$rootScope','$state','$stateParams','$timeout','$location', '$parse','opPatientService','complaintService','opPrescriptionService','$http','commonService','labPatientService','ngDialog','$parse','doctorService','ipService','patientHistoryService',
function($scope, $rootScope, $state, $stateParams,$timeout,$location,$parse,opPatientService,complaintService,opPrescriptionService,$http,commonService,labPatientService,ngDialog,$parse,doctorService,ipService,patientHistoryService) {
	$scope.getCurrentOPPrescriptions = getCurrentOPPrescriptions;
	$scope.savePrescription = savePrescription;
	$scope.skipPatient = skipPatient;
	$scope.getPatientLabs = getPatientLabs;
	$scope.confirmComplaint = confirmComplaint;
	$scope.getConfirmedPatientComplaint = getConfirmedPatientComplaint;
	$scope.changeComplaintStatus = changeComplaintStatus;
	$scope.changeCaseSheetStatus = changeCaseSheetStatus;
	$scope.changeLabsStatus = changeLabsStatus;
	$scope.changePrescriptionStatus = changePrescriptionStatus;
	$scope.changeDependPanelsStatus = changeDependPanelsStatus;
	$scope.setPrescriptionComplaint = setPrescriptionComplaint;
	$scope.setPrescriptionPreDiagnosis = setPrescriptionPreDiagnosis;
	$scope.editPatientPrescription = editPatientPrescription;
	$scope.getAvailableQuantity = getAvailableQuantity;
	$scope.changePrescriptionView = changePrescriptionView;
	$scope.printPage = printPage;
	$scope.setComplaint = setComplaint;
	$scope.showSelectedList = showSelectedList;
	$scope.modifyComplaint = modifyComplaint;
	$scope.patientCaseSheet = patientCaseSheet;
	$scope.equateDesc = equateDesc;
	$scope.showAll = showAll;
	$scope.getDetails= getDetails;
	$scope.getPatientHistory = getPatientHistory; 
	$scope.patientHistoryList=[];

	/*lab functions*/
	$scope.deleteTest = deleteTest;
	$scope.clearAll = clearAll;
	$scope.totalFeeCal = totalFeeCal;
	$scope.saveLabTestPatient = saveLabTestPatient;
	$scope.getPatientReport = getPatientReport;
	$scope.getPatientTests = getPatientTests;
	$scope.changeStatus = changeStatus;
	$scope.printCost = printCost;
	$scope.printLabReport = printLabReport;
	$scope.viewFile = viewFile;
	$scope.cost = 0;
	$scope.isSaved = false;
	$scope.form = {};
	$scope.ipTypes = IPTYPES;
	var testIds = [];
	$scope.dirOptions = {selectAll : false};
	$scope.selectAll = $scope.dirOptions.selectAll;
	if (!$stateParams.opPatient) {
		$state.go("home");
		return;
	} else {
		$scope.currentDate = new Date();
		$scope.patientComplaints = [];
		$scope.saveLabsMsg = undefined;
		$scope.selectedLabs = {};
		$scope.doctorSelectedLabs = {};
		$scope.seletecedLabslength = 0;
		$scope.patientOldLabsJson = [];
		$scope.patientLabId = undefined;
		$scope.opPatient = $stateParams.opPatient;
		$scope.defComplaint = {
			createdOn : $scope.currentDate,
			patient : {
				id : $scope.opPatient.patient.id
			}
		};
		 $scope.patientLabs = [];
		$scope.complaint = angular.copy($scope.defComplaint);
		commonService.getLabData().then(function(data) {
			$scope.labsData = JSON.parse(data['json']);
		});
		commonService.getLabReportData().then(function(data) {
			$scope.labsReport = JSON.parse(data['json']);
		});
		$scope.prescription = {
			opPatient : $scope.opPatient,
			opId : $scope.opPatient.op.id,
			doctor : $scope.opPatient.op.doctor,
			prescriptionMedicines : []
		};
		$scope.previousLabsList = [];
	}
	$scope.currentAction = undefined;

	$scope.medicineSearch = {};
	$scope.expanded = {
		prescription : false
	};
	$scope.patientPrescriptions = [];
	$scope.purchaseMedicineSearchResults = [];
	$scope.selectedPurchaseMedicineProduct = [];
	/* Complaint Start */
	$scope.complaintPanelStatus = 'inComplete';
	$scope.currentPanel = 'complaintPanel';
	$scope.caseSheetPanelStatus = 'inComplete';
	$scope.prescriptionPanelStatus = 'disable';
	$scope.labsPanelStatus = 'disable';

	$scope.referToDoctorPanelStatus = 'disable';
	$scope.allPanelStatus = 'disable';
	$scope.ipPanelStatus = 'disable';
	
	$scope.setIpPatient = setIpPatient;
	$scope.getDoctorList = getDoctorList;
	$scope.getDepartmentList = getDepartmentList;
	$scope.getIpPatient = getIpPatient;
	$scope.saveIp = saveIp;
	
	getDoctorList();
	getDepartmentList();
	getIpPatient($scope.opPatient.id);
	getPatientHistory();
	function deleteTest(test){
		$scope.dirOptions.removeTest(test);
		totalFeeCal();
	}
	function clearAll(){
		$scope.selectedLabs = {};
		$scope.cost = 0;
		$scope.selectAll = false;
		$scope.isSaved = false;
	}
	function changeComplaintStatus() {
		$scope.complaintPanelStatus = 'complete';
		$scope.changeDependPanelsStatus();
	};
	/* Complaint End */

	/* Case Sheet Start */
	function changeCaseSheetStatus() {
		$scope.caseSheetPanelStatus = 'complete';
	};

	function changeLabsStatus() {
		$scope.labsPanelStatus = 'complete';
		$scope.changeDependPanelsStatus();
	};

	function changePrescriptionStatus() {
		$scope.prescriptionPanelStatus = 'complete';
		$scope.changeDependPanelsStatus();
	};

	function changeDependPanelsStatus() {
		if ($scope.complaintPanelStatus == 'complete') {
			if ($scope.prescriptionPanelStatus == 'disable') {
				$scope.prescriptionPanelStatus = 'inComplete';
			}
			if ($scope.labsPanelStatus == 'disable') {
				$scope.labsPanelStatus = 'inComplete';
			}
			if ($scope.referToDoctorPanelStatus == 'disable') {
				$scope.referToDoctorPanelStatus = 'inComplete';
			}
			if ($scope.ipPanelStatus == 'disable') {
				$scope.ipPanelStatus = 'inComplete';
			}
		}
	};
	$scope.getPatientLabs();
	/* Prescription Starts */
	function getPrescriptionByComplaint(){
		opPrescriptionService.opPrescriptionList({complaint:$scope.confirmedComplaint.comDesc}).then(function(res) {
			if (res.length) {
				$scope.prescription.prescriptionMedicines = res[res.length - 1].prescriptionMedicines;
				$scope.prescription.opPatient = $scope.opPatient;
			}
		});
		
	}
	function equateDesc(){
		$parse('comDesc').assign(complaint, $scope.complaint.comShortName);
	}
	function getCurrentOPPrescriptions() {
		opPrescriptionService.opPrescriptionList({opPatientId:$scope.opPatient.id}).then(function(res) {
			$scope.prescription.prescriptionMedicines = [];
			if (res.length) {
				$scope.oldPrescriptions = res;
				var latestPrescription = $scope.oldPrescriptions[$scope.oldPrescriptions.length - 1];
//				if (latestPrescription && !latestPrescription.prescriptionReadOnly) {
				if (latestPrescription) {
					$scope.prescription.id = latestPrescription.id;
					$scope.prescription.prescriptionMedicines = latestPrescription.prescriptionMedicines;
					$scope.oldPrescriptions.splice($scope.oldPrescriptions.length - 1, 1);
					$scope.changePrescriptionStatus();
				}
			}
		});
	};

	$scope.getCurrentOPPrescriptions();
	function setPrescriptionComplaint(comDesc) {
		$scope.prescription.complaint = comDesc;
	};

	function setPrescriptionPreDiagnosis() {
		$scope.prescription.preDiagnosis = "Testing only, need to change after CaseSheet selection";
	};

	function savePrescription(prescriptionMedicines) {
		$scope.prescription.prescriptionMedicines = prescriptionMedicines;
		opPrescriptionService.save($scope.prescription).then(function(res) {
			if (res.id) {
				$scope.prescriptionPanelStatus = 'complete';
				$scope.prescription = res;
				$scope.toggleOverlay(false);
				$scope.changePrescriptionView();
			}
		});
		$scope.changePrescriptionStatus();
	};

	function editPatientPrescription() {
		$scope.changePrescriptionView('prescription');
		$timeout(function() {
			$rootScope.$broadcast('$setPrescriptionTotal');
		}, 100);
	};

	function getAvailableQuantity(product) {
		/*return (((product.quantity * 1 + product.freeUnits * 1) * (product.noOfUnits * 1))
				- (product.sold * 1)
				+ (product.returned * 1))-(product.purchaseReturned*1);*/
		return product.available;
	};

	function changePrescriptionView(action) {
		$scope.prescriptionView = action;
	};
	function skipPatient(){
		$scope.opPatient.status = 'Skipped';
		opPatientService.save($scope.opPatient).then(function(res) {
			if (res.id) {
				//$location.path('/patientSearch');
				$state.go("patientSearch");
			}
		});
	};
	
	$scope.slideToShowActions = function() {
		$scope.showPatientActions = 'slide-page-right';
	};

	$scope.slideToShowInfo = function() {
		$scope.showPatientActions = 'slide-page-left';
	};

	$scope.changeCurrentPanel = function(panel) {
		$scope.currentPanel = panel;
		if($scope.currentPanel == 'ipPanel'){
			if(!$scope.ipType){
				$scope.ipType = {ipPatient:{patient:{}}};
				setIpPatient($scope.opPatient);
			}
		}
	};

	$scope.toggleOverlay = function(expanded) {
		$rootScope.showOverlay = expanded;
	};
	/* Prescription End */

	/* Labs Print Start */
	function totalFeeCal(fromSelectAll, selected){
		$scope.cost = 0;
		testIds = [];
		var hasUnSelectedLab = false;
		angular.forEach($scope.selectedLabs, function(values, key){
			values.map(function(val) {
				val.isFeePaid = fromSelectAll? selected: val.isFeePaid; 
				if(val.whatsappCost){
					val.isWhatsapp = !val.isFeePaid ? false: val.isWhatsapp;
				}
				if(!val.isFeePaid){
					hasUnSelectedLab = true;
				}
				testId = {};
				testId['id'] = val.id;
				testId['src'] = sessionStorage.getItem('userName');
				testIds.push(testId);
				if(val.isFeePaid) {
					$scope.cost += parseFloat(Number((val.isWhatsapp?val.whatsappCost:val.cost)));
					testId['val'] = val.isFeePaid ;
				} else {
					testId['val'] = false;
				}
			});
		});
		$scope.selectAll = !hasUnSelectedLab;
	}
	$scope.$watch("selectedLabs",function(lab) {
		angular.forEach(lab, function(values, key){
			values.map(function(val) {
				val.isFeePaid = true;
			});
		});
	});
	
	$scope.clearFormMsg = function() {
		$timeout(function() {
			$scope.saveLabsMsg = undefined;
			$scope.formMsgContent = undefined;
			$scope.formMsg = undefined;
		}, 3000);
	};

	function saveLabTestPatient(){
		$scope.formLoader = true;
		$scope.labPatient = {
				doctorName : $scope.opPatient.op.doctor.name,
				hospitalName : HOSPITAL_NAME,
				patient : $scope.opPatient.patient,
				opPatient: $scope.opPatient,
				dispensedBy : $scope.opPatient.op.doctor.name,
				testIds: JSON.stringify(testIds),
				status: LAB_STATUS[0]
		};
		labPatientService.save($scope.labPatient).then(function(res){
			if(res){
				$scope.isSaved = true;
				$scope.labPatient.id = res.id;
				$scope.formLoader = false;
				$scope.formMsgClass = "form-msg-success";
				$scope.formMsgContent = "Success.";
				$scope.clearFormMsg();
				$scope.getPatientLabs();
			}else{
				$scope.formLoader = false;
				$scope.formMsgClass = "form-msg-error";
				$scope.formMsgContent = "Error .";
				$scope.clearFormMsg();
			}
		}, function(e){
			console.log('Error: ', e);
			$scope.formLoader = false;
		});
	}
	//update lab report
	function updateLabReport(labPatientId,isEdit){
		$scope.formLoader = false;
		labReportService.getBylabPatient(labPatientId).then(function(report){
			if(report){
				report.isReportEdit = isEdit;
				labReportService.save(report).then(function(res){
					if(res){
						$scope.formLoader = false;
					}else{
						$scope.formLoader = false;
					}
				});
			};
		}, function(e){
			console.log('Error: ', e);
			$scope.formLoader = false;
		});
	} 
	function getPatientLabs(){
		$scope.formLoader = true;
		labPatientService.search({patientId : $scope.opPatient.patient.id}).then(function(res){
			if(res.length){
				$scope.formLoader = false;
				$scope.patientLabs = res;
				changeLabsStatus();
			}else{
				$scope.formLoader = false;
			}
		}, function(e){
			console.log('Error: ', e);
			$scope.formLoader = false;
		});
	}
	function getPatientTests(patientLab){
		var labReport = patientLab;
		labReport.labs = getLabsByIds(JSON.parse(patientLab.testIds), $scope.labsData,$scope.labsReport,true);
		viewTests(labReport,true);
	}
	function getPatientReport(patientLab,isPrint){
		var labReport = {};
		labPatientService.getReport(patientLab.id).then(function(res){
			if(res){
				labReport = JSON.parse(res.labReport);
				labReport['fee'] = res.fee;
				labReport['reportedOn'] = res.reportedOn;
				labReport['isReportEdit'] = res.isReportEdit;
				if(labReport.labs){
					var prescCount = 0, paidCount = 0;
					for(var i = 0; i < labReport.labs.length; i++){
						if(labReport.labs[i].tests){
							for(var j = 0; j < labReport.labs[i].tests.length; j++){
								if(labReport.labs[i].tests[j].isFeePaid){
									labReport['paidTests'] = ++paidCount;
								}
								labReport['prescribedTests'] = ++prescCount;
							};
						};
					};
				}
				if(isPrint){
					printLabReport(labReport);
				}else{
					viewTests(labReport,false);
				};
			}else{
				$scope.formMsgClass = "form-msg-error";
				$scope.formMsg = "Report is Pending ..";
				$scope.clearFormMsg();
			}
		}, function(e){
			console.log(e);
			$scope.formMsgClass = "form-msg-error";
			$scope.formMsg = "Report is Pending...";
		});
	}
	//lab tests dialog box
	function viewTests(labPatientReport,flag){
		$scope.report = labPatientReport;
		$scope.isCost = flag;
		$scope.isLab = !flag;
		ngDialog.open({
			template:'./views/common/lab/viewTests.html',
    		className: 'ngdialog-theme-default formDialog',
    		closeByDocument : false,
    		scope : $scope
    	}).closePromise.then(function() {
    	});
	}
	function viewFile(labPatientId,categoryName,testName){
		$scope.labPatientId = labPatientId;
		$scope.categoryName = categoryName;
		$scope.testName = testName;
		ngDialog.open({
			template:'<img ng-src="./labpatient/getreport/{{labPatientId}}?labPatientId={{labPatientId}}&categoryName={{categoryName}}&testName={{testName}}" class="grid-md-12 no-padding"/>',
    		className: 'ngdialog-theme-default formDialog',
    		closeByDocument : false,
    		scope: $scope,
    		plain : true
    	}).closePromise.then(function() {
    	});
	}
	function changeStatus(labPatientId){
		$scope.report['isReportEdit'] = !$scope.report['isReportEdit'];
		updateLabReport(labPatientId,$scope.report['isReportEdit']);
	}
	function printCost(patientLab) {
		var labTestIds = [];
		$scope.cost = 0;
		$scope.isPrescribed = true;
		$scope.isReport = !$scope.isPrescribed;
		if(patientLab){
			labTestIds =  JSON.parse(patientLab.testIds);
			$scope.printReport = patientLab;
		}else{
			labTestIds = JSON.parse($scope.labPatient.testIds);
			$scope.printReport = { patient : $scope.opPatient.patient, createdOn : $scope.opPatient.createdOn};
		}
		$scope.printReport.labs = getLabsByIds(labTestIds, $scope.labsData,$scope.labsReport,true);
		angular.forEach($parse('printReport.labs')($scope), function(lab) {
			var lReports = [];
			angular.forEach($parse('tests')(lab), function(test, tIndex) {
				var reports = $parse('report')(test);
				$scope.cost += parseInt(test.cost);
				angular.forEach(reports, function(report, rIndex) {
					report.test = test;
					if (reports && reports.length && rIndex === 0) {
						report.count = reports.length;
					}
					lReports.push(report);
				});
			});
			lab.reports = lReports;
		});
		$timeout(function(){
			window.print();
		},1500);
	};
	function printLabReport(report) {
		$scope.isReport = true;
		$scope.isPrescribed = !$scope.isReport;
		$scope.printReport = angular.copy(report);
		angular.forEach($parse('printReport.labs')($scope), function(lab) {
			var lReports = [];
			lab.isXray = $parse('categoryName.includes("X RAY")')(lab);
			lab.isScan = $parse('categoryName.includes("ULTRASOUND")')(lab);
			lab.isEcg = $parse('categoryName.includes("ECG")')(lab);
			angular.forEach($parse('tests')(lab), function(test, tIndex) {
				var reports = $parse('report')(test);
				angular.forEach(reports, function(report, rIndex) {
					report.test = test;
					if (reports && reports.length && rIndex === 0) {
						report.count = reports.length;
					}
					lReports.push(report);
				});
			});
			lab.reports = lReports;
		});
		$timeout(function(){
			window.print();
		},1000);
	};
	/* Labs Actions completed */
	$scope.toggleAddPopup = function(selectPrint) {
		$scope.showAddPopup = !$scope.showAddPopup;
		$scope.selectPresPrint = selectPrint;
	};

	function printPage(prescriptionMedicines, text) {
		$scope.selectPrint = text;
		$scope.printPrescriptionObj = prescriptionMedicines;
		$scope.showAddPopup = !$scope.showAddPopup;
		setTimeout(function() {
			window.print();
		}, 500);
	};

	/*Complaint starts*/
	$scope.showSelectedComplaint = false;
	function setComplaint(com) {
		$scope.presentComplaint = com;
		$scope.prescription.complaint = $scope.presentComplaint.comShortName;
	};
	function showSelectedList(state) {
		$scope.showSelectedComplaint = state;
	};
	function confirmComplaint(presentComplaint) {
		$scope.confirmedComplaint = presentComplaint;
		$scope.ConfirmedPatientComplaints = $scope.confirmedComplaint;
		$scope.complaintTransact = {
			complaint : presentComplaint,
			patientOpId : $scope.opPatient
		};
		if ($scope.previousComplaints) {
			$scope.complaintTransact.id = $scope.previousComplaints.id;
		}
		complaintService.saveComplaintTransation($scope.complaintTransact).then(function(res) {
			if (res.id) {
				$scope.changeComplaintStatus();
				$scope.showSelectedComplaint = true;
				$scope.previousComplaints = res;
			}
		});
		getPrescriptionByComplaint();
		$scope.changeCurrentPanel('prescriptionPanel');
	};

	function getConfirmedPatientComplaint() {
		complaintService.complaintTransactList($scope.opPatient.id).then(function(res) {
			if (!res.length) {
				$scope.ConfirmedPatientComplaints = {};
			} else {
				$scope.ConfirmedPatientComplaints = res;
				$scope.changeComplaintStatus();
				$scope.showSelectedComplaint = false;
				$scope.previousComplaints = res[0];
			}
		});
	};

	$scope.previousComplaints = {};
	$scope.getConfirmedPatientComplaint();

	function modifyComplaint() {
		$scope.showSelectedComplaint = true;
		$scope.showOldCom = true;
	};
	//Complaints Ends

	// * IP starts  
	
	function getDepartmentList(){
		doctorService.getDepartments().then(function(res){
			$scope.departmentList = res;
		});
	}
	function getDoctorList(){
    	commonService.getDoctors().then(function(res){
    		$scope.doctors = res;
    	});
    }
	
	function getIpPatient(opPatientId){
		ipService.getIpTypeList({opPatientId:opPatientId}).then(function(res){
			if(res.length){
				$scope.ipType = res[0];
				$scope.ipPanelStatus = 'complete';
			}
		});
	}
	
	function setIpPatient(opPatient){
		$scope.ipType.refferedOn = new Date();
		$scope.ipType.ipPatient.opPatient = opPatient;
		$scope.ipType.ipPatient.patient = angular.copy(opPatient.patient);
		$scope.ipType.ipPatient.doctor = opPatient.op.doctor;
	}
	
	function saveIp(ip){
		$scope.ipType.refferedOn = new Date();
		ipService.save(ip).then(function(res) {
			console.log(res);
			$scope.ipPanelStatus = 'complete';
		});
	}
	
	
	/*All panel Starts*/
	function patientCaseSheet(patientCurrentCaseSheet) {
		$scope.patientCurrentCaseSheet = patientCurrentCaseSheet;
	};
	
	function showAll(){
		console.log("hiii");
	}
	
	
	/* patient History */
	
	function getPatientHistory(){
		patientHistoryService.getList({patientId:$scope.opPatient.patient.id}).then(function(res) {
				$scope.patientHistoryList.patient=res.patient;
				$scope.patientHistoryList.opsList = res.opsList.map(function (item){
				    if(item.labsList){
				        item.labsList=item.labsList.map(function (labItem){
				            if (labItem.labReportList){
				                labItem.labReportList.map(function (reportItem){
				                      reportItem.labReportJson=JSON.parse(reportItem.labReport);
				                      return reportItem;
				                 });
				            }
				            return labItem;
				        });
				    }
				    return item;
				})
				
				
//			}
//		
		});
		
		
	}
	
	function getDetails(prespcriptionHistory){
		$scope.prespcriptionHistory = prespcriptionHistory;
		ngDialog.open({
			template:'./views/common/prespcriptionHistory/viewPrespcriptionHistory.html',
    		className: 'ngdialog-theme-default formDialog',
    		closeByDocument : false,
    		scope : $scope
    	}).closePromise.then(function() {
    	});
		
	}
	
	
}]);