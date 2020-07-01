angular.module("doctorModule").controller("labTestsCtrl", ['$scope','$location', 'commonService','labPatientService', '$state','ngDialog','$timeout', '$parse', function($scope,$location, commonService,labPatientService, $state,ngDialog,$timeout,$parse) {
	
	$scope.getLabtests = getLabtests;
	$scope.viewLabTests = viewLabTests;
	$scope.viewFile = viewFile;
	$scope.changeStatus = changeStatus;
	$scope.viewPayments = viewPayments;
	$scope.print = print;
	$scope.getSpecialLab = getSpecialLab;
	
	function init(){
		$scope.printReport = {};
		commonService.getLabData().then(function(data) {
			$scope.labsData = JSON.parse(data['json']);
		});
		commonService.getLabTestNotes().then(function(data) {
			$scope.labNotes = JSON.parse(data['json']);
		});
		$scope.searchDate = new Date();
		var path = $location.url();
		var tempArr = path.split("/");
		if(tempArr.indexOf("lab-report") == 1){
			$scope.role = "DATAENTRY";
		}else if(tempArr.indexOf("bill-desk") == 1){
			$scope.role = "BILLDESK";
		}else{
			$scope.role = "DOCTOR";
		}
		getLabtests(new Date());
	}
	
	function getLabtests(searchDate){
		$scope.formLoader = true;
		$scope.totalSales = 0;
		labPatientService.search({createdOn:dateToStr(new Date(searchDate))}).then(function(res){
			if(res.length){
				$scope.data = res.map(function(labPatientReport){
					var labReport = JSON.parse(labPatientReport.labReport);
					labReport['labPatient'] = labPatientReport.labPatient;
					labReport['id'] = labPatientReport.id;
					labReport['fee'] = labPatientReport.fee;
					labReport['isLabClosed'] = labPatientReport.isLabClosed;
					$scope.totalSales += labReport['fee'];
					labReport['isReportEdit'] = labPatientReport.isReportEdit;
					labReport['testedBy'] = labPatientReport.testedBy;
					labReport['reportedOn'] = labPatientReport.reportedOn;
					labReport['dispensedBy'] = $parse('labPatient.dispensedBy')(labPatientReport);
					if(labReport.labs){
						var prescCount = 0, paidCount = 0;
						for(var i = 0; i < labReport.labs.length; i++){
							if(labReport.labs[i].tests){
								for(var j = 0; j < labReport.labs[i].tests.length; j++){
									labReport.labs[i].tests[j]['note'] = getTestNotes(labReport.labs[i].tests[j].id);								
									if(labReport.labs[i].tests[j].isFeePaid){
										labReport['paidTests'] = ++paidCount;
									}
									labReport['prescribedTests'] = ++prescCount;
								}
							}
						}
					}
					return labReport;
				});
				$scope.formLoader = false;
			}else{
				$scope.formLoader = false;
			}
		}).catch(function(e){
			console.log('Error: ', e);
			$scope.formLoader = false;
		});
	}
	function getTestNotes(testId){
		var noteObj = $scope.labNotes.find(function(item){
			return item.testIds.indexOf(testId) > -1;
		});
		return $parse("note")(noteObj);
	}
	//lab tests dialog box
	function viewLabTests(labPatientReport){
		$scope.labPatientId = $parse('labPatient.id')(labPatientReport);
		$scope.report = labPatientReport;
		ngDialog.open({
			template:'./views/common/lab/viewTests.html',
    		className: 'ngdialog-theme-default formDialog',
    		scope : $scope
    	}).closePromise.then(function() {
    	});
	}
	//view payments
	function viewPayments(labReport){
		$scope.report = labReport;
		ngDialog.open({
			template:'./views/common/lab/labPayments.html',
    		className: 'ngdialog-theme-default ngdialog-lg',
    		scope : $scope,
    		controller: 'labPaymentsCtrl'
    	}).closePromise.then(function() {
    	});
	}
	//x ray image view
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
	function changeStatus(labPatientId,index){
		$scope.data[index]['isReportEdit'] = !$scope.data[index]['isReportEdit'];
		updateLabReport(labPatientId,$scope.data[index]['isReportEdit']);
	}
	//update lab report
	function updateLabReport(labPatientId,isEdit){
		$scope.formLoader = false;
		labPatientService.getReport(labPatientId).then(function(report){
			if(report){
				report.isReportEdit = isEdit;
				labPatientService.saveReport(report).then(function(res){
					if(res){
						$scope.formLoader = false;
					}else{
						$scope.formLoader = false;
					}
				});
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
	
	function print(labData) {
		$scope.printReport = angular.copy(labData);
		$scope.cost = 0;
		angular.forEach($parse('printReport.labs')($scope), function(lab) {
			var lReports = [];
			lab.isXray = $parse('categoryName.includes("X RAY")')(lab);
			lab.isScan = $parse('categoryName.includes("ULTRASOUND")')(lab);
			lab.isEcg = $parse('categoryName.includes("ECG")')(lab);
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
		},1000);
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
