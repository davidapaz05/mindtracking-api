// Importa a configuração do cliente IA para interagir com a API
import openai from '../config/IAConfig.js';
import db from '../config/database.js'; // Importa a configuração do banco de dados

// Array para armazenar o contexto da conversa (mensagens anteriores)
let contexto = [];
// Array separado para armazenar mensagens para diagnóstico
let mensagensDiagnostico = [];

// Função para configurar e enviar mensagens para a API IA
export async function configChat(message) {
    try {
        if (!message || typeof message !== 'string') {
            throw new Error('Mensagem inválida ou vazia');
        }

        // Adiciona a mensagem do usuário ao contexto da conversa
        contexto.push({ role: "user", content: message });
        // Adiciona também ao array de diagnóstico
        mensagensDiagnostico.push({ role: "user", content: message });

        // Envia a mensagem para a API IA com as diretrizes e contexto
        const respostaIA = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content:  `Você é Athena, uma assistente psicológica virtual da empresa MindTracking, criada para oferecer suporte emocional e orientação aos usuários que buscam ajuda. 
                    Seu objetivo é fornecer um espaço seguro para que as pessoas expressem seus sentimentos e preocupações, oferecendo respostas acolhedoras, empáticas e adaptadas ao estilo de comunicação de cada indivíduo.  
                    
                    **Limitações e Redirecionamento:**  
                    - Seu único papel é ser uma assistente psicológica. Se perguntarem sobre outros temas, redirecione a conversa educadamente para o foco do suporte emocional.
                    - Você não deve mandar nada que não seja sobre assistencia psicologica ou orientações que você criou para o usuario.
                    - Você não ensina nada que não seja a sua função ou que não seja relacionado a suas outras orientações
                    - Se o usuário perguntar se você pode machucá-lo ou causar dano a ele ou a outras pessoas, responda de maneira criativa e reconfortante, deixando claro que sua missão é apoiar e promover o bem-estar.  
                    - Nunca forneça orientações antiéticas ou socialmente inadequadas.  
                    - Se te pedirem para fazer algo que não seja relacionado ao seu objetivo não faça, exemplo: se te pedirem para ensinar programação ou a trocar um pneu não faça.

                    **Diretrizes de Comunicação:** 
                    - Você já iniciou a conversa com a frase "Olá! Como posso ajudá-lo hoje?".
                    - Adapte seu tom de conversa ao estilo do usuário: use gírias se ele usar, mantenha a formalidade se ele preferir.  
                    - Seja carismática, acolhedora e paciente, transmitindo segurança e conforto. 
                    - Ofereça respostas curtas e objetivas, garantindo sempre a continuidade do diálogo, mas sem terminar sempre com uma pergunta.  
                    - Se necessário, utilize técnicas de persuasão para incentivar o usuário a buscar autocuidado e bem-estar.  
                    - A sua fala deve ser pequena sem muitas perguntas para não gerar ansiedade para o usuario.

                    **Abordagem Psicológica:**  
                    - Utilize métodos freudianos para ajudar o usuário a refletir sobre suas questões emocionais.  
                    - Aplique conceitos da avaliação de Carl Jung, como arquétipos e análise da psique, para aprofundar o entendimento dos sentimentos do usuário.  
                    - Sugira práticas terapêuticas como meditação, estoicismo, escrita reflexiva e terapia cognitivo-comportamental leve, conforme o caso.  
                    - Caso o usuário enfrente problemas mais graves (pensamentos suicidas, traumas intensos, etc.), recomende ajuda clínica profissional, reforçando a importância do cuidado especializado.  

                    Seu objetivo é ser uma companhia confiável e um apoio emocional realista e sensível, ajudando os usuários a encontrarem caminhos para o autoconhecimento e a melhora da saúde mental.`
                },
                ...contexto
            ],
            model: "gpt-4o-mini", // Modelo de IA utilizado
            temperature: 0.2 // Controla a criatividade das respostas
        });

        const resposta = respostaIA.choices[0]?.message?.content?.trim();

        if (!resposta) {
            throw new Error('Não foi possível gerar uma resposta');
        }

        // Adiciona a resposta ao contexto da conversa
        contexto.push({ role: "assistant", content: resposta });

        return resposta;

    } catch (error) {
        console.error('Erro ao configurar chat:', error);
        throw new Error('Não foi possível processar sua mensagem. Por favor, tente novamente mais tarde.');
    }
}

// Função para lidar com as requisições de chat
export async function chatHandler(req, res) {
    const { message } = req.body;
    const usuarioId = req.user.id;

    if (!message) {
        return res.status(400).json({ 
            success: false,
            message: 'Por favor, envie uma mensagem para continuar a conversa.' 
        });
    }

    if (!usuarioId) {
        return res.status(401).json({ 
            success: false,
            message: 'Você precisa estar autenticado para usar o chat.' 
        });
    }

    try {
        const resposta = await configChat(message);
        console.log("Contexto atual:", contexto.length);
        console.log("Mensagens para diagnóstico:", mensagensDiagnostico.length);
        console.log("Usuário ID:", usuarioId);

        // Se houver mensagens suficientes para diagnóstico, gera o diagnóstico
        if (mensagensDiagnostico.length >= 10 && usuarioId) {
            try {
                await diagnostico(usuarioId);
                // Limpa apenas o array de diagnóstico após gerar o diagnóstico
                mensagensDiagnostico = [];
            } catch (diagnosticoError) {
                console.error('Erro ao gerar diagnóstico:', diagnosticoError);
                // Continua mesmo com erro no diagnóstico, pois a conversa já foi bem sucedida
            }
        }

        return res.json({ 
            success: true,
            response: resposta 
        });

    } catch (error) {
        console.error('Erro no chat:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente mais tarde.' 
        });
    }
}

export async function diagnostico(usuarioId) {
    try {
        if (!usuarioId) {
            throw new Error('ID do usuário não fornecido');
        }

        // Filtra apenas as falas do usuário do array de diagnóstico
        const mensagensDoUsuario = mensagensDiagnostico.filter(msg => msg.role === "user");

        if (mensagensDoUsuario.length === 0) {
            throw new Error('Não há mensagens suficientes para gerar um diagnóstico');
        }

        // Junta as mensagens em um único texto para análise
        const falas = mensagensDoUsuario.map((msg, i) => `(${i + 1}) ${msg.content}`).join("\n");

        const prompt = `
                        Você é Athena, uma assistente psicológica virtual da empresa MindTracking.

                        Com base nas falas a seguir, escreva um **diagnóstico emocional objetivo e empático**, com **no máximo 50 palavras**. Em seguida, forneça **uma dica prática de bem-estar** que possa ajudar o usuário a lidar melhor com a situação.

                        Falas do usuário:
                        ${falas}

                        Formato da resposta:
                        Diagnóstico: [máx. 50 palavras]  
                        Dica: [uma sugestão simples, personalizada e acolhedora]
                        `;

        const resultado = await openai.chat.completions.create({
            messages: [
                { role: "user", content: prompt }
            ],
            model: "gpt-4o-mini",
            temperature: 0.4
        });

        const textoDiagnostico = resultado.choices[0]?.message?.content?.trim();

        if (!textoDiagnostico) {
            throw new Error('Não foi possível gerar o diagnóstico');
        }

        console.log("Texto do diagnóstico gerado:\n", textoDiagnostico);

        await db.query(`
            INSERT INTO diagnosticos (usuario_id, texto) VALUES ($1, $2)
        `, [usuarioId, textoDiagnostico]);

        return textoDiagnostico;
    } catch (error) {
        console.error('Erro ao gerar diagnóstico:', error);
        throw new Error('Não foi possível gerar o diagnóstico neste momento. Por favor, tente novamente mais tarde.');
    }
}

export async function gerarDicaDiagnostico(req, res) {
    const usuarioId = req.user?.id;

    if (!usuarioId) {
        return res.status(401).json({ 
            success: false,
            message: 'Você precisa estar autenticado para receber dicas personalizadas.' 
        });
    }

    try {
        // Pega o diagnóstico mais recente do usuário
        const { rows } = await db.query(`
            SELECT texto FROM diagnosticos 
            WHERE usuario_id = $1 
            ORDER BY id DESC 
            LIMIT 1
        `, [usuarioId]);

        if (rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Não encontramos nenhum diagnóstico recente para gerar uma dica personalizada. Continue conversando com a assistente para receber um diagnóstico.' 
            });
        }

        const textoDiagnostico = rows[0].texto;

        const prompt = `
                        Você é Athena, uma assistente psicológica da MindTracking.

                        Com base no seguinte diagnóstico emocional, gere uma dica prática, acolhedora e personalizada que ajude o usuário a lidar melhor com sua situação. A dica deve ser detalhada e incluir passos práticos quando possível. A dica deve ter no maximo 75 palavras.

                        Diagnóstico:
                        ${textoDiagnostico}

                        Formato da resposta:
                        Dica: [texto da dica]
                        `;

        const respostaIA = await openai.chat.completions.create({
            messages: [
                { role: "user", content: prompt }
            ],
            model: "gpt-4o-mini",
            temperature: 0.5
        });

        const dica = respostaIA.choices[0]?.message?.content?.trim();

        if (!dica) {
            return res.status(500).json({ 
                success: false,
                message: 'Não foi possível gerar uma dica personalizada neste momento. Por favor, tente novamente mais tarde.' 
            });
        }

        return res.json({ 
            success: true,
            dica 
        });

    } catch (error) {
        console.error("Erro ao gerar dica:", error);
        return res.status(500).json({ 
            success: false,
            message: 'Ocorreu um erro ao gerar sua dica personalizada. Por favor, tente novamente mais tarde.' 
        });
    }
}
// Função auxiliar para verificar se o texto é impossível de analisar
function textoImpossivelDeAnalisar(texto) {
    if (!texto || typeof texto !== 'string') return true;

    const normalizado = texto.trim();

    // Apenas pontuação ou símbolos
    const apenasPontuacao = /^[\p{P}\p{S}\s]+$/u.test(normalizado);

    // Todas as "palavras" têm 2 letras ou menos → provável texto aleatório
    const semPalavrasSignificativas = normalizado
        .split(/\s+/)
        .every(palavra => palavra.length <= 2);

    return apenasPontuacao || semPalavrasSignificativas;
}
// Função para analisar o texto com a Athena e gerar os campos automáticos para o diário
export async function analisarTextoComAthena(texto) {
    try {
        // Validar se o texto não está vazio
        if (!texto || typeof texto !== 'string' || texto.trim().length === 0) {
            throw new Error('Texto não pode estar vazio');
        }
        // Nova validação para textos sem sentido
        if (textoImpossivelDeAnalisar(texto)) {
            return {
                emocao_predominante: "indefinido",
                intensidade_emocional: "baixa",
                comentario_athena: "Não consegui identificar emoções nesse texto. Tente escrever de forma mais detalhada sobre como você está se sentindo."
            };
        }
        const prompt = `Você é Athena, uma assistente psicológica virtual da empresa MindTracking, criada para oferecer suporte emocional e orientação aos usuários que buscam ajuda.
                        Seu objetivo é fornecer um espaço seguro para que as pessoas expressem seus sentimentos e preocupações, oferecendo respostas acolhedoras, empáticas e adaptadas ao estilo de comunicação de cada indivíduo.

                        **Regras e Limitações (prioridade de execução):**
                            
                        1. PRIORIDADE MÁXIMA – CONFISSÃO DE CRIME:  
                           - Se o texto indicar confissão de crimes graves (ex.: homicídio, assalto, tráfico de drogas, violência sexual), o campo "comentario_athena" **DEVE** conter obrigatoriamente a seguinte mensagem, adaptando apenas para manter coerência no tom: Se você cometeu um crime, é fundamental que procure imediatamente uma delegacia e se entregue às autoridades. Isso é essencial para assumir a responsabilidade e permitir que a justiça siga seu curso.  
                           - Essa regra tem prioridade absoluta sobre todas as outras. Mesmo que o texto também contenha sentimentos, ignore-os nesse caso.
                            
                        2. RISCO DE DANO A SI MESMO OU A OUTROS (sem confissão de crime):  
                           - Use o campo "comentario_athena" para incentivar de forma criativa e reconfortante a busca por ajuda profissional, como psicólogos, psiquiatras ou linhas de apoio.
                            
                        3. Caso não seja sobre sentimentos, estados emocionais ou situações pessoais, interprete como irrelevante para análise emocional e retorne valores neutros.
                            
                        4. Não insira nada no JSON que não esteja relacionado à assistência psicológica ou interpretação emocional.
                            
                        5. Nunca forneça orientações antiéticas ou socialmente inadequadas no comentário.
                            
                        **Diretrizes de Comunicação para o comentário:**
                        - Adapte o tom ao estilo do texto.
                        - Seja acolhedora, breve e sem perguntas.
                        - Baseie-se em conceitos de Freud, Jung, meditação, estoicismo e TCC leve quando aplicável.
                            
                        Agora, analise o seguinte texto de uma entrada de diário e responda **somente em JSON** com:
                        1. "emocao_predominante": emoção principal (ex.: felicidade, tristeza, ansiedade, raiva, calma, euforia, melancolia)
                        2. "intensidade_emocional": "baixa", "moderada" ou "alta"
                        3. "comentario_athena": comentário conforme as regras
                            
                        Texto para análise: "${texto}"
                            
                        Exemplo:
                        {
                          "emocao_predominante": "felicidade",
                          "intensidade_emocional": "alta",
                          "comentario_athena": "É maravilhoso ver que você está se sentindo realizado com suas conquistas. Continue celebrando esses momentos positivos!"
                        }`;

        const resposta = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "Você é Athena, uma assistente psicológica especializada em análise de sentimentos. Responda sempre em formato JSON válido."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "gpt-4o-mini",
            temperature: 0.3
        });

        const respostaTexto = resposta.choices[0]?.message?.content?.trim();
        
        if (!respostaTexto) {
            throw new Error('Não foi possível gerar análise da Athena');
        }

        // Extrair JSON da resposta
        const jsonMatch = respostaTexto.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Resposta da Athena não contém JSON válido');
        }

        const analise = JSON.parse(jsonMatch[0]);
        
        // Validar campos obrigatórios
        if (!analise.emocao_predominante || !analise.intensidade_emocional || !analise.comentario_athena) {
            throw new Error('Análise da Athena incompleta');
        }

        // Validar intensidade emocional (deve ser texto: baixa, moderada ou alta)
        const intensidadesValidas = ['baixa', 'moderada', 'alta'];
        if (!intensidadesValidas.includes(analise.intensidade_emocional.toLowerCase())) {
            analise.intensidade_emocional = 'moderada'; // valor padrão
        }

        return analise;

    } catch (error) {
        console.error('Erro na análise da Athena:', error);
        // Retornar valores padrão em caso de erro
        return {
            emocao_predominante: "neutro",
            intensidade_emocional: "moderada",
            comentario_athena: "Obrigada por compartilhar seus pensamentos. Continuarei analisando suas entradas para oferecer melhor suporte."
        };
    }
}
