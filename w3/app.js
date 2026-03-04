const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
const Employee = require('./models/Employee');
const hbs = require('hbs');

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


app.get('/', (req, res) => {
  res.redirect('/index');
});

app.get('/index', (req, res) => {
  res.render('index', { departments });
});

app.post('/employees', async (req, res) => {
  try {
    const { firstName, lastName, department, startDate, jobTitle, salary } = req.body;

    await Employee.create({
      firstName,
      lastName,
      department,
      startDate,
      jobTitle,
      salary: Number(salary),
    });

    res.redirect('/view');
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).send('Failed to create employee.: ');
  }
});

app.get('/view', async (req, res) => {
  try {
    const employees = await Employee.find({}).sort({ createdAt: -1 });
    res.render('view', { employees });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).send('Failed to load employees.');
  }
});

app.get('/update/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).send('Employee not found.');
    }

    res.render('update', { employee, departments });
  } catch (error) {
    console.error('Error loading employee for update:', error);
    res.status(500).send('Failed to load employee.');
  }
});

app.post('/update/:id', async (req, res) => {
  try {
    const { firstName, lastName, department, startDate, jobTitle, salary } = req.body;

    await Employee.findByIdAndUpdate(req.params.id, {
      firstName,
      lastName,
      department,
      startDate,
      jobTitle,
      salary: Number(salary),
    });

    res.redirect('/view');
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).send('Failed to update employee.');
  }
});

app.get('/delete/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).lean();

    if (!employee) {
      return res.status(404).render('delete', { deletedMessage: 'Employee not found.' });
    }

    res.render('delete', { employee });
  } catch (error) {
    console.error('Error loading employee for delete:', error);
    res.status(500).send('Failed to load delete page.');
  }
});

app.post('/delete/:id', async (req, res) => {
  try {
    const deletedEmployee = await Employee.findByIdAndDelete(req.params.id).lean();

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


