
type AuthFlowState = 'anon' | '2fa_required' | 'auth' | 
					'reset_passwd_allowed' | 'reset_passwd_expired' | 'link_account_required';


class AuthStore {
	private state: AuthFlowState = 'anon';

	getState(): AuthFlowState {
		return this.state;
	}

	setState(state: AuthFlowState) {
		this.state = state;
	}
}

export const authStore = new AuthStore();
