import express from 'express';
import { gerarRelatorio } from '../controllers/pdfController.js';

const router = express.Router();

// Rota para exportar PDF do paciente
router.get("/export/pdf/:id", gerarRelatorio);
export default router;