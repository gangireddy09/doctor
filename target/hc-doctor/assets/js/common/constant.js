var CONSTANTS = {
	URL: {
		BASE: '/hospitaldev'
	}
};

var ONLY_NUMBER_REGEX   	= "/^[0-9]*$/";
var ONLY_ALPHABETS_REGEX	= "/^[a-zA-Z]*$/";
var FLOATNUMBERS_REGEX 		= "/^\d{0,9}(\.\d{1,9})?$/";
var EMAIL_REGEX				= "/^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)$/";
var EMAIL_REGEX_2			= "/^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/";//minimum 2 letters after Dot

var REFERRER_LIST = [
                     "Dr.Krishna Reddy M.B.B.S.,D.G.O.",
                     "Dr.B. Lakshmi Narayana M.S.Ortho",
                     "Dr.Vadrevu Ravi M.D.Derm",
                     "Dr.M. Seshadri Reddy M.D.Gen",
                     "Dr.P.V. Nishanth DNB(Cardiology), NIMS",
                     "Dr.N. Lakshmi Narayana Reddy M.S(ENT)",
                     "Dr.T.V. GopiNath M.D.Chest",
                     "Dr.Satya Prasad M.ch, Uro",
                     "Dr.G. Vara Prasad M.S.MCH., Neuro",
                     "Dr.S. Venkat Reddy M.D, D.M, Gastro",
                     "Dr.G. RaghuSwaroop B.P.T(M.P.T, Ortho)"
                      ];
var DISPENSER_LIST = [
                      "Priyanka",
                      "Bhavani",
                      "Devi",
                      "Brahman Reddy",
                      "Ayyappa",
                      "Venkat Rama Reddy",
                      "Maha Lakshmi"
                      ];

var SALES_INFO_LIST =[{
						id : 1001,
						salesCustomerName : "UMA",
						salesInvoiceNumber : "SB190516093110160",
						salesInvoiceDate : 1463630140000,
						salesReferedBy : "Dr.Krishna Reddy M.B.B.S.,D.G.O.Dip.Diabetology.",
						salesDispensedBy : "Priyanka",
						salesDiscountPercentage : 0,
						salesDiscuntAmount : 0,
						salesPayType : 1,
						salesNetAmount : null,
						salesTotalAmount : null,
						paidAmount : null,
						salesRoundOff : "0",
						salesMedicines : [{
							salesBillMedicineMrp : 15.01,
							salesBillMedicinePrice : 15.01,
							salesBillMedicineQuantity : 1,
							salesBillMedicineVatAmount : 0.714762,
							salesBillMedicineVatPercent : 5,
							salesBillMedicineBatch : "IDI-1845",
							purchaseMedicine : {
								purchaseBillMedicineBatch : "IDI-1845",
								purchseBillMedicineExpiryMonth : 11,
								purchseBillMedicineExpiryYear : 2017,
								medicine : {
									medicineName : "MOWIN INJ"
								}
							}
						}]
					},{
						id : 1531,
						salesCustomerName : "Kona venkat",
						salesInvoiceNumber : 1202351,
						salesInvoiceDate : 1463630140000,
						salesNetAmount : 39.01,
						salesReferedBy : "Dr.Krishna Reddy M.B.B.S.,D.G.O.Dip.Diabetology",
						salesDiscountPercentage : 0 ,
						salesDiscountAmount : 0 ,
						salesDispensedBy : "Priyanka",
						salesMedicines : [{
							salesBillMedicineMrp : 16,
							salesBillMedicinePrice : 16,
							salesBillMedicineQuantity : 1,
							salesBillMedicineVatAmount : 0.761905,
							salesBillMedicineVatPercent : 5,
							purchaseMedicine : {
								purchaseBillMedicineBatch : "378",
								medicine : {
									medicineName : "INTAGESIC INJ"
								}
							}
						}],
					}];