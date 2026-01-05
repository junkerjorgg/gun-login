import { html, css, LitElement } from 'lit';

export class GunLogin extends LitElement {
  static get properties() {
    return {
      gun: { type: Object },
      user: { type: Object },
      username: { type: String },
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

  constructor() {
    super();
    this._gun = null;
    this.user = null;
    this.username = '';
    this.password = '';
    this.userIsLoggedOut();
  }

  get gun() {
    return this._gun;
  }

  set gun(newGun) {
    const oldGun = this._gun;
    if (oldGun === newGun) return;

    this._gun = newGun;

    if (this._gun) {
      this._gun.on('auth', this.userIsLoggedIn.bind(this));
      const user = this._gun.user();
      if (user && user.is) {
        this.userIsLoggedIn();
      }
    }
    this.requestUpdate('gun', oldGun);
  }

  render() {
    return html`
      <main>
        <form autocomplete="on" @submit="${this._handleFormSubmit}">
          <div>
            <span ?hidden=${this.userPassHidden}>
              <input
                type="text"
                name="username"
                placeholder="username"
                autocomplete="username"
                @input="${this.usernameChanged}"
              />
              <input
                type="password"
                name="password"
                placeholder="password"
                autocomplete="${this.signInHidden
                  ? 'current-password'
                  : 'new-password'}"
                @input="${this.passwordChanged}"
              />
            </span>

            <span ?hidden=${this.signInHidden}>
              <input type="submit" value="sign in" />
              <br />
              <a href="#" @click="${this.switchToSignUp}">sign up instead</a>
            </span>

            <span ?hidden=${this.signUpHidden}>
              <input type="submit" value="sign up" />
              <br />
              <a href="#" @click="${this.switchToSignIn}">sign in instead</a>
            </span>
          </div>
          <input
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
    this.user.create(this.username, this.password);
    this.user.auth(this.username, this.password);
  }

  /**
   * Sign in event handler
   * @memberof GunLogin
   */
  signIn() {
    this.user.auth(
      this.username,
      this.password,
      this.userIsLoggedIn.bind(this),
    );
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
   * Username changed event handler
   *
   * @param {Event} event
   * @memberof GunLogin
   */
  usernameChanged(event) {
    this.username = event.target.value;
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
   * Form submit event handler
   * @param {Event} event
   * @memberof GunLogin
   */
  _handleFormSubmit(event) {
    event.preventDefault();
    if (this.signInHidden) {
      this.signUp();
    } else {
      this.signIn();
    }
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
    this.dispatchEvent(
      new CustomEvent('user-is-logged-out', {
        detail: {
          username: this.username,
        },
      }),
    );
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
    this.dispatchEvent(
      new CustomEvent('user-is-logged-in', {
        detail: {
          username: this.username,
        },
      }),
    );
    localStorage.setItem('hasLoggedIn', true);
    this.userPassHidden = true;
    this.signInHidden = true;
    this.signUpHidden = true;
    this.signOutHidden = false;
  }
}
