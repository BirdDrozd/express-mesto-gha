const { HTTP_STATUS_BAD_REQUEST } = require('http2').constants;
const userModel = require('../models/user');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ConflictError,
        NotFoundError,
        NotAuthorizedError } = require('../errors/errors');

const SALT_ROUNDS = 10;
const JWT_SECRET = 'supersecretstring';

const getUsers = (req, res, next) => userModel.find({})
  .then((result) => res.status(200).send(result))
  .catch(err => next(err));

const createUser = (req, res, next) => {
  const { email, password, name, about, avatar } = req.body;

  bcrypt.hash(password, SALT_ROUNDS, function(err, hash) {
    const userData = { email, password: hash, name, about, avatar };

    return userModel.create(userData)
      .then((r) => {
        const { password, ...userWithoutPassword } = r.toObject();
        res.status(201).send(userWithoutPassword);
      })
      .catch((err) => {
        if (err.code == 11000) {
          next(new ConflictError('Пользователь с таким email уже существует'));
          return;
        }
        next(err);
      });
  });
};

const getUserById = (req, res, next) => {
  const { userId } = req.params;
  return userModel.findById(userId)
    .then((r) => {
      if (r === null) {
        throw new NotFoundError('Пользователь не найден');
      }
      return res.status(200).send(r);
    })
    .catch(err => next(err));
};

const updateUserById = (req, res, next) => {
  const { name, about } = req.body;
  return userModel.findByIdAndUpdate(req.user._id, { 'name': name, 'about': about }, { new: true, runValidators: true })
    .then((r) => {
      if (r === null) {
        throw new NotFoundError('Пользователь не найден');
      }
      return res.status(200).send(req.body);
    })
    .catch(err => next(err));
};

const updateAvatarById = (req, res, next) => {
  const userId = req.user._id;
  const { avatar } = req.body;
  return userModel.findByIdAndUpdate(userId, { 'avatar': avatar }, {new: true, runValidators: true})
    .then((r) => {
      if (r === null) {
        throw new NotFoundError('Пользователь не найден');
      }
      return res.status(200).send(req.body);
    })
    .catch(err => next(err));
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  return userModel.findOne({ email }).select('+password').then((user) => {
    if (!user) {
      next(new NotAuthorizedError('Такого пользователя не существует'));
      return;
    }
    bcrypt.compare(password, user.password, function(err, isValid) {
      if (!isValid) {
        next(new NotAuthorizedError('Пароль неверный'));
        return;
      }

      const token = jwt.sign({
        _id: user._id
      }, JWT_SECRET, { expiresIn: '1w' });

      res.cookie('token', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true
      });

      return res.status(200).send({ message: "Вы авторизованы" })
    });
  }).catch(err => next(err));
}

const getCurrentUser = (req, res, next) => {
  const userId = req.user._id;
  console.log(userId)
  return userModel.findById(userId)
    .then((result) => {
      if (result === null) {
        throw new NotFoundError('Пользователь не найден');
      }
      return res.status(200).send(result);
    })
    .catch(err => next(err));
}

module.exports = {
  getUsers,
  createUser,
  getUserById,
  updateUserById,
  updateAvatarById,
  login,
  getCurrentUser,
};
