
let hofState = {

    create: createHOF
};

let msg;
let again;

function restartPlay() {
    game.state.start('play');
}



function createHOF() {


    game.stage.backgroundColor = "#b5b5b5";
    game.input.enabled = true;

    msg = game.add.text(285, 80, "GAME OVER",
    {font:'32px Arial ', fill:'#eb1333',
     boundsAlignH:'center', boundsAlignV:'bottom',fontWeight:'bold'});

   

    again = game.add.text(242, 500, "FINAL SCORE: "+score,
    {font:'32px Arial', fill:'#eb1333',
     boundsAlignH:'center', boundsAlignV:'bottom',fontWeight:'bold'});
    
    
    game.input.onDown.add( checkDistance);
    
    
  

    
}

function checkDistance () {
    
    if (game.input.activePointer.isDown){
           
           let xPointer=game.input.x;
           let yPointer=game.input.y;

           if ((xPointer>286 && xPointer<488)&& (yPointer>90 && yPointer<118)||
               (xPointer>203 && xPointer<488)&&(yPointer>508 && yPointer<540)){   
                restartPlay();
           }    
    }
}

