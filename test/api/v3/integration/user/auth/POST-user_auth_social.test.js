import {
  generateUser,
  requester,
  translate as t,
  getProperty,
} from '../../../../../helpers/api-integration/v3';
import passport from 'passport';

describe('POST /user/auth/social', () => {
  let api;
  let user;
  let endpoint = '/user/auth/social';
  let randomAccessToken = '123456';
  let facebookId = 'facebookId';
  let googleId = 'googleId';
  let network = 'NoNetwork';

  beforeEach(async () => {
    api = requester();
    user = await generateUser();
  });

  it('fails if network is not supported', async () => {
    await expect(api.post(endpoint, {
      authResponse: {access_token: randomAccessToken}, // eslint-disable-line camelcase
      network,
    })).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('unsupportedNetwork'),
    });
  });

  describe('facebook', () => {
    before(async () => {
      let expectedResult = {id: facebookId};
      sandbox.stub(passport._strategies.facebook, 'userProfile').yields(null, expectedResult);
      network = 'facebook';
    });

    it('registers a new user', async () => {
      let response = await api.post(endpoint, {
        authResponse: {access_token: randomAccessToken}, // eslint-disable-line camelcase
        network,
      });

      expect(response.apiToken).to.exist;
      expect(response.id).to.exist;
      expect(response.newUser).to.be.true;
    });

    it('logs an existing user in', async () => {
      await user.update({ 'auth.facebook.id': facebookId });

      let response = await api.post(endpoint, {
        authResponse: {access_token: randomAccessToken}, // eslint-disable-line camelcase
        network,
      });

      expect(response.apiToken).to.eql(user.apiToken);
      expect(response.id).to.eql(user._id);
      expect(response.newUser).to.be.false;
    });

    it('add social auth to an existing user', async () => {
      let response = await user.post(endpoint, {
        authResponse: {access_token: randomAccessToken}, // eslint-disable-line camelcase
        network,
      });

      expect(response.apiToken).to.exist;
      expect(response.id).to.exist;
      expect(response.newUser).to.be.false;
    });

    it('enrolls a new user in an A/B test', async () => {
      await api.post(endpoint, {
        authResponse: {access_token: randomAccessToken}, // eslint-disable-line camelcase
        network,
      });

      await expect(getProperty('users', user._id, '_ABtest')).to.eventually.be.a('string');
    });
  });

  describe('google', () => {
    before(async () => {
      let expectedResult = {id: googleId};
      sandbox.stub(passport._strategies.google, 'userProfile').yields(null, expectedResult);
      network = 'google';
    });

    it('registers a new user', async () => {
      let response = await api.post(endpoint, {
        authResponse: {access_token: randomAccessToken}, // eslint-disable-line camelcase
        network,
      });

      expect(response.apiToken).to.exist;
      expect(response.id).to.exist;
      expect(response.newUser).to.be.true;
    });

    it('logs an existing user in', async () => {
      await user.update({ 'auth.google.id': googleId });

      let response = await api.post(endpoint, {
        authResponse: {access_token: randomAccessToken}, // eslint-disable-line camelcase
        network,
      });

      expect(response.apiToken).to.eql(user.apiToken);
      expect(response.id).to.eql(user._id);
      expect(response.newUser).to.be.false;
    });

    it('add social auth to an existing user', async () => {
      let response = await user.post(endpoint, {
        authResponse: {access_token: randomAccessToken}, // eslint-disable-line camelcase
        network,
      });

      expect(response.apiToken).to.exist;
      expect(response.id).to.exist;
      expect(response.newUser).to.be.false;
    });

    it('enrolls a new user in an A/B test', async () => {
      await api.post(endpoint, {
        authResponse: {access_token: randomAccessToken}, // eslint-disable-line camelcase
        network,
      });

      await expect(getProperty('users', user._id, '_ABtest')).to.eventually.be.a('string');
    });
  });
});
