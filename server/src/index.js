require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs');

const connectDB = require('./config/db');
const { seedDatabase } = require('./utils/seed');

const init = async () => {
  await connectDB();
  await seedDatabase();
};
init();

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/beekeepers', require('./routes/beekeeper.routes'));
app.use('/api/hives', require('./routes/hive.routes'));
app.use('/api/batches', require('./routes/batch.routes'));
app.use('/api/quality', require('./routes/quality.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/fraud', require('./routes/fraud.routes'));

app.use(require('./middleware/error.middleware'));

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
