export class Error {
    status: any;
    message: string;

    constructor(status: any, message: string) {
        this.status = status;
        if (message.indexOf('Failed to fetch') > -1) {
            this.message = 'Network Error: Unable to connect to the server.';
        } else {
            this.message = message;
        }
    }
}