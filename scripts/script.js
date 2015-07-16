console.log("LINKED");
// $(document).ready(function(){

    // Create card prototype with card
    function Card(cardName,value,suit,imageUrl){
        this.cardName = cardName;
        this.value = value;
        this.suit = suit;
        this.imageUrl = imageUrl;
    }// End Card factory

    // Create stack of cards prototype with methods to return the cards in the hand, add a card, pull random card
    function CardStack (cardArray){
        this.cards = cardArray;
        
        // pushes a card (object) to the cards array
        this.addCard = function(card){
            this.cards.push(card);
        };

        // return name of all cards in stack
        this.cardsInDeck = function(){
            var allCards = [];
            var cards = this.cards;
            for (var i = 0; i < cards.length; i++) {
                allCards.push(cards[i].cardName);
            }
            return allCards;
        };

        // pull a random card from the stack
        this.dealCards = function(number){
            var cards = this.cards;
            var dealtCards = [];
            if (cards.length > 0 && cards.length > number) {
                for (var i = 0; i < number; i++) {
                    var randomCards = cards.splice(Math.floor(Math.random() * cards.length),1);
                    dealtCards.push(randomCards[0]);
                }
            }
            return dealtCards;
        };

        // return total value of cards in stack
        this.totalValue = function(){
            var cards = this.cards;
            var totalArray = [];
            var total = 0;
            for (var i = 0; i < cards.length; i++) {
                totalArray.push(cards[i].value);
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
    }// End CardStack factory

    // Creating arrays of file names, card names, suits, and values in order to create a deck of cards
    var imgFileNames = ['1.png','2.png','3.png','4.png','5.png','6.png','7.png','8.png','9.png','10.png','11.png','12.png','13.png','14.png','15.png','16.png','17.png','18.png','19.png','20.png','21.png','22.png','23.png','24.png','25.png','26.png','27.png','28.png','29.png','30.png','31.png','32.png','33.png','34.png','35.png','36.png','37.png','38.png','39.png','40.png','41.png','42.png','43.png','44.png','45.png','46.png','47.png','48.png','49.png','50.png','51.png','52.png'];

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

    var imageUrlArray = (function(fileNames){
        var fullPaths = [];
        var directory = 'images/cards/classic-cards/';
        for (var i = 0; i < fileNames.length; i++) {
            fullPaths.push(directory+fileNames[i]);
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
    var playingDeck = new CardStack(fullDeck);
    var playerHand = new CardStack(playingDeck.dealCards(2));
    var computerHand = new CardStack(playingDeck.dealCards(2));

    function dealNewHand() {
        playingDeck = new CardStack(fullDeck);
        playerHand = new CardStack(playingDeck.dealCards(2));
        computerHand = new CardStack(playingDeck.dealCards(2));
        $('.player-hand').empty();
        $('.computer-hand').empty();
        $('.computer-total').text(computerHand.totalValue());
        $('.player-total').text(playerHand.totalValue());
        $('.player-hand').text(playerHand.cardsInDeck());
        $('.computer-hand').text(computerHand.cardsInDeck());
    }

    function hit (deck,hand){
        hand.addCard(deck.dealCards(1)[0]);
        if (hand.totalValue() > 21) {
            return "Busted with "+hand.totalValue();
        } else {
            return hand.totalValue();
        }
    }

    function autoPlay(hand){
        while (hand.totalValue() < 17){
            hit(playingDeck,hand);
        }
        if (hand.totalValue() > 21) {
            return "Busted with "+hand.totalValue();
        } else {
            return hand.totalValue();
        }
    }

    function playerLose() {
        $('#lose-modal').toggle(); // CREATE lose-modal
        alert("you lose");
        dealNewHand();
    }

    function computerLose() {
        $('#win-modal').toggle();   // CREATE win-modal
        alert("you win");
        dealNewHand();
    }

    function gamePush() {
        $('#push-modal').toggle();   // CREATE win-modal   
        alert("push! it's a tie!");
        dealNewHand();
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


    $('#win-play-again').on('click',function(event){
        dealNewHand();
        $('#win-modal').toggle(); //CREATE this button
    });

    $('#lose-play-again').on('click',function(event){
        dealNewHand();
        $('#lose-modal').toggle(); //CREATE this button
    });

    $('.hit').on('click',function(event){
        var result = hit(playingDeck,playerHand);
        if (typeof(result) === "string") {
            $('.player-total').text(result);
            $('.player-hand').text(playerHand.cardsInDeck());
            playerLose();
        } else {
            $('.player-total').text(result);
            $('.player-hand').text(playerHand.cardsInDeck());
        }
    });

    $('.stand').on('click',function(){
        var computerResult = autoPlay(computerHand);
        if (typeof(computerResult) === "string") {
            $('.computer-total').text(computerResult);
            $('.computer-hand').text(computerHand.cardsInDeck());
            computerLose()
        } else {
            $('.computer-total').text(computerResult);
            $('.computer-hand').text(computerHand.cardsInDeck());
            decideWinner();
        }
    });

    dealNewHand();

    

// })