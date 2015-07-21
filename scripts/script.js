console.log("LINKED");
$(document).ready(function(){

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

    // Initializing global variables
    var fullDeck = createFullDeck(nameArray,valueArray,suitArray,imageUrlArray);
    var playingDeck = [];
    var playerHand = [];
    var computerHand = [];
    var backOfCard = new Card('back of card',0,'all suits',"url('images/cards/classic-cards/b2fv.png')");
    var bankrupt = false;

    // Resets game to have no cards displayed and disables action buttons until player hits 'Bet' button
    function bettingRound() {
        $('.player-hand').empty();
        $('.computer-hand').empty();
        
        if (readMoney($('.chip-total')) <= 0) {
            bankrupt = true;
            $('.modal').removeClass('hidden');
            $('.modal-title').text('You\'re broke! To the cashier!');
            $('.score').text('');
            $('#play-again').text('Start over');
        }

        enableButton($('#confirm-bet'));
        enableButton($('#bet'));

        disableButton($('.hit'));
        disableButton($('.stand'));
        disableButton($('.double-down'));
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

    // Shuffles the deck and deals cards
    function dealNewHand() {
        var $playerHand = $('.player-hand');
        var $computerHand = $('.computer-hand');
        playingDeck = _.shuffle(fullDeck);
        playerHand = playingDeck.splice(0,2);
        computerHand = playingDeck.splice(0,2);

        disableButton($('#confirm-bet'));
        disableButton($('#bet'));
        
        enableButton($('.hit'));
        enableButton($('.stand'));
        enableButton($('.double-down'));
        
        // If chip total is too low to double down, disable double down button
        var balance = readMoney($('.chip-total'));
        var bet = readMoney($('.bet-total'));
        if (balance < bet) {
            disableButton($('.double-down'));
        }
        
        // Displays player cards
        playerHand.forEach(function(card){
            drawHand(card,$playerHand)
        });
        
        // Displays computer cards with back of card shown for first card
        drawHand(backOfCard,$computerHand)
        drawHand(computerHand[1],$computerHand)

        // Tests for blackjack and immediately calls the decideWinner function
        if (blackJackValue(playerHand) === 21 && blackJackValue(computerHand) === 21) {
            decideWinner(blackJackValue(playerHand),blackJackValue(computerHand),'push');
        } else if (blackJackValue(playerHand) === 21) {
            decideWinner(blackJackValue(playerHand),blackJackValue(computerHand),'blackjack');
        } else if (blackJackValue(computerHand) === 21) {
            decideWinner(blackJackValue(playerHand),blackJackValue(computerHand));
        }
    }

    // Displays a card--appends a card image to a jQuery object
    function drawHand (card,$section) {        
        var $newCard = $('<div>').attr('class','card animated fadeInDown');
        $newCard.css('background-image',card.imageUrl);
        $section.append($newCard); 
    }

    function hit (deck,hand,$section){
        var newCard = deck.splice(0,1)[0];
        hand.push(newCard);
        drawHand(newCard,$section);
        if (blackJackValue(hand) > 21) {
            return "bust";
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

    function decideWinner(playerTotal,computerTotal,result) {
        var playerScore = 'had ' + blackJackValue(playerHand);
        var dealerScore = 'had ' + blackJackValue(computerHand) + '.';

        if (result === 'computer busts') {
            winMoney($('.bet-total'),$('.chip-total'));
            resultModal('You win!',playerScore,'busted.','Play next hand');
        } else if (result === 'blackjack') {
            winMoney($('.bet-total'),$('.chip-total'),result);
            resultModal('You win!','scored a black',dealerScore,'Play next hand');
        } else if (result === 'bust') {
            resultModal('You Lose!','busted',dealerScore,'Play next hand');
        } else if (playerTotal > computerTotal) {
            winMoney($('.bet-total'),$('.chip-total'));
            resultModal('You win!',playerScore,dealerScore,'Play next hand');
        } else if (computerTotal > playerTotal) {
            resultModal('You Lose!',playerScore,dealerScore,'Play next hand');
        } else {
            winMoney($('.bet-total'),$('.chip-total'),'push');
            resultModal('Push! It\'s a tie!',playerScore,dealerScore,'Play next hand');
        }
    }

    // Displays a result modal and formats it to show the appropriate message
    function resultModal(winMessage,playerScore,dealerScore,buttonText) {
        revealComputerHand();
        $('.modal').removeClass('hidden');
        $('.modal-title').text(winMessage);
        $('.score').text('You ' + playerScore +' and the dealer '+ dealerScore);
        $('#play-again').text(buttonText);
        console.log(winMessage);
    }

    // Computes a blackjack value for a given hand
    function blackJackValue(hand){
            var valueArray = [];
            var total = 0;
            var k = 0

            // Iterate through the hand with card values accumulating in 'total'
            for (var i = 0; i < hand.length; i++) {
                valueArray.push(hand[i].value);
                total += valueArray[i];
            }

            // Ace handling--while total is over 21, look for aces and decrease total by 10
            if (valueArray.indexOf(11) >= 0 && total > 21) {
                while (total > 21) {
                    if (valueArray[k] === 11) {
                        total -= 10;
                    }
                    k++;
                }
            }
            return total;
        };

    // Writes the appropriate winnings to the user total
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
    }

    function revealComputerHand() {
        $('.computer-hand > .card').eq(0).css('background-image',computerHand[0].imageUrl);
    }

    // Parses the text of a particular element as a number, rounding down to the nearest whole number
    function readMoney($element) {
        return Math.floor(parseInt($element.text().replace(/[^0-9-.]/g, '')));
    }

    // Writes a number to an element as a string
    function writeMoney(amount,$element) {
        $element.text('$' + amount.toString());
    }

    // Un-disables a button and removes disabled class and styling
    function enableButton (button) {
        button.removeAttr('disabled');
        button.removeClass('disabled');
    }

    // Disables a button and and adds disabled class and styling
    function disableButton (button) {
        button.attr('disabled','disabled');
        button.addClass('disabled')
    }

    // New game button on the (only) modal. Checks for bankrupt indicator, resets bet-total
    // and starts a new betting round
    $('#play-again').on('click',function(event){
        if (bankrupt) {
            $('.chip-total').text('$200');
            bankrupt = false;
        }
        $('.bet-total').text('$0');
        $('.modal').addClass('hidden');
        bettingRound();
        
    });

    // Listener for the 'Bet' button
    $('#confirm-bet').on('click',function(){
        if ($('#bet').val().replace(/[^0-9-.]/g, '') > 0) {
            placeBet($('#bet'),$('.chip-total'),$('.bet-total'));
        }
    });

    // Listener for the bet input text area
    $('#bet').on('keypress',function(event){
        if (event.which === 13) {
            if ($('#bet').val().replace(/[^0-9-.]/g, '') > 0) {
                placeBet($('#bet'),$('.chip-total'),$('.bet-total'));
            }
        }
    });

    // Listener for the hit button, automatic decideWinner if player busts (if hit result is string)
    $('.hit').on('click',function(event){
        var result = hit(playingDeck,playerHand,$('.player-hand'));
        if (typeof(result) === "string") {
            decideWinner(blackJackValue(playerHand),blackJackValue(computerHand),result);
        } 
    });

    // Double down if player has enough money, decideWinner if bust, otherwise call computer autoPlay
    $('.double-down').on('click',function(){
        var balance = readMoney($('.chip-total'));
        var bet = readMoney($('.bet-total'));
        
        if (balance >= bet) {
            writeMoney((bet*2),$('.bet-total'));
            writeMoney((balance-bet),$('.chip-total'));
            
            var result = hit(playingDeck,playerHand,$('.player-hand'));

            if (typeof(result) === "string") {
                decideWinner(blackJackValue(playerHand),blackJackValue(computerHand),result);
            } else {
                var computerResult = autoPlay(computerHand,$('.computer-hand'));
                decideWinner(blackJackValue(playerHand),blackJackValue(computerHand),computerResult);
            }
        }
    })

    // Calls autoPlay for computerHand and then decideWinner
    $('.stand').on('click',function(){
        var computerResult = autoPlay(computerHand,$('.computer-hand'));
        decideWinner(blackJackValue(playerHand),blackJackValue(computerHand),computerResult);
    });

    // Starts the game!
    bettingRound();


})