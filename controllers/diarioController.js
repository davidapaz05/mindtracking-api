import banco from '../config/database.js';
import { analisarTextoComAthena } from './chatController.js';

// Criar uma nova entrada no diário
export async function criarEntrada(req, res) {
    const { texto } = req.body;
    const usuario_id = req.user.id; // Obtido do middleware de autenticação

    if (!texto) {
        return res.status(400).json({
            success: false,
            message: 'O campo texto é obrigatório'
        });
    }

    try {
        // Criar a entrada com campos vazios
        const novaEntrada = await banco.query(
            `INSERT INTO diario (usuario_id, texto, emocao_predominante, intensidade_emocional, comentario_athena) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING id, usuario_id, data_hora, texto, emocao_predominante, intensidade_emocional, comentario_athena`,
            [usuario_id, texto, null, null, null]
        );

        // Analisar o texto com a Athena e aguardar a conclusão
        const analise = await analisarTextoComAthena(texto);
        
        // Atualizar a entrada com a análise da Athena
        const entradaAtualizada = await banco.query(
            `UPDATE diario 
             SET emocao_predominante = $1, intensidade_emocional = $2, comentario_athena = $3
             WHERE id = $4
             RETURNING id, usuario_id, data_hora, texto, emocao_predominante, intensidade_emocional, comentario_athena`,
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
export async function buscarEntradas(req, res) {
    const usuario_id = req.user.id;

    try {
        // Buscar todas as entradas
        const entradas = await banco.query(
            `SELECT data_hora, texto, emocao_predominante, intensidade_emocional, comentario_athena
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

