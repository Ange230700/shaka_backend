// src/swagger/response-helpers.ts
import { getSchemaPath } from '@nestjs/swagger';

export function jsonSingle<T>(dto: new () => T, example: T) {
  return {
    'application/json': {
      schema: { $ref: getSchemaPath(dto) },
      examples: { sample: { value: example } },
    },
  };
}

export function jsonArray<T>(dto: new () => T, exampleList: T[]) {
  return {
    'application/json': {
      schema: {
        type: 'array',
        items: { $ref: getSchemaPath(dto) },
      },
      examples: { sample: { value: exampleList } },
    },
  };
}
