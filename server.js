// server.js
require('dotenv').config();
const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const cookieSession = require('cookie-session');
const Stripe = require('stripe');
const bodyParser = require('body-parser');
const cors = require('cors');
const paypal = require('@paypal/checkout-server-sdk');

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || '');

app.use(bodyParser.json());
app.use(cors({ origin: true, credentials: true }));
app.use(cookieSession({ name: 'session', keys: [process.env.SESSION_SECRET || 'secret'], maxAge: 24*60*60*1000 }));

// Passport setup
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));
app.use(passport.initialize());
app.use(passport.session());

// Google
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
  return done(null, { id: profile.id, name: profile.displayName, email: profile.emails?.[0]?.value });
}));

// Facebook
passport.use(new FacebookStrategy({
  clientID: process.env.FB_APP_ID || '',
  clientSecret: process.env.FB_APP_SECRET || '',
  callbackURL: process.env.FB_CALLBACK_URL || '/auth/facebook/callback',
  profileFields: ['id','displayName','emails']
}, (accessToken, refreshToken, profile, done) => {
  return done(null, { id: profile.id, name: profile.displayName, email: profile.emails?.[0]?.value });
}));

app.get('/auth/google', passport.authenticate('google', { scope: ['profile','email'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/auth/failure' }), (req,res)=>{
  req.session.user = req.user; res.redirect(process.env.CLIENT_SUCCESS_URL || '/auth/success');
});

app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/auth/failure' }), (req,res)=>{
  req.session.user = req.user; res.redirect(process.env.CLIENT_SUCCESS_URL || '/auth/success');
});

app.get('/session', (req,res)=>{
  if(req.session && req.session.user) return res.json(req.session.user);
  res.status(204).end();
});

app.get('/auth/failure', (req,res)=>res.send('Auth failed'));

app.post('/create-checkout-session', async (req,res) => {
  try {
    const { cart = [], currency='AUD', successUrl, cancelUrl } = req.body;
    // IMPORTANT: Validate and compute line_items server-side using your DB
    const line_items = cart.map(i=>{
      const price = Math.round((i.price || 10) * 100);
      return { price_data: { currency, product_data: { name: `Item ${i.id}` }, unit_amount: price }, quantity: i.qty };
    });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      success_url: successUrl || (req.headers.origin + '/checkout-success.html'),
      cancel_url: cancelUrl || (req.headers.origin + '/checkout-cancel.html'),
      shipping_address_collection: { allowed_countries: ['AU','US','GB','CA'] }
    });
    res.json({ url: session.url });
  } catch(err){
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PayPal setup (Sandbox)
const payPalEnv = new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID || '', process.env.PAYPAL_SECRET || '');
const payPalClient = new paypal.core.PayPalHttpClient(payPalEnv);

app.post('/create-paypal-order', async (req,res) => {
  try {
    const cart = req.body.cart || [];
    const total = cart.reduce((s,i)=> s + (i.price||10) * (i.qty||1), 0).toFixed(2);
    const request = new paypal.orders.OrdersCreateRequest();
    request.requestBody({ intent:'CAPTURE', purchase_units:[{ amount:{ currency_code:'AUD', value: total } }]});
    const order = await payPalClient.execute(request);
    res.json({ orderID: order.result.id });
  } catch(err){ console.error(err); res.status(500).json({ error: err.message }); }
});

app.post('/capture-paypal-order', async (req,res) => {
  try {
    const { orderID } = req.body;
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});
    const capture = await payPalClient.execute(request);
    res.json(capture.result);
  } catch(err){ console.error(err); res.status(500).json({ error: err.message }); }
});

// Serve static public folder
app.use(express.static('public'));

const PORT = process.env.PORT || 4242;
app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));
