const fs = require('fs');
const path = require('path');

// Caminhos baseados no projeto
const imagesDir = path.join(__dirname, 'webxoss-core', 'webxoss-client', 'images');
const cardInfoPath = path.join(__dirname, 'webxoss-core', 'webxoss-client', 'lang', 'CardInfo_en.json');

function renameCards() {
    console.log('Iniciando processo de renomeação...');

    // 1. Ler o arquivo de informações das cartas
    if (!fs.existsSync(cardInfoPath)) {
        console.error('Arquivo de metadados não encontrado em:', cardInfoPath);
        return;
    }

    const cardInfo = JSON.parse(fs.readFileSync(cardInfoPath, 'utf8'));
    
    // 2. Mapear WXID -> PID
    const wxidToPid = {};
    for (const pid in cardInfo) {
        const card = cardInfo[pid];
        if (card.wxid) {
            wxidToPid[card.wxid.toLowerCase()] = card.pid;
        }
    }

    // 3. Listar arquivos na pasta de imagens
    if (!fs.existsSync(imagesDir)) {
        console.error('Pasta de imagens não encontrada em:', imagesDir);
        return;
    }

    const files = fs.readdirSync(imagesDir);
    let count = 0;

    files.forEach(file => {
        // Obter nome sem extensão e converter para minúsculas
        const ext = path.extname(file);
        const nameWithoutExt = path.basename(file, ext).toLowerCase();

        // Verificar se o nome corresponde a um WXID
        if (wxidToPid[nameWithoutExt]) {
            const pid = wxidToPid[nameWithoutExt];
            const newName = ('0000' + pid).slice(-4) + ext;
            const oldPath = path.join(imagesDir, file);
            const newPath = path.join(imagesDir, newName);

            if (fs.existsSync(newPath)) {
                console.warn(`Aviso: O arquivo de destino ${newName} já existe. Pulando ${file}.`);
            } else {
                fs.renameSync(oldPath, newPath);
                console.log(`Renomeado: ${file} -> ${newName}`);
                count++;
            }
        }
    });

    console.log(`Processo concluído! Total de arquivos renomeados: ${count}`);
}

renameCards();
