
import type { UserGameState } from '@shared/types/users.ts';
import { inviteStore } from '../../../store/inviteStore.ts';
import { renderButton } from './render.ts';
import { stringToElement } from '../../utils.ts';

export function updateUserButton(user: UserGameState) {
	const divUser = document.querySelector(`.user-item[data-username=${user.username}]`)
	if (!divUser)
		return;
	const btn = divUser.querySelector('.game-btn')
	if (!btn)
		return;
	const newBtn = renderButton(user);

	btn.replaceWith(stringToElement(newBtn));
}

export function cleanSubscription() {
	inviteStore.getUsers().forEach(u => inviteStore.unsubscribe(u.username));
	inviteStore.getFriends().forEach(f => inviteStore.unsubscribe(f.username));
}
