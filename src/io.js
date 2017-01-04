// @flow

import fs from 'fs';

export function writeJson(path: string, object: Object) {
  fs.writeFileSync(path, JSON.stringify(object), 'utf8');
}

export function readJson(path: string): Object {
  try {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (error) {
    return {}
  }
}