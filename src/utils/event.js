import { isAnon } from './user';
export function getUserTags(event) {
  const userTags = [];
  if (event.bot) {
    userTags.push('bot');
  }
  if (isAnon(event.user)) {
    userTags.push('anon');
  }
  return userTags;
}

export function getRevTags(event) {
  const revTags = [];
  if (event.patrolled) {
    revTags.push('patrolled');
  }
  if (event.minor) {
    revTags.push('minor');
  }
  return revTags;
}
