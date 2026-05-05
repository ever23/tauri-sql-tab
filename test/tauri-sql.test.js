import { describe, it } from 'node:test';
import assert from 'node:assert';
import path from 'path';
import { fileURLToPath } from 'url';
import dbLib from 'dbtabla';
const { dbRow } = dbLib;

import { tauriSqlTab } from '../tauri-sql-tab.js';
import { TauriMock } from './TauriMock.js';
import tauriSqlOk from '../lib/tauriSqlOk.js';
import tauriSqlResult from '../lib/tauriSqlResult.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createAndInsert() {
    const mock = new TauriMock();
    const db = new tauriSqlTab(mock);
    await db.query("create table `test1`(`id` int not null,`row1` text default 'ever',`row2` int not null,`row3` date null,primary key (`id`))");
    await db.query("INSERT INTO `test1` (`id`,`row1`,`row2`,`row3`) VALUES (1,'text',12,'text2');");
    return { db, mock };
}

describe("Tests de Integración tauri-sql-tab (Estilo sqlite3-tab)", async () => {
    
    it('obtencion del objeto dbtabla', async () => {
        const mock = new TauriMock();
        const db = new tauriSqlTab(mock);
        assert.ok(db.tabla('test1') instanceof dbLib, "debe retornar un objeto dbtabla");
        await db.close();
    });

    it('obtencion del objeto dbtabla async', async () => {
        const mock = new TauriMock();
        const db = new tauriSqlTab(mock);
        await db.query("create table `test1`(`id` int not null,`row1` text default 'ever',`row2` int not null,`row3` text null,primary key (`id`))");
        
        return new Promise((resolve) => {
            db.tabla('test1', (test1) => {
                assert.ok(test1 instanceof dbLib, "debe retornar un objeto dbtabla");
                resolve();
            }, true);
        });
    });

    it('dbTabla:insert', async () => {
        const mock = new TauriMock();
        const db = new tauriSqlTab(mock);
        await db.query("create table `test1`(`id` int not null,`row1` text default 'ever',`row2` int not null,`row3` text null,primary key (`id`))");
        let test1 = db.tabla('test1');
        const ok = await test1.insert(12, "text", 12, "text2");
        assert.ok(ok instanceof tauriSqlOk, "debe retornar un objeto tauriSqlOk");
    });

    it('dbTabla:select', async () => {
        const { db } = await createAndInsert();
        let test1 = db.tabla('test1');
        const data = await test1.select();
        
        assert.ok(data instanceof tauriSqlResult, "debe retornar un objeto tauriSqlResult");
        assert.equal(data.length, 1);
        assert.ok(data[0] instanceof dbRow, "debe retornar un objeto dbRow");
        assert.equal(data[0].id, 1);
        assert.equal(data[0].row1, "text");
        assert.equal(data[0].row2, 12);
        assert.equal(data[0].row3, "text2");
    });

    it('dbTabla:update', async () => {
        const { db } = await createAndInsert();
        let test1 = db.tabla('test1');
        await test1.update({ row2: "hola" }, { id: 1 });
        const data = await test1.selectById(1);
        assert.equal(data.row2, "hola");
    });

    it('dbTabla:delete', async () => {
        const { db } = await createAndInsert();
        let test1 = db.tabla('test1');
        const data = await test1.delete({ id: 1 });
        assert.ok(data instanceof tauriSqlOk, "debe retornar un objeto tauriSqlOk");
        assert.equal(data.$sql, "DELETE FROM `test1` WHERE `id`=1;");
    });

    it('load model test3', async () => {
        const mock = new TauriMock();
        const db = new tauriSqlTab(mock);
        db.pathModels(path.join(__dirname, "modelo"));
        
        return new Promise((resolve) => {
            db.tabla('test3', async (test3) => {
                assert.ok(test3 instanceof dbLib, "debe retornar un objeto dbtabla");
                await test3.select();
                resolve();
            }, true);
        });
    });

    it('silumacion de AUTO_INCREMENT usando modelos', async () => {
        const mock = new TauriMock();
        const db = new tauriSqlTab(mock);
        db.pathModels(path.join(__dirname, "modelo"));
        let test4 = db.tabla('test4');
        
        await test4.insert(null, "text", 12, "text2");
        await test4.insert([null, "mas texto", 13, "text2"]);
        await test4.insert({ una: "text3", row2: 14, dos: "asdasdasdasd" });
        
        const ok = await test4.select();
        assert.ok(ok instanceof Array);
        assert.equal(ok.length, 3);
        assert.equal(ok[0].id_key2, 1);
        assert.equal(ok[1].id_key2, 2);
        assert.equal(ok[2].id_key2, 3);
    });

    // Pruebas específicas de Tauri
    it('Manejo de transacciones', async () => {
        const { db } = await createAndInsert();
        await db.beginTransaction();
        const test1 = db.tabla('test1');
        await test1.insert(99, "tx", 99, "tx");
        await db.commit();
        
        const row = await db.get("SELECT * FROM test1 WHERE id = 99");
        assert.ok(row);
    });

    it('Rollback de transacciones', async () => {
        const { db } = await createAndInsert();
        await db.beginTransaction();
        const test1 = db.tabla('test1');
        await test1.insert(100, "rb", 100, "rb");
        await db.rollback();
        
        const row = await db.get("SELECT * FROM test1 WHERE id = 100");
        assert.strictEqual(row, null);
    });
});
