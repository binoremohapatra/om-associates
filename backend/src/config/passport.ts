import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import { config } from './index';
import { AuthService } from '../services/auth.service';

const oauthCallback = async (provider: string, accessToken: string, refreshToken: string, profile: any, done: any) => {
  try {
    const user = await AuthService.findOrCreateOAuthUser(provider, profile);
    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
};

if (config.google.clientId && config.google.clientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.google.clientId,
        clientSecret: config.google.clientSecret,
        callbackURL: config.google.callbackUrl,
      },
      (accessToken, refreshToken, profile, done) => oauthCallback('GOOGLE', accessToken, refreshToken, profile, done)
    )
  );
}

if (config.facebook.clientId && config.facebook.clientSecret) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: config.facebook.clientId,
        clientSecret: config.facebook.clientSecret,
        callbackURL: config.facebook.callbackUrl,
        profileFields: ['id', 'displayName', 'emails', 'photos'],
      },
      (accessToken, refreshToken, profile, done) => oauthCallback('FACEBOOK', accessToken, refreshToken, profile, done)
    )
  );
}

if (config.github.clientId && config.github.clientSecret) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: config.github.clientId,
        clientSecret: config.github.clientSecret,
        callbackURL: config.github.callbackUrl,
        scope: ['user:email'],
      },
      (accessToken: string, refreshToken: string, profile: any, done: any) => oauthCallback('GITHUB', accessToken, refreshToken, profile, done)
    )
  );
}

if (config.microsoft.clientId && config.microsoft.clientSecret) {
  passport.use(
    new MicrosoftStrategy(
      {
        clientID: config.microsoft.clientId,
        clientSecret: config.microsoft.clientSecret,
        callbackURL: config.microsoft.callbackUrl,
        scope: ['user.read'],
      },
      (accessToken: string, refreshToken: string, profile: any, done: any) => oauthCallback('MICROSOFT', accessToken, refreshToken, profile, done)
    )
  );
}

export default passport;
