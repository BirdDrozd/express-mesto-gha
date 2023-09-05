const mongoose = require('mongoose');
const cardSchema = require('../models/card');

const getCards = (req, res) => {
  cardSchema
    .find({})
    .then((response) => res.status(200).send(response))
    .catch((err) => {
      console.log(err.name);
      return res.status(500).send({ message: `Server error: ${err.name}` });
    });
};

const createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  return cardSchema
    .create({ name, link, owner })
    .then((response) => res.status(201).send(response))
    .catch((err) => {
      console.log(err.name);
      if (err instanceof mongoose.Error.ValidationError) {
        return res.status(400).send({ message: `Invalid data: ${err.name}` });
      }
      return res.status(500).send({ message: `Server error: ${err.name}` });
    });
};

const deleteCardById = (req, res) => {
  const { cardId } = req.params;
  return cardSchema.findByIdAndRemove(cardId)
    .orFail()
    .then((response) => res.status(200).send(response))
    .catch((err) => {
      console.log(err.name);
      if (err instanceof mongoose.Error.CastError) {
        return res.status(400).send({ message: `Invalid Id: ${cardId}` });
      }
      if (err instanceof mongoose.Error.DocumentNotFoundError) {
        return res.status(404).send({ message: `Card not found: ${cardId}` });
      }
      return res.status(500).send({ message: `Server error: ${err.name}` });
    });
};

const addLikes = (req, res) => {
  const { cardId } = req.params;
  cardSchema
    .findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    )
    .orFail()
    .then((response) => res.status(200).send(response))
    .catch((err) => {
      console.log(mongoose.Error);
      if (err instanceof mongoose.Error.CastError) {
        return res.status(400).send({ message: `Invalid Id: ${cardId}` });
      }
      if (err instanceof mongoose.Error.DocumentNotFoundError) {
        return res.status(404).send({ message: `Card not found: ${cardId}` });
      }
      return res.status(500).send({ message: `Server error: ${err.name}` });
    });
};
const deleteLikes = (req, res) => {
  const { cardId } = req.params;
  cardSchema
    .findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    )
    .orFail()
    .then((response) => res.status(200).send(response))
    .catch((err) => {
      console.log(mongoose.Error);
      if (err instanceof mongoose.Error.CastError) {
        return res.status(400).send({ message: `Invalid Id: ${cardId}` });
      }
      if (err instanceof mongoose.Error.DocumentNotFoundError) {
        return res.status(404).send({ message: `Card not found: ${cardId}` });
      }
      return res.status(500).send({ message: `Server error: ${err.name}` });
    });
};

module.exports = {
  getCards,
  createCard,
  addLikes,
  deleteLikes,
  deleteCardById,
};
