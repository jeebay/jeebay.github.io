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
    var backOfCard = new Card('back of card',0,'all suits',"url('images/cards/classic-cards/b2fv.png')");
    var bankrupt = false;

    function enableButton (button) {
        button.removeAttr('disabled');
        button.removeClass('disabled');
    }

    function disableButton (button) {
        button.attr('disabled','disabled');
        button.addClass('disabled')
    }

    function bettingRound() {
        $('.player-hand').empty();
        $('.computer-hand').empty();
        
        if (readMoney($('.chip-total')) <= 0) {
            bankrupt = true;
            gameOver();
        }

        enableButton($('#confirm-bet'));

        disableButton($('.hit'));
        disableButton($('.stand'));
    }

    function dealNewHand() {
        var $playerHand = $('.player-hand');
        var $computerHand = $('.computer-hand');
        playingDeck = _.shuffle(fullDeck);
        playerHand = playingDeck.splice(0,2);
        computerHand = playingDeck.splice(0,2);

        disableButton($('#confirm-bet'));
        
        enableButton($('.hit'));
        enableButton($('.stand'));
        
        $('.computer-total').text(blackJackValue(computerHand));
        $('.player-total').text(blackJackValue(playerHand));
        
        playerHand.forEach(function(card){
            drawHand(card,$playerHand)
        });
        
        drawHand(backOfCard,$computerHand)
        drawHand(computerHand[1],$computerHand)

        // console.log(playerHand.cards.length);

        if (blackJackValue(playerHand) === 21 && blackJackValue(computerHand) === 21) {
            decideWinner(blackJackValue(playerHand),blackJackValue(computerHand),'push');
        } else if (blackJackValue(playerHand) === 21) {
            decideWinner(blackJackValue(playerHand),blackJackValue(computerHand),'blackjack');
        } else if (blackJackValue(computerHand) === 21) {
            decideWinner(blackJackValue(playerHand),blackJackValue(computerHand));
        }
    }

    function blackJackValue(hand){
            var totalArray = [];
            var total = 0;
            
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
            return "player busts";
        } else {
            return blackJackValue(hand);
        }
    }

    function autoPlay(hand,$section){
        while (blackJackValue(hand) < 17){
            hit(playingDeck,hand,$section);
        }
        if (blackJackValue(hand) > 21) {
            return "computer busts";
        } else {
            return blackJackValue(hand);
        }
    }

    function playerLose() {
        revealComputerHand();
        $('#modal').toggle(); 
        $('.modal-title').text("You Lose!");
        $('.score').text('You had '+blackJackValue(playerHand)+' and the dealer had '+blackJackValue(computerHand));
        $('#play-again').text('Play next hand');
        console.log("you lose");
    }

    function playerWin(message) {
        revealComputerHand();
        $('#modal').toggle(); 
        $('.modal-title').text("You Win!");
        $('.score').text('You had '+blackJackValue(playerHand)+' and the dealer had '+blackJackValue(computerHand));
        $('#play-again').text('Play next hand');
        console.log("you win");
    }

    function gamePush() {
        revealComputerHand();
        $('#modal').toggle(); 
        $('.modal-title').text("Push! It's a tie!");
        $('.score').text('You had '+blackJackValue(playerHand)+' and the dealer had '+blackJackValue(computerHand));
        $('#play-again').text('Play next hand');
        console.log("push! it's a tie!");
    }

    function gameOver() {
        revealComputerHand();
        $('#modal').toggle(); 
        $('.modal-title').text("You're out of dough!");
        $('.score').text('');
        $('#play-again').text('Start over');
        console.log("Game over");
    }

    function decideWinner(playerTotal,computerTotal,result) {
        if (result === 'computer busts') {
            winMoney($('.bet-total'),$('.chip-total'));
            playerWin();
        } else if (result === 'blackjack') {
            winMoney($('.bet-total'),$('.chip-total'),result);
            playerWin();
        } else if (result === 'player busts') {
            playerLose();
        } else if (playerTotal > computerTotal) {
            winMoney($('.bet-total'),$('.chip-total'));
            playerWin();
        } else if (computerTotal > playerTotal) {
            playerLose();
        } else {
            winMoney($('.bet-total'),$('.chip-total'),'push');
            gamePush();
        }
        $('.bet-total').text('$0');
    }

    function drawHand (card,$section) {        
        var $newCard = $('<div>').attr('class','card animated fadeInDown');
        $newCard.css('background-image',card.imageUrl);
        $section.append($newCard); 
    }

    function revealComputerHand() {
        $('.computer-hand > .card').eq(0).css('background-image',computerHand[0].imageUrl);
    }

    function readMoney($element) {
        return Math.floor(parseInt($element.text().replace(/[^0-9-.]/g, '')));
    }

    function writeMoney(amount,$element) {
        $element.text('$' + amount.toString());
    }

    function placeBet($amount,$account,$pot){
        var balance = readMoney($account);
        var bet = $amount.val();
        if (balance >= bet) {
            writeMoney(bet,$pot);
            writeMoney((balance-bet),$account);
            disableButton($('#confirm-bet'));
            dealNewHand();
        }
        $amount.val('');
    }

    function winMoney($pot,$account,result) {
        var winnings = readMoney($pot);
        var balance = readMoney($account);
        if (result === 'blackjack') {
            balance += winnings*2.5
        } else if (result === 'push') {
            balance += winnings;
        } else {
            balance += winnings*2;
        }
        writeMoney(balance,$account);
        $pot.text('$0');
    }

    $('#play-again').on('click',function(event){
        if (bankrupt) {
            $('.chip-total').text('$200');
            bankrupt = false;
        }
        bettingRound();
        $('#modal').toggle(); //CREATE this button
    });

    $('.hit').on('click',function(event){
        var result = hit(playingDeck,playerHand,$('.player-hand'));
        if (typeof(result) === "string") {
            decideWinner(blackJackValue(playerHand),blackJackValue(computerHand),result);
        } 
    });

    $('.stand').on('click',function(){
        var computerResult = autoPlay(computerHand,$('.computer-hand'));
        decideWinner(blackJackValue(playerHand),blackJackValue(computerHand),computerResult);
    });

    $('#confirm-bet').on('click',function(){
        placeBet($('#bet'),$('.chip-total'),$('.bet-total'));
    });

    // dealNewHand();

    // setTimeout(function () { 
    //     dealCard1(); 
    //     setTimeout(function () { 
    //         dealCard2; 
    //     }, 600); 
    // }, 600)

// })