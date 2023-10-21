## Stacc-Challenge
This is a fun project made as part of a competition - Stacc Challenge.

The idea of this project is to motivate bank customers to save more money!

Nothing beats a simple, but addictive game. 
Instead of spending money on a lottery, the customer will get the impression of winning, 
but rather, the score will actually be the amount of money that
will be withdrawn from the account and put into a savings account! Pretty clever, huh?
This way the customer will most likely save more money than usual.

## How to run
Make sure you have python 3 installed.
In command prompt or a terminal, run the following commands:

pip install pgzero                                                        
pip install pygames

Now you can run the game.

Using git:
Navigate to the folder by using: cd "file location"
Then type: python game.py

In a vscode or IntelliJ IDEA:
Open/Import the project folder, and click "Run python file" inside Visual Studio Code or a similar program.

## Running the app: 
Once the server is running locally:
enter: http://127.0.0.1:5000
Then you'll have to create a user to log in.
Each new users will get created two bank accouns in the sql: Main account and Savings account.
10 000 NOK (kr) is automatically added for each new registered user. Cool huh?
When you play the game, you will have the chance to transfer the amount equal to the score of the game, into your savings account. The money will be withdrawn from the main account. Because you already got 10 000, so now you should start playing and save some of those money ;)

## Game Rules
Try to reach the maximum score of 200-, before the time runs out!
Steer with arrows.
Coins give 1,-
Pots give 5-,
Rainbows give an additional 7 seconds.
When time runs out, the score achieved will be the amount of money you save.

## Comments

I hope you liked the game, and also the styling on the bank account!
Once you have played and accepted the tranfer, the transactions will appear both on the main page(last 5), as well as the history-page(all transactions)
