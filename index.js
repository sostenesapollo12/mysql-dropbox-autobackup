var mysqldump = require('mysqldump')
var moment = require('moment')
var fs = require('fs');
var path = require('path')
var {
    execSync
} = require('child_process');
var dropboxactions = require("./dropboxActions")
let key = ''

//*                 3.600.000 -  1 hora
//*                   2000    - 20 segs

let thisfoldername = 'default'
let tempodeespera = 3600000

dbconfig = fs.readFileSync('./dbconfig.txt')
dbconfig = dbconfig.toString().split('\n')

let params = {}
if (dbconfig && dbconfig[0] && dbconfig[1] && dbconfig[2] && dbconfig[3]) {
    params['host'] = dbconfig[0].replace("\r", '')
    params['user'] = dbconfig[1].replace("\r", '')
    params['password'] = dbconfig[2].replace("\r", '')
    params['database'] = dbconfig[3].replace("\r", '')
    thisfoldername = dbconfig[3]
} else {
    fs.writeFileSync('./error-log.txt', `No db params insert into dbconfig.txt`);
    let stdout = execSync('start notepad error-log.txt');
    fs.unlinkSync('./error-log.txt')
}


//! Dropbox credentials
apikey = './apikey.txt'
if (fs.existsSync(apikey)) {
    key = fs.readFileSync(apikey).toString()
    // todo -> Se tiver a API KEY continua...    
    main()
} else {
    fs.writeFileSync('./error-log.txt', `No dropbox credentials \n\nCreate ${apikey} file and insert your api key.`);
    let stdout = execSync('start notepad error-log.txt');
    fs.unlinkSync('./error-log.txt')
}

async function main() {
    let date = moment().format('MMMM-D-YYYY....h.mm.ss....A')
    let filename = `${date}.sql.gz`
    let dir = './out/'
    try {
        console.log('Realizando dump.');
        await mysqldump({
            connection: params,
            dumpToFile: dir + filename,
            compressFile: true,
        });
        console.log('Dump realizado com sucesso.');
        if (key) {
            dp = new dropboxactions(key, thisfoldername)
            console.log(`Salvando ${filename} no dropbox`);
            dp.save(dir, filename, fs.readFileSync(dir + filename)).then(s => {
                console.log(`${filename} salvo no dropbox`);
                console.log(`Aguardando por ${tempodeespera} ms.`);
                setaTimer()
            }).catch(err => console.log('error'))
        }
    } catch (error) {
        fs.writeFileSync('./error-log.txt', `Erro ao realizar dump do db, verifique a conexão com o banco de dados.`);
        let stdout = execSync('start notepad error-log.txt');
        fs.unlinkSync('./error-log.txt')
    }
}


function setaTimer() {
    setTimeout(() => {
        main()
    }, tempodeespera)
}