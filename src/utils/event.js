import { isAnon } from './user';

/**
 * 
 * @param {RcEvent} event 
 * @param {Object} additionalData 
 * @param {Set<string>} additionalData.admins
 * @param {Set<string>} additionalData.admeditorsins
 */
export function getUserTags(event, {
  admins,
  editors,
}) {
  const userTags = [];
  if (event.bot) {
    userTags.push('bot');
  }
  if (isAnon(event.user)) {
    userTags.push('anon');
  }
  if (admins && admins.has(event.user)) {
    userTags.push('admin');
  }
  if (editors && editors.has(event.user)) {
    userTags.push('editor');
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
