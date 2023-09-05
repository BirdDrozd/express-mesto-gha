const mongoose = require('mongoose');
const userSchema = require('../models/user');

const getUsers = (req, res) => {
  userSchema.find({})
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((err) => {
      console.log(err.name);
      return res.status(500).send({ message: `Внутренняя ошибка сервера: ${err.name}` });
    });
};

const getUserById = (req, res) => {
  const { userId } = req.params;
  return userSchema.findById(userId)
    .orFail()
    .then((response) => res.status(200).send(response)).catch((err) => {
      console.log(err.name);
      if (err instanceof mongoose.Error.CastError) {
        return res.status(400).send({ message: `Несуществующий id: ${userId}` });
      }
      if (err instanceof mongoose.Error.DocumentNotFoundError) {
        return res.status(404).send({ message: `Пользователя с таким id нет: ${userId}` });
      }
      return res.status(500).send({ message: `Внутренняя ошибка сервера: ${err.name}` });
    });
};

const postUser = (req, res) => {
  const { name, about, avatar } = req.body;
  return userSchema.create({ name, about, avatar })
    .then((response) => { res.status(201).send(response); })
    .catch((err) => {
      console.log(err.name);
      if (err instanceof mongoose.Error.ValidationError) {
        return res.status(400).send({ message: `Неправильные исходные данные: ${err.name}` });
      }
      return res.status(500).send({ message: `Внутренняя ошибка сервера: ${err.name}` });
    });
};

const updateUser = (req, res) => {
  const { name, about } = req.body;
  return userSchema
    .findByIdAndUpdate(
      req.user._id,
      { name, about },
      { new: true, runValidators: true },
    )
    .then((response) => res.status(200).send(response))
    .catch((err) => {
      console.log(err.name);
      if (err instanceof mongoose.Error.ValidationError) {
        return res.status(400).send({ message: `Некорректные данные: ${err.name}` });
      }
      return res.status(500).send({ message: `Внутренняя ошибка сервера: ${err.name}` });
    });
};

const updateAvatar = (req, res) => {
  const { avatar } = req.body;
  userSchema
    .findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true, runValidators: true },
    )
    .then((response) => { res.status(200).send(response); })
    .catch((err) => {
      console.log(err.name);
      if (err instanceof mongoose.Error.ValidationError) {
        return res.status(400).send({ message: `Некорректные данные: ${err.name}` });
      }
      return res.status(500).send({ message: `Внутренняя ошибка сервера: ${err.name}` });
    });
};

module.exports = {
  getUsers,
  getUserById,
  postUser,
  updateUser,
  updateAvatar,
};
