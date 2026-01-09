
import type { UserFriendState, FriendInviteStatus } from '@shared/types/users.ts';


export class FriendsStore {

	private users: Map<string, UserFriendState> = new Map();
	private friends: Map<string, UserFriendState> = new Map();
	private listeners: Map<string, (user: UserFriendState) => void> = new Map();

	subscribe(username: string, listener: (user: UserFriendState) => void) {
		this.listeners.set(username, listener);
	}

	unsubscribe(username: string) {
		this.listeners.delete(username);
	}

	private notify(username: string) {
		const user = this.findUser(username);
		if (!user)
			return;
		const listener = this.listeners.get(username);
		if (listener)
			listener(user);
	}

	setUsers(users: UserFriendState[]) {
		// this.users = users;
		this.users.clear();
		users.forEach(user => this.users.set(user.username, user));
	}

	getUsers(): UserFriendState[] {
		return Array.from(this.users.values());
	}

	getUser(username: string): UserFriendState | undefined {
		return this.users.get(username);
	}

	addUser(user: UserFriendState) {
		this.users.set(user.username, user);
	}

	removeUser(username: string) {
		this.users.delete(username);
	}

	setFriends(friends: UserFriendState[]) {
		this.friends.clear();
		friends.forEach(friend => this.friends.set(friend.username, friend));
	}

	getFriends(): UserFriendState[] {
		return Array.from(this.friends.values());
	}

	getFriend(username: string): UserFriendState | undefined {
		return this.friends.get(username);
	}

	addFriend(user: UserFriendState) {
		this.friends.set(user.username, user);
	}

	removeFriend(username: string) {
		this.friends.delete(username);
	}

	private findUser(username: string): UserFriendState | undefined {
		return this.users.get(username) || this.friends.get(username);
	}

	updateInvite(username: string, newInvite: FriendInviteStatus, oldInvite: FriendInviteStatus) {
		const user = this.findUser(username);
		if (!user)
			return;

		if (oldInvite !== user.invite)
			return;

		user.invite = newInvite;

		this.notify(username);
	}

}

export const friendsStore = new FriendsStore();
