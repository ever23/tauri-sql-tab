/**
 * tauriSqlOk
 * Objeto de respuesta positiva para INSERT, UPDATE y DELETE
 */
class tauriSqlOk {
    /**
     * @param {dbTabla} dbtabla - Objeto de la tabla que ejecutó la consulta
     * @param {object} ok - Resultado del plugin (rowsAffected, lastInsertId)
     */
    constructor(dbtabla, ok) {
        this.$sql = dbtabla._lastSql;
        this.rowsAffected = ok ? ok.rowsAffected : 0;
        this.insertId = ok ? ok.lastInsertId : null;
    }
}

export default tauriSqlOk;
