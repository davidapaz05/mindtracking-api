// Importa o pacote express para criar rotas
import express from 'express';
// Importa a função chatHandler do controlador de chat
import { chatHandler, gerarDicaDiagnostico, contarDiagnosticos } from '../controllers/chatController.js';
import authenticate from '../middlewares/authenticate.js';


// Cria uma instância do roteador do Express
const router = express.Router();

// Define a rota para lidar com requisições de chat, chamando a função chatHandler
router.post('/chat', authenticate, chatHandler);
router.get('/dica', authenticate, gerarDicaDiagnostico);
// Retorna a contagem total de diagnósticos registrados
router.get('/diagnosticos', authenticate, contarDiagnosticos);

export default router;// Exporta o roteador para ser usado em outros arquivos