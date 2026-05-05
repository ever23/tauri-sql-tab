import dbTabla, { dbTablaError } from 'dbtabla';
import tauriSqlResult from './tauriSqlResult.js';
import tauriSqlOk from './tauriSqlOk.js';

/**
 * tauriSqlTabla
 * Representación de una tabla en Tauri SQL
 */
class tauriSqlTabla extends dbTabla {
    /**
     * Construye el objeto de resultado para consultas SELECT
     */
    _formatResult(result) {
        return new tauriSqlResult(this, result);
    }

    /**
     * Construye el objeto de resultado para INSERT, DELETE, UPDATE
     */
    _PropertyOk(ok) {
        let retOk = new tauriSqlOk(this, ok);
        
        // Si el plugin devolvió lastInsertId, lo asignamos
        if (ok && ok.lastInsertId !== undefined) {
            retOk.insertId = ok.lastInsertId;
        }
        
        // Compatibilidad con dbtabla autoincrement manual si fuera necesario
        if (this.sql.nextAutoincrementValue !== undefined) {
            retOk.insertId = this.sql.nextAutoincrementValue;
        }
        
        return retOk;
    }

    /**
     * Envía una sentencia insert a la base de datos
     */
    insert(...params) {
        if (params.length === 0) {
            throw new dbTablaError("debe pasar al menos un parámetro");
        }

        return new Promise((res, rej) => {
            this._verifyKeys(async e => {
                if (e) return rej(e);

                let index = this.sql.colums.findIndex(d => d.autoincrement);
                
                // Si el motor no devuelve el ID automáticamente o necesitamos calcularlo
                if (this.sql.autoincrement !== undefined && 
                    ((params.length === 1 && typeof params[0] === "object" && (params[0][this.sql.autoincremet] === null || params[0][this.sql.autoincremet] === undefined)) ||
                    (params.length > 1 && index !== -1 && (params[index] === null || params[index] === undefined)))) {
                    
                    try {
                        const row = await this._connection.get(`SELECT max(${this.sql.autoincrement}) as autoincrement_value FROM ${this.tabla}`);
                        this.sql.nextAutoincrementValue = Number(row.autoincrement_value) + 1;
                        
                        const d = await this.#insert(params);
                        this.sql.nextAutoincrementValue = undefined;
                        res(this._PropertyOk(d));
                    } catch (error) {
                        this.sql.nextAutoincrementValue = undefined;
                        rej(error);
                    }
                } else {
                    this.#insert(params).then(d => res(this._PropertyOk(d))).catch(rej);
                }
            });
        });
    }

    #insert(params) {
        this.sql.activeSmt(true);
        if (params instanceof Array && params.length === 1) {
            this._lastSql = this.sql.insert(params[0]);
        } else {
            this._lastSql = this.sql.insert(params);
        }
        
        // En Tauri, solemos pasar los parámetros por separado si el plugin lo soporta
        // Pero procesingSql de dbtabla suele inyectar los valores directamente si no se usa SMT
        // Para Tauri, usaremos la query generada.
        let data = this.sql.getDataSmt();
        this.sql.resetDataSmt();
        this.sql.activeSmt(false);
        
        return this._connection.query(this._lastSql, data);
    }

    /**
     * Envía una sentencia update
     */
    update(sets, where) {
        if (sets === undefined) throw new dbTablaError("Falta el parámetro sets");
        if (where === undefined) throw new dbTablaError("Falta el parámetro where");

        return new Promise((resolve, reject) => {
            this._verifyKeys(async e => {
                if (e) return reject(e);

                this.sql.activeSmt(true);
                this._lastSql = this.sql.update(sets, where, reject);
                let data = this.sql.getDataSmt();
                this.sql.resetDataSmt();
                this.sql.activeSmt(false);

                if (this._lastSql) {
                    try {
                        const d = await this._connection.query(this._lastSql, data);
                        resolve(this._PropertyOk(d));
                    } catch (error) {
                        reject(error);
                    }
                }
            });
        });
    }
}

export default tauriSqlTabla;
