var a = [ '', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ',
		'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ',
		'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ',
		'nineteen ' ];
var b = [ '', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy',
		'eighty', 'ninety' ];

Array.prototype.add = function(key) {
	var sum = 0, i;
	if (key === undefined) {
		for (i = 0; i < this.length; i++) {
			sum += parseFloat(this[i]);
		}
	} else {
		for (i = 0; i < this.length; i++) {
			sum += parseFloat(this[i][key]);
		}
	}
	return sum;
};

Array.prototype.addNonBlanks = function(key) {
	var sum = 0;
	var i = this.length;
	if (key) {
		while (i--) {
			if (parseFloat(this[i][key]))
				sum += parseFloat(this[i][key]);
		}
	} else {
		while (i--) {
			if (parseFloat(this[i]))
				sum += parseFloat(this[i]);
		}
	}
	return sum;
};

Array.prototype.search = function(key, value) {
	for (var i = 0; i < this.length; i++) {
		if (this[i] === value || this[i][key] == value) {
			return this[i];
		}
	}
};
Array.prototype.getObjByKeyVal = function(key, val) {
	var i = this.length;
	while (i--) {
		if (this[i][key] == val)
			return this[i];
	}
};
Array.prototype.getIndexByKeyVal = function(key, val) {
	var i = this.length;
	while (i--) {
		if (this[i][key] == val)
			return i;
	}
};
String.prototype.toTextString = function(number) {
	return number.parseInt(number).toTextString();
};

Number.prototype.toTextString = function() {
	var num = Math.round(this.valueOf());
	n = ('000000000' + num).substr(-9).match(
			/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
	if (!n)
		return;
	else if (num == 0) {
		return "zero rupees only";
	}
	var str = '';
	str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]])
			+ 'crore ' : '';
	str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]])
			+ 'lakh ' : '';
	str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]])
			+ 'thousand ' : '';
	str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]])
			+ 'hundred ' : '';
	str += (n[5] != 0) ? ((str != '') ? 'and ' : '')
			+ (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + '' : '';
	return str + ' rupees only';
};

String.prototype.leadingZeros = function(length) {
	return parseInt(this).leadingZeros(length);
};
Number.prototype.leadingZeros = function(length) {
	var zero = length - this.valueOf().toString().length + 1;
	return Array(+(zero > 0 && zero)).join("0") + this.valueOf();
};

Date.prototype.addDays = function(days) {
	this.setDate(this.getDate() + parseInt(days));
	return this;
};

function dateToStr(date) {
	if (date) {
		return date.getFullYear() + '-' + (date.getMonth() + 1) + '-'
				+ date.getDate();
	} else {
		return '';
	}
}

function removeTime(date) {
	if (!date) {
		date = new Date();
	}
	date.setHours(0);
	date.setMinutes(0);
	date.setSeconds(0);
	date.setMilliseconds(0);
	return date;
}

function getDateFromAge(age) {
	var today = new Date();
	var todayinMilliSecs = today.getTime();
	var ageinMilliSecs = age * 365 * 24 * 60 * 60 * 1000;
	var dobinMilliSecs = todayinMilliSecs - ageinMilliSecs;
	return new Date(dobinMilliSecs);
}
function getAgeFromDob(dob) {
	var dobYear = dob.getFullYear();
	var today = new Date();
	var currentYear = today.getFullYear();
	return currentYear - dobYear;
}

function toURLParams(obj, nullAllowed) {
	var params = '';
	Object
			.keys(obj)
			.forEach(
					function(k) {
						if (nullAllowed
								|| (!nullAllowed && obj[k] !== null && obj[k] !== undefined)) {
							params += (encodeURIComponent(k) + '='
									+ encodeURIComponent(obj[k]) + '&');
						}
					});
	return params.substr(0, params.length - 1);
}

function getLabsByIds(labIds, labData,labReports,group) {
	testIds = labIds;
	var labs = labIds.map(function(labId) {
	    var labObj = findInLabTree(labId, labData.subTests,labReports);
		labObj.src = labId.src;
		return labObj;
	});
	if(group){
		return groupLabs(labs);
	}else{
		return labs;
	}
}

function findInLabTree(labId, treeNode,labReports) {
	var id = labId.id;
	var itemFound = treeNode.find(function(item) {
		return item.id === id;
	});
	if (!itemFound) {
		var parentNode = treeNode.find(function(item) {
			return id.indexOf(item.id) === 0;
		});
		itemFound = findInLabTree(labId, parentNode.subTests,labReports);
	}else{
		if(labReports){
			itemFound['report'] = labReports[itemFound['report']];
			itemFound['isFeePaid'] = labId.val;
		}
	}
	return itemFound;
}
function groupLabs(labs){
	var list = [];
	for(var i = 0; i < labs.length; i++){
		var obj = {
				categoryName: labs[i].categoryName,
				parents: labs[i].parents,
				tests: [labs[i]]
		};
		for(var j = i + 1; j < labs.length; j++){
			if(labs[i].categoryName == labs[j].categoryName){
					obj.tests.push(labs[j]);
					labs.splice(j,1);
					j--;
			}
		}
		list.push(obj);
	}
	return list;
};

function getSelectedLabs(groupLabs,reports){
	var selectedLabs = {};
	groupLabs.map(function(lab){
		var categoryName = lab.categoryName;
		if(categoryName in selectedLabs){
			//To check category in selected labs				
		}else{
			selectedLabs[categoryName] = [ ];
		}
		lab.tests.map(function(test){
			test['isSelected'] = true;
			test['highlight'] = true;
			if(reports){
				angular.forEach(reports,function(values,key){
					if(JSON.stringify(values) === JSON.stringify(test.report)){
						test.report = key;
					};
				});
			}
			angular.forEach(selectedLabs,function(values,key){
				if(test.categoryName == key){
					selectedLabs[categoryName].push(test);
				}
			});
			test['isPrescribed'] = true;
			test['src'] = test.src || sessionStorage.getItem('userName');
		});
		
	});
	return selectedLabs;
}
var HOSPITAL_NAME = "Sura Reddy Nursing Home";
var LAB_STATUS = ["DP","BD"];
var REFERER_LIST = [ "Dr. Krishna Reddy", "Dr. Narayana Reddy" ];
var LAB_TECHNICIANS = [ "Dr. Krishna Reddy", "Srinadh", "Nagaraju", "Kranthi" ];
var DISPENCER_LIST = ["Sunitha","Ganga Bhavani","Swapna","Sandhya Devi","Prasad","Veera Lakshmi"];
var SALES_PAYMENT_TYPES = [
	{id: 1, value: "Cash"},
	{id: 2, value: "Credit"},
	{id: 3, value: "Partial Credit"},
	{id: 4, value: "Free"},
	];
var SALES_CREDIT_PAYMENT_TYPES = [
	{id: 2.1, value: "SELF"},
	{id: 2.2, value: "NTRVS"},
	{id: 2.3, value: "EHS"},
  	{id: 2.4, value: "ESI"},
  	{id: 2.5, value: "WJHS"},
  	{id: 2.6, value: "INSURANCE"}
    ];
var SALES_FREE_PAYMENT_TYPES = [
      {id: 4.1, value: "SELF"},
      {id: 4.2, value: "OTHERS"}
  ];
var TAX_PERCENTS = [ {
	key : "0 %",
	val : "0"
}, {
	key : "5 %",
	val : "5"
}, {
	key : "12 %",
	val : "12"
}, {
	key : "18 %",
	val : "18"
}, {
	key : "28 %",
	val : "28"
} ];

var PURCHASE_PAYMENT_TYPES = [ {
	id : 1,
	value : "Cash"
}, {
	id : 2,
	value : "Credit"
}, {
	id : 3,
	value : "Partial Credit"
}, {
	id : 4,
	value : "Free"
} ];


var OP_COST_CONFIG = {
	"costs" : {
		"1" : { // GENERAL
			"1" : {
				"cost" : 50,
				"validity" : 15
			},
			"2" : {
				"cost" : 75,
				"validity" : 15
			},
			"3" : {
				"cost" : 75,
				"validity" : 15
			},
			"4" : {
				"cost" : 0,
				"validity" : 15
			},
			"5" : {
				"cost" : 0,
				"validity" : 15
			},
			"6" : {
				"cost" : 0,
				"validity" : 15
			}
		},
		"2" : { // EMERGENCY
			"1" : {
				"cost" : 100,
				"validity" : 5
			},
			"2" : {
				"cost" : 125,
				"validity" : 5
			},
			"3" : {
				"cost" : 125,
				"validity" : 5
			},
			"4" : {
				"cost" : 0,
				"validity" : 5
			},
			"5" : {
				"cost" : 0,
				"validity" : 5
			},
			"6" : {
				"cost" : 0,
				"validity" : 5
			}
		}
	},
	"free" : [ 4, 5, 6 ]
};
var GENDERS = [ "Male", "Female" ];
var RELATIONS = [ "S/o", "D/o", "W/o", "C/o" ];
var IPTYPES = ["Surgical", "Medical"];
