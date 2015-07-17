console.log("LINKED");
// $(document).ready(function(){

    // Create card prototype with card
    function Card(cardName,value,suit,imageUrl){
        this.cardName = cardName;
        this.value = value;
        this.suit = suit;
        this.imageUrl = imageUrl;
    }// End Card factory

    // Creating arrays of file names, card names, suits, and values in order to create a deck of cards

    var nameArray = (function(){
        var suits = ['Clubs','Spades','Hearts','Diamonds'];
        var numbers = ['Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Jack', 'Queen', 'King', 'Ace'];
        var names = [];
        
        for (var k = numbers.length-1; k >= 0; k--){
            for (var i = 0; i < suits.length; i++) {
                names.push(numbers[k]+" of "+suits[i]);
            }
        }
        return names;
    })();

    var suitArray = (function(){
        var suits = ['Clubs','Spades','Hearts','Diamonds'];
        var fullSuits = [];
        for (var i = 0; i < 13; i++) {
            for (var k = 0; k < 4; k++) {
                fullSuits.push(suits[k]);
            }
        }
        return fullSuits;
    })();

    var valueArray = [11,11,11,11,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,9,9,9,9,8,8,8,8,7,7,7,7,6,6,6,6,5,5,5,5,4,4,4,4,3,3,3,3,2,2,2,2];
    
    var imgFileNames = ['1.png','2.png','3.png','4.png','5.png','6.png','7.png','8.png','9.png','10.png','11.png','12.png','13.png','14.png','15.png','16.png','17.png','18.png','19.png','20.png','21.png','22.png','23.png','24.png','25.png','26.png','27.png','28.png','29.png','30.png','31.png','32.png','33.png','34.png','35.png','36.png','37.png','38.png','39.png','40.png','41.png','42.png','43.png','44.png','45.png','46.png','47.png','48.png','49.png','50.png','51.png','52.png'];
    var imageUrlArray = (function(fileNames){
        var fullPaths = [];
        var directory = 'images/cards/classic-cards/';
        for (var i = 0; i < fileNames.length; i++) {
            fullPaths.push("url('"+directory+fileNames[i]+"')");
        }
        return fullPaths;
    })(imgFileNames);
    // End of section creating arrays to populate the initial deck of cards


    // Creating the initial deck of cards
    function createFullDeck (namesArray,valuesArray,suitsArray,imagesUrlArray){
        var deck = [];
        for (var k = 0; k < 52; k++) {
            deck.push(new Card(namesArray[k],valuesArray[k],suitsArray[k],imagesUrlArray[k]));
        }
        return deck;
    }

    var fullDeck = createFullDeck(nameArray,valueArray,suitArray,imageUrlArray);
    var playingDeck = [];
    var playerHand = [];
    var computerHand = [];

    function dealNewHand() {
        var $playerHand = $('.player-hand');
        var $computerHand = $('.computer-hand');
        playingDeck = _.shuffle(fullDeck);
        playerHand = playingDeck.splice(0,2);
        computerHand = playingDeck.splice(0,2);
        

        $('.player-hand').empty();
        $('.computer-hand').empty();
        $('.computer-total').text(blackJackValue(computerHand));
        $('.player-total').text(blackJackValue(playerHand));
        
        playerHand.forEach(function(card){
            drawHand(card,$playerHand)
        });
        computerHand.forEach(function(card){
            drawHand(card,$computerHand)
        });

        // console.log(playerHand.cards.length);

        if (blackJackValue(playerHand) === 21 && blackJackValue(computerHand) === 21) {
            gamePush();
        } else if (blackJackValue(playerHand) === 21) {
            computerLose();
        } else if (blackJackValue(computerHand) === 21) {
            playerLose();
        }
    }

    function blackJackValue(hand){
            var totalArray = [];
            var total = 0;
            
            // console.log(cardsInHand.length);
            
            for (var i = 0; i < hand.length; i++) {
                totalArray.push(hand[i].value);
                total += totalArray[i];
            }
            if (total > 21) {
                for (var k = 0; k < totalArray.length; k++) {
                    if(totalArray[k] === 11) {
                        total -= 10;
                    }
                }
            }
            return total;
        };

    function hit (deck,hand,$section){
        var newCard = deck.splice(0,1)[0];
        hand.push(newCard);
        drawHand(newCard,$section);
        $section.next().text(blackJackValue(hand));
        if (blackJackValue(hand) > 21) {
            return "busted with "+blackJackValue(hand);
        } else {
            return blackJackValue(hand);
        }
    }

    function autoPlay(hand,$section){
        while (blackJackValue(hand) < 17){
            hit(playingDeck,hand,$section);
        }
        if (blackJackValue(hand) > 21) {
            return "busted with "+blackJackValue(hand);
        } else {
            return blackJackValue(hand);
        }
    }

    function playerLose() {
        $('#modal').toggle(); 
        $('.modal-title').text("You Lose!");
        $('.score').text('You had '+blackJackValue(playerHand)+' and the dealer had '+blackJackValue(computerHand));
        $('#play-again').text('Play next hand');
        console.log("you lose");
    }

    function computerLose() {
        $('#modal').toggle(); 
        $('.modal-title').text("You Win!");
        $('.score').text('You had '+blackJackValue(playerHand)+' and the dealer had '+blackJackValue(computerHand));
        $('#play-again').text('Play next hand');
        console.log("you win");
    }

    function gamePush() {
        $('#modal').toggle(); 
        $('.modal-title').text("It was a push!");
        $('.score').text('You had '+blackJackValue(playerHand)+' and the dealer had '+blackJackValue(computerHand));
        $('#play-again').text('Play next hand');
        console.log("push! it's a tie!");
    }

    function decideWinner(playerTotal,computerTotal) {
        if (playerTotal > computerTotal) {
            computerLose();
        } else if (computerTotal > playerTotal) {
            playerLose();
        } else {
            gamePush();
        }
    }

    function drawHand (card,$section) {        
        var $newCard = $('<div>').attr('class','card animated fadeInDown');
        $newCard.css('background-image',card.imageUrl);
        $section.append($newCard);
    }

    $('#play-again').on('click',function(event){
        dealNewHand();
        $('#modal').toggle(); //CREATE this button
    });

    $('.hit').on('click',function(event){
        var result = hit(playingDeck,playerHand,$('.player-hand'));
        if (typeof(result) === "string") {
            playerLose();
        } 
    });

    $('.stand').on('click',function(){
        var computerResult = autoPlay(computerHand,$('.computer-hand'));
        if (typeof(computerResult) === "string") {            
            computerLose();
        } else {
            decideWinner(blackJackValue(playerHand),blackJackValue(computerHand));
        }
    });

    // dealNewHand();

    // setTimeout(function () { 
    //     dealCard1(); 
    //     setTimeout(function () { 
    //         dealCard2; 
    //     }, 600); 
    // }, 600)

// })