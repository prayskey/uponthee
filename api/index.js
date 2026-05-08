import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import connectPg from "connect-pg-simple";
import pg from "pg";
import env from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
env.config();

const app = express();
const PORT = process.env.PORT;
const saltRounds = 10;

const db = new pg.Pool({
    connectionString: process.env.SUPABASE_CONNECTION_STRING,
    // connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    }
});
const pgSession = connectPg(session);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set up EJS as the view engine and specify the views directory
app.set('views', join(__dirname, '../views'));
app.set('view engine', 'ejs');

// Serve static files from the public directory
app.use(express.static(join(__dirname, '../public')));
app.use(express.urlencoded({ extended: false }));

// Configure session middleware with PostgreSQL store
app.use(session({
    store: new pgSession({
        pool: db,
        tableName: 'session',
        createTableIfMissing: false,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
    }
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.render('about-us.ejs');
    } else return res.render('home.ejs', { user: req.user });
});
app.get('/sign-up', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.render('sign-up.ejs');
    } else res.redirect('/home');
});
app.get('/sign-in', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.render('sign-in.ejs');
    } else res.redirect('/home');
});
app.get('/password-reset', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/');
    } else res.render('password-reset.ejs', { user: req.user });
})
app.get('/home', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/');
    } else res.render('home.ejs', { user: req.user });
});
app.get('/profile', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/');
    } else {
        return res.render('profile.ejs', { user: req.user });
    }
});
app.get('/lodges', (req, res) => {
    if (!req.isAuthenticated()) {
        res.redirect('/sign-in');
    } else res.render('lodges.ejs', { user: req.user });
});
app.get('/about-us', (req, res) => {
    if (!req.isAuthenticated()) {
        res.redirect('/');
    } else res.render('about-us.ejs', { user: req.user });
});
app.get('/bookings', (req, res) => {
    if (!req.isAuthenticated()) {
        res.redirect('/');
    } else res.render('bookings.ejs', { user: req.user });
});
app.get('/saved', (req, res) => {
    if (!req.isAuthenticated()) {
        res.redirect('/');
    } else res.render('saved-lodges.ejs', { user: req.user });
});
app.get('/history', (req, res) => {
    if (!req.isAuthenticated()) {
        res.redirect('/');
    } else res.render('history.ejs', { user: req.user });
});
app.get('/settings', (req, res) => {
    if (!req.isAuthenticated()) {
        res.redirect('/');
    } else res.render('settings.ejs', { user: req.user });
})

////////////////////////////////////////////////////////////



app.get('/select-lodge/:id', (req, res) => {
    const lodgeId = parseInt(req.params.id, 10);

    // ❌ Invalid ID guard
    if (isNaN(lodgeId)) {
        return res.status(400).send('Invalid lodge ID');
    }

    // 🔹 Your lodge data (replace with DB later)
    const lodges = [
        {
            id: 1,
            name: 'Emerald Heights Lodge',
            description: 'Well-maintained lodge with steady water and security.',
            price: 120000,
            caution: 10000,
            available: true,
            amenities: ['Water', 'Security', 'Parking'],
            images: [
                '/images/lodge1.jpg',
                '/images/lodge2.jpg',
                '/images/lodge3.jpg'
            ],
            landlord: {
                name: 'Mr. Obi',
                phone: '08012345678'
            },
            reviews: []
        },
        {
            id: 2,
            name: 'Royal Palm Lodge',
            description: 'Comfortable lodge with good accessibility.',
            price: 150000,
            caution: 15000,
            available: false,
            amenities: ['Water', 'Security'],
            images: [
                '/images/lodge4.jpg',
                '/images/lodge5.jpg'
            ],
            landlord: {
                name: 'Mrs. Ada',
                phone: '08087654321'
            },
            reviews: []
        }
    ];

    // 🔍 Find lodge
    const lodge = lodges.find(l => l.id === lodgeId);

    // ❌ Not found
    if (!lodge) {
        return res.status(404).render('404', {
            message: 'Lodge not found'
        });
    }

    // ✅ Render page (matches your EJS perfectly)
    res.render('selected-lodge', { lodge, user: req.user });
});






////////////////////////////////////////////////////////////
app.post('/sign-up', async (req, res) => {
    console.log(req.body);
    try {
        const { firstName, lastName, email, phone, confirm_password } = req.body;
        const hashedPassword = await bcrypt.hash(confirm_password, saltRounds);

        // Check if the user already exists in the database
        const existingUser = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).render('sign-up.ejs', { error: "User already exists.", })
        };
        // Insert the new user into the database
        const user = await db.query("INSERT INTO users (first_name, last_name, email, phone_number, password) VALUES ($1, $2, $3, $4, $5) RETURNING *", [firstName, lastName, email, phone, hashedPassword]);

        // Log the user in immediately after successful sign-up
        req.login(user.rows[0], (err) => {
            if (err) {
                console.error("Error during login after sign-up:", err);
                return res.status(500).render('error-page.ejs', { error: "An error occurred during login. Please try again later." });
            }
            return res.redirect('/home');
        });
    } catch (error) {
        console.error("Error during sign-up:", error);
        return res.status(500).send("An error occurred during sign-up. Please try again later.");
    }
});
app.post('/sign-in', (req, res, next) => {
    passport.authenticate('local', (err, user) => {
        if (err) {
            console.error("Error during authentication:", err);
            return res.status(500).render('error-page.ejs', { error: "An error occurred during authentication. Please try again later." });
        }
        // user don't exist or invalid credentials
        if (!user) {
            return res.status(401).render('sign-in.ejs', { error: "Invalid credentials." });
        }
        // Log the user in
        req.login(user, (err) => {
            if (err) {
                console.error("Error during login:", err);
                return res.status(500).render('error-page.ejs', { error: "An error occurred during login. Please try again later." });
            }
            return res.redirect('/home');
        });
    })(req, res, next);
});
app.post('/logout', (req, res) => {
    req.logout(err => {
        if (err) {
            res.status(500).render('error-page.ejs', { error: "An error occurred during logout. Please try again later." });
        } else res.redirect('/');
    })
})
passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
        const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        if (result.rows.length === 0) return done(null, false);
        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return done(null, false);
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));
passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser(async (user, done) => {
    try {
        const result = await db.query("SELECT * FROM users WHERE id = $1", [user]);
        done(null, result.rows[0]);
    } catch (err) {
        done(err);
    }
});
// app.listen(PORT, () => {
//     console.log(`Server is running at PORT: ${PORT}`);
// });
export default app;