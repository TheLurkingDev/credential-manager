export interface IElectronAPI {
    createUser: (username: string, password: string) => Promise<boolean>;
    verifyUser: (username: string, password: string) => Promise<boolean>;
}

declare global {
    interface Window {
        electron: IElectronAPI;
    }
}

export {};
