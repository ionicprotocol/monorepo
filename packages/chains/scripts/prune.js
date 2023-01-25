const fs = require('fs');
console.log('./scripts/prune.js - pruning JSON files to reduce bundle size')
const filePaths = process.argv.slice(2)
filePaths.forEach(fp=>{
    const file = fs.readFileSync(fp);
    const obj = JSON.parse(file);

    prune(obj,[/abi/,/ArrakisERC4626.*/,/Beefy.*/]);

    fs.writeFileSync(fp, JSON.stringify(obj,0,2))

})

function prune(data,keysToDelete){
    if (typeof data === 'object'){
        for (const key in data){
            if(keysToDelete.some(k=>k instanceof RegExp ? k.test(key) : k === key)){
                delete data[key]
            }else{
                prune(data[key],keysToDelete)
            }
        }
    }
}

