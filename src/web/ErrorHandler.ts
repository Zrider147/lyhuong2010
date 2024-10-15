import { ref } from 'vue';

export const errorTitle = ref<string>();
export const errorDetails = ref<string[]>([]);

export function setErrorHandler(enable: boolean) {
    API.showErrorMessage = showErrorMessage;
    if (!enable) return;
    
    window.onerror = (event, _source, _lineno, _colno, error) => {
        if (typeof event == 'string')
            API.showErrorMessage(event, error?.stack?.split('\n'));
        else
            API.showErrorMessage(event.type, error?.stack?.split('\n'));
    }
    window.onunhandledrejection = (event) => {
        if (event.reason instanceof Error && event.reason.message != '')
            API.showErrorMessage(event.reason.message, event.reason.stack?.split('\n'));
        else
            throw new Error(event.type);
    }
}

function showErrorMessage(message: string | null, details?: string | string[]) {
    if (message === null) {
        errorTitle.value = undefined;
        return;
    }
    errorTitle.value = message;
    if (details !== undefined) {
        if (Array.isArray(details))
            errorDetails.value = details;
        else
            errorDetails.value = [details];
    } 
    else
        errorDetails.value.length = 0;
}
