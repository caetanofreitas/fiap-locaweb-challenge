import * as fs from 'fs';
import * as path from 'path';
import { EntitySchema } from 'typeorm';

export const entities = fs
  .readdirSync(path.join(__dirname))
  .filter(
    (file) =>
      !file.includes('.ts') &&
      !file.includes('.map') &&
      !file.includes('index'),
  )
  .map((file) => require(`./${file}`))
  .map((obj) => Object.values(obj)[0] as EntitySchema);
