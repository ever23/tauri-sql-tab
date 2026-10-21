import { Connect, dbTabla } from 'dbtabla';

export class tauriSqlTab extends Connect {
    connection: any;
    constructor(connection: any);
    tabla(tabla: string, callback?: (t: dbTabla, error?: any) => void, verify?: boolean): dbTabla;
    query(query: string, params?: any[]): Promise<any>;
    beginTransaction(): Promise<any>;
    commit(): Promise<any>;
    rollback(): Promise<any>;
    close(): Promise<any>;
}

export default tauriSqlTab;
