import express from 'express';
import { mandarDiario, buscarDiarios, buscarDiarioPorId } from '../controllers/diarioController.js';
import authenticate from '../middlewares/authenticate.js';

const router = express.Router();

// Todas as rotas do diário requerem autenticação
router.use(authenticate);

// POST /api/diario - Criar nova entrada no diário
router.post('/', mandarDiario);
router.get('/', buscarDiarios);
router.get('/:id', buscarDiarioPorId);

export default router;