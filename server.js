const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');

const db = mysql.createConnection(
  {
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'business_db'
  },
  console.log(`Connected to the business_db database.`)
);

db.connect(function(err) {
  if (err) throw err;
  
});
promptUser();

// start menu
function promptUser() {
  inquirer.prompt([
    {
      type: 'list',
      message: 'Please choose an option:',
      name: 'option',
      choices: [
        'View all departments',
        'View all roles',
        'View all employees',
        'Add a department',
        'Add a role',
        'Add an employee',        
        'Update an employee',
        'Exit'
      ]     
    }
  ])
  // Return user's option
  .then(function(answer) {
    switch (answer.option) {
      case 'View all departments':
        allDepartments();
        break;
     case 'View all roles':
        allRoles();
        break;
      case 'View all employees':
        allEmployees();
        break;
      case 'Add a department':
        addDepartment();
        break;
      case 'Add a role':
        addRole();
        break;
      case 'Add an employee':
        addEmployee();
        break;
      case 'Update an employee':
        updateRole();
        break;
      case 'Exit':
        db.end();
        break;
    }
  });
};

// Create all departments table
function allDepartments() {
  const sql = `SELECT * FROM department`
  console.log(sql);
  db.query(sql, (err, res) => {
    if(err) {
      throw err
    }
    console.table(res)
    promptUser()
  });
}

// Create all roles table
function allRoles() {
  const sql = `SELECT * FROM role`
  db.query(sql, (err, res) => {
    if(err) {
      throw err
    }
    console.table(res)
    promptUser()
  });
}

// Create all employees table
function allEmployees() {
  const sql = `SELECT employee.id, 
  CONCAT(employee.first_name, ' ', employee.last_name) AS name,
   role.title, department.name AS department, 
   CONCAT(manager.first_name, ' ', 
   manager.last_name) AS manager FROM employee LEFT JOIN 
   role ON employee.role_id = role.id LEFT JOIN department
   ON role.department_id = department.id LEFT JOIN 
   employee manager ON manager.id = employee.manager_id`

  db.query(sql, (err, res) => {
    if(err) {
      throw err
    }
    console.table(res)
    promptUser()
  });
}

// add department function
function addDepartment(){
  inquirer.prompt([
      {
        name: 'name',
        type: 'input',
        message: 'Add the department name.'
      },

  ]).then(answers => {
          const sql = `INSERT INTO department (name) VALUES (?)`;
          const params = [answers.name]
          db.query(sql, params, (err, res) => {
              if (err) throw err 
              console.log("The department" + " '" + answers.name + "' " + "has been added!");
              promptUser();
          }
      );
  });
};


// Add Role function
function addRole(){
  return inquirer.prompt([
      {
        name: 'title',
        type: 'input',
        message: 'Please add a role.'
      },
      {
          name: 'salary',
          type: 'input',
          message: 'Please enter the salary of this role.'
      },
      {
          name: 'departmentId',
          type: 'input',
          message: 'Please select the department ID of this role.'
      }

  ]).then(answer => {
          const sql = `INSERT INTO role (title, salary, department_id) VALUES (?,?,?)`;
          const params = [answer.title, answer.salary, answer.departmentId]
          db.query(sql, params, (err, res) => {
              if (err) throw err 
              console.log("Successfully added role");
              promptUser();
          }
      )
  })
}



// add employee function
function addEmployee() {
  inquirer.prompt([
    {
      name: 'firstname',
      type: 'input',
      message: 'Please enter the first name of the employee.'
    },
    {
      name: 'lastname',
      type: 'input',
      message: 'Please enter the last name of the employee.'
    },
    {
      name: 'roleId',
      type: 'input',
      message: 'Please enter the role ID.'
    },
    {
      name: 'managerId',
      type: 'input',
      message: 'Please enter the manager ID of the employee.'
    }
  ]).then(answer => {
    const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)`;
    const params = [answer.firstname, answer.lastname, answer.roleId, answer.managerId]
    db.query(sql, params, (err, res) => {
      if (err) throw err;
      console.log('Successfully added department.')
      promptUser()
      });
  });
};

// Update a role
function updateRole(){
  const sql = `SELECT * FROM employee`;
  db.query(sql, (err, res) => {
      if (err) throw err
      console.log(res);
      const employee = res.map(({ id, first_name, last_name }) => ({
       value: id,
       name: `${first_name} ${last_name}`,
     }));
           inquirer.prompt([
           {
               name: 'title',
               type: 'list',
               message: 'Choose an employee to update the role',
               choices: employee
           },
       ]).then(answer => { 
           const sql = `SELECT * FROM role`;
           db.query(sql, (err, res) => {
               if (err) throw err
                   const role = res.map(({ id, title, salary }) => ({
                   value: id,
                   title: `${title}`,
                   salary: `${salary}`,
                   name: `${title}`,
               }));
               return inquirer.prompt([
                   {
                   type: 'list',
                   name: 'role',
                   message: 'Choose the new role.',
                   choices: role,
                   }
               ]).then(ans =>{
                       const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;
                       const params = [ans.role, answer.title]

                       db.query(sql, params, (err, res) => {
                         if (err) throw err;
                         console.log("Employe role has been updated.");
                         promptUser();
                       });
               })
           })
       })
   }
)};