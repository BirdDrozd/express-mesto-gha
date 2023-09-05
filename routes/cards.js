const cardRoutes = require('express').Router();

const {
  getCards,
  createCard,
  deleteCardById,
  addLikes,
  deleteLikes,
} = require('../controllers/cards');

cardRoutes.get('/', getCards);
cardRoutes.post('/', createCard);
cardRoutes.delete('/:cardId', deleteCardById);
cardRoutes.put('/:cardId/likes', addLikes);
cardRoutes.delete('/:cardId/likes', deleteLikes);

module.exports = cardRoutes;
