import { Connect } from 'dbtabla';
import model from 'tabla-model';
import tauriSqlTabla from './lib/tauriSqlTabla.js';

/**
 * tauriSqlTab
 * Crea una conexión a una base de datos en Tauri usando tauri-plugin-sql
 */
class tauriSqlTab extends Connect {
    /**
     * @param {object} connection - Instancia de Database de @tauri-apps/plugin-sql
     */
    constructor(connection) {
        super({}, "sqlite3"); // Por defecto Tauri suele usar SQLite
        this.connection = connection;
        this._escapeChar = "`";
        this._information_schema = "select sqlite_master.* from sqlite_master where name=";
    }

    /**
     * Construye un objeto dbtabla asociado al nombre de la tabla
     * @param {string} tabla - nombre de la tabla
     * @param {function} callback - función que se ejecutará al verificar la tabla
     * @param {boolean} verify - indica si se verificará la existencia de la tabla
     * @return {tauriSqlTabla}
     */
    tabla(tabla, callback, verify = false) {
        if (typeof callback === "boolean") verify = callback;
        
        if (typeof this._caheTablas[tabla] !== "undefined") {
            if (typeof callback === "function") callback(this._caheTablas[tabla]);
            return this._caheTablas[tabla];
        }

        return this._caheTablas[tabla] = new tauriSqlTabla({
            tabla: tabla,
            connection: this,
            callback: t => typeof callback === "function" ? callback(t) : null,
            config: this.helpersConf()
        }, verify);
    }

    /**
     * Envía una consulta a la base de datos
     * @param {string} query - consulta sql
     * @param {array} params - parámetros para la consulta
     * @return {Promise}
     */
    async query(query, params = []) {
        if (/^[\s]*select/i.test(query)) {
            return await this.connection.select(query, params);
        } else {
            return await this.connection.execute(query, params);
        }
    }

    async beginTransaction() {
        return await this.query("BEGIN TRANSACTION");
    }

    async commit() {
        return await this.query("COMMIT");
    }

    async rollback() {
        return await this.query("ROLLBACK");
    }

    /**
     * Obtiene una sola fila
     */
    async get(query, params = []) {
        const result = await this.connection.select(query, params);
        return result && result.length > 0 ? result[0] : null;
    }

    /**
     * Simula each usando select (Tauri no tiene stream nativo en el plugin de SQL)
     */
    async each(query, params = [], callback) {
        if (typeof params === "function") {
            callback = params;
            params = [];
        }
        const results = await this.connection.select(query, params);
        for (const row of results) {
            callback(row);
        }
        return results;
    }

    close() {
        return this.connection.close();
    }

    /**
     * Verifica la existencia de la tabla y retorna sus metadatos
     */
    async _keysInTable(table) {
        try {
            const result = await this.query(`${this._information_schema}'${table}'`);
            
            try {
                return await this.inModel(table, result.length === 0);
            } catch (e) {
                if (e === undefined) {
                    if (result.length === 0) {
                        throw new Error("la tabla no existe");
                    } else {
                        return (new model(result[0].sql, this._escapeChar)).getData();
                    }
                } else {
                    throw e;
                }
            }
        } catch (error) {
            throw error;
        }
    }
}

export { tauriSqlTab };
export default tauriSqlTab;
