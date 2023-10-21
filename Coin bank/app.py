from flask import Flask, request, jsonify, session, render_template, redirect, url_for, flash
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import datetime
import re

dailyLimit = 500  # Initialize with a default value

# Initialize Flask application
app = Flask(__name__)

# Set secret key and OpenAI API key from the configuration
app.secret_key = 'Secret12345!' # You should change to your own secret key

def get_db_connection():
    return sqlite3.connect('customers.db', check_same_thread=False)

def initialize_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check and create tables if they don't exist
    cursor.execute('''CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        username TEXT NOT NULL UNIQUE,
                        password TEXT NOT NULL)''')
    
    cursor.execute('''CREATE TABLE IF NOT EXISTS accounts (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id INTEGER NOT NULL,
                        account_type TEXT NOT NULL,
                        balance REAL NOT NULL,
                        currency TEXT NOT NULL,
                        FOREIGN KEY (user_id) REFERENCES users (id))''')
                        
    cursor.execute('''CREATE TABLE IF NOT EXISTS transactions (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        date TEXT NOT NULL,
                        description TEXT NOT NULL,
                        amount REAL NOT NULL,
                        currency TEXT NOT NULL,
                        account_id INTEGER NOT NULL,
                        FOREIGN KEY (account_id) REFERENCES accounts (id)
                   );
    ''')
    conn.commit()
    conn.close()

initialize_db()

@app.route('/')
def index():
    """Show landing page"""
    return render_template("index.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")

        if not username:
            flash("Du må taste inn et brukernavn.")
            return render_template("login.html")
        if not password:
            flash("Du må taste inn et passord.")
            return render_template("login.html")

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE username=?", (username,))
        user = cursor.fetchone()

        if user is None or not check_password_hash(user[2], password):
            flash("Ugyldig brukernavn og/eller passord.")
            return render_template("login.html")

        session["user_id"] = user[0]
        conn.close()
        return redirect(url_for("account_overview"))

    return render_template("login.html")


@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        confirmation = request.form.get("confirmation")

        # Validate form input
        if not username:
            flash("Du må taste inn et brukernavn.")
            return render_template("register.html")
        if len(username) < 4:
            flash("Brukernavnet må inneholde minst 4 tegn.")
            return render_template("register.html")
        if not password:
            flash("Du må taste inn et passord.")
            return render_template("register.html")
        if not confirmation:
            flash("Du må bekrefte passordet.")
            return render_template("register.html")
        if password != confirmation:
            flash("Passordene stemmer ikke overens.")
            return render_template("register.html")

        # Validate password strength
        pattern = r"^(?=.*[A-Z]).{6,}$"
        if not re.fullmatch(pattern, password):
            flash("Passordet må inneholde minst 6 tegn og minst en stor bokstav.")
            return render_template("register.html")



        # Open database connection
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check for existing username
        cursor.execute("SELECT * FROM users WHERE username=?", (username,))
        existing_user = cursor.fetchone()
        if existing_user:
            flash("Bruker finnes allerede.")
            return render_template("register.html")

        # Insert the new user
        password_hash = generate_password_hash(password)
        cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, password_hash))
        user_id = cursor.lastrowid  # Get the last inserted row ID (new user's ID)

        # Create main and savings account for new user
        cursor.execute("INSERT INTO accounts (user_id, account_type, balance, currency) VALUES (?, ?, ?, ?)",
                       (user_id, 'main', 10000, 'kr'))
        cursor.execute("INSERT INTO accounts (user_id, account_type, balance, currency) VALUES (?, ?, ?, ?)",
                       (user_id, 'savings', 0, 'kr'))

        # Commit changes and close connection
        conn.commit()
        conn.close()


        # Log the user in automatically after registering
        session["user_id"] = user_id

        return redirect(url_for("account_overview"))

    return render_template("register.html")


@app.route("/gameview", methods=["GET", "POST"])
def gameview():
    """Select yahtzee game versions"""
    if not session.get("user_id"):
        flash("Du må være innlogget for å kunne spille!")
        return redirect(url_for('login'))
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    user_id = session.get('user_id')
    cursor.execute('SELECT * FROM accounts WHERE user_id = ? AND account_type = ?', (user_id, 'main'))
    main_account = cursor.fetchone()
    
    conn.close()

    if main_account is None:
        flash('Brukskonto ikke funnet. Vennligst kontakt kundeservice.')
        return redirect(url_for('index'))
    
    if request.method == "POST":
        players = request.form.get("players")
        return redirect(url_for(f"playgame{players}"))
    else:
        return render_template("gameview.html", main_account=main_account, dailyLimit=dailyLimit)

@app.route('/transfer_score', methods=['POST'])
def transfer_score():
    conn = get_db_connection()
    cursor = conn.cursor()
    request_data = request.get_json()
    game_score = float(request_data.get('score'))
    user_id = session.get('user_id')
    cursor.execute('SELECT * FROM accounts WHERE user_id = ? AND account_type = ?', (user_id, 'main'))
    main_account = cursor.fetchone()
    cursor.execute('SELECT * FROM accounts WHERE user_id = ? AND account_type = ?', (user_id, 'savings'))
    savings_account = cursor.fetchone()

    if main_account and savings_account and float(main_account[3]) >= game_score:  # Corrected index for main_account
        new_main_balance = float(main_account[3]) - game_score  # Also casting here for good measure
        new_savings_balance = float(savings_account[3]) + game_score  # Corrected index for savings_account

        cursor.execute('UPDATE accounts SET balance = ? WHERE id = ?', (new_main_balance, main_account[0]))
        cursor.execute('UPDATE accounts SET balance = ? WHERE id = ?', (new_savings_balance, savings_account[0]))
        
        current_date = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute('INSERT INTO transactions (date, description, amount, currency, account_id) VALUES (?, ?, ?, ?, ?)',
                       (current_date, 'Game Score Transfer', game_score, 'NOK', main_account[0]))
        
        conn.commit()
        conn.close()
        return jsonify({'success': True})
    else:
        conn.close()
        return jsonify({'success': False, 'message': 'Insufficient balance in the main account or accounts not found'})

@app.route('/account_overview')
def account_overview():
    if not session.get('user_id'):
        flash('Du må være innlogget for å se denne siden.')
        return redirect(url_for('login'))
    
    # Open database connection
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Fetch the user's main and savings account details
    user_id = session.get('user_id')
    cursor.execute('SELECT * FROM accounts WHERE user_id = ? AND account_type = ?', (user_id, 'main'))
    main_account = cursor.fetchone()
    
    cursor.execute('SELECT * FROM accounts WHERE user_id = ? AND account_type = ?', (user_id, 'savings'))
    savings_account = cursor.fetchone()

    # Fetch last 5 transactions for main account
    cursor.execute('SELECT * FROM transactions WHERE account_id = ? ORDER BY date DESC LIMIT 5', (main_account[0],))
    main_transactions = cursor.fetchall()

    # Fetch last 5 transactions for savings account
    cursor.execute('SELECT * FROM transactions WHERE account_id = ? ORDER BY date DESC LIMIT 5', (savings_account[0],))
    savings_transactions = cursor.fetchall()

    conn.close()

    return render_template('account_overview.html', 
                           main_account=main_account, 
                           savings_account=savings_account,
                           main_transactions=main_transactions,
                           savings_transactions=savings_transactions)

@app.route('/transactions')
def transactions():
    if not session.get('user_id'):
        flash('Du må være innlogget for å kunne se denne siden')
        return redirect(url_for('login'))

    conn = get_db_connection()
    cursor = conn.cursor()

    user_id = session.get('user_id')

    # Fetch the user's main and savings account details to get their account IDs
    cursor.execute('SELECT id FROM accounts WHERE user_id = ? AND account_type = ?', (user_id, 'main'))
    main_account_id = cursor.fetchone()[0]
    cursor.execute('SELECT id FROM accounts WHERE user_id = ? AND account_type = ?', (user_id, 'savings'))
    savings_account_id = cursor.fetchone()[0]

    # Fetch transactions for both accounts
    cursor.execute('SELECT * FROM transactions WHERE account_id = ? OR account_id = ? ORDER BY date DESC', 
                   (main_account_id, savings_account_id))
    transactions = cursor.fetchall()

    conn.close()

    return render_template('transactions.html', transactions=transactions)


@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

@app.route('/about')
def om_oss():
    return render_template('about.html')

def get_todays_transfers():
    user_id = session.get('user_id')
    print(f"Debug: User ID: {user_id}")  # Debugging user ID
    
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('SELECT id FROM accounts WHERE user_id = ? AND account_type = ?', (user_id, 'main'))
    account_id = cursor.fetchone()

    if account_id is None:
        print("Debug: No account found for the user.")
        conn.close()
        return jsonify({"error": "Sparekonto not found for the user"})

    account_id = account_id[0]
    print(f"Debug: Account ID: {account_id}")  # Debugging account ID
    
    # SQL query to sum all transactions for the specific account
    query = 'SELECT SUM(amount) FROM transactions WHERE account_id = ?'
    cursor.execute(query, (account_id,))
    rows = cursor.fetchall()

    print(f"Debug: Fetched Rows - {rows}")  # Debugging fetched rows

    # Initialize total_sum
    total_sum = 0

    for row in rows:
        sum_value = row[0]
        print(f"Debug: Sum value from row: {sum_value}")  # Debugging sum value from row

        # If sum_value is None, then there were no transactions
        if sum_value is None:
            sum_value = 0
        
        total_sum += sum_value

    conn.close()
    print(f"Debug: Total sum: {total_sum}")  # Debugging final total sum
    return jsonify({"total_sum": total_sum})



# Map the function to a new API endpoint
@app.route('/api/todays_transfers', methods=['GET'])
def api_todays_transfers():
    return get_todays_transfers()


@app.route('/api/daily_limit', methods=['GET'])
def get_daily_limit():
    return jsonify({"daily_limit": dailyLimit})

@app.route('/api/update_daily_limit', methods=['POST'])
def update_daily_limit():
    try:
        newLimit = request.json.get('daily_limit', None)
        if newLimit is None:
            return jsonify({"success": False, "message": "Limit not provided"}), 400

        # Validate the limit
        if int(newLimit) > 5000 or int(newLimit) < 1:
            return jsonify({"success": False, "message": "Limit cannot exceed 5000"}), 400

        global dailyLimit
        dailyLimit = int(newLimit)
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

    


if __name__ == "__main__":
    app.run(debug=True)
