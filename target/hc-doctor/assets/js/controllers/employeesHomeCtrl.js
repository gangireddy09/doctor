angular.module("doctorOPModule").controller("employeesHomeCtrl", function($scope,$http,$timeout) {
	var defSalary;
	var defCredit;
	$scope.init = function() {
		$scope.typesList=["Credit","Debit"];
		$scope.monthsList=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
		$scope.yearsList=["2016","2017","2018","2019","2020","2021","2022","2023","2024","2025"];

		var date = new Date();
		defSalary = {
			month: $scope.monthsList[date.getMonth()],
			year : date.getFullYear() + ""
		};
		$scope.getAllEmpList();
		$scope.form = {};
		$scope.empList = [];
		$scope.empSal = {};
		$scope.emp={};
		$scope.payType = {};
		$scope.empCreditTransactionsList=[];
		$scope.empSalaryTransactionsList=[];
		$scope.searchObjCredit={fromDate:new Date(),toDate:new Date()};
		$scope.searchObjSalary={fromDate:new Date(),toDate:new Date()};
		
		$scope.creditTransMsg=undefined;
		$scope.salaryTransMsg=undefined;
		
		$scope.resetSalaryForm();
	};
	
	$scope.resetSalaryForm = function() {
		$scope.salary = angular.copy(defSalary);
	};

	$scope.reserCreditForm=function(){
		$scope.payType=angular.copy(defCredit);
	};
	
	/*$scope.getAllEmpList = function() {
		$http.post(CONSTANTS.URL.BASE + '/employeeprofile/completeemployeelist').then(function(res){
			if(res.data.isSuccess) {
				$scope.empList = res.data.response;
				console.log($scope.empList);
			}
		});
	};*/
	$scope.getAllEmpList = function() {
		$http.get(CONSTANTS.URL.BASE + '/employeeprofile/getEmployeeCompleteInfo').then(function(res){
			if(res.data.isSuccess) {
				$scope.empList = res.data.response;
				//console.log($scope.empList);
			}
		});
	};
	
	
	$scope.openEmpForm = function() {
		$scope.emp = {};
		$scope.toggleBoolean('showEmpForm');
	};
	$scope.saveEmployee = function(){
		$http.post(CONSTANTS.URL.BASE + '/employeeprofile/insertemployeedetails',$scope.emp).then(function(res){
			if(res.data.isSuccess) {
				$scope.getAllEmpList();
				$scope.emp = {};
				$scope.form.empForm.$setPristine();
				$scope.formMsgClass = "form-msg-success";
				$scope.formMsgContent = "Employee Created Succesfully";
				$scope.clearFormMsg();
				$scope.toggleBoolean('showEmpForm');
			}
		});
	};
	
	$scope.ediEmployee = function(emp,index){
		$scope.toggleBoolean('showEmpForm');
		$scope.emp = angular.copy(emp.employeeProfile);
		$scope.index = index;
	};
	
	$scope.updateEmployee = function(){
		var req = {};
		req = angular.copy($scope.emp);
		$http.post(CONSTANTS.URL.BASE + '/employeeprofile/updateEmployeeProfile',req).then(function(res){
			console.log(res);
			if(res.data.isSuccess) {
				$scope.getAllEmpList();
				$scope.emp = {};
				$scope.form.empForm.$setPristine();
				$scope.formMsgClass = "form-msg-success";
				$scope.formMsgContent = "Employee Details Updated Succesfully";
				$scope.clearFormMsg();
				$scope.toggleBoolean('showEmpForm');
			}
		});
	};
	
	$scope.editEmpSalary = function(emp,index){
		$scope.index = index;
		$scope.empSal.employeeProfile = {};
		$scope.empSal.employeeProfile.id = emp.employeeProfile.id;
		$scope.empSal.amount = emp.amount;
		$scope.empSal.fromDate = emp.fromDate;
		$scope.toggleBoolean('editSalary');
	};
	
	$scope.updateSalary = function() {
		$scope.empSal.fromDate = dateToStr($scope.empSal.fromDate); 
		$http.post(CONSTANTS.URL.BASE + '/employeesalary/updateEmployeeSalary',$scope.empSal).then(function(res){
			if(res.data.isSuccess) {
				//$scope.empList[$scope.index].amount = res.data.response.amount;
				$scope.getAllEmpList();
				$scope.empSal = {};
				$scope.form.empSalForm.$setPristine();
				$scope.formMsgClass = "form-msg-success";
				$scope.formMsgContent = "Employee Salary Updated Succesfully";
				$scope.clearFormMsg();
				$scope.toggleBoolean('editSalary');
			}
		});
	};
	
	
	$scope.openPayForm = function(emp) {
		$scope.toggleBoolean('showPayForm');
		$scope.currentEmp = angular.copy(emp);
		$scope.changeCurrentView('salaryForm');
		$http.post("../employeeprofile/getemployeeprofilebyid?id="+emp.employeeProfile.id).then(function(res){
			if(res.data.isSuccess) {
				remBal = $scope.remainingBalance = res.data.response.creditAmount;
			}
		});
	};
	
	$scope.saveEmpSalary = function(){ 
		var req = angular.copy($scope.salary);
		req.paidMonth = req.month.concat(req.year);
		delete req.month;
		delete req.year;
		req.employeeProfile = {
				id: $scope.currentEmp.employeeProfile.id
		};
		$http.post("../salarypayment/savePaymentInfo", req).then(function(res){
			if(res.data.isSuccess) {
				$scope.formMsgClass = "form-msg-success";
				$scope.formMsgData = "Employee Salary Saved Succesfully";
				$scope.clearFormMsg();

				$scope.resetSalaryForm();
				$scope.form.salaryForm.$setPristine();
			}else{
				$scope.formMsgClass = "form-msg-error";
				$scope.formMsgData = "Error in Saving";
				$scope.clearFormMsg();
			}
		});
	};
	
	$scope.saveData = function(){
		var req = angular.copy($scope.payType);
		req.employeeProfile = {
				id: $scope.currentEmp.employeeProfile.id
		};
		$http.post("../employeecredit/insertEmployeeCreditInfo",req).then(function(res){
			if(res.data.isSuccess) {
				//$scope.calRemainAmount();
				$scope.formMsgClass = "form-msg-success";
				$scope.formMsgData = "Amount Saved Succesfully";
				$scope.clearFormMsg();
				
				$scope.reserCreditForm();
				$scope.form.creditForm.$setPristine();
			}else{
				$scope.formMsgClass = "form-msg-error";
				$scope.formMsgData = "Error in Saving";
				$scope.clearFormMsg();
			}
		});
	};
	
	$scope.calRemainAmount=function(){
		if(remBal){
		if($scope.payType.paidAmount){
			if($scope.payType.type=='Credit'){
				$scope.remainingBalance = parseInt(remBal) + parseInt($scope.payType.paidAmount);
			}else if($scope.payType.type=='Debit'){
				$scope.remainingBalance = parseInt(remBal) - parseInt($scope.payType.paidAmount);
			}
		}else{
			$scope.remainingBalance = parseInt(remBal);
		}
	}else{
		remBal = 0;
	}
	};

	$scope.getEmpCreditTransactions=function(){
		var req = angular.copy($scope.searchObjCredit);
		req.id = $scope.currentEmp.employeeProfile.id;
		$http.post('../employeecredit/completeEmployeecreditList',req).then(function(res){
			if(res.data.response){
				$scope.empCreditTransactionsList = res.data.response;
				if(res.data.response.length==0){
					$scope.creditTransMsg="No Transactions Found";
				}
			}	
		});
	};
	
	
	$scope.getEmpSalaryTransactions=function(){
		var req=angular.copy($scope.searchObjSalary);
		req.id = $scope.currentEmp.employeeProfile.id;
		$http.post('../salarypayment/completeEmployeesalaryList',req).then(function(res){
			if(res.data.response){
				$scope.empSalaryTransactionsList = res.data.response;
				if(res.data.response.length==0){
					$scope.salaryTransMsg="No Transactions Found";
				}
			}
			});
	};
	
	
	$scope.clearFormMsg = function() {
		$timeout(function() {
			$scope.formMsgContent = undefined;
			$scope.formMsgData= undefined;
		}, 3000);
	};
	
	$scope.toggleBoolean = function(state) {
		$scope[state] = !$scope[state];
	};
	
	$scope.changeCurrentView = function(panel) {
		$scope.currentView = panel;
	};
	
	/*Calendar Start*/
	$scope.showWeeks= false;
	$scope.inlineOptions = {
		customClass: getDayClass,
		minDate: new Date() ,
		showWeeks: false
	};

	$scope.dateOptions = {
		// dateDisabled: disabled,
		formatYear: 'yy',
		maxDate: new Date(2040, 11, 31),
		minDate: new Date(),
		startingDay: 1
	};

	// Disable weekend selection
	function disabled(data) {
		var date = data.date,
		mode = data.mode;
		return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
	}

	$scope.toggleMin = function() {
		$scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
		$scope.dateOptions.minDate = $scope.inlineOptions.minDate;
	};

	$scope.toggleMin();

	$scope.openCalendar = function(calenderParameter) {
		$scope[calenderParameter] = {opened: true};
	};

	$scope.setDate = function(year, month, day) {
		$scope.dt = new Date(year, month, day);
	};
	  $scope.calendarPanel = {
	    opened: false
	  };


	  function getDayClass(data) {
	    var date = data.date,
	      mode = data.mode;
	    if (mode === 'day') {
	      var dayToCheck = new Date(date).setHours(0,0,0,0);

	      for (var i = 0; i < $scope.events.length; i++) {
	        var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

	        if (dayToCheck === currentDay) {
	          return $scope.events[i].status;
	        }
	      }
	    }

	    return '';
	  }
	  /*Calendar End*/
	$scope.init();
});