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
//*                   2000    - 2 segs
//*                   20000   - 20 segs

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
    logerror(`❌ project does't have all params in dbconfig.txt file`)
}


//! Dropbox credentials
apikey = './apikey.txt'
if (fs.existsSync(apikey)) {
    key = fs.readFileSync(apikey).toString()
    logerror(`✔️ Api key ok ! ${apikey}`);
    main()
} else {
    logerror(`❌ No dropbox credentials \n\nCreate ${apikey} file and insert your api key.`);
}

async function main() {
    let date = moment().format('MMMM-D-YYYY....h.mm.ss....A')
    let filename = `${date}.sql.gz`
    let dir = './out/'
    try {
        logerror('✔️ Realizando dump.');
        await mysqldump({
            connection: params,
            dumpToFile: dir + filename,
            compressFile: true,
        });
        logerror('✔️ Dump realizado com sucesso.');
        if (key) {
            dp = new dropboxactions(key, thisfoldername)
            logerror(`✔️ Salvando ${filename} no dropbox`);
            dp.save(dir, filename, fs.readFileSync(dir + filename)).then(s => {
                logerror(`✔️ ${filename} salvo no dropbox`)
                logerror(`✔️ Aguardando por ${tempodeespera} ms.`);
                setaTimer()
            }).catch(err => console.log('error'))
        }
    } catch (error) {
        logerror(`❌ Erro ao realizar dump do db, verifique a conexão com o banco de dados.` + err);
    }
}


function setaTimer() {
    setTimeout(() => {
        main()
    }, tempodeespera)
}

function logerror(message) {
    if (fs.existsSync('log.txt')) {
        if (!message) {
            message = ''
        }
        fs.appendFileSync('log.txt', '\n' + moment().format('MMMM-D-YYYY  h:mm:ss A') + '..............................' + message)
        console.log('Append to file');
    } else {
        console.log('Write file');
        logerror(message)
    }
}