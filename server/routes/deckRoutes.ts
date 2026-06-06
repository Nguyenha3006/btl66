import { Router } from 'express';
import { getDecks, getDeck, createDeck, updateDeck, deleteDeck, createCard, updateCard, deleteCard, reviewCard, importCards, importSharedDeck } from '../controllers/deckController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Apply auth protection to all routes in this router
router.use(authMiddleware);

// Deck CRUD
router.get('/', getDecks);
router.post('/import-shared', importSharedDeck);
router.get('/:id', getDeck);
router.post('/', createDeck);
router.put('/:id', updateDeck);
router.delete('/:id', deleteDeck);
router.post('/:id/import-cards', importCards);

// Card CRUD
router.post('/cards', createCard);
router.put('/cards/:id', updateCard);
router.delete('/cards/:id', deleteCard);

// SM-2 Spaced Repetition action
router.post('/cards/:id/review', reviewCard);

export default router;
