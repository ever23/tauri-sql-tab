# tauri-sql-tab

[![NPM Version](https://img.shields.io/npm/v/tauri-sql-tab.svg)](https://npmjs.org/package/tauri-sql-tab)
[![Node.js Version](https://img.shields.io/node/v/tauri-sql-tab.svg)](https://nodejs.org/en/download/)

**tauri-sql-tab** es la solución definitiva para integrar la potencia de **dbtabla** y **tabla-model** en aplicaciones de escritorio creadas con **Tauri**. Permite interactuar con bases de datos SQL (SQLite, MySQL, PostgreSQL) de forma nativa a través del plugin oficial de Tauri, manteniendo una interfaz de alto nivel orientada a objetos (Active Record).

## 🚀 Características Principales

*   **Integración Nativa con Tauri**: Diseñado específicamente para trabajar sobre `@tauri-apps/plugin-sql`.
*   **Zero Logic en Rust**: Toda tu lógica de base de datos permanece en JavaScript/TypeScript.
*   **Patrón Active Record**: Los resultados son objetos inteligentes (`dbRow`) con métodos `.update()` y `.delete()`.
*   **Gestión de Esquemas**: Sincronización automática de tablas basada en modelos de `tabla-model`.
*   **Fluent Query Builder**: Motor de selección polimórfico con soporte para Joins dinámicos y búsquedas inteligentes.
*   **Portabilidad**: API 100% compatible con `sqlite3-tab` y `mysql-tab`.

## 📚 Ecosistema dbtabla

Este paquete forma parte de un ecosistema modular. También puedes utilizar:

*   **[tabla-model](https://github.com/ever23/tabla-model)**: El motor de definición de esquemas.
*   **[dbtabla](https://github.com/ever23/dbtabla)**: El núcleo de la librería.
*   **[sqlite3-tab](https://github.com/ever23/sqlite3-tab)**: Para aplicaciones Node.js puras con SQLite.

---

## Configuración de Tauri

Para que este paquete funcione, debes tener configurado el plugin de SQL en tu proyecto Tauri.

### 1. Dependencias de Rust (`src-tauri/Cargo.toml`)
Añade el plugin a tu archivo de configuración de Rust:

```toml
[dependencies]
tauri-plugin-sql = "2.0.0" # Usa la versión compatible con tu Tauri
```

### 2. Registro del Plugin (`src-tauri/src/lib.rs` o `main.rs`)
Registra el plugin en el constructor de tu aplicación:

```rust
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().build()) // <--- Añadir esto
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### 3. Permisos (Solo Tauri v2)
Asegúrate de conceder permisos en `src-tauri/capabilities/default.json`:

```json
{
  "permissions": [
    "sql:default",
    "sql:allow-load",
    "sql:allow-execute",
    "sql:allow-select"
  ]
}
```

---

## 📦 Instalación

```bash
npm install tauri-sql-tab
```

---

## 🛠️ Inicio Rápido

### 1. Conexión en Tauri
Primero carga la base de datos usando el plugin de Tauri y luego envuélvela con `tauri-sql-tab`.

```javascript
import Database from '@tauri-apps/plugin-sql';
import { tauriSqlTab } from 'tauri-sql-tab';

// Carga la base de datos (SQLite en este ejemplo)
const dbTauri = await Database.load('sqlite:notas.db');

// Inicializa el conector de dbtabla
const db = new tauriSqlTab(dbTauri);
```

### 2. Definición y Registro de Modelos
```javascript
import Model from 'tabla-model';

const UsuarioModel = new Model('usuarios', {
    colums: [
        { name: 'id', type: 'integer', primary: true, autoincrement: true },
        { name: 'nombre', type: 'varchar(100)' },
        { name: 'email', type: 'varchar(100)', unique: true }
    ]
});

db.addModel(UsuarioModel);
```

---

## 📖 Guía de Uso

### Operaciones de Tabla
```javascript
const usuarios = db.tabla('usuarios');
```

#### Inserción
```javascript
await usuarios.insert({ nombre: 'Antigravity', email: 'anti@example.com' });
```

#### Consultas (Select)
```javascript
// Búsqueda simple
const lista = await usuarios.select("id > 0");

// Búsqueda con objeto (Where avanzado)
// Sufijos: % (LIKE), ! (!=), > (>), < (<)
const resultados = await usuarios.select(null, null, { 
    "nombre%": "Anti%", 
    "||email!": "test@test.com" 
});

// Búsqueda por ID
const user = await usuarios.selectById(1);
```

#### Actualización y Borrado
```javascript
await usuarios.update({ nombre: 'Nuevo Nombre' }, { id: 1 });
await usuarios.delete({ id: 1 });
```

---

## 💎 Active Record (dbRow)
Los resultados devueltos por `select` son instancias de `dbRow`:

```javascript
const user = await usuarios.selectById(1);
if (user) {
    user.nombre = "Editado";
    await user.update(); // Sincroniza con la DB automáticamente
}
```

---

## 🧪 Pruebas
El paquete incluye una suite de pruebas que utiliza un Mock de SQLite para entorno Node.js:

```bash
npm test
```

## 🤖 Agentes de IA & Skills

Este proyecto incluye una **AI Skill** diseñada para que asistentes de IA (como ChatGPT, Claude o Copilot) puedan entender y utilizar esta librería de forma óptima. 

Puedes encontrarla en: [SKILL.md](.agents/skills/tauri-sql-tab/SKILL.md)

## 📄 Licencia
MIT
