var express = require('express');
var cors = require('cors');
var app = express();
var path = require(path);
var router = express.Router();
const axios = require('axios');
import distloc from 'distloc'


app.use(cors());

app.get('*', function(req,res){
    res.sendFile(path.resolve(__dirname, distloc))
})

app.listen('8080', () => {
    console.log('server listening on 8080...');
});

router.route('/ironmanbtw/getIronMan/:name')
.all((req, res, next) =>{
    next();
})
.get((req,res,next) => {
    //Log to output
    console.log('Checking if player: ' +  req.params.name + ' is an Iron Man...');

    //create our response json
    var respJson = {
        name: req.params.name,
        playerFound: false,
        ironMan: {
            isIronMan: false,
            isHardCoreIronMan: false,
            isUltimateIronMan: false
        },
        xp: {
            normal: 0,
            ironMan: 0,
            ultimateIronMan: 0,
            hardCoreIronMan: 0
        }
    }
    
    //Make a request to the NORMAL HISCORES first. If their name doesn't exist here, they dont exist.
    axios.get('https://secure.runescape.com/m=hiscore_oldschool/index_lite.ws?player='+req.params.name)
    .then((resp) => {
        respJson.xp.normal = resp.data.split('\n')[0].split(',')[2];
        respJson.playerFound = true;

        // Now we have to make a call to see if they are an IronMan

        //Make a request to NORMAL IRON MAN hiscores. If their name doesn't exist here, then they're a NORMIE
        axios.get('https://secure.runescape.com/m=hiscore_oldschool_ironman/index_lite.ws?player='+req.params.name)
        .then((resp) => {
            respJson.xp.ironMan = resp.data.split('\n')[0].split(',')[2];
            if (respJson.xp.ironMan === respJson.xp.normal){
                respJson.ironMan.isIronMan = true;
            } 
            
            //Done here, we have to now check if they are a HARDCORE IronMan
            axios.get('https://secure.runescape.com/m=hiscore_oldschool_hardcore_ironman/index_lite.ws?player='+req.params.name)
            .then((resp) => {
    
                respJson.xp.hardCoreIronMan = resp.data.split('\n')[0].split(',')[2];
                if (    respJson.xp.hardCoreIronMan === respJson.xp.normal
                    &&  respJson.xp.hardCoreIronMan === respJson.xp.ironMan){
                    respJson.ironMan.isHardCoreIronMan = true;
                } 

                res.send(respJson);
    
            })
            .catch((err) =>{
                //if we get a 404, we need to check if they're an Ultimate Iron Man.
                axios.get('https://secure.runescape.com/m=hiscore_oldschool_ultimate/index_lite.ws?player='+req.params.name)
                .then((resp) => {

                    respJson.xp.ultimateIronMan = resp.data.split('\n')[0].split(',')[2];
                    if (    respJson.xp.ultimateIronMan === respJson.xp.normal
                        &&  respJson.xp.ultimateIronMan === respJson.xp.ironMan){
                        respJson.ironMan.isUltimateIronMan = true;
                    } 
                    
                    res.send(respJson);
                })
                .catch((err) =>{
                    //if it fails here, they're not an ultimate.
                    res.send(respJson);
                });
            });

        })
        .catch((err) =>{
            //if it fails here, they're not an ironman of ANY type.
            res.send(respJson);
        });

    })
    .catch((err) =>{
        //if we don't find this player on the hiscores here, their name doesn't exist.
        res.send(respJson);
    });
});

app.use('/api', router);