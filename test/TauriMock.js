import sqlite3 from 'sqlite3';

/**
 * TauriMock
 * Simula el plugin de Tauri SQL usando sqlite3 de Node.js
 */
export class TauriMock {
    constructor(path = ':memory:') {
        this.db = new sqlite3.Database(path);
    }

    /**
     * Simula el método select de Tauri
     */
    select(query, params = []) {
        return new Promise((res, rej) => {
            this.db.all(query, params, (err, rows) => {
                if (err) return rej(err);
                res(rows);
            });
        });
    }

    /**
     * Simula el método execute de Tauri
     */
    execute(query, params = []) {
        return new Promise((res, rej) => {
            // Usamos una función tradicional para acceder a 'this.lastID' y 'this.changes'
            this.db.run(query, params, function(err) {
                if (err) return rej(err);
                res({
                    lastInsertId: this.lastID,
                    rowsAffected: this.changes
                });
            });
        });
    }

    /**
     * Cierra la base de datos
     */
    close() {
        return new Promise((res) => {
            this.db.close(() => res());
        });
    }
}
