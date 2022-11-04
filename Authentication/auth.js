const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const UserModel = require('../models/users');

const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

passport.use(
    new JWTstrategy(
        {
            secretOrKey: process.env.JWT_SECRET,
            jwtFromRequest: ExtractJWT.fromUrlQueryParameter('secret_token')
            // jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken() // Use this if you are using Bearer token
        },
        async (token, done) => {
            try {
                return done(null, token.user);
            } catch (error) {
                done(error);
            }
        }
    )
);

passport.use(
    'signup',
    new localStrategy(
        {
            firstname: 'firstname',
            lastname: 'lastname', 
            username: 'username',
            email: 'email',
            password: 'password',

            passReqToCallback: true
        },

        
        
        async (req, firstname, lastname, username, email, password, done) => {
            try {
                const user = await UserModel.create({ firstname, lastname, username, email, password });

                return done(null, user);
            } catch (error) {
                done(error);
            }
        }
    ) 
);

passport.use(
    'login',
    new localStrategy(
        {
            username: 'email',
            password: 'password'
        },
        async (email, password, done) => {
            try {
                const user = await UserModel.findOne({ email });

                if (!user) {
                    return done(null, false, { message: 'User not found' });
                }

                const validate = await user.isValidPassword(password);

                if (!validate) {
                    return done(null, false, { message: 'Wrong Password' });
                }

                return done(null, user, { message: 'Logged in Successfully' });
            } catch (error) {
                return done(error);
            }
        }
    )
);