const { HTTP_STATUS_BAD_REQUEST } = require('http2').constants;
const cardModel = require('../models/card');
const mongoose = require('mongoose');

const {
  NotFoundError,
  NotAuthorizedError,
  ForbiddenError } = require('../errors/errors');

const getCards = (req, res) => cardModel.find({})
  .then((r) => res.status(200).send(r))
  .catch(err => next(err));

const createCard = (req, res, next) => {
  const { name, link, owner = req.user._id } = req.body;
  return cardModel.create({ name, link, owner })
    .then((r) => res.status(201).send(r))
    .catch(err => next(err));
};

const deleteCardById = async (req, res, next) => {
  try {
    const cardId = req.params.cardId;

    const card = await cardModel.findById(cardId);

    if (!card) {
      next(new NotFoundError("Карточка пользователя не найдена"));
      return
    }

    if (card.owner.toString() !== req.user._id) {
      next(new ForbiddenError("Вы не можете удалять чужую карточку"));
      return
    }

    await cardModel.findByIdAndDelete(cardId);
    return res.status(200).send(card);

  } catch {
    next(new Error("Ошибка при удалении карточки пользователя"));
  }
};

const addLikeById = (req, res, next) => {
  const { cardId } = req.params;
  return cardModel.findByIdAndUpdate(
    cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((r) => {
      if (r === null) {
        throw new NotFoundError("Карточка не найдена")
      }
      return res.status(200).send(r);
    })
    .catch(err => next(err));
};

const removeLikeById = (req, res, next) => {
  return cardModel.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((r) => {
      if (r === null) {
        throw new NotFoundError("Карточка не найдена")
      }
      return res.status(200).send(r);
    })
    .catch(err => next(err));
};

module.exports = {
  getCards,
  createCard,
  deleteCardById,
  addLikeById,
  removeLikeById,
};
