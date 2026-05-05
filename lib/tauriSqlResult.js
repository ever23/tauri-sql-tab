import { dbResult } from 'dbtabla';

/**
 * tauriSqlResult
 * Maneja el resultado de una consulta SELECT en Tauri
 */
class tauriSqlResult extends dbResult {
    /**
     * @param {dbTabla} dbTabla - objeto de la tabla que ejecutó la consulta
     * @param {array} result - resultado de la consulta
     */
    constructor(dbTabla, result) {
        super(dbTabla, result);
    }
}

export default tauriSqlResult;
