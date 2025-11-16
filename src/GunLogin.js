import { html, css, LitElement } from 'lit';

export class GunLogin extends LitElement {
  static get properties() {
    return {
      gun: { type: Object },
      user: { type: Object },
      alias: { type: String },
      password: { type: String },
      signInHidden: { type: Boolean },
      signUpHidden: { type: Boolean },
      signOutHidden: { type: Boolean },
      userPassHidden: { type: Boolean },
    };
  }

  static get styles() {
    return css`
      [hidden] {
        display: none;
      }
    `;
  }

  firstUpdated() {
    // TODO: This does not seem to work, so leaving it out for now.
    // this.gun.on('auth', this.userIsLoggedIn.bind(this));
    // this.gun.on('leave', this.userIsLoggedOut.bind(this));
    if (this.user.is) {
      this.userIsLoggedIn();
    } else {
      this.userIsLoggedOut();
    }
  }

  render() {
    return html`
      <main>
        <form autocomplete="on">
          <div>
            <span id="user-pass" ?hidden=${this.userPassHidden}>
              <input
                id="alias"
                type="text"
                placeholder="username"
                autocomplete="username"
                @keyup="${this.aliasChanged}"
              />
              <input
                id="pass"
                type="password"
                placeholder="password"
                autocomplete="${this.signInHidden
                  ? 'current-password'
                  : 'new-password'}"
                @keyup="${this.passwordChanged}"
              />
            </span>

            <span id="sign-in" ?hidden=${this.signInHidden}>
              <input
                id="in"
                type="button"
                value="sign in"
                @click="${this.signIn}"
              />
              <br />
              <a href="#" id="switch-to-sign-up" @click="${this.switchToSignUp}"
                >sign up instead</a
              >
            </span>

            <span id="sign-up" ?hidden=${this.signUpHidden}>
              <input
                id="up"
                type="button"
                value="sign up"
                @click="${this.signUp}"
              />
              <br />
              <a href="#" id="switch-to-sign-in" @click="${this.switchToSignIn}"
                >sign in instead</a
              >
            </span>
          </div>
          <input
            id="sign-out"
            ?hidden=${this.signOutHidden}
            type="button"
            value="sign out"
            @click="${this.signOut}"
          />
        </form>
      </main>
    `;
  }

  /**
   * Sign up event handler
   * @memberof GunLogin
   */
  signUp() {
    this.user.create(this.alias, this.password);
    this.user.auth(this.alias, this.password);
  }

  /**
   * Sign in event handler
   * @memberof GunLogin
   */
  signIn() {
    this.user.auth(this.alias, this.password, this.userIsLoggedIn.bind(this));
  }

  /**
   * Sign out event handler
   * @memberof GunLogin
   */
  signOut() {
    this.user.leave();
    // TODO: See if there's a way to detect when logout is complete.  The docs at https://gun.eco/docs/User#unexpected-behavior say:
    // "There is no callback called at this time to confirm successful logging out. Personal recommendation of the author (@dletta) of this part of the documentation is to check if user._.sea exists after leave is called. If it no longer contains a keypair, you are successfully logged out. It should be 'undefined' and a truth check would come back false."
    this.userIsLoggedOut();
  }

  /**
   * Alias changed event handler
   *
   * @param {Event} event
   * @memberof GunLogin
   */
  aliasChanged(event) {
    this.alias = event.target.value;
  }

  /**
   * Password changed event handler
   *
   * @param {Event} event
   * @memberof GunLogin
   */
  passwordChanged(event) {
    this.password = event.target.value;
  }

  /**
   * Switch to sign in event handler
   *
   * @param {Event} event
   * @memberof GunLogin
   */
  switchToSignIn(event) {
    event.preventDefault();
    this.signInHidden = false;
    this.signUpHidden = true;
  }

  /**
   * Switch to sign up event handler
   *
   * @param {Event} event
   * @memberof GunLogin
   */
  switchToSignUp(event) {
    event.preventDefault();
    this.signInHidden = true;
    this.signUpHidden = false;
  }

  /**
   * Perform tasks after the user logs out
   */
  userIsLoggedOut() {
    this.userPassHidden = false;
    if (localStorage.getItem('hasLoggedIn')) {
      this.signInHidden = false;
      this.signUpHidden = true;
    } else {
      this.signInHidden = true;
      this.signUpHidden = false;
    }
    this.signOutHidden = true;
  }

  /**
   * Perform tasks after the user logs in
   */
  userIsLoggedIn() {
    localStorage.setItem('hasLoggedIn', true);
    this.userPassHidden = true;
    this.signInHidden = true;
    this.signUpHidden = true;
    this.signOutHidden = false;
  }
}
