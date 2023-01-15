import { generateRandomId } from './generateRandomId';

export function generateRandomIdAvoidingCollisions(existingIds: string[]): string {
	let id = generateRandomId();
	while (existingIds.includes(id)) {
		id = generateRandomId();
	}
	return id;
}
