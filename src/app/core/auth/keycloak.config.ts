import { KeycloakOptions } from 'keycloak-angular';

export const keycloakConfig: KeycloakOptions = {
  config: {
    url: 'http://localhost:8180',
    realm: 'master',
    clientId: 'geli-web-client',
  },
  initOptions: {
    onLoad: 'login-required',
    checkLoginIframe: false,
  },
};
