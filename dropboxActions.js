var fetch = require('isomorphic-fetch'); // or another library of choice.
var Dropbox = require('dropbox').Dropbox;
var request = require('request')
var fs = require('fs')

module.exports =
    class DropboxActions {
        thisfoldername
        app
        apikey
        dbx
        constructor(apikey, thisfoldername) {
            this.thisfoldername = thisfoldername
            this.apikey = apikey
            this.dbx = new Dropbox({
                accessToken: apikey,
                fetch: fetch
            });
        }
        // listFiles(path) {
        //     console.log('list', path);
        //     return new Promise((resolve, reject) => {
        //         this.dbx.filesListFolder({
        //             path: path
        //         }).then(r => resolve(r)).catch(e => reject(e));
        //     })
        // }
        save(dir, filename, file) {
            return new Promise((resolve, reject) => {
                var content = fs.readFileSync(dir + filename);
                // console.log(filename);
                // console.log(content.toString();                
                let options = {
                    method: "POST",
                    url: 'https://content.dropboxapi.com/2/files/upload',
                    headers: {
                        "Content-Type": "application/octet-stream",
                        "Authorization": "Bearer " + this.apikey,
                        "Dropbox-API-Arg": "{\"path\": \"/backupapi/" + this.thisfoldername + "/" + filename + "\",\"mode\": \"overwrite\",\"autorename\": true,\"mute\": false}"
                        //   "Dropbox-API-Arg": "{\"path\": \"/Sale2__Databases/"+userCode+"/"+file+"\",\"mode\": \"overwrite\",\"autorename\": true,\"mute\": false}"
                    },
                    body: content
                };

                request(options, function (err, res, body) {
                    if (err) {
                        reject(err)
                        console.log('Erro ao salvar', err);
                    } else {
                        resolve(res)
                    }
                })
            })
        }
    }

// function readFile(file) {
// 	var options = {
// 	  method: "POST",
// 	  url: 'https://content.dropboxapi.com/2/files/download',
// 	  headers: {        
// 	    "Authorization": "Bearer " + key,
// 	    'Dropbox-API-Arg': '{"path":"'+file+'"}'
// 	  }  
// 	}
// 	return new Promise((resolve, reject)=>{		
// 		request(options,function(err, res,body){
// 		  if(err) {
// 		    reject(err)
// 		  } else {
// 		    resolve(body)
// 		  }      
// 		})   
// 	})
// }	