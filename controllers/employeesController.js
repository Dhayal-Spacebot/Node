const data = {
    employees: require('../data/data.json'),
    setEmployees: function (data) {this.employees = data}
};

const getAllEmployees = (req,res) => {
    res.json(data.employees)
};

const createNewEmployee = (req,res) => {
    // res.json({
    //     "firstName" : req.body.firstName,
    //     "lastName": req.body.lastName
    // })
    const newEmployee = {
        id: data.employees?.length ? data.employees[data.employees?.length -1].id + 1 : 1 ,
        firstName: req.body?.firstName,
        lastName: req.body?.lastName
    }

    if(!newEmployee?.firstName || !newEmployee?.lastName){
        return res.status(400).json({
            "message":  "firstName and LastName is required ra puka!!!"
        });
    }

    data.setEmployees([...data.employees, newEmployee]);
    res.status(201).json(data.employees);

};

const updateEmployee = (req,res) => {
    // res.json({
    //     "firstName" : req.body.firstName,
    //     "lastName": req.body.lastName
    // })

    const employee = data.employees.find(emp => emp.id === parseInt(req.body?.id))
    if(!employee) {
        return res.status(404).json({"message": `Employee id: ${req.body?.id} is not found`})
    }
    if(req.body.firstName) employee.firstName = req.body.firstName
    if(req.body.lastName) employee.lastName = req.body.lastName

    const filteredArray = data.employees.filter(emp => emp.id !== parseInt(req.body.id));
    const unsortedArray = [...filteredArray, employee];
    data.setEmployees(unsortedArray.sort(compareById));
    res.status(200).json(data.employees)
};

const deleteEmployee = (req,res) => {
    // res.json({"id": req.body.id})

    const employee = data.employees.find(emp => emp.id === parseInt(req.body.id));
    if(!employee) {
        return res.status(404).json({"message": `Employee id: ${req.body?.id} is not found`});
    }
    const filterArray = data.employees.filter(emp => emp.id !== parseInt(req.body.id));
    data.setEmployees([...filterArray]);
    res.json(data.employees);
};

const getEmployee =  (req,res) => {
    // res.json({"id" : req.params.id})
    const employee = data.employees.find(emp => emp.id === parseInt(req.params.id));
    if(!employee) {
        return res.status(404).json({"message": `Employee id: ${req.params?.id} is not found`});
    }
    res.json(employee)
};


function compareById(a,b) {
    return a.id - b.id;
}

module.exports = { getAllEmployees, createNewEmployee, updateEmployee,deleteEmployee,getEmployee};
