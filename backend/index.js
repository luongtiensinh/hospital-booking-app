require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const authRouter = require('./routes/auth');
const doctorsRouter = require('./routes/doctors');
const appointmentsRouter = require('./routes/appointments');
const calendarRouter = require('./routes/calendar');

app.use('/api/auth', authRouter);
app.use('/api/doctors', doctorsRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/calendar', calendarRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server đang chạy tại http://localhost:${PORT}`));
