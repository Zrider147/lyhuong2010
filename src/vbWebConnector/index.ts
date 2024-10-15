/**
 * Global exports for project to use.
 */
export {
    default as Ajv,
    type ValidateFunction,
    type DefinedError
} from 'ajv';

export type {
    SomeJSONSchema,
    JSONSchemaType,
} from 'ajv/dist/types/json-schema';


export { vbWebConnector } from './BaseConnector';
export {
    vbRequestHandler,
    type PresetRequestHandlers,
    type PresetGameDataType
} from './BaseRequestHandler';

export * as NextDigital from './NextDigital';
