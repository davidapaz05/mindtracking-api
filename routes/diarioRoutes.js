import express from 'express';
import { criarEntrada, buscarEntradas } from '../controllers/diarioController.js';
import authenticate from '../middlewares/authenticate.js';

const router = express.Router();

// Todas as rotas do diário requerem autenticação
router.use(authenticate);

// POST /api/diario - Criar nova entrada no diário
router.post('/', criarEntrada);
router.get('/', buscarEntradas);

export default router; 