const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cardRouter = require('./routes/cards');
const userRouter = require('./routes/users');
const { auth } = require('./middlewares/auth');
const cookieParser = require('cookie-parser');
const { celebrate, Joi, errors } = require('celebrate');
const { NotFoundError } = require('./errors/errors');

const { PORT = 3000, DB_URL = 'mongodb://127.0.0.1:27017/mestodb' } = process.env;

mongoose.connect(DB_URL, {
  useNewUrlParser: true,
});

const app = express();

app.use(helmet());
app.use(cookieParser());
app.use(express.static('public'));
app.use(express.json());

const { signupValidation, signinValidation } = require('./middlewares/validation');

app.post('/signin', signinValidation, login);

app.post('/signup', signupValidation, createUser);

app.use(auth);
app.use('/users', userRouter);
app.use('/cards', cardRouter);

app.use(errors());

app.use((req, res, next) => {
  next(new NotFoundError('Страница не найдена'));
});

const errorHandler = require('./middlewares/error-handler');
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
