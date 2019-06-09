var budgetController = (function(){
    var Incomes = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    var Expenses = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentages = -1;
    };
    Expenses.prototype.calcPercentages = function(totalInc){
        if(totalInc > 0)
            this.percentages = Math.round((this.value / totalInc) * 100);
        else 
            this.percentages = -1;
    }
    Expenses.prototype.getPercentage = function(){
        return this.percentages;
    }
    
    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(current){
            sum += current.value;          
        });
        data.totals[type] = sum;
    };
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }
    
    return {
        addItem: function(type, des, val){
            var newItem, ID;
            if(data.allItems[type].length > 0)
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            else 
                ID = 0;
            if(type === 'exp')
                newItem = new Expenses(ID, des, val);
            else if(type === 'inc')
                newItem = new Incomes(ID, des, val);
            data.allItems[type].push(newItem);
        return newItem;
        },
        calculateBudget: function(){
            calculateTotal('exp');
            calculateTotal('inc');
            data.budget = data.totals.inc - data.totals.exp;
            if(data.totals.inc > 0)
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            else 
                data.percentage = -1;
        },
        deleteItem: function(type, id){
            var ids, index;
            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            index = ids.indexOf(id);
            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },
        calculatePercentages: function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentages(data.totals.inc);
            });
        },
        getPercentages: function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },
        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        testing: function(){
            console.log(data);
        }
        
    };
    
})();

var UIController = (function(){
    
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    var formatNumber = function(num, type){
        var numSplit, int, dec;
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];
        dec = numSplit[1];
        if(int.length > 3)
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };
    
    var nodeListForEach = function(list, callback){
        for(var i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    };
    
    return {
        keyObject : function(){
            return{
                inc_or_dec: document.querySelector(DOMstrings.inputType).value,
                desc: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }; 
        },
        addListItem: function(obj, type){
            var html, newHtml, element;
            if(type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if(type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
        },
        deleteListItem: function(selector){
            var el = document.getElementById(selector);
            el.parentNode.removeChild(el);
        },
        clearFields: function(){
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ", " + DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current, index, array){
                current.value = "";
            });
            fieldsArr[0].focus();
        },
        displayBudget: function(obj){
            var type;
            obj.budget >= 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            if(obj.percentage > 0)
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            else 
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
        },
        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            
            nodeListForEach(fields, function(current, index){
                if(percentages[index] > 0)
                    current.textContent = percentages[index] + '%';
                else
                    current.textContent = '---';
            });
        },
        displayMonth: function(){
            var now, months, month, year;
            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + " " + year;
        },
        changedType: function(){
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ', ' +
                DOMstrings.inputDescription + ', ' + 
                DOMstrings.inputValue
            );
            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },
        getDOMstrings: function(){
            return DOMstrings;
        }
    };
})();

var controller = (function(budgetCtrl, uiCtrl){
    var setupEventListeners = function(){
        var DOM = uiCtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);
        document.addEventListener("keypress", function(e){
            if(e.keyCode === 13)
                ctrlAddItem();
        });
       document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener("change", uiCtrl.changedType);
    }
    
    var updateBudget = function(){
        budgetCtrl.calculateBudget();
        var budget = budgetCtrl.getBudget();
        uiCtrl.displayBudget(budget);
    };
    
    var updatePercentages = function(){
        budgetCtrl.calculatePercentages();
        var percentage = budgetCtrl.getPercentages();
        uiCtrl.displayPercentages(percentage);
    };
    
    var ctrlAddItem = function(){
        var input, newItem;
        input = uiCtrl.keyObject();
        if(input.desc !== "" && input.value > 0 && !isNaN(input.value)){
            newItem = budgetCtrl.addItem(input.inc_or_dec, input.desc, input.value);
            uiCtrl.addListItem(newItem, input.inc_or_dec);
            uiCtrl.clearFields();
            updateBudget();
            updatePercentages();
        }
    };
    var ctrlDeleteItem = function(event){
        var itemID,splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            budgetCtrl.deleteItem(type, ID);
            console.log(itemID);
            uiCtrl.deleteListItem(itemID);
            updateBudget();
            updatePercentages();
        }
    };
    return {
        init: function(){
            console.log("Application has been started");
            uiCtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            uiCtrl.displayMonth();
            setupEventListeners();
        }
    };
    
    
})(budgetController, UIController);

controller.init();

//var budgetController = (function(){
//    var Incomes = function(id, desc, value){
//        this.id = id;
//        this.desc = desc;
//        this.value = value;
//    }
//    var Expenses = function(id, desc, value){
//        this.id = id;
//        this.desc = desc;
//        this.value = value;
//    }
//    var data = {
//        allItems: {
//            inc: [],
//            exp: []
//        },
//        totals: {
//            inc: 0,
//            exp: 0
//        }
//    }
//    var newItem, ID;
//    return {
//        addItem: function(type, des, val){
//            if(data.allItems[type].length > 0)
//                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
//            else 
//                ID = 0;
//            if(type === 'inc'){
//                newItem = new Incomes(ID, des, val);
//            } else if(type === 'exp'){
//                newItem = new Expenses(ID, des, val);
//            }
//            data.allItems[type].push(newItem);
//            return newItem;
//        }
//    }
//    
//})();
//
//var UIController = (function(){
//    var DOMstrings = {
//        inputType: ".add__type",
//        inputDescription: ".add__description",
//        inputValue: ".add__value",
//        inputBtn: ".add__btn"
//    }
//    return{
//        newItem: function(){
//            return {
//                type: document.querySelector(DOMstrings.inputType).value,
//                desc: document.querySelector(DOMstrings.inputDescription).value,
//                value: document.querySelector(DOMstrings.inputValue).value
//            };
//        },
//        getDOMstrings: function(){
//            return DOMstrings;
//        }
//    };   
//        
//})();
//
//var controller = (function(budgetCtrl, UICtrl){
//    var DOM = UICtrl.getDOMstrings();
//    var ctrlAddItem = function(){
//        var input = UICtrl.newItem();
//        var newItem = budgetCtrl.addItem(input.type, input.desc, input.value);
//    }
//    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);
//    document.addEventListener("keypress", function(e){
//        if(e.keyCode === 13){
//            ctrlAddItem();
//        }
//    });
//})(budgetController, UIController);







