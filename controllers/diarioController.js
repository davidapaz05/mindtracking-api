import banco from '../config/database.js';
import { analisarTextoComAthena } from './chatController.js';

// Criar uma nova entrada no diário
export async function mandarDiario(req, res) {
    const { texto, titulo } = req.body;
    const usuario_id = req.user.id;

    if (!texto || typeof texto !== 'string' || texto.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'O campo texto é obrigatório e não pode estar vazio'
        });
    }

    if (!titulo || typeof titulo !== 'string' || titulo.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'O campo título é obrigatório e não pode estar vazio'
        });
    }

    try {
        // 1️⃣ Verificar se já existe diário na data atual para este usuário
        const diarioExistente = await banco.query(
            `SELECT id 
             FROM diario 
             WHERE usuario_id = $1
             AND DATE(data_hora) = CURRENT_DATE`,
            [usuario_id]
        );

        if (diarioExistente.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Já existe um diário registrado para a data de hoje.'
            });
        }

        // 2️⃣ Criar entrada
        const novaEntrada = await banco.query(
            `INSERT INTO diario (usuario_id, titulo, texto, emocao_predominante, intensidade_emocional, comentario_athena) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING id, usuario_id, data_hora, titulo, texto, emocao_predominante, intensidade_emocional, comentario_athena`,
            [usuario_id, titulo, texto, null, null, null]
        );

        // 3️⃣ Analisar o texto
        const analise = await analisarTextoComAthena(texto);

        // 4️⃣ Atualizar com análise
        const entradaAtualizada = await banco.query(
            `UPDATE diario 
             SET emocao_predominante = $1, intensidade_emocional = $2, comentario_athena = $3
             WHERE id = $4
             RETURNING id, usuario_id, data_hora, titulo, texto, emocao_predominante, intensidade_emocional, comentario_athena`,
            [analise.emocao_predominante, analise.intensidade_emocional, analise.comentario_athena, novaEntrada.rows[0].id]
        );

        console.log(`Análise da Athena concluída para entrada ${novaEntrada.rows[0].id}`);

        return res.status(201).json({
            success: true,
            message: 'Entrada do diário criada com sucesso e análise da Athena concluída.',
            entrada: entradaAtualizada.rows[0]
        });

    } catch (error) {
        console.error('Erro ao criar entrada no diário:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao criar entrada no diário',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}
// Buscar todas as entradas do diário do usuário
export async function buscarDiarios(req, res) {
    const usuario_id = req.user.id;

    try {
        // Buscar todas as entradas
        const entradas = await banco.query(
            `SELECT data_hora, titulo, texto, emocao_predominante, intensidade_emocional, comentario_athena
             FROM diario 
             WHERE usuario_id = $1 
             ORDER BY data_hora DESC`,
            [usuario_id]
        );

        return res.status(200).json({
            success: true,
            message: 'Entradas do diário recuperadas com sucesso',
            entradas: entradas.rows
        });

    } catch (error) {
        console.error('Erro ao buscar entradas do diário:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao buscar entradas do diário',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

