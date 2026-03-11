const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
const Employee = require('./models/Employee');
const hbs = require('hbs');
const { createHandler } = require('graphql-http/lib/use/express');
const {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
} = require('graphql');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Empl';
const departments = ['Engineering', 'Human Resources', 'Finance'];


hbs.registerPartials(path.join(__dirname, 'views/partials'));
hbs.registerHelper('isSelected', function(option, value) {
  return option === value;
});
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

async function connectDB() {
  try {
    await mongoose.connect(uri, {
      dbName: 'Empl',
    });
    console.log('Successfully connected to MongoDB with mongoose');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

app.use(express.urlencoded());

const EmployeeType = new GraphQLObjectType({
  name: 'Employee',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: employee => employee._id.toString(),
    },
    firstName: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    department: { type: new GraphQLNonNull(GraphQLString) },
    startDate: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: employee => new Date(employee.startDate).toISOString().split('T')[0],
    },
    jobTitle: { type: new GraphQLNonNull(GraphQLString) },
    salary: { type: new GraphQLNonNull(GraphQLFloat) },
  },
});

const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    employees: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(EmployeeType))),
      resolve: async () => Employee.find({}).sort({ createdAt: -1 }),
    },
    employee: {
      type: EmployeeType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (_, { id }) => Employee.findById(id),
    },
  },
});

const MutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createEmployee: {
      type: new GraphQLNonNull(EmployeeType),
      args: {
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        lastName: { type: new GraphQLNonNull(GraphQLString) },
        department: { type: new GraphQLNonNull(GraphQLString) },
        startDate: { type: new GraphQLNonNull(GraphQLString) },
        jobTitle: { type: new GraphQLNonNull(GraphQLString) },
        salary: { type: new GraphQLNonNull(GraphQLFloat) },
      },
      resolve: async (_, args) => {
        const createdEmployee = await Employee.create({
          ...args,
          salary: Number(args.salary),
        });

        return createdEmployee;
      },
    },
    updateEmployee: {
      type: EmployeeType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        lastName: { type: new GraphQLNonNull(GraphQLString) },
        department: { type: new GraphQLNonNull(GraphQLString) },
        startDate: { type: new GraphQLNonNull(GraphQLString) },
        jobTitle: { type: new GraphQLNonNull(GraphQLString) },
        salary: { type: new GraphQLNonNull(GraphQLFloat) },
      },
      resolve: async (_, { id, ...rest }) => Employee.findByIdAndUpdate(
        id,
        {
          ...rest,
          salary: Number(rest.salary),
        },
        { new: true }
      ),
    },
    deleteEmployee: {
      type: EmployeeType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (_, { id }) => Employee.findByIdAndDelete(id),
    },
  },
});

const schema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType,
});

app.use('/graphql', createHandler({ schema }));

async function executeGraphQL(operation, variables = {}) {
  const payload = await graphql({
    schema,
    source: operation,
    variableValues: variables,
  });

  if (payload.errors?.length) {
    throw new Error(payload.errors.map(error => error.message).join('; '));
  }

  return payload.data;
}


app.get('/', (req, res) => {
  res.redirect('/index');
});

app.get('/index', (req, res) => {
  res.render('index', { departments });
});

app.post('/create-employee', async (req, res) => {
  try {
    const { firstName, lastName, department, startDate, jobTitle, salary } = req.body;

    await executeGraphQL(
      `
        mutation CreateEmployee(
          $firstName: String!
          $lastName: String!
          $department: String!
          $startDate: String!
          $jobTitle: String!
          $salary: Float!
        ) {
          createEmployee(
            firstName: $firstName
            lastName: $lastName
            department: $department
            startDate: $startDate
            jobTitle: $jobTitle
            salary: $salary
          ) {
            id
          }
        }
      `,
      {
      firstName,
      lastName,
      department,
      startDate,
      jobTitle,
      salary: Number(salary),
      }
    );

    res.redirect('/view');
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).send('Failed to create employee.: ');
  }
});

app.get('/view', async (req, res) => {
  try {
    const data = await executeGraphQL(`
      query GetEmployees {
        employees {
          id
          firstName
          lastName
          department
          startDate
          jobTitle
          salary
        }
      }
    `);

    const employees = data.employees.map(employee => ({
      ...employee,
      _id: employee.id,
    }));

    res.render('view', { employees });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).send('Failed to load employees.');
  }
});

app.get('/update/:id', async (req, res) => {
  try {
    const data = await executeGraphQL(
      `
        query GetEmployee($id: ID!) {
          employee(id: $id) {
            id
            firstName
            lastName
            department
            startDate
            jobTitle
            salary
          }
        }
      `,
      { id: req.params.id }
    );

    const employee = data.employee;

    if (!employee) {
      return res.status(404).send('Employee not found.');
    }

    res.render('update', {
      employee: {
        ...employee,
        _id: employee.id,
      },
      departments,
    });
  } catch (error) {
    console.error('Error loading employee for update:', error);
    res.status(500).send('Failed to load employee.');
  }
});

app.post('/update-employee/:id', async (req, res) => {
  try {
    const { firstName, lastName, department, startDate, jobTitle, salary } = req.body;

    await executeGraphQL(
      `
        mutation UpdateEmployee(
          $id: ID!
          $firstName: String!
          $lastName: String!
          $department: String!
          $startDate: String!
          $jobTitle: String!
          $salary: Float!
        ) {
          updateEmployee(
            id: $id
            firstName: $firstName
            lastName: $lastName
            department: $department
            startDate: $startDate
            jobTitle: $jobTitle
            salary: $salary
          ) {
            id
          }
        }
      `,
      {
        id: req.params.id,
        firstName,
        lastName,
        department,
        startDate,
        jobTitle,
        salary: Number(salary),
      }
    );

    res.redirect('/view');
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).send('Failed to update employee.');
  }
});

app.get('/delete/:id', async (req, res) => {
  try {
    const data = await executeGraphQL(
      `
        query GetEmployee($id: ID!) {
          employee(id: $id) {
            id
            firstName
            lastName
            department
            startDate
            jobTitle
            salary
          }
        }
      `,
      { id: req.params.id }
    );

    const employee = data.employee;

    if (!employee) {
      return res.status(404).render('delete', { deletedMessage: 'Employee not found.' });
    }

    res.render('delete', {
      employee: {
        ...employee,
        _id: employee.id,
      },
    });
  } catch (error) {
    console.error('Error loading employee for delete:', error);
    res.status(500).send('Failed to load delete page.');
  }
});

app.post('/delete-employee/:id', async (req, res) => {
  try {
    const data = await executeGraphQL(
      `
        mutation DeleteEmployee($id: ID!) {
          deleteEmployee(id: $id) {
            id
            firstName
            lastName
          }
        }
      `,
      { id: req.params.id }
    );

    const deletedEmployee = data.deleteEmployee;

    if (!deletedEmployee) {
      return res.status(404).render('delete', { deletedMessage: 'Employee not found.' });
    }

    res.render('delete', {
      deletedMessage: `${deletedEmployee.firstName} ${deletedEmployee.lastName} was deleted successfully.`,
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).send('Failed to delete employee.');
  }
});

app.use((req, res) => {
  res.redirect('/index');
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}).catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});


